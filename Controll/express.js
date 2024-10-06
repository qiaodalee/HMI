import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import api from './Router/api.route.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const server = express();

// set ejs
server.set('views', path.join(__dirname, '../View'));
server.set('view engine','ejs');

server.use(cookieParser());

server.use('/img', express.static(path.join(__dirname, '../View/img')));

server.use('/css', express.static(path.join(__dirname, '../View/css')));

server.use('/index', (req, res) => {
    if ( req.cookies.isAdmin)
        res.render('index', {title: 'Home'});
    else
        res.redirect('/');
});

server.use('/api', api);

server.use('/mail', (req, res) => {
    if ( req.cookies.isAdmin)
        res.render('mail');
    else
        res.redirect('/');
});

server.use('/battery', (req, res) => {
    if ( req.cookies.isAdmin)
        res.render('battery');
    else
        res.redirect('/');
});

server.use('/', (req, res) => {
    res.render('admin');
});

// server.use('/', (req, res) =>{
//     res.send('<a href="./index">index</a><br><br><a href="./mail">mail</a>');
// });

export default server;
