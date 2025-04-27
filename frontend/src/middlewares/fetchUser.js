const axios = require('axios');

module.exports = async function (req, res, next) {
    const token = req.cookies?.token;
    if (token) {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/api/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            req.user = response.data.user;
        } catch (e) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};