require('dotenv').config()  // if(process.env.NODE_ENV !=="production"){}

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wreuRouter = require('./routes/wreu')
const imagesRouter = require('./routes/images')
const docsRouter = require('./routes/docs')
const userRouter = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo")
const cookieparser = require('cookie-parser');

// const dbUrl= 'mongodb://localhost:27017/wreu'; //process.env.DB_URL || 
const dbUrl= process.env.DB_URL; //process.env.DB_URL || 
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex:true, 
    useUnifiedTopology: true,
    useFindAndModify:false
})
.then(()=>{
console.log('Mongoose connection done!!')
})
.catch((err)=>{
    console.log('ughhh Mongoose connection failed')
    console.log(err)
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(cookieparser()); //use
app.use(express.json());
app.use(methodOverride('_method'));
app.use(mongoSanitize({
    replaceWith:'_'
}))

const secret = process.env.SECRET || 'thisismysecret';
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60
});

store.on("error",function(e){
    console.log("Session store ERROR",e);
})

const sessionConfig = {
    store,
    name:'rahul',
    secret,
    resave:false,
    saveUninitialized: true,
    cookie:{
        // secure:true, (only when deployed)
        expires: Date.now() *1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly:true
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({contentSecurityPolicy:false})); //use contentSecuritypolicy in future 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/user',userRouter)
app.use('/',wreuRouter)
app.use('/:id/images',imagesRouter)
app.use('/:id/docs',docsRouter)

app.use(express.static('public'))
app.use((err, req, res, next)=>{
    const {status = 500} = err;
    if(!err.message) err.message = 'Product not found'
    res.status(status).render('error',{err})
})

app.get('/', async (req,res)=>{
    res.redirect('/');
})

const port = 3000;

app.listen(port,()=>{
    console.log(`PORT STARTING AT ${port}`)
})


