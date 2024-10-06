import { rejects } from 'assert';
import {exec} from 'child_process';
import { resolve } from 'path';
import { start } from 'repl';

// admin: admin
const users = {
    ed0d1b8cdb: 'ed0d1b8cdb'
}

let solarDatas = {
    'totalPowerGeneration': 0,
    'monthGeneration': 0,
    'dayGeneration': 0,
    'currentGeneration': 0,
    'systemEfficiency': 0,
    'co2Reduction': 0,
    'todayPowerUsed': 0,
    'nameplateCapacity': 5000000,
    'nameplateCapacityPercentage': 0
};

let solarHistoryDatas = {
    'timestamp': 0,
};

let HMIData = {};

function getRandomNumber(range, base, isInteger){
    if ( isInteger) return Math.floor(Math.random() * range)+base; 

    return (Math.random() * range)+base;
}

function getRandomPowerGenerationNumber(currentMonth, currentHour){
    let powerGeneration = 0;
    // if ( (currentMonth <= 4 && currentMonth > 1) || (currentMonth <= 10 && currentMonth > 7)){
    //     powerGeneration += 10;
    // }
    // else if ( (currentMonth <= 7 && currentMonth > 4)){
    //     powerGeneration += 20;
    // }

    if ( currentHour < 8 && currentHour >= 18){
        powerGeneration = getRandomNumber(30, 0, true);
    }
    else if ( currentHour >= 8 && currentHour < 10){
        powerGeneration = getRandomNumber(40, 10, true);
    }
    else if ( (currentHour >= 10 && currentHour < 12) || (currentHour >= 14 && currentHour < 16)){
        powerGeneration = getRandomNumber(50, 30, true);
    }
    else if ( currentHour >= 12 && currentHour < 14){
        powerGeneration = getRandomNumber(40, 60, true);
    }
    else if ( currentHour >= 16 && currentHour < 18){
        powerGeneration = getRandomNumber(30, 0, true);
    }

    return powerGeneration;
}

function getRandomPowerGeneration(currentDate){
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    if ( !solarHistoryDatas[currentYear]){
        solarHistoryDatas[currentYear] = {};
    }

    if ( !solarHistoryDatas[currentYear][currentMonth]) {
        solarHistoryDatas[currentYear][currentMonth] = {};  
    } 

    if ( !solarHistoryDatas[currentYear][currentMonth][currentDay]) {
        solarHistoryDatas[currentYear][currentMonth][currentDay] = {};  
    } 

    if ( !solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour]) {
        solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour] = {};  
    }

    solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute] = {};

    solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'] = getRandomPowerGenerationNumber(currentMonth, currentHour) / 20;
    solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['co2Reduction'] = solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'] * (getRandomNumber(3, 4, true) / 10);
    solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerUsed'] = ((getRandomPowerGenerationNumber(currentMonth, currentHour)*0.02) + getRandomNumber(20, 0, true)) / 20
    solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['nameplateCapacity'] = solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'] - solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerUsed'];

    // console.log(solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration']);


    solarDatas['totalPowerGeneration'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'];
    
    if ( currentDay == 1) solarDatas['monthGeneration'] = 0;
    solarDatas['monthGeneration'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'];

    if ( currentHour == 0) {
        solarDatas['dayGeneration'] = 0;
        solarDatas['todayPowerUsed'] = 0;
    }
    solarDatas['dayGeneration'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'];

    solarDatas['currentGeneration'] = solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerGeneration'] * 60;

    solarDatas['systemEfficiency'] = (solarDatas['currentGeneration'] > 0) ? (getRandomNumber(40, 950, true) / 10) : 0;

    solarDatas['co2Reduction'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['co2Reduction'];

    solarDatas['todayPowerUsed'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['powerUsed'];

    solarDatas['nameplateCapacity'] += solarHistoryDatas[currentYear][currentMonth][currentDay][currentHour][currentMinute]['nameplateCapacity'];
    solarDatas['nameplateCapacityPercentage'] = solarDatas['nameplateCapacity'] / 300000;

    // console.log(solarDatas)
}

function updateSolarDatas(){
    const currentDate = new Date();

    if ( solarHistoryDatas['timestamp'].getMinutes() != currentDate.getMinutes()){
        getRandomPowerGeneration(currentDate);
        solarHistoryDatas['timestamp'] = currentDate;
    }   

    console.log(solarDatas);
}

function initSolarHistoryDatas(){
    let currentDate = new Date("2023-01-01");
    // let currentDate = new Date("2024-10-06");
    const endDate = new Date();

    endDate.setMinutes(endDate.getMinutes() - 1);

    let i = 0;
    
    while( currentDate < endDate){
        getRandomPowerGeneration(currentDate);
        currentDate.setTime(currentDate.getTime() + 60000);
    }

    solarHistoryDatas['timestamp'] = endDate;
}

function getHMIData(){
    return new Promise((resolve, rejects) => {
        fetch('http://127.0.0.1:8080/api/getChartData')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                Object.keys(data).forEach( (host) => {
                    console.log(data[host]['historyData']['electricProduction']);
                })

                resolve(data);
            });
    });
    
}

initSolarHistoryDatas();
updateSolarDatas();
getHMIData();
setInterval(() =>{
    updateSolarDatas();
    getHMIData()
        .then(recv => {
            HMIData = recv;
        })
}, 20000);

export default {

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

    admin(req, res){
        const user = req.body['user'];
        const passwd = req.body['passwd'];

        /* sql */
        if ( users[user] != undefined && users[user] && passwd == users[user]){
            res.cookie('isAdmin', true, {maxAge: 24 * 60 * 60 * 1000});
            res.send(true);
        }
        else{
            res.cookie('isAdmin', false, {maxAge: 24 * 60 * 60 * 1000});
            res.send(false);
        }
    },

    getSolarData( req, res){
        res.json(solarDatas);
    },

    getSolarHistoryDatas( req, res){
        res.json(solarHistoryDatas);
    },

    getHMIData( req, res){
        res.json(HMIData);
    }
};  

