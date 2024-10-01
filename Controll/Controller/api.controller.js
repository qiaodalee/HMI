import {exec} from 'child_process';
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
    'nameplateCapacityPercentage': 0
};

let solarHistoryDatas = {
    'timestamp': 0,
    'powerGeneration': {},
    'co2Reduction': {},
    'powerUsed': {},
    'nameplateCapacityPercentage': {}
};

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

    if ( !solarHistoryDatas['powerGeneration'][currentYear]){
        solarHistoryDatas['powerGeneration'][currentYear] = {};
    }

    if ( !solarHistoryDatas['powerGeneration'][currentYear][currentMonth]) {
        solarHistoryDatas['powerGeneration'][currentYear][currentMonth] = {};  
    } 

    if ( !solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay]) {
        solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay] = {};  
    } 

    if ( !solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay][currentHour]) {
        solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay][currentHour] = {};  
    } 

    if ( !solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay][currentHour][currentMinute]) {
        solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay][currentHour][currentMinute] = {};  
    } 

    solarHistoryDatas['powerGeneration'][currentYear][currentMonth][currentDay][currentHour][currentMinute] = getRandomPowerGenerationNumber(currentMonth, currentHour);

}

function updateSolarDatas(){
    const currentDate = new Date();

    if ( solarHistoryDatas['timestamp'].getMinutes() != currentDate.getMinutes()){
        getRandomPowerGeneration(currentDate);
        Object.keys(solarHistoryDatas['powerGeneration']).forEach((year) => {
            const yearData = solarHistoryDatas['powerGeneration'][year];
            Object.keys(yearData).forEach((month) => {
                const monthData = yearData[month];
                solarDatas['monthGeneration'] = 0;
                Object.keys(monthData).forEach((date) => {
                    const dateData = monthData[date];
                    solarDatas['dayGeneration'] = 0;
                    solarDatas['todayPowerUsed'] = 0;
                    Object.keys(dateData).forEach((hour) => {
                        const minuteData = dateData[hour];
                        Object.keys(minuteData).forEach((powerGeneration) => {
                            // console.log(powerGeneration , minuteData[powerGeneration]);
                            solarDatas['monthGeneration'] += Math.floor(minuteData[powerGeneration]/60);
                            solarDatas['dayGeneration'] += Math.floor(minuteData[powerGeneration]/60);
                            solarDatas['totalPowerGeneration'] += Math.floor(minuteData[powerGeneration]/60);
                            solarDatas['currentGeneration'] = minuteData[powerGeneration];

                            solarDatas['co2Reduction'] += minuteData[powerGeneration] * 0.5;
                            solarDatas['todayPowerUsed'] += ((((getRandomPowerGenerationNumber(month, hour)) * 0.02) + getRandomNumber(2, 1, true))/ 60);
                            // console.log(solarDatas['todayPowerUsed'] / 60)
                        });
                    });
                });
            });
        });

        solarDatas['nameplateCapacityPercentage'] = getRandomNumber(40, 80, true) / 10;
        solarDatas['systemEfficiency'] = (solarDatas['currentGeneration'] > 0) ? (getRandomNumber(40, 950, true) / 10) : 0;
        solarHistoryDatas['timestamp'] = currentDate;
        solarDatas['todayPowerUsed'] = Math.floor(solarDatas['todayPowerUsed']);
    }   

    console.log(solarDatas);
}

function initSolarHistoryDatas(){
    let currentDate = new Date("2023-01-01");
    const endDate = new Date();

    endDate.setMinutes(endDate.getMinutes() - 1);

    let i = 0;
    
    while( currentDate < endDate){
        getRandomPowerGeneration(currentDate);
        currentDate.setTime(currentDate.getTime() + 60000);
    }

    solarHistoryDatas['timestamp'] = endDate;
}

initSolarHistoryDatas();
updateSolarDatas();
setInterval(() =>{
    updateSolarDatas();
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
    }
};

