import { conn } from './conn.model.js';

const table = 'statement';
export default{

    setSinglePowerState( name, state){
        const cmd = `UPDATE ${table} SET state = ${state} where name="${name}";`;
        return new Promise((resolve, reject)=>{
            conn.query(cmd,  (err, res)=>{
                if(err){
                    return reject(err);
                }
                return resolve((res));
            });
        });
    },

    getPowerState(){
        const cmd = `SELECT name, state from ${table}`;
        return new Promise((resolve, reject)=>{
            conn.query(cmd,  (err, res)=>{
                if(err){
                    return reject(err);
                }
                return resolve((res));
            });
        });
    }
};