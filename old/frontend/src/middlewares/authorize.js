module.exports = (allowedRoles, redirectUrl = '/login') => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.redirect(redirectUrl);
    }
    next();
};