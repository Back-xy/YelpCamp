const Campground = require('../models/Campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds})
}

module.exports.renderNew = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.new = async (req, res, next) => {
    const response = await geocodingService.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // res.send(response.body.features[0].geometry.coordinates)
    const images = req.files.map(image => {
        return {
            url: image.path,
            filename: image.filename
        }
    })
    const newCamp = req.body.campground;
    newCamp.geometry = response.body.features[0].geometry;
    const campground = new Campground(newCamp);
    campground.images = images;
    campground.author = req.user;
    await campground.save();
    req.flash('success', "Campground created Successfully")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
            select: 'username'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', "Campground doesn't exist")
        res.redirect('/campgrounds')
    } else
        res.render('campgrounds/show', { campground })
}

module.exports.renderUpdate = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', "Campground doesn't exist")
        res.redirect('/campgrounds')
    } else
        res.render('campgrounds/edit', { campground })
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    const images = req.files.map(image => {
        return {
            url: image.path,
            filename: image.filename
        }
    })
    if (images.length) {
        campground.images.push(...images);
        campground.save()
    }
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', "Campground updated Successfully")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndRemove(id)
    req.flash('success', "Campground deleted Successfully")
    res.redirect('/campgrounds')
}