const {Client, Pool} = require('pg')

let PG_USER = 'postgres';
const PG_PSSW = 'bug';
const DB = 'criador-apostila';
const TIMEOUT = 30000;
const HOST = '192.168.1.169';
const PORT = '5433';

const dbConfig = {
    user: PG_USER,
    password: PG_PSSW,
    database: DB,
    host: HOST,
    port: PORT,
    idleTimeoutMillis: TIMEOUT,
};


exports.db = new Pool(dbConfig)