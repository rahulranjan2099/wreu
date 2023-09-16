const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const users = require('../controllers/users');
const {verifyEmail} = require('../utils/middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(wrapAsync(users.register));
 
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/user/login'}),
    verifyEmail,users.login);

router.get('/logout',users.logout);

router.get('/verify-email',users.verifyEmail);

module.exports = router;