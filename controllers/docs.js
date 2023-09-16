const Docs = require('../models/docs');
const Wreu = require('../models/wreu');
const { S3 } = require('../config/s3');

module.exports.createDocs = async (req, res) => {
    try {
        if (Object.getOwnPropertyNames(req.files).length === 0) {
            res.redirect('/') //Object is NULL
        }
        else {
            const { id } = req.params;
            const token = req.query.category;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
            let today = new Date();
            let month = monthNames[today.getMonth()];
            let year = today.getFullYear();
            let date = today.getDate();
            let currentDate = `${date} ${month}, ${year}`;

            const wreu = await Wreu.findById(id);
            const { title, description } = req.body;

            if (token !== 'PNM' && token !== 'INFORMAL' && token !== 'NON-PAYMENT' && token !== 'SBF'
                && token !== 'JCCS-NEWS' && token !== 'RAILWAY-BOARD'
                && token !== 'HEADQUARTER' && token !== 'DIVISION' && token !== 'FORM-FOR-STAFF'
                && token !== 'VACANCY' && token !== 'GS-AIRF' && token !== 'GS-WREU' && token !== 'DS-BVP') {
                req.flash('error', 'Invalid')
                res.redirect('/')
            } else {

                const docsData = new Docs({ title, description, date: currentDate, category: `${token}` });
                if (req.files.image) {
                    const imgs = req.files.image.map(f => ({ url: f.location, key: f.key }));
                    docsData.images.push(...imgs);
                }
                if (req.files.docs) {
                    const doc = req.files.docs.map(f => ({ url: f.location, key: f.key }));
                    docsData.docs.push(...doc);
                }

                docsData.author = req.user._id;
                wreu.docs.push(docsData);

                await docsData.save();
                await wreu.save();
                req.flash('success', 'Successfully Uploaded Document');

                switch (token) {
                    case 'PNM':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'INFORMAL':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'NON-PAYMENT':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'SBF':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'JCCS-NEWS':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'RAILWAY-BOARD':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'HEADQUARTER':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'DIVISION':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'FORM-FOR-STAFF':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'VACANCY':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'GS-AIRF':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'GS-WREU':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    case 'DS-BVP':
                        res.redirect(`/imp-docs?category=${token}`);
                        break;
                    default:
                        res.redirect('/');
                        break;
                }
            }
        }
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/');
    }
}

module.exports.docsDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const docsInfo = await Docs.findById(id).populate('author');
        const token = docsInfo.category;
        const wreuProfile = await Wreu.find({ docs: id });
        let profileUrl = [];

        if (typeof wreuProfile[0].profileimages[0] == 'undefined') {
            function defaultImage(url) {
                this.url = url;
            }
            profileUrl.push(new defaultImage("/img/default.jpg"))
        } else {
            profileUrl.push(wreuProfile[0].profileimages[0]);
        }
        res.render('wreupages/docs-single', { docsInfo, profileUrl, token });
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/');
    }

}

module.exports.getPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const docData = await Docs.find(
            { "docs._id": id },
            { _id: 0, docs: { $elemMatch: { _id: id } } });

        const docUrl = docData[0].docs[0].url;
        res.render('wreupages/view-pdf', { docUrl })
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/');
    }

}

module.exports.editDocs = async (req, res) => {
    try {
        const { id } = req.params;
        const docsData = await Docs.findById(id);
        res.render('wreupages/editDocs', { docsData });
    }
    catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/');
    }
}

module.exports.updateDocs = async (req, res) => {
    try {
        const { id } = req.params;
        const docsData = await Docs.findByIdAndUpdate(id, { ...req.body });
        if (req.files.image) {
            const imgs = req.files.image.map(f => ({ url: f.location, key: f.key }));
            docsData.images.push(...imgs);
        }
        if (req.files.docs) {
            const doc = req.files.docs.map(f => ({ url: f.location, key: f.key }));
            docsData.docs.push(...doc);
        }
        if (req.body.delete) {
            for (let filename of req.body.delete) {
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
            await docsData.updateOne({ $pull: { images: { key: { $in: req.body.delete } } } });
            await docsData.updateOne({ $pull: { docs: { key: { $in: req.body.delete } } } });
        }
        await docsData.save();
        req.flash('success', 'successfully updated');
        res.redirect(`/${id}/docs/docs-details`);
    }
    catch (error) {
        req.flash('error', `${error}`)
        res.redirect('/')
    }

}

module.exports.deleteDocs = async (req, res) => {
    try {
        const docsDelete = await Docs.findById(req.params.id).populate('author');
        const token = docsDelete.category;
        let docData = [];
        docsDelete.images.forEach((img, i) => {
            docData.push(img.key);
        })
        docsDelete.docs.forEach((doc, i) => {
            docData.push(doc.key);
        })

        for (let filename of docData) {
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
        const wreuArray = await Wreu.find({ author: docsDelete.author })
        await Wreu.findByIdAndUpdate(wreuArray[0]._id, { $pull: { docs: docsDelete._id } });
        await Docs.findByIdAndDelete(req.params.id);
        req.flash('success', 'successfully deleted');


        switch (token) {
            case 'PNM':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'INFORMAL':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'NON-PAYMENT':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'SBF':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'JCCS-NEWS':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'RAILWAY-BOARD':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'HEADQUARTER':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'DIVISION':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'FORM-FOR-STAFF':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'VACANCY':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'GS-AIRF':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'GS-WREU':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            case 'DS-BVP':
                res.redirect(`/imp-docs?category=${token}`);
                break;
            default:
                res.redirect('/');
                break;
        }

    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/');
    }
}
