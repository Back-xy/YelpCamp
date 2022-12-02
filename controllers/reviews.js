const Review = require('../models/Review')
const Campground = require('../models/Campground');

module.exports.new = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const { rating, body } = req.body.review;
    const review = new Review({ rating, body });
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save();
    res.redirect('/campgrounds/' + campground._id)
}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params;
    // pull (remove) in the reviews array if has a value of reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)
    res.redirect('/campgrounds/' + id)
}