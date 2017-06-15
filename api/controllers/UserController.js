/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    signup: function (req, res) {
        User.create(req.body).exec(function (err, user) {
            if (err) {
                return res.negotiate({"message": err.message, "status": "error"});
//                return res.json(err.status, {err: err});
            }
            req.session.me = user;
            // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
            // send a 200 response letting the user agent know the signup was successful.
            //  if (req.wantsJSON) {
            //  }
            Mailer.sendWelcomeMail(user);
            return res.ok({user: user, "status" : "success" });
        });
    },
    login: function (req, res) {
        // See `api/responses/login.js`
        return res.login(req.param('email'), req.param('password'));
    },
    logout: function (req, res) {
        'use strict';
        if (!req.session.me) {
            return res.json(403, {err: "You must be authorized for logout"});
        }
        // "Forget" the user from the session.
        // Subsequent requests from this user agent will NOT have `req.session.me`.
        let meId = req.session.me.id;
        req.session.me = null;
        // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
        // send a simple response letting the user agent know they were logged out
        // successfully.
        return res.ok('Logged out successfully for user: ' + meId);
    },
    resetPassword: function (req, res) {
        'use strict';
        if (req.session.me) {
            Mailer.sendResetMail(req.session.me);
        }
        return res.ok('ResetPassword' + req.session.me.id);
    },

    checkEmail: function(req, res) {
        User.find({'email':req.param('email')}).exec(function (err, user){
            if (err) {
                return res.serverError(err);
            }
            sails.log(user);
            return (!user.length) ? res.ok({"status":"success"}) : res.ok({
                "status":"error",
                "message" : "this email is exists"
            });
        });
    },

    checkPhone: function(req, res) {
        User.find({'phone':req.param('phone')}).exec(function (err, user){
            if (err) {
                return res.serverError(err);
            }
            sails.log(user);
            if(user.length) {
                return res.ok({
                    "status":"error",
                    "message" : "this phone is exists"
                });
            }
            User.sendMessage(req.param('phone'), function(err, result) {
                if(err) {
                    return res.negotiate(err);
                }
                return res.ok({
                    "status":"success",
                    "code": result
                });
            });
        });
    }


};