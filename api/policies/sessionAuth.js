/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
    //in headers prefer, in params possible
    let key = req.headers['auth-token'] || req.param('auth-token') || '';
    // Check the database to see if a permission record exists which matches both the
    // target folder id, the appropriate "type", and the id of the logged-in user.
    //todo make checking for is_active
    AuthToken.findOne({"value": key, "expire_date": {'>': new Date()} }).exec(function (err, result) {
        if (err) {
            return res.serverError({"status": "error", "detail": err});
        }
        if (!result) {
            return res.unauthorized({
                "status": "error",
                "message": 'You are not permitted to perform this action. Please, log in.'
            });
        }
        return next();
    });
};
