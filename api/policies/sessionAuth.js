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
    AuthToken.findOne({"value": key}).exec(function (err, result) {
        if (err) {
            return res.serverError({"status": "error", "detail": err});
        }
        if (!result) {
            return res.forbidden({
                "status": "error",
                "message": 'You are not permitted to perform this action. Please, log in.'
            });
        }
        return next();
    });
    // User.findOne({
    //   value: key
    // }).exec(function (err, apiKey) {
    //   if (err) {
    //     return res.serverError(err);
    //   }
    //   if (!apiKey) {
    //
    //   }
    //   // If we made it all the way down here, looks like everything's ok, so we'll let the user through.
    //   // (from here, the next policy or the controller action will run)
    //   return ;
//  });


};
