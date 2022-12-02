const Campground = require('./models/Campground');
const Review = require('./models/Review')
const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/expressError')


isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (!['/', '/login'].includes(req.originalUrl)) {
            req.session.returnTo = req.originalUrl;
        }
        req.flash('error', 'You must be logged in!')
        res.redirect('/login')
    } else
        next()
}

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next()
    }
}

async function isAuthor(req, res, next) {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (campground.author.equals(req.user._id))
        return next()
    req.flash('error', "You don't have permission to this page")
    res.redirect('/campgrounds/' + id)
}

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400)
    }
    else {
        next()
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review.author.equals(req.user._id))
        return next()
    req.flash('error', "You don't have permission to remove this review")
    res.redirect('/campgrounds/' + id)
}

module.exports = {
    isLoggedIn,
    validateCampground,
    isAuthor,
    validateReview,
    isReviewAuthor
}