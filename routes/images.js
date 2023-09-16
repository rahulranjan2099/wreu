const express = require('express');
const router = express.Router({mergeParams:true});
const {isLoggedIn,imagesSchema} = require('../utils/middleware');
const images = require('../controllers/images')
const wrapAsync = require('../utils/wrapAsync');
const {uploadS3}= require('../config/s3');

router.route('/edit')
    .get(isLoggedIn,wrapAsync(images.editImages))  
    .put(isLoggedIn,uploadS3.array('image'),imagesSchema,wrapAsync(images.updateImages))
    .delete(isLoggedIn,wrapAsync(images.deleteImages));

router.post('/',isLoggedIn,uploadS3.array('image'),imagesSchema,wrapAsync(images.createImages));

router.get('/gallery-details',images.galleryDetails);

module.exports = router;  