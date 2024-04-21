import express from 'express';

import session from 'express-session';
import allRoutes from '../routes/index.js'


const rootUserReroute = (req, res, next) => { //for root user url
    if (req.session.user) {
        return res.render('feed', {});
    } else {
        return res.redirect('/');
    }
}

export {rootUserReroute};