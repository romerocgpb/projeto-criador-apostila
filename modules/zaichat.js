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

function getTime() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0'); // Garante que fique "05" em vez de "5"

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Truque para pegar o GMT: O JS retorna o offset em minutos invertido. 
    // Dividimos por 60 e invertemos o sinal com o sinal de menos na frente.
    const offsetHours = -now.getTimezoneOffset() / 60;
    const gmtSign = offsetHours >= 0 ? '+' : '';
    const timezone = `Etc/GMT${gmtSign}${offsetHours}`;

    return {
        "{{USER_NAME}}": "zai",
        "{{USER_LOCATION}}": "Unknown",
        "{{CURRENT_DATETIME}}": `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
        "{{CURRENT_DATE}}": `${year}-${month}-${day}`,
        "{{CURRENT_TIME}}": `${hours}:${minutes}:${seconds}`,
        "{{CURRENT_WEEKDAY}}": weekdays[now.getDay()],
        "{{CURRENT_TIMEZONE}}": timezone,
        "{{USER_LANGUAGE}}": "en-US"
    };
}

class ZaiChat{
    constructor(bearer, user_id, model, titulo_chat, s_prompt){
        this.user_id = user_id;
        this.bearer = bearer;
        this.model = model;
        this.titulo_chat = titulo_chat;
        this.prompt = s_prompt;
        this.new_chat_id = null;
        this.last_resp_id = null;
        this.enable_thinking = true;
        this.init();
    }
    async init() {
        const msgId = crypto.randomUUID();
        const now = Date.now();
        let resp = await axios.post('https://chat.z.ai/api/v1/chats/new', {
            "chat": {
                "id": "",
                "title": "New Chat",
                "models": [
                    this.model
                ],
                "params": {},
                "history": {
                    "messages": {
                        [msgId]: {
                            "id": msgId,
                            "parentId": null,
                            "childrenIds": [],
                            "role": "user",
                            "content": this.prompt,
                            "timestamp": Math.floor(now / 1000),
                            "models": [
                                this.model
                            ]
                        }
                    },
                    "currentId": msgId
                },
                "tags": [],
                "flags": [],
                "features": [
                    {
                        "type": "mcp",
                        "server": "vibe-coding",
                        "status": "hidden"
                    },
                    {
                        "type": "mcp",
                        "server": "ppt-maker",
                        "status": "hidden"
                    },
                    {
                        "type": "mcp",
                        "server": "image-search",
                        "status": "hidden"
                    },
                    {
                        "type": "mcp",
                        "server": "deep-research",
                        "status": "hidden"
                    }
                ],
                "mcp_servers": [],
                "enable_thinking": true,
                "auto_web_search": false,
                "message_version": 1,
                "extra": {},
                "timestamp": now,
                "type": "default"
            }
        }, {headers: {
                'Authorization': 'Bearer ' + this.bearer,
                'Content-Type': 'application/json',
                'x-region': 'overseas'
        }})
        this.new_chat_id = resp.data.id;

    }
    async send_zai_message(){
        let timestamp  = String(Date.now())
        let requestId  = crypto.randomUUID()

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

        this.last_resp_id = crypto.randomUUID()

        let resp = await axios.post(`https://chat.z.ai/api/v2/chat/completions?timestamp=${timestamp}&requestId=${requestId}&version=1.0.0&platform=web&token=${this.bearer}&user_id=${this.user_id}`, {
                    "stream": true,
                    "model": this.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": this.prompt
                        }
                    ],
                    "signature_prompt": this.prompt,
                    "params": {},
                    "extra": {},
                    "features": {
                        "image_generation": false,
                        "web_search": false,
                        "auto_web_search": false,
                        "preview_mode": true,
                        "flags": [],
                        "vlm_tools_enable": false,
                        "vlm_web_search_enable": false,
                        "vlm_website_mode": false,
                        "enable_thinking": this.enable_thinking
                    },
                    "variables": getTime(),
                    "chat_id": this.new_chat_id,
                    "id": this.last_resp_id,
                    "current_user_message_id": crypto.randomUUID(),
                    "current_user_message_parent_id": this.last_resp_id,
                    "background_tasks": {
                        "title_generation": true,
                        "tags_generation": true
                    }
    }, { headers:{"Authorization": `Bearer ${this.bearer}`, "X-Signature": signature, "signature_timestamp": timestamp, "Content-Type": "application/json", "X-FE-Version": "prod-fe-1.1.21"} } )

    }

}