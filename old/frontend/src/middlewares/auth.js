module.exports = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};