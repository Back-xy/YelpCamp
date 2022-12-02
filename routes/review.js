const express = require('express')
const router = express.Router({ mergeParams: true })
const reviews = require('../controllers/reviews')
//Error handlers
const catchAsync = require('../utils/catchAsync')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middlewares')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.new))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router