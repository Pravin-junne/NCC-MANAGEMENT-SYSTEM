// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login"); // Redirect to login if not authenticated
}




//admin dashboard protection of route
module.exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    next();
};

