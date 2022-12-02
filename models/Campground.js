const Review = require('./Review')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//https://res.cloudinary.com/dnzzofw87/image/upload/v1666638679/YelpCamp/rj4htskdkocaxofkyfof.jpg
const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});
// to make virtuals a part of the schema object
const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    images: [imageSchema],
    location: {
        type: String
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts)

campgroundSchema.post('findOneAndRemove', async (doc) => {
    if (doc.reviews.length) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})
// in the schema
// properties:{
//     popupMarkup:`<b><a href="/campgrounds/${this._id}">${this.title}</a></b>
//                 <p>${this.description.substring(0,70)}...</p>`
// }
campgroundSchema.virtual('properties.popupMarkup').get(function(){
    return `<h6><a href="/campgrounds/${this._id}">${this.title}</a></h6>
            <p>${this.description.substring(0,70)}...</p>`
})

const Campground = mongoose.model('Campground', campgroundSchema)
module.exports = Campground;