const express = require('express');
const http = require('http');
const app = express();
const {db} = require('./database')
const {verificarToken} = require('./modules/tok_gen')


const PORT = 8585

const bodyParser = require("body-parser");
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

app.set('view engine', 'ejs');
app.set('views', './views');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const md5 = require('md5');
const session = require('express-session');
app.use(session({secret: md5('Este é um projeto que plantará muito milho'),saveUninitialized: true,resave: false}));

app.use(function (req, res, next){
    res.locals.conn = db;
    next()
});

app.use(function(req, res, next){
    if (!req.path.startsWith('/api/login')){
        console.log(req.headers.authorization)
        next()
    }
    else{
        next()
    }
})

const login = require('./routes/login-api')

app.use('/api', [login])

app.use((req, res, next) => {
    res.status(404).send('404 not found...')
});

const server = http.createServer(app)

server.listen(PORT, () => {
  	console.log(`Servidor disponível em http://localhost:${PORT}/`);
});

module.exports = app;
