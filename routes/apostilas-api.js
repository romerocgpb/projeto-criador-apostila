const express = require('express');
const crypto = require('crypto')
const puppeteer = require('puppeteer-core');
const axios = require('axios')
const {solvePow, buildPowHeader, DeepSeekHash} = require('../modules/deepseek_pow_solver')
const {StringDecoder} = require('string_decoder')

const app = express.Router();

const EventEmitter = require('events');
const ap_evs = new EventEmitter();

function formatChallenge(challenge){
    return {
        "algorithm": challenge.algorithm,
        "challenge": challenge.challenge,
        "salt": challenge.salt,
        "signature": challenge.signature,
        "difficulty": challenge.difficulty,
        "expire_at": challenge.expire_at,
        "expire_after": challenge.expire_after,
        "target_path": challenge.target_path
}
}

app.post('/apostilas/list', async function(req, res){
    let query = "SELECT uuid, titulo FROM apostilas WHERE fk_usuario_id=$1"
    let db_query = await res.locals.conn.query(query, [res.locals.decoded.id])
    res.send(db_query.rows);
})

app.post('/apostilas/new', async function (req, res) {
    let query = "INSERT INTO apostilas(fk_usuario_id, uuid, titulo) VALUES($1, $2, $3) RETURNING uuid"
    let db_query = await res.locals.conn.query(query, [res.locals.decoded.id, crypto.randomUUID(), 'Nova Apostila!'])
    console.log(db_query.rows);
    res.send(db_query.rows[0].uuid)
})

app.post('/apostilas/image_upload', async function (req, res) {
    /*for (let image of req.body.imagens){
        image.preview_buffer_b64 = image.preview.replace(/^data:image\/\w+;base64,/, '');
        image.preview_buffer = Buffer.from(image.preview_buffer_b64, 'base64');
    }*/
    let browser = await puppeteer.connect({browserWSEndpoint: res.locals.globals.ws_endpoint})
    let page = await browser.newPage()
    await page.goto('https://chat.deepseek.com', {timeout: 0})
    await page.addScriptTag({url: 'https://cdn.jsdelivr.net/npm/@angelrs/axios-fetch-adapter@0.3.5/index.min.js'})
    await page.exposeFunction('solvePow', solvePow)
    await page.exposeFunction('buildPowHeader', buildPowHeader)
    await page.exposeFunction('formatChallenge', formatChallenge)
    let file_count = 0
    let files_ids = []
    page.on('response', async function(response) {
        const url = response.url();
        if (url.includes('/api/v0/file/upload_file')) {
            const status = response.status();
            
            try {
                const dados = await response.json(); 
                files_ids.push(dados.data.biz_data.id)

                file_count += 1
                if (file_count == req.body.imagens.length){
                    page.off('response');
                    ap_evs.emit('sended_all_files');
                }
            } catch (erro) {
                console.log(`Resposta não-JSON da URL ${url}. Status: ${status}`);
            }
        }
    });
    
    let pow_newchat_resp = await page.evaluate(async function (images) {
        function clicarPorTexto(textoProcurado) {
            // O XPath: Procura qualquer elemento (*) que contenha o texto exato
            // Usamos normalize-space() para ignorar espaços extras e quebras de linha
            const xpath = `//*[normalize-space(text())='${textoProcurado}']`;
            
            // Se quiser buscar apenas um pedaço do texto (contém), use:
            // const xpath = `//*[contains(text(), '${textoProcurado}')]`;

            // Executa a busca no documento
            const resultado = document.evaluate(
                xpath, 
                document, 
                null, 
                XPathResult.FIRST_ORDERED_NODE_TYPE, 
                null
            );

            // Pega o elemento encontrado
            const elemento = resultado.singleNodeValue;

            if (elemento) {
                elemento.click();
                console.log(`Clicou no elemento com texto: "${textoProcurado}"`);
            } else {
                console.error(`Elemento com texto "${textoProcurado}" não encontrado!`);
            }
        }
        clicarPorTexto('Vision')

        let dataTransfer = new DataTransfer();
        let input = document.querySelector('input[type="file"]');
        for (let img of images){
            let b64 = img.preview.replace(/^data:image\/\w+;base64,/, "");
            let byteString = atob(b64);
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            let file = new File([ab], img.name, { type: 'image/jpeg' });
            dataTransfer.items.add(file)
        }
        input.files = dataTransfer.files;
        let changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        let inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);

    }, req.body.imagens)
    ap_evs.on('sended_all_files', async function(){
        let ds_completions_pow_challenge = await page.evaluate(async function () {
            let pow_c_resp = await axios.post('https://chat.deepseek.com/api/v0/chat/create_pow_challenge', {"target_path":"/api/v0/chat/completion"}, {headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.userToken).value}});
            return pow_c_resp.data.data.biz_data.challenge;
        });
        let ds_new_chat_id = await page.evaluate(async function () {
            let new_chat_resp = await axios.post('https://chat.deepseek.com/api/v0/chat_session/create', {}, {headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.userToken).value}});
            return new_chat_resp.data.data.biz_data.id;
        });
        let answer = solvePow(ds_completions_pow_challenge.challenge, ds_completions_pow_challenge.salt, ds_completions_pow_challenge.difficulty, ds_completions_pow_challenge.expireAt);
        let header = buildPowHeader(ds_completions_pow_challenge, answer);

        let stream_return = await page.evaluate(async function(header, ds_new_chat_id, files_ids){
            return await axios.post('https://chat.deepseek.com/api/v0/chat/completion', {
                "chat_session_id": ds_new_chat_id,
                "parent_message_id": null,
                "model_type": "vision",
                "prompt": "Você é uma ferramenta de extração de texto OCR (Reconhecimento Óptico de Caracteres).\n\nSUA ÚNICA FUNÇÃO É EXTRAIR O CONTEÚDO EXATO QUE ESTÁ ESCRITO NA IMAGEM.\n\nAja como um motor OCR de alta precisão especializado em extração de tabelas. Sua única tarefa é analisar as imagens fornecidas e transcrever o conteúdo para Markdown, respeitando rigorosamente o layout original.\n\nRegras estritamente obrigatórias:\n1. Saída Única: Seu output deve conter APENAS a tabela em formato Markdown. NÃO inclua saudações, explicações, comentários, blocos de código (```markdown) ou qualquer texto que não pertença à tabela.\n2. Layout Fiel: Mantenha exatamente a mesma quantidade de colunas e a ordem das linhas da imagem. O alinhamento visual (esquerda, centro, direita) deve ser preservado usando a sintaxe de alinhamento do Markdown (`:---`, `:---:`, `---:`).\n3. Múltiplas Imagens = Uma Tabela: Você receberá múltiplas imagens que formam uma ÚNICA tabela contínua. A primeira imagem contém o cabeçalho da tabela. As imagens subsequentes são apenas a continuação das linhas de dados. Una tudo em uma única estrutura de tabela no Markdown final, sem repetir o cabeçalho.\n4. Precisão de Dados: Transcreva os textos e números exatamente como aparecem na imagem, sem interpretar, corrigir ou omitir informações.\n\nEstrutura esperada:\n| Cabeçalho 1 | Cabeçalho 2 | Cabeçalho 3 |\n|:---|:---:|---:|\n| Dados img 1 | Dados img 1 | Dados img 1 |\n| Dados img 2 | Dados img 2 | Dados img 2 |\n\nProcesse as imagens agora e retorne APENAS a tabela.",
                "ref_file_ids": files_ids,
                "thinking_enabled": true,
                "search_enabled": false,
                "action": null,
                "preempt": false
            }, {headers: {
                'Authorization': 'Bearer ' + JSON.parse(localStorage.userToken).value,
                "x-hif-leim": JSON.parse(localStorage.getItem("hif_leim_cached")),
                'x-ds-pow-response': header
            }, responseType: 'stream'})
        }, header, ds_new_chat_id, files_ids);
        // Cria o decoder dizendo que a codificação é UTF-8
        let decoder = new StringDecoder('utf8');

        let textoCompleto = '';

        resp.data.on('data', (chunk) => {
            // O decoder garante que caracteres UTF-8 não serão cortados pela metade
            const textoSeguro = decoder.write(chunk);
            
            console.log("--- Chunk Seguro ---");
            console.log(textoSeguro);
            
            // Agora você pode concatenar com segurança se quiser
            textoCompleto += textoSeguro;
        });

        resp.data.on('end', () => {
            // O método .end() solta qualquer byte que tenha sobrado no decoder
            const resto = decoder.end();
            textoCompleto += resto;
            
            console.log("\nTexto Final Montado:");
            console.log(textoCompleto);
        });



    })

    res.sendStatus(500);
    // await page.close()
    /*return
    let history = {}
    let ocr_sys_prompt = `Você é uma ferramenta de extração de texto OCR (Reconhecimento Óptico de Caracteres).

SUA ÚNICA FUNÇÃO É EXTRAIR O CONTEÚDO EXATO QUE ESTÁ ESCRITO NA IMAGEM.

REGRAS RÍGIDAS:
1. Retorne APENAS o texto extraído da imagem.
2. NÃO escreva nenhuma introdução, saudação ou explicação (ex: "Aqui está o texto", "A imagem contém...").
3. NÃO faça correções gramaticais, ortográficas ou melhorias no texto, a menos que o texto esteja ilegível.
4. NÃO adicione conclusões ou comentários pessoais.
5. Se a imagem não contiver texto, retorne apenas a palavra: [IMAGEM_SEM_TEXTO].
6. Mantenha a formatação original (quebras de linha, listas, tabela) sempre que possível.

SAÍDA ESPERADA:
[O texto extraído puro, sem nenhuma formatação de conversa ao redor.]`
    
    console.log('Enviado...')
    try{
        let response = await axios.post('https://api.z.ai/api/paas/v4/chat/completions', {model: "GLM-4.7-Flash", messages: [
            {
                "role": "system",
                "content": ocr_sys_prompt
            },
            {
                "role": "user",
                'content': `Guarde essa tabela markdown:
## PLANO DE CURSO 2026 - Currículo Referência de Minas Gerais - Ensino Fundamental

**Área de Conhecimento:** Ciências Humanas
**Componente Curricular:** Geografia
**Ano de Escolaridade:** 9º Ano - Ensino Fundamental
**Modalidade de Ensino:** Ensino Regular

| TRIMESTRE | UNIDADE TEMÁTICA | HABILIDADE | CONTEÚDOS RELACIONADOS | ORIENTAÇÕES PEDAGÓGICAS |
|---|---|---|---|---|
| 1º | Conexões e escalas | [EF09GE09X] Identificar e analisar características de países e grupos de países europeus, asiáticos e do Oceano Pacífico, com seus aspectos populacionais, urbanos, políticos, econômicos, e discutir suas desigualdades sociais e econômicas e pressões sobre seu ambiente físico-natural. | Conceito de Geopolítica; Divisão do mundo por Oriente e Ocidente; Regionalização do espaço geográfico mundial; Regionalização histórica. | Foque na transição para a bipolaridade (ou unipolaridade) da atualidade. Utilize mapas para mostrar zonas de influência. |
| 1º | O sujeito e seu lugar no mundo | [EF09GE01] Analisar criticamente a forma como a hegemonia europeia foi exercida em várias regiões do planeta, notadamente em suas consequências, intervenções militares e/ou influência cultural em diferentes lugares. | Compreender a Guerra Fria e sua influência na geopolítica mundial; Diferenciar ideias político-econômicas e conflitos entre os países; Conflitos descoloniais da Guerra Fria no passado e no presente. | Destaque que, embora "fria" entre as potências, houve conflitos reais na periferia. Foque na herança tecnológica e nuclear. |
| 1º | Conexões e escalas | [EF09GE05] Analisar fatos e situações para compreender a integração cultural, política e econômica em diferentes escalas, interpretando a globalização e mundialização. | Conceito de Globalização; Características da Globalização; Diferença entre globalização e mundialização; Identificar o papel das multinacionais no processo de globalização. | Trabalhe o conceito de "encurtamento" das distâncias (compressão espaço-tempo). |
| 1º | Conexões e escalas | [EF09GE05] Analisar fatos e situações para compreender a integração cultural, política e econômica em diferentes escalas, interpretando a globalização e mundialização. | Verificar os fluxos de mercadorias e serviços para entender sua consolidação com a globalização; Entender as consequências da globalização na transformação nesse processo. | Aborde a lógica moderna (centralização) e a fragmentação da produção e do consumo global. |
| 1º | O sujeito e seu lugar no mundo | [EF09GE02] Identificar e analisar a atuação das corporações internacionais e das organizações econômicas mundiais na vida da população em relação ao consumo, a cultura e a mobilidade. | A sociedade de informações. | Fluxos de Informação: Discuta a exclusão digital e como a velocidade da informação molda a opinião pública. |
| 1º | Conexões e escalas | [EF09GE05] Analisar fatos e situações para compreender a integração mundial (econômica, política e cultural) e as diferentes interpretações da globalização e mundialização. | Transformações do espaço na sociedade de informações. | Fluxos Financeiros: Explique a volatilidade do capital especulativo e o papel das bolsas de valores mundiais. |
| 1º | O sujeito e seu lugar no mundo | [EF09GE01] Analisar criticamente de que forma a hegemonia europeia foi exercida em várias regiões do planeta, notadamente em suas consequências, intervenções militares e/ou influência cultural em diferentes tempos e lugares. | A integração mundial e suas interpretações. | Fluxos de Pessoas: Diferencie migração econômica de refúgio. Use dados atuais sobre crises humanitárias. |
| 1º | O sujeito e seu lugar no mundo | [EF09GE03] Identificar e analisar manifestações culturais de minorias étnicas como forma de compreender a multiplicidade cultural na escala mundial, defendendo o princípio do respeito às diferenças. | A integração mundial e suas interpretações. | Globalização e Desigualdade: Analise como a desigualdade se concentra em poucos países pelas tecnologias, enquanto a periferia fornece mão de obra barata. |
| 1º | Conexões e escalas | [EF09GE09X] Identificar e analisar características de países e grupos de países europeus, asiáticos e do Oceano Pacífico, com seus aspectos populacionais, urbanos, políticos, econômicos, e discutir suas desigualdades sociais e econômicas e pressões sobre seu ambiente físico-natural. | O surgimento e a importância da ONU. | ONU: Explique a estrutura do Conselho de Segurança e a dificuldade de reforma diante do direito de veto. |
| 1º | Conexões e escalas | [EF09GE08X] Reconhecer e analisar transformações territoriais, considerando povos (basco, curdos, palestinos, israelenses, etc.) e as múltiplas regionalidades na Europa, na Ásia e no Oceania. | Corporações e organismos internacionais. | Organizações Intergovernamentais: Aborde o papel do FMI, Banco Mundial e OMC na regulação da economia global. |
`
            }], temperature: 0.5, stream: false, thinking: {'type': 'enabled'}}, {headers: {'Authorization': 'Bearer 542b8d5e4a904e0c8e1010208f0dbd20.kNbsf7gtFu0xMz0o'}})
        console.log(response.data)
    }
    catch(err){
        console.log(err)
    }
    res.sendStatus(200)*/
    

    
})

module.exports = app;