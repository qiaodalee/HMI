import express from 'express';
import bodyParser from 'body-parser';
import api from '../Controller/api.controller.js';

const router = express.Router();
router.use(bodyParser.json());

router.post('/sendMailToUser', api.sendMailToUser);

router.post('/admin', api.admin);

router.get('/getSolarData', api.getSolarData);

router.get('/getSolarHistoryDatas', api.getSolarHistoryDatas);

export default router;