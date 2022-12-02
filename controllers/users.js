const User = require('../models/User')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, err) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err)
                return next(err)
            req.flash('success', 'Welcome to YelpCamp ' + username + '!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    res.redirect(req.session.returnTo || '/campgrounds');
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
        req.flash('success', 'Logged you out!')
        res.redirect('/campgrounds');
    });
}