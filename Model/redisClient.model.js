import { redisClient } from './conn.model.js';

export default {
    set( key, val){
        redisClient.set(key, val)
            .then((res) =>{
                console.log(`[${key}:${val}] ${res}`);
            })
    },

    get( key){
        return new Promise( ( resolve, reject) =>{
            redisClient.get(key)
                .then((res) =>{
                    console.log(res);
                    resolve( res);
                })
        })
    }
};