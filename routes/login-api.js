const express = require('express');
const md5 = require('md5');
const {gerarToken} = require('../modules/tok_gen')

const app = express.Router();
const validar_login = require('../middlewares/login')

app.post('/login', validar_login, async function(req, res){
    let senha = md5(req.body.senha)
    let email = req.body.email;
    let query_text = `SELECT * FROM usuarios WHERE email = $1 AND senha = $2`;
    let query = await res.locals.conn.query(query_text, [email, senha]);
    if (query.rows.length == 0){
        res.send({mensagem: "Email ou senha inválidos."}).status(403)
    }
    else{
        let tok = gerarToken(query.rows[0])
        res.send({mensagem: "Login efetuado com sucesso!", t: tok, user_name: query.rows[0].nome})
    }
})

module.exports = app;