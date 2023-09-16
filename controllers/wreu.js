const Wreu = require('../models/wreu');
const Images = require('../models/images');
const Docs = require('../models/docs');
const { S3 } = require('../config/s3');
const Banner = require('../models/banner');

module.exports.index = async (req, res, err) => {
    try {
        // const wreu = await Wreu.find({profileimages:{$exists:true}}).populate('author'); //to find existance of particular key
        const wreu = await Wreu.find({}).populate({
            path: 'images',
            populate: {
                path: 'author'
            }
        }).populate('author');
        const bannerData = await Banner.find({});
        const imagesInfo = await Images.find({}).populate('images').sort({ createdAt: -1 });
        let imgsource = [];
        let namesource = [];
        let designation = [];

        for (let i = 0; i < wreu.length; i++) {
            if (typeof wreu[i].profileimages[i] == 'undefined') {
                function defaultImage(url) {
                    this.url = url;
                }
                wreu[i].profileimages.push(new defaultImage("/img/default.jpg"))
            }
        }

        for (let i = 0; i < wreu.length; i++) {
            imgsource.push(wreu[i].profileimages[0].url);
            namesource.push(wreu[i].author.name);
            designation.push(wreu[i].author.designation);
        }

        let userinfo = imgsource.map(function (value, index) {
            return { image: value, name: namesource[index], designation: designation[index] }
        });

        let sliderUrl = [];
        for (let i = 0; i < wreu.length; i++) {
            if (typeof wreu[i].sliderImages !== 'undefined' && wreu[i].sliderImages.length !== 0) {
                for (let k = 0; k < wreu[i].sliderImages.length; k++) {
                    sliderUrl.push(wreu[i].sliderImages[k])
                }
            }
        }
        if (sliderUrl == 0) {
            function defaultImage(url) {
                this.url = url;
            }
            sliderUrl.push(new defaultImage("/img/defaultSlider.jpg"))
        }
        // Link Display of Latest Posts And Recent Events
        const docsLink = await Docs.find({}).sort({ createdAt: -1 });

        //Banner
        const banner = bannerData[0];

        //vacancy-Link
        const latestVacancy = await Docs.findOne({ category: "VACANCY" }).sort({ createdAt: -1 });

            res.render('wreupages/index', { userinfo, wreu, sliderUrl, imagesInfo, docsLink, banner, latestVacancy });

    } catch (error) {
        res.send(error)
    }
}

module.exports.history = (req, res) => {
    res.render('wreupages/history')
}

module.exports.docsForum = (req, res) => {
    res.render('wreupages/docsForum')
}

module.exports.docsImpCircular = (req, res) => {
    res.render('wreupages/docsImp-circular')
}

module.exports.docsUnionLetter = (req, res) => {
    res.render('wreupages/docsUnionLetter')
}

module.exports.docsFormStaff = async (req, res) => {
    const token = 'FORM-FOR-STAFF';
    const docsData = await Docs.find({ category: `${token}` }).sort({ createdAt: -1 });
    res.render('wreupages/imp-docs', { docsData, token });
}

module.exports.docsVacancy = async (req, res) => {
    const token = 'VACANCY';
    const docsData = await Docs.find({ category: `${token}` }).sort({ createdAt: -1 });
    res.render('wreupages/imp-docs', { docsData, token });
}

module.exports.impdocs = async (req, res) => {
    const token = req.query.category;
    const docsData = await Docs.find({ category: `${token}` }).sort({ createdAt: -1 });
    res.render('wreupages/imp-docs', { docsData, token })
}

module.exports.officialgallery = async (req, res) => {
    const imagesInfo = await Images.find({}).sort({ createdAt: -1 });
    res.render('wreupages/official-gallery', { imagesInfo });
}

module.exports.newPhoto = async (req, res) => {
    const wreuProfile = await Wreu.find({ author: req.user._id });
    const wreu = wreuProfile[0];
    res.render('wreupages/new', { wreu });
}

module.exports.addDocs = async (req, res) => {
    const token = req.query.category;
    if (token !== 'PNM' && token !== 'INFORMAL' && token !== 'NON-PAYMENT' && token !== 'SBF' && token !== 'JCCS-NEWS' && token !== 'RAILWAY-BOARD'
        && token !== 'HEADQUARTER' && token !== 'DIVISION' && token !== 'FORM-FOR-STAFF'
        && token !== 'VACANCY' && token !== 'GS-AIRF' && token !== 'GS-WREU' && token !== 'DS-BVP') {
        req.flash('error', 'Invalid')
        res.redirect('/')

    } else {
        const wreuProfile = await Wreu.find({ author: req.user._id });
        const wreu = wreuProfile[0];
        res.render('wreupages/newDocs', { wreu, token });
    }
}

module.exports.profileWreu = async (req, res) => {
    const wreuprofile = await Wreu.find({ author: req.user._id });
    const bannerData = await Banner.find({})
    const banner = bannerData[0];
    const wreu = wreuprofile[0];
    res.render('wreupages/profile', { wreu, banner });
}

module.exports.updateWreu = async (req, res) => {
    await Banner.deleteMany({})
    const banner = new Banner({ bannerName: req.body.bannername })
    await banner.save()
    const { id } = req.params;
    const wreu = await Wreu.findByIdAndUpdate(id, { ...req.body })
    if (req.files.image) {
        const imgs = req.files.image.map(f => ({ url: f.location, key: f.key }));
        wreu.profileimages.push(...imgs);
    }
    if (req.files.sliderImage) {
        const imgs = req.files.sliderImage.map(f => ({ url: f.location, key: f.key }));
        wreu.sliderImages.push(...imgs);
    }
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            var params = {
                Bucket: "rahul-wreu-bucket-2021",
                Key: filename
            };
            S3.deleteObject(params, function (err, data) {
                if (err) {                                          // an error occurred 
                    req.flash('error', `${err}`)
                    res.redirect('/');
                }
            });
        }
        await wreu.updateOne({ $pull: { profileimages: { key: { $in: req.body.deleteImages } } } });
        await wreu.updateOne({ $pull: { sliderImages: { key: { $in: req.body.deleteImages } } } });
    }
    await wreu.save();
    req.flash('success', 'successfully updated');
    res.redirect('/');
}
