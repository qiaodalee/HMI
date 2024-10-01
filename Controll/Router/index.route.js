import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    if ( req.cookies.isAdmin)
        res.render('index', {title: 'Home'});
    else
        res.redirect('../');
});

export default router;