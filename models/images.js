const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url:String,
    key: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});


const imagesSchema = new mongoose.Schema({
    title: String,
    description: String,
    images:[ImageSchema],
    date: String, 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true});

module.exports = mongoose.model('Image',imagesSchema);

