const { descriptors, places } = require('./titleSeedHelper')
const iqCities = require('./iraqCities')

const mongoose = require('mongoose');
// mongodb+srv://Back_xy:zzFrEYJXMDn16Ag8@cluster0.yzt42mj.mongodb.net/?retryWrites=true&w=majority
// mongodb://localhost:27017/yelp-camp
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Mongoose CONNECTED!')
    })
    .catch(err => {
        console.log('Mongoose ERROR')
        console.log(err)
    });
const Campground = require('../models/Campground')

// pickes a random element from the array that has passen through it
function randomPicker(array) {
    return array[Math.floor(Math.random() * array.length)]
}

// creates a random title based of a descriptor and a place
function titleMaker() {
    return `${randomPicker(descriptors)} ${randomPicker(places)}`
}

async function resetDatabase() {
    await Campground.deleteMany();
    for (let i = 0; i < 50; i++) {
        let random1000 = Math.floor(Math.random() * 130);
        const newCamp = new Campground({
            title: titleMaker(),
            author: '637328e079e27ffc627df529',
            images: [
                {
                  url: 'https://res.cloudinary.com/dnzzofw87/image/upload/v1666823266/YelpCamp/r7musesoamgljpo5tzan.jpg',
                  filename: 'YelpCamp/r7musesoamgljpo5tzan'
                },
                {
                  url: 'https://res.cloudinary.com/dnzzofw87/image/upload/v1666823380/YelpCamp/mfxhldgbcguyymy8t2ny.jpg',
                  filename: 'YelpCamp/mfxhldgbcguyymy8t2ny'
                },
                {
                  url: 'https://res.cloudinary.com/dnzzofw87/image/upload/v1666823486/YelpCamp/jgzjiv0dusrkxys7sh2y.jpg',
                  filename: 'YelpCamp/jgzjiv0dusrkxys7sh2y'
                }
              ],
            location: `${iqCities[random1000].city}, ${iqCities[random1000].admin_name}`,
            geometry: {
                type: "Point",
                coordinates: [iqCities[random1000].lng, iqCities[random1000].lat]
            },
            price: Math.floor(Math.random() * 50) + 10,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea sequi deserunt sunt fugiat quas autem, reprehenderit alias, labore vero repudiandae officiis error sit libero illo? Voluptatibus iusto delectus voluptate eligendi.'
        })
        await newCamp.save();
    }
}

resetDatabase()
    .then(() => {
        console.log('Database Reseted')
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log('SOMETHING WENT WRONG!')
        console.log(err)
    })