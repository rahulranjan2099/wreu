const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    email:{
        required:true,
        type:String,
        unique:true
    },
    username: {
        required: true,
        type: String,
        unique: true
    },
    name: {
        required: true,
        type: String
    },
    designation: String,
    emailToken: {
        type: String
    },
    isVerified:{
        type: Boolean,
    },
    date:{
        type:Date,
        default: Date.now()
    }
        
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',UserSchema);