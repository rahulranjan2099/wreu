const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const {isLoggedIn,isAuthor} = require('../utils/middleware')
const wreu = require('../controllers/wreu');
const {uploadProfileS3} = require('../config/s3')
const {loginRequired} = require('../config/JWT');

router.route('/')
    .get(wrapAsync(wreu.index))

router.get('/docs-forum', wreu.docsForum);

router.get('/docs-impCircular', wreu.docsImpCircular);

router.get('/docs-form-for-staff', wreu.docsFormStaff);

router.get('/docs-unionLetter', wreu.docsUnionLetter);

router.get('/docs-vacancy', wreu.docsVacancy);
    
router.get('/imp-docs', wreu.impdocs); 

router.get('/history', wreu.history); 

router.get('/images', wreu.officialgallery);

router.get('/newPhoto',isLoggedIn, loginRequired, wrapAsync(wreu.newPhoto));

router.get('/addDocs',isLoggedIn, loginRequired, wrapAsync(wreu.addDocs));

router.get('/profile',isLoggedIn, loginRequired, wrapAsync(wreu.profileWreu));

router.route('/:id')
    .put(isLoggedIn, isAuthor, uploadProfileS3.fields([{name:'image',maxCount:1},{name:'sliderImage',maxCount:4}]), wrapAsync(wreu.updateWreu))

module.exports = router;