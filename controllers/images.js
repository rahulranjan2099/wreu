const Images = require('../models/images');
const Wreu = require('../models/wreu');
const {S3} = require('../config/s3')
 
module.exports.createImages = async(req,res)=>{
    if(Object.getOwnPropertyNames(req.files).length === 0){
        res.redirect('/') //Object is NULL
      }else{
    const {id}=req.params;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June","July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let today = new Date();
    let month =  monthNames[today.getMonth()];
    let year = today.getFullYear();
    let date = today.getDate();
    let currentDate = `${date} ${month}, ${year}`;
    
    const wreu = await Wreu.findById(id);
    const {title,description} = req.body;
    const imagesData = new Images({title,description,date:currentDate})
    imagesData.author = req.user._id;
    wreu.images.push(imagesData);
    imagesData.images = req.files.map(f =>({url:f.location,key:f.key}));    
    await imagesData.save();
    await wreu.save();
    req.flash('success','successfully uploaded images');
    res.redirect('/');
      }
}

module.exports.editImages = async(req,res)=>{
    const {id} = req.params;
    const imagesData = await Images.findById(id);
    res.render('wreupages/editImages',{imagesData});
}

module.exports.galleryDetails = async(req,res)=>{
    const {id} = req.params;
    const imagesInfo = await Images.findById(id).populate('author');
    const imagesData = imagesInfo.images;  
    res.render('wreupages/gallery-details',{imagesData,imagesInfo})
}

module.exports.updateImages = async(req,res,err)=>{
    if(Object.getOwnPropertyNames(req.files).length === 0){
        res.redirect('/') //Object is NULL
      }else{
    const {id} = req.params;
    const imagesData = await Images.findByIdAndUpdate(id,{...req.body});
        if(req.files){
    const imgs = req.files.map(f =>({url:f.location,key:f.key}));
    imagesData.images.push(...imgs);
    }
        if(req.body.deleteImages){
            for(let filename of req.body.deleteImages){
                var params = {
                    Bucket: "rahul-wreu-bucket-2021", 
                    Key: filename
                   };
                   S3.deleteObject(params, function(err, data) {
                     if (err){                                          // an error occurred 
                    req.flash('error',`${err}`)
                    res.redirect('/');
                    } 
                   });
            }
            await imagesData.updateOne({$pull:{images:{key:{$in:req.body.deleteImages}}}});
    }
    await imagesData.save();
    req.flash('success','successfully updated');
    res.redirect(`/${id}/images/gallery-details`);
    }
}

module.exports.deleteImages = async(req,res)=>{
    const imagesDelete = await Images.findById(req.params.id).populate('author');

    let imgData = [];
    imagesDelete.images.forEach((img,i)=>{
        imgData.push(img.key);
    })

    for(let filename of imgData){
        var params = {
            Bucket: "rahul-wreu-bucket-2021", 
            Key: filename
            };
        S3.deleteObject(params, function(err, data) {
            if (err){                                          // an error occurred 
                req.flash('error',`${err}`)
                res.redirect('/');
            } 
            });
            }
    const wreuArray = await Wreu.find({author:imagesDelete.author})        
    await Wreu.findByIdAndUpdate(wreuArray[0]._id,{ $pull: {images:imagesDelete._id}});
    await Images.findByIdAndDelete(req.params.id);
    req.flash('success','successfully deleted')
    res.redirect('/images');
}
