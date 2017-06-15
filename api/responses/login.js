/**
 * Created by decadal on 10.06.17.
 */
module.exports = function login(email, pass) {
    // Get access to `req` and `res`
    var req = this.req;
    var res = this.res;
    // Look up the user
    User.login(email, pass, function (err, user) {
        if (err) return res.negotiate({"status": "error", "message": err.message});

        if (!user) {
            return res.badRequest({"status":"error", "message": 'Invalid username/password combination.'});
            // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
            // send a 200 response letting the user agent know the login was successful.
            // (also do this if no `invalidRedirect` was provided)
            // if (req.wantsJSON || !inputs.invalidRedirect) {

//            }
            // Otherwise if this is an HTML-wanting browser, redirect to /login.
            // return res.redirect(inputs.invalidRedirect);
        }

        // "Remember" the user in the session
        // Subsequent requests from this user agent will have `req.session.me` set.
        req.session.me = user;

        // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
        // send a 200 response letting the user agent know the login was successful.
        // (also do this if no `successRedirect` was provided)
        // if (req.wantsJSON || ! inputs.successRedirect) {
            return res.ok({
                "status" : "success",
                "user" : req.session.me
            });
        // }

        // Otherwise if this is an HTML-wanting browser, redirect to /.
//        return res.redirect(inputs.successRedirect);
    });

};
