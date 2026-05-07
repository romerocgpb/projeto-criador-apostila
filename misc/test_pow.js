const {solvePow, buildPowHeader, DeepSeekHash} = require('./deepseek_pow_solver')

let challenge = "106fbad74f25be623da9c96f921cde0ccbc4413d1c7757119f96448f918510f5"
let salt = "f294cfe5d50c2ddab2a8"
let difficulty = 144000
let expireAt = 1777075121198

let challengeData = {
    "algorithm": "DeepSeekHashV1",
    "challenge": "106fbad74f25be623da9c96f921cde0ccbc4413d1c7757119f96448f918510f5",
    "salt": "f294cfe5d50c2ddab2a8",
    "signature": "674e3abd68de1ef3032364e3ad34ba11cde3e42d99ba8fc1b68e6a1bc7f772a5",
    "difficulty": 144000,
    "expire_at": 1777075121198,
    "expire_after": 300000,
    "target_path": "/api/v0/chat/completion"
}


let answer = solvePow(challenge, salt, difficulty, expireAt);
let header = buildPowHeader(challengeData, answer);

console.log(answer)
console.log(header)

axios.post('https://chat.deepseek.com/api/v0/chat/completion', {
        chat_session_id: "423b8d44-6625-4f29-b584-348b04c11ec1",
        model_type: "default",
        parent_message_id: null,
        preempt: false,
        prompt: "olá! eu estou usando você a partir do console devtools do browser, não do modo convencional de digitar no chat deepseek!",
        ref_file_ids: [],
        search_enable: false,
        thinking_enabled: true,
    },
    {headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.userToken).value,
        "x-hif-leim": JSON.parse(localStorage.getItem("hif_leim_cached")),
        "x-ds-pow-response": `eyJhbGdvcml0aG0iOiJEZWVwU2Vla0hhc2hWMSIsImNoYWxsZW5nZSI6IjEwNmZiYWQ3NGYyNWJlNjIzZGE5Yzk2ZjkyMWNkZTBjY2JjNDQxM2QxYzc3NTcxMTlmOTY0
NDhmOTE4NTEwZjUiLCJzYWx0IjoiZjI5NGNmZTVkNTBjMmRkYWIyYTgiLCJhbnN3ZXIiOjEyODg4Nywic2lnbmF0dXJlIjoiNjc0ZTNhYmQ2OGRlMWVmMzAzMjM2NGUz
YWQzNGJhMTFjZGUzZTQyZDk5YmE4ZmMxYjY4ZTZhMWJjN2Y3NzJhNSIsInRhcmdldF9wYXRoIjoiL2FwaS92MC9jaGF0L2NvbXBsZXRpb24ifQ==`
    }
    }).then(function(resp){console.log(resp)})


axios.post('https://chat.deepseek.com/api/v0/chat/create_pow_challenge', {target_path: "/api/v0/chat/completion"},
    {headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.userToken).value,
    }
    }).then(function(resp){console.log(resp)})
