/**
 * sessionAnon
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
    Auth.checkToken(req, function(err, result) {
        if (err) {
            return res.serverError({"status": "error", "detail": err});
        }
        if (result) {
            return res.forbidden({
                "status": "error",
                "message": 'You are not permitted to perform this action. Please, log out.'
            });
        }
        return next();
    });
};
