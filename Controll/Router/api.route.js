import express from 'express';
import bodyParser from 'body-parser';
import api from '../Controller/api.controller.js';

const router = express.Router();
router.use(bodyParser.json());

router.post('/setPowerState', api.setPowerState);

router.get('/getPowerState', api.getPowerState);

router.post('/sendMailToUser', api.sendMailToUser);

router.post('/updatePowerState', api.updatePowerState);

export default router;