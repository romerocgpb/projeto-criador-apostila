const express = require('express');
const http = require('http');
const app = express();
const {db} = require('./database')
const {verificarToken} = require('./modules/tok_gen')
const readline = require('readline');
const file_sys = require('fs')

const globals = {}

// Função que cria uma promessa para esperar a resposta
function perguntar(pergunta) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      rl.close(); // Fecha a interface de leitura
      resolve(resposta); // Retorna a resposta para quem chamou
    });
  });
}

file_sys.readFile('./wse.txt', function(err, data){
    if (err){
        console.log(err)
    }
    else if(data){
        globals.ws_endpoint = data.toString()
        console.log(globals.ws_endpoint)
    }
})

const PORT = 8585

const bodyParser = require("body-parser");
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

app.set('view engine', 'ejs');
app.set('views', './views');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(function (req, res, next){
    res.locals.conn = db;
    res.locals.globals = globals;
    next()
});

app.use(function(req, res, next){
    if (req.path.startsWith('/api/login')){
        next()
    }
    else{
        let token_verif = verificarToken(req.headers.authorization)
        if (token_verif.resultado == true){
            res.locals.decoded = token_verif.decoded
            next()
        }
        else if (token_verif.resultado == false){
            if (token_verif.causa == 'erro_especial'){
                res.sendStatus(500)
            }
            else{
                res.send({erro: 'autenticação', msg: token_verif.causa})
            }
        }
    }
})

const login = require('./routes/login-api')
const apostilas = require('./routes/apostilas-api')

app.use('/api', [login, apostilas])

app.use((req, res, next) => {
    res.status(404).send('404 not found...')
});

const server = http.createServer(app)

server.listen(PORT, () => {
  	console.log(`Servidor disponível em http://localhost:${PORT}/`);
});

module.exports = app;
