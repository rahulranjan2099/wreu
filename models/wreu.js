const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Images = require('./images');

const ImageSchema = new Schema({
    url:String,
    key: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
}); 

const WreuSchema = new Schema({
    profileimages:[ImageSchema],
    sliderImages:[ImageSchema],
    images:[
        {
            type:Schema.Types.ObjectId,
            ref:'Image'
        }
    ],
    bannername: String,
    docs:[
        {
            type:Schema.Types.ObjectId,
            ref:'Doc'
        }
    ],
    author: {
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});

WreuSchema.post('findOneAndDelete',async(doc)=>{
    if(doc){
        await Images.deleteMany({
            _id:{
                $in:doc.images
            }
        })
    }
})

module.exports = mongoose.model('Wreu',WreuSchema);