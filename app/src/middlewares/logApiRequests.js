const path = require('path');
const fs = require('fs');
const logApiRequests = (req, res, next) => {
    const logFile = path.join(__dirname, 'api-docs.json');
    const routeInfo = {
        method: req.method,
        path: req.originalUrl,
        query: req.query,
        body: req.body,
    };
    let apiDocs = [];
    if (fs.existsSync(logFile)) {
        apiDocs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    }
    const isRouteLogged = apiDocs.some(route => route.method === routeInfo.method && route.path === routeInfo.path);
    if (!isRouteLogged) {
        apiDocs.push(routeInfo);
        fs.writeFileSync(logFile, JSON.stringify(apiDocs, null, 2));
    }
    next();
};
module.exports = logApiRequests;
