const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url: String,
    key: String
});

const DocsSchema = new mongoose.Schema({
    url: String,
    key: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});

const docsSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    docs: [DocsSchema],
    date: String,
    images:[ImageSchema], 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true});

module.exports = mongoose.model('Doc',docsSchema);

