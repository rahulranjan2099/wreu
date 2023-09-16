const jwt = require('jsonwebtoken')

const loginRequired = async(req,res,next) =>{
    const token = req.cookies['access-token']
    if(token){
        const validateToken = await jwt.verify(token, process.env.JWT_SECRET)
        if(validateToken){
            res.user = validateToken.id
            req.flash('success',"Token verified")
            next()            
        }else{
            req.flash('error','token expires')
            res.redirect('/user/login')
        }
    }else{
        req.flash('error','Token Not Found')
        res.redirect('/user/login')
    }
}


module.exports = {loginRequired} 