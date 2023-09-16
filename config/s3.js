require('dotenv').config()

const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4;
const path = require('path');
const aws = require('aws-sdk')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY


const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads');
    },
    filename:(req,file,cb)=>{
        const ext = path.extname(file.originalname);
        cb(null, `${uuid()}${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(null,false);
      return cb(new Error('Only Images Extension Accepted'));
    }
  };

const multerDocFilter = (req, file, cb) => {
    
    if (file.mimetype.startsWith('application') || file.mimetype.startsWith('image')) {
            cb(null, true);
    } else {
        cb(null,false);
        req.flash('error','Only PDF And Images Extension Accepted')
    }
  };  

  const multerProfileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
            req.flash('error','Only Images Extension Allowed(JPG,JPEG,PNG)')
            return cb(null, false);
    } else {
      cb(null,true);
    }
  };
const s3 = new aws.S3({
    apiVersion: '2006-03-01',
    region,
    accessKeyId,
    secretAccessKey
});

exports.upload = multer({storage});

exports.S3 = s3;

exports.uploadS3 = 
multer({
    limits: { fileSize: 20*1024*1024 },
    storage: multerS3({
        s3:s3,
        bucket: bucketName,
        acl: 'public-read',
        metadata: (req,file,cb)=>{
            cb(null,{fieldName: file.fieldname});
        },
        key:(req,file,cb)=>{
            const ext = path.extname(file.originalname);
            cb(null, `image-${uuid()}${ext}`);
        }
    }),
    fileFilter: multerFilter,
});
exports.uploadProfileS3 = 
multer({
    limits: { fileSize: 20*1024*1024 },
    storage: multerS3({
        s3:s3,
        bucket: bucketName,
        acl: 'public-read',
        metadata: (req,file,cb)=>{
            cb(null,{fieldName: file.fieldname});
        },
        key:(req,file,cb)=>{
            const ext = path.extname(file.originalname);
            cb(null, `image-${uuid()}${ext}`);
        }
    }),
    fileFilter: multerProfileFilter,
});
exports.uploadDocumentS3 = 
multer({
    limits: { fileSize: 15*1024*1024 },
    storage: multerS3({
        s3:s3,
        bucket: bucketName,
        acl: 'public-read',
        metadata: (req,file,cb)=>{
            cb(null,{fieldName: file.fieldname});
        },
        key:(req,file,cb)=>{
            const ext = path.extname(file.originalname);
            cb(null, `document-${uuid()}${ext}`);
        },
    }),
    fileFilter: multerDocFilter,
});
