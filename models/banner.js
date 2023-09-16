const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bannerName: {
        type:String,
        max:1
    }
});

module.exports = mongoose.model('Banner',bannerSchema);

