
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/axios@1.15.2/dist/axios.min.js';
document.head.appendChild(script);

function hmacSha256Pure(key, msg) {
    function sha256(str) {
        const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
        const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
        let msg = unescape(encodeURIComponent(str));
        const words = [];
        for (let i = 0; i < msg.length * 8; words[i >> 5] |= (msg.charCodeAt(i / 8) & 0xff) << (24 - i % 32), i += 8);
        words[msg.length * 8 >> 5] |= 0x80 << (24 - msg.length * 8 % 32);
        words[(msg.length * 8 + 64 >> 9 << 4) + 15] = msg.length * 8;
        for (let i = 0; i < words.length; i += 16) {
            const w = [...words.slice(i, i + 16)];
            for (let j = 16; j < 64; j++) { const s0 = [0,1][+(j>=16)] ? (w[j-15]>>>7^w[j-15]>>>18^w[j-15]>>>3) : 0; const s1 = [0,1][+(j>=16)] ? (w[j-2]>>>17^w[j-2]>>>19^w[j-2]>>>10) : 0; w[j] = (w[j-16]+s0+w[j-7]+s1)|0; }
            let [a,b,c,d,e,f,g,h] = H;
            for (let j = 0; j < 64; j++) {
                const S1 = (e>>>6^e>>>11^e>>>25); const ch = (e&f)^(~e&g); const t1 = (h+S1+ch+K[j]+w[j])|0;
                const S0 = (a>>>2^a>>>13^a>>>22); const maj = (a&b)^(a&c)^(b&c); const t2 = (S0+maj)|0;
                h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
            }
            H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
            H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
        }
        return H.map(v => ('00000000'+v.toString(16)).slice(-8)).join('');
    }

    const BLOCK = 64;
    let k = unescape(encodeURIComponent(key));
    if (k.length > BLOCK) k = sha256(k);
    while (k.length < BLOCK) k += '\0';
    let oKey = '', iPad = '';
    for (let i = 0; i < BLOCK; i++) { oKey += String.fromCharCode(k.charCodeAt(i) ^ 0x5c); iPad += String.fromCharCode(k.charCodeAt(i) ^ 0x36); }
    return sha256(oKey + sha256(iPad + msg));
}
changedAttrs
class ZAIChat{
    constructor(model, bearer, user_id, globalEventEmitter){
        this.model = model;
        this.model_data = null;
        this.bearer = bearer;
        this.user_id = user_id;
        this.chat_id = null;
        this.current_user_message_parent_id = null;
        this.globalEventEmitter = globalEventEmitter;
        this.msgId = null;
        this.chat_data = null
    }
    formatarData(data) {
        const ano = data.getFullYear();
        // getMonth() retorna de 0 a 11, por isso somamos +1
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        
        const dia = String(data.getDate()).padStart(2, '0');
        
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        const segundo = String(data.getSeconds()).padStart(2, '0');

        // Retorna no formato desejado: YYYY-MM-DD HH:MM:SS
        return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
    }
    async init_GLM5V_Turbo(prompt, titulo_chat){
        // TODO: Adicionar lógica de busca de features por nome de ia
        const msgId = crypto.randomUUID();
        const now = Date.now();
            
        let newchat_req = await axios.post('https://chat.z.ai/api/v1/chats/new', {
            "chat": {
                "id": "",
                "title": titulo_chat,
                "models": [
                    "GLM-5v-Turbo"
                ],
                "params": {},
                "history": {
                    "messages": {
                        [msgId]: {
                            "id": msgId,
                            "parentId": null,
                            "childrenIds": [],
                            "role": "user",
                            "content": prompt,
                            "timestamp": Math.floor(now/1000),
                            "models": [
                                "GLM-5v-Turbo"
                            ]
                        }
                    },
                    "currentId": msgId
                },
                "tags": [],
                "flags": [],
                "features": [
                    {
                        "server": "web_search",
                        "status": "selected",
                        "type": "web_search"
                    },
                    {
                        "server": "vlm-tools",
                        "status": "selected",
                        "type": "vlm-tools"
                    }
                ],
                "mcp_servers": [],
                "enable_thinking": true,
                "auto_web_search": true,
                "message_version": 1,
                "extra": {
                    "vlm_tools_enable": true,
                    "vlm_web_search_enable": true,
                    "vlm_website_mode": true
                },
                "timestamp": now,
                "type": "default"
            }
        }, {headers: {
            'Authorization': 'Bearer ' + this.bearer,
            'Content-Type': 'application/json',
            'x-region': 'overseas'
        }})
        this.msgId = msgId
        this.chat_id = newchat_req.data.id
    }
    async getAvailableModels(){
        let resp = await axios.get('https://chat.z.ai/api/models');
        return resp.data
    }
    async setModelData(){
        let availableModelsData = await this.getAvailableModels();
        for (let modelData of availableModelsData.data){
            if (modelData.id == this.model){
                this.model_data = modelData;
                break;
            }
        }
        if (!this.model_data){
            throw new Error('Dados pro modelo selecionado indisponíveis!')
        }
        return 'ok';
         
    }

    async queryChatData() {
        let chat_data = await axios.get(`https://chat.z.ai/api/v1/chats/${this.chat_id}`, {headers:{
            'X-Region': 'overseas'
        }});
        this.chat_data = chat_data.data;
        return chat_data.data
        
    }
    async completions(prompt){
        if (!this.model_data){
            let a = await this.setModelData();
        }
        
        await this.queryChatData();
        // window.exposedFNs.ts(this.chat_data, this.model_data, crypto.randomUUID(), this.chat_id)
        let finalData = {
            "mcpServers": [],
            "userPrompt": prompt,
            "autoWebSearch": false,
            "thinking": true,
            "skipThinking": false,
            "extra": {
                vlm_tools_enable: true,
                vlm_web_search_enable: true,
                vlm_website_mode: true
            }
        }
        this.globalEventEmitter.on('completions_data', function(request){
            console.log(request);
        })
        console.log(this.chat_data.chat.history.messages)
        console.log(this.model_data)
        console.log(this.chat_id)
        let assistantMessage = structuredClone(this.chat_data.chat.history.messages[this.msgId])
        let assistantMessageId = crypto.randomUUID();
        this.chat_data.chat.history.messages[this.msgId].childrenIds = [assistantMessageId]
        assistantMessage.parentId = this.msgId;
        assistantMessage.id = assistantMessageId
        assistantMessage.role = 'assistant'
        console.log(assistantMessage, 'assist msg')
        this.chat_data.chat.history.messages[assistantMessageId] = assistantMessage
        await window.exposedFNs.ts(this.chat_data.chat.history, this.model_data, assistantMessageId,  this.chat_id, finalData)
    }
}
let zaic = new ZAIChat('GLM-5.1', localStorage.getItem('token'), '9d622803-4050-41e8-ad2c-aa957456cae8', window.globalEventEmitter)
await zaic.init_GLM5V_Turbo('Olá! Você conhece o sublime text?', 'Chat agentico 033: sublime text');
await zaic.completions('Olá! Você conhece o sublime text?')
async function zaichatinit() {
    
};
zaichatinit();



    /*async oldcompletions(prompt){
        let now = Date.now()
        let now_qs = new Date()
        let timestamp  = String(Date.now())           // ex: "1777321391088"
        let requestId  = crypto.randomUUID()          // ex: "22c175ec-dbc5-44c3-b200-a705de43a90d"
        let sortedPayload = "requestId," + requestId + ",timestamp," + timestamp + ",user_id," + this.user_id;

        let encoder = new TextEncoder();
        let bytes = encoder.encode(prompt);
        let CHUNK = 32768;
        let byteStr = "";
        for (let i = 0; i < bytes.length; i += CHUNK) {
            byteStr += String.fromCharCode(...Array.from(bytes.slice(i, i + CHUNK)));
        }
        let promptB64 = btoa(byteStr);

        let message = sortedPayload + "|" + promptB64 + "|" + timestamp;

        let timeWindow = String(Math.floor(Number(timestamp) / 300000));

        let derivedKey = hmacSha256Pure("key-@@@@)))()((9))-xxxx&&&%%%%%", timeWindow);

        let signature = hmacSha256Pure(derivedKey, message);

        let ia_message_id = crypto.randomUUID()
        let captcha_verify_param = null
        try{
            captcha_verify_param = await window.exposedFNs.NM();
        }
        catch (err){
            console.log(err)
        }
    
        try{
            let completions_req = await axios.post(`https://chat.z.ai/api/v2/chat/completions?timestamp=${now}&requestId=${requestId}&version=0.0.1&platform=web&token=${this.bearer}&user_agent=Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F143.0.0.0+Safari%2F537.36&language=pt-BR&languages=pt-BR&timezone=Etc%2FGMT%2B3&cookie_enabled=true&screen_width=1280&screen_height=800&screen_resolution=1280x800&viewport_height=766&viewport_width=567&viewport_size=567x766&color_depth=24&pixel_ratio=0.800000011920929&current_url=${encodeURI(window.location.href)+'/c/'+this.chat_id}&pathname=${'/c/'+this.chat_id}&search=&hash=&host=chat.z.ai&hostname=chat.z.ai&protocol=https%3A&referrer=&title=Z.ai+-+Free+AI+Chatbot+%26+Agent+powered+by+GLM-5.1+%26+GLM-5&timezone_offset=180&local_time=${encodeURI(now_qs.toISOString())}&utc_time=${now_qs.toUTCString()}&is_mobile=false&is_touch=false&max_touch_points=0&browser_name=Chrome&os_name=Windows&signature_timestamp=${timestamp}`, {
                "stream": true,
                "model": "GLM-5v-Turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "signature_prompt": prompt,
                "params": {},
                "extra": {
                    "vlm_tools_enable": true,
                    "vlm_web_search_enable": true,
                    "vlm_website_mode": true
                },
                "features": {
                    "image_generation": false,
                    "web_search": false,
                    "auto_web_search": false,
                    "preview_mode": true,
                    "flags": [],
                    "vlm_tools_enable": true,
                    "vlm_web_search_enable": true,
                    "vlm_website_mode": true,
                    "enable_thinking": true
                },
                "variables": {
                    "{{USER_NAME}}": "zai",
                    "{{USER_LOCATION}}": "Unknown",
                    "{{CURRENT_DATETIME}}": "2026-05-20 19:59:26",
                    "{{CURRENT_DATE}}": "2026-05-20",
                    "{{CURRENT_TIME}}": "19:59:26",
                    "{{CURRENT_WEEKDAY}}": "Wednesday",
                    "{{CURRENT_TIMEZONE}}": "Etc/GMT+3",
                    "{{USER_LANGUAGE}}": "en-US"
                },
                "chat_id": this.chat_id,
                "id": ia_message_id,
                "current_user_message_id": crypto.randomUUID(),
                "current_user_message_parent_id": null,
                "background_tasks": {
                    "title_generation": false,
                    "tags_generation": true
                },
                "captcha_verify_param": captcha_verify_param
            }, {headers:{
                'Authorization': 'Bearer ' + this.bearer,
                "X-Signature": signature,
                "signature_timestamp": timestamp,
                "x-fe-version": "prod-fe-1.1.34"
            }})
            this.current_user_message_parent_id = ia_message_id;
            console.log(completions_req)
        }
        catch (err){
            console.log(err)
        }

    }*/

async function useFreNM(){
    let token = localStorage.getItem('token');
    let captcha_verify_param = null;
    try{
        captcha_verify_param = await window.exposedFNs.NM();
    }
    catch (err){
        console.log(err)
    }
    let resp = await window.exposedFNs.fre()
}

async function getAvailableModels(){
    let resp = await axios.get('https://chat.z.ai/api/models');
    return resp.data
}

async function queryChatParams() {
    let availableModels = await getAvailableModels();
    console.log(availableModels);
    let chat_data = await axios.get('https://chat.z.ai/api/v1/chats/906d340f-44b6-46e9-861e-298cfb287e27', {headers:{
        'X-Region': 'overseas'
    }});
    console.log(chat_data.data)
    // window.exposedFNs.ts(chat_data, )
}

queryChatParams()