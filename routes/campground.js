const express = require('express')
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })
// Erorr handlers
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middlewares')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.new))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files)
//     res.send('Complete')
// })

router.get('/new', isLoggedIn, campgrounds.renderNew)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderUpdate))

module.exports = router;