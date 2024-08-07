import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import index from './Router/index.route.js';
import api from './Router/api.route.js';
import mail from './Router/mail.route.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const server = express();

// set ejs
server.set('views', path.join(__dirname, '../View'));
server.set('view engine','ejs');

server.use('/img', express.static(path.join(__dirname, '../View/img')));

server.use('/index', index);

server.use('/api', api);

server.use('/mail', mail);

server.use('/', (req, res) =>{
    res.send('<a href="https://127.0.0.1/index">index</a><br><br><a href="https://127.0.0.1/mail">mail</a>');
});

export default server;
