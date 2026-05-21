const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process'); // Importa o spawn
const path = require('path');
const readline = require('readline');

function perguntar(pergunta) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(pergunta, (resposta) => { rl.close(); resolve(resposta); }));
}

async function criar_scraper() {
    const pastaPerfil = path.resolve(__dirname, 'meu_perfil_brave');
    const porta = 5525;

    // 1. INICIA O NAVEGADOR MANUALMENTE (PROCESSO INDEPENDENTE)
    // Isso abre o navegador "solto" no sistema, ele não é filho do Node.js
    const browserProcess = spawn('C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', [
        `--remote-debugging-port=${porta}`,
        `--user-data-dir=${pastaPerfil}`,
        '--no-first-run',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ], {detached: true});
    // Espera um pouco o navegador abrir (2 segundos geralmente basta)
    await new Promise(r => setTimeout(r, 2000));

    // 2. CONECTA AO NAVEGADOR QUE JÁ ESTÁ RODANDO
    const browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${porta}`
    });

    console.log("✅ Conectado!");

    let page = (await browser.pages())[0] || await browser.newPage();
    await page.goto('https://chat.deepseek.com/', { timeout: 0 });

    await perguntar('OK?');
    console.log(browser.wsEndpoint())
        /*await page.evaluate(function(){
        localStorage.setItem('token', 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkNjIyODAzLTQwNTAtNDFlOC1hZDJjLWFhOTU3NDU2Y2FlOCIsImVtYWlsIjoidHJleXRlbi56ZXJyaWNrQGZvcmxpaW9uLmNvbSJ9.LUsWbIAIszSuhyblJQ9tHbM1wi9QrDMfoPJ_Xgo-LCNFc_BvFa4jT3uuFt8Jlpk1bzqgZvc1RCjYgfa4W-ac7w')
    })*/

    // 3. DESCONECTA
    // Como o navegador foi aberto pelo 'spawn' e não pelo puppeteer.launch, ele NÃO MORRE aqui.
    await browser.disconnect();
    
    console.log("🏁 Script finalizado. O navegador continua aberto!");
    process.exit(0); // Mata o Node.js
}

criar_scraper();