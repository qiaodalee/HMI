import {exec} from 'child_process';
import power from './../../Model/power.model.js';
import cache from './../../Model/redisClient.model.js'

function getNameByRecData(name){
    /*********************************
    * Receive msg from Modbus master:
    * ---------------------------------
    * | Field             | Type     |
    * ---------------------------------
    * | isLightOn         | boolean  |
    * | isACOn            | boolean  |
    * | isFanOn           | boolean  | 
    *********************************/
    switch(name){
        case 'isLightOn':
            return 'isLightOn';
        case 'isACOn':
            return 'isACOn';
        case 'isFanOn':
            return 'isFanOn';
        default:
            return '';
    }
}

async function setPowerState(received){
    let isErr = false;
    let errMsg = '';
    for ( const name in received){
        cache.set(getNameByRecData(name), received[name]);
    }

    return [isErr, errMsg];
}

export default {

    /********************* 
    * Received JSon data and set powers state
    **********************/
    async setPowerState(req, res){
        await isErr, errMsg = setPowerState(req.body);

        res.json({status:!isErr, msg:errMsg});
    },
    
    /********************* 
    * Get all power states and send HTML tag to front-end
    **********************/
    async getPowerState(req, res){
        // console.log(cache.get('isLightOn'));
        const name = ['isLightOn', 'isACOn', 'isFanOn']
        let html = '';
        return new Promise( ( resolve, reject) =>{
            let promises = [];

            name.forEach(element =>{
                let promise = cache.get(getNameByRecData(element))
                    .then((recv) =>{
                        console.log(element + ' ' + recv);
                        let state = 'off';
                        if ( recv > 0) state = 'on';

                        html += 
                            `<p>${element}</p>
                            <img src="./../img/power_${state}.jpg" onclick="out('${element}', '${recv}')" />`;
                    })

                promises.push(promise);
            })

            Promise.all(promises)
                .then(() => {
                    resolve(html);
                })
                .catch(err => {
                    console.error('Error in processing:', err);
                    reject(err);
                });
        })
            .then(() =>{
                res.send(html);
            }); 
        
    },

    /********************* 
    * Send a testing mail to target mail address with ssmtp
    * ssmtp setting:
    *   sudo apt install ssmtp
    *   
    **********************/
    sendMailToUser(req, res){
        const emailAddress = req.body.emailAddressInput;
        exec(`ssmtp ${emailAddress} < /home/matthew/Desktop/HMI/mail.txt`, (err, stdout, stderr) => {
            res.json(`stdout: ${stdout}\nstderr: ${stderr}`);
          });

        // exec(`ssmtp ;ls;# < /home/matthew/Desktop/HMI/mail.txt`, (err, stdout, stderr) => {
        //     // if (err) {
        //     //   console.error(`Error: ${err}`);
        //     //   return;
        //     // }
        //     // console.log(`stdout: ${stdout}`);
        //     // console.error(`stderr: ${stderr}`);
        //     res.send(`stdout: ${stdout}\nstderr: ${stderr}`);
        //   });
    },

    async updatePowerState(req, res){
        const [isErr, errMsg] = await setPowerState(req.body);

        await power.getPowerState()
            .then( (sqlres) =>{
                const powerState = sqlres;
                let result = {};
                powerState.forEach((element) => {
                    result[element.name] = element.state;
                });
                // fetch(`http://${config.homeMasterIP}/dashboard`, {
                //     body: JSON.stringify(result),
                //     headers: {
                //       "content-type": "application/json"
                //     },
                //     method: "POST"
                // })
                //     .then((response) => res.json(response.json()))
                //     .catch((err) =>{
                //         console.log(err);
                //         res.status(400).send('');
                //     });
                res.status(200).json('good');
            })
            .catch ( (err) =>{
                console.log(err);
                res.status(400).send('');
            });
    }
};

