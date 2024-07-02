import mysql from 'mysql';
import redis from 'redis';
import config from '../config.js';

const conn = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database:config.database,
    port: config.dbport
});

conn.connect();

const redisClient = redis.createClient();
redisClient.connect();
redisClient.on('connect', function(){
    console.log('redis server connected on port 6379');
});

export {conn, redisClient};