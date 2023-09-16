const express = require('express');
const router = express.Router({mergeParams:true});
const {isLoggedIn,docsSchema} = require('../utils/middleware');
const docs = require('../controllers/docs')
const wrapAsync = require('../utils/wrapAsync');
const {uploadDocumentS3}= require('../config/s3');


router.get('/docs-details',wrapAsync(docs.docsDetails));

router.get('/getPdf',wrapAsync(docs.getPdf));

router.route('/edit')
.get(isLoggedIn,wrapAsync(docs.editDocs))  
.put(isLoggedIn,uploadDocumentS3.fields([{name:'image',maxCount:10},{name:'docs',maxCount:10}]),docsSchema,wrapAsync(docs.updateDocs))
.delete(isLoggedIn,wrapAsync(docs.deleteDocs));

router.post('/',uploadDocumentS3.fields([{name:'image', maxCount:10},{name:'docs',maxCount:10}]),wrapAsync(docs.createDocs));

module.exports = router;