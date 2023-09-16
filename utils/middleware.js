const {imagesSchema,docsSchema} = require('./errorHandlingSchema');
const Wreu = require('../models/wreu');
const AppError = require('./apperror');
const User = require('../models/user');
const Docs = require('../models/docs');

module.exports.isLoggedIn =(req,res,next)=>{ 
    if(!req.isAuthenticated()) {
        req.session.returnToo = req.originalUrl;    
        req.flash('error','You Must Be Logged In First!')
        return res.redirect('/user/login')
}
    next();
}

module.exports.imagesSchema=(req,res,next)=>{
    const {error} = imagesSchema.validate(req.body)
if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new AppError(401,msg)
}else{
    next();
}}

module.exports.docsSchema=(req,res,next)=>{
    const {error} = docsSchema.validate(req.body)
if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new AppError(401,msg)
}else{
    next();
}}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const wreu = await Wreu.findById(id)
    if(!wreu.author.equals(req.user._id)){
    req.flash('error','You Donot Have Permission')
    return res.redirect(`/wreu/${wreu._id}`)
}
    next();
}

module.exports.verifyEmail = async(req,res,next)=>{
    try{
        const user = await User.findOne({username:req.body.username})
        if(user.isVerified){
            next() 
        }else{
            await User.findByIdAndDelete(user._id)  
        req.flash('error',"Please Contact Admin To Verify Your Account")
        res.redirect('/')
        }
    }
    catch(error){
        req.flash('error',error)
    }
}

module.exports.validCategory = async(req,res,next)=>{
    const user = await Docs.find({category:req.query.category});
    const token = user.category;
    if(token !=='PNM' && token !=='INFORMAL' && token !=='NON-PAYMENT'&& token !=='SBF'&& token !=='JCCS-NEWS'&& token !=='RAILWAY-BOARD'
    && token !=='HEADQUARTER'&& token !=='DIVISION'&& token !=='FORM-FOR-STAFF'&& token !=='GS-AIRF'&& token !=='GS-WREU'&& token !=='DS-BVP'){
         req.flash('error','Invalid')
        res.redirect('/')
    
    }else{
        next();
    }
}