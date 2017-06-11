/**
 * Created by decadal on 10.06.17.
 */

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

    let key = req.headers['vlife-access-key'] || '';

    // Check the database to see if a permission record exists which matches both the
    // target folder id, the appropriate "type", and the id of the logged-in user.
    ApiKey.findOne({
        value: key
    }).exec(function (err, apiKey) {
        if (err) {
            return res.serverError(err);
        }
        if (!apiKey) {
            return res.forbidden('You have no valid vlife access token in headers');
        }
        // If we made it all the way down here, looks like everything's ok, so we'll let the user through.
        // (from here, the next policy or the controller action will run)
        return next();
    });
};
