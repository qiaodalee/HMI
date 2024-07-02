import modbusTCP from modbus-serial;

const slave = modbusTCP();

async function connect(ip, port){
    await slave.connectTCP(ip, {'port': port});
}

async function setId(id){
    await slave.setId(id);
}

async function readHoldingRegisters(startAddress, amount){
    await slave.readHoldingRegisters(startAddress, amount, (err, res) =>{
        if ( err){
            console.log(err);
            return err;
        }
        return res;
    });
}

export default {

};