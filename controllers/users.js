const User = require('../models/user');
const Wreu = require('../models/wreu');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
// const AWS = require('aws-sdk');

// AWS.config.update({
//  credentials
// });
const CLIENT_ID = '950695236259-c0nh2usgo4kjulbeqs86jtlefkliqis8.apps.googleusercontent.com'
const CLIENT_SECRET = 'dSCHehJ8tGR1Vy4sJ96lXh3G'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04fWoy537GSfQCgYIARAAGAQSNwF-L9Ir3MDUB0D8YzozIdp7eiwVrZMP4Gso4aIutrKz9_DAAOSu7cjzWuQ1ydebY-8nigKyAc4'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})


module.exports.renderRegister = (req,res)=>{
    res.render('users/register')
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login')
}

module.exports.verifyEmail = async(req,res) =>{
    try{
        const token = req.query.token
        const user = await User.findOne({emailToken:token})
        if(user){
            user.emailToken = null
            user.isVerified = true
            await user.save()
            const wreu = new Wreu({}) 
            wreu.author = user._id;
            await wreu.save();
            req.flash('success','Yayy Email confirmation successfull !')
            res.redirect('/user/login')
        }else{
            req.flash('error','Email Is Not Verified')
            res.redirect('/user/register')
        }

    }
    catch(err){
        req.flash('error',`${err}`)
        res.redirect('/')
    }
}
  
module.exports.logout = (req,res)=>{
    res.cookie('access-token',"",{maxAge : 1})
    req.logout();
    req.flash('success','Successfully Logout :)')
    res.redirect('/')
}

// let transporter = nodemailer.createTransport({
//     SES: new AWS.SES({
//       apiVersion: '2010-12-01'
//     })
//     });
 

 
module.exports.register = async (req,res,next)=>{
    try{    
    const {email,username,name,password,designation}=req.body;
    const user = new User({
        email,
        username,
        name,
        designation,
        emailToken: crypto.randomBytes(64).toString('hex'),
        isVerified: false 
    });
    
    const accessToken = await oAuth2Client.getAccessToken()
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            type: 'OAuth2',
            user:'rahulranjantom@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
        }
        // tls:{
        //     rejectUnauthorized: false
        // }
    })

    let mailOptions = {
        from: ' "Verify your Email" <rahulranjantom@gmail.com ',
        // to: user.email,
        to: 'ranbirahul9@gmail.com , 18bcs1730@gmail.com',
        subject: 'WREU-BVP Registration -Verify your email',
        html:`<h2> ${user.name} ! Thanks for registering on our website</h2><br>
        <h4> Please Verify your mail to continue....</h4>
        <a href="http://${req.headers.host}/user/verify-email?token=${user.emailToken}">Verify Your Email</a>`
    }
    await User.register(user,password);
    //sending email
  
    transporter.sendMail(mailOptions, function (error, info){
        if(error){
            req.flash('error',"Failed To Send Email")
            res.redirect('/')
        }else{
            req.flash('success',"Verification Email Is Send To The Officials")
            res.redirect('/user/login')
        }  
      })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/user/register')
    }
}



const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET)
}


module.exports.login = async(req,res)=>{
    try{
        const {username} = req.body;
        const findUser = await User.findOne({username:username});
        if(findUser){
            const token = createToken(findUser.id);
            res.cookie('access-token',token)
            req.flash('success','Welcome Back');
            const redirectUrl = req.session.returnToo || '/';
            delete req.session.returnToo
            res.redirect(redirectUrl);
        }else{
                req.flash('error','User not registered')
                res.redirect('/')
            }

    }catch(e){
        req.flash('error',`${e}`)
        res.redirect('/')
    }
}
