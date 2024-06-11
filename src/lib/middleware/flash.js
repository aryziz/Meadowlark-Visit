module.exports = (req, res, next) => {
    if (req.session) {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    } else {
        res.locals.flash = undefined;
    }
    next();
}
