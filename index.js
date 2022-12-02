// if not in production mode
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
///////////////////////////////////////////////////////

const express = require('express')
const app = express();
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('express-flash')
const mongoose = require('mongoose');
const passport = require('passport')
const LocalStrategy = require('passport-local')

const ExpressError = require('./utils/expressError')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')
const userRoutes = require('./routes/user')
const User = require('./models/User')

// to prevent mongo injections
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const CSPConfig = require('./utils/CSPConfig')

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongoose CONNECTED!')
    })
    .catch(err => {
        console.log('Mongoose ERROR')
        console.log(err)
    });

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
    //   contentSecurityPolicy: false
    })
  );
app.use(
    helmet.contentSecurityPolicy(CSPConfig)
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbUrl,
        secret,
        touchAfter: 24*60*60 //24 hours
    }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())



app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

app.get('/', (req, res) => {
    res.render('home.ejs')
})
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND!', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 404 } = err;
    if (!err.message)
        err.message = 'SOMETHING WENT WRONG'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})