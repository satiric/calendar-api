/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    find: function (req, res) {
        User.find({"id":req.param('id')}, function (err, user) {
            if(!user.length) {
                return res.badRequest({"status": "error", "message": "User not found."});
            }
            return res.ok({"status": "success", "user":user[0]});
        });
    },
    signup: function (req, res) {
        User.create(req.body).exec(function (err, user) {
            if (err) {
                return res.badRequest({"message": err.message, "status": "error"});
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
            return res.json(403, {"err": "You must be authorized for logout"});
        }
        // "Forget" the user from the session.
        // Subsequent requests from this user agent will NOT have `req.session.me`.
        let meId = req.session.me.id;
        req.session.me = null;
        // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
        // send a simple response letting the user agent know they were logged out
        // successfully.
        return res.ok({"message": 'Logged out successfully for user: ' + meId, "status": "success"});
    },
    changePassword: function (req, res) {
        var token = req.param('token');
        var value = req.param('value');
        if (token) {
            return User.find({'password_reset_token': token}).exec(function (err, user){
                if (err) {
                    return res.serverError(err);
                }
                if(!user.length){
                    return res.badRequest({"status":"error", "message":"token is not active"});
                }

                User.changePassword(user[0], value, function (err, changed) {
                    if (err) {
                        return res.serverError(err);
                    }
                    (changed) ? res.ok({"status":"success"})
                        : res.badRequest({
                        "status":"error",
                        "message" : "This email is already registered to a vlife account"
                    });
                });
                sails.log(user);
            });
        }
        if(!req.session.me) {
            return  res.badRequest({
                "status":"error",
                "message" : "you're not logged"
            });
        }
        User.changePassword(req.session.me, value, function (err, changed) {
            (changed) ? res.ok({"status":"success"})
                : res.badRequest({
                "status":"error",
                "message" : "This email is already registered to a vlife account"
            });
        });
    },

    resetPassword: function (req, res) {
        'use strict';
        var hash = require("randomstring").generate(45);

        User.update({'email':req.param('email')}, {"password_reset_token":hash, "reset_token_created": new Date()})
            .exec(function (err, users){
                if (err) {
                    return res.serverError(err.message);
                }
                if(!users.length) {
                    return res.badRequest({"status" : "error", "message": "User by this email is not found"});
                }
            return Mailer.sendResetMail(users[0], hash, function(err, resp) {
                return (resp) ? res.ok({"status":"success"}) : res.badRequest({
                    "status":"error",
                    "message" : err
                });
            });
        });
    },
    checkEmail: function(req, res) {
        User.find({'email':req.param('email')}).exec(function (err, user){
            if (err) {
                return res.badRequest(err);
            }
            sails.log(user);
            return (!user.length) ? res.ok({"status":"success"}) : res.badRequest({
                "status":"error",
                "message" : "This email is already registered to a vlife account"
            });
        });
    },

    checkPhone: function(req, res) {
        User.find({'phone':req.param('phone')}).exec(function (err, user){
            if (err) {
                return res.badRequest(err);
            }
            sails.log(user);
            if(user.length) {
                return res.badRequest({
                    "status":"error",
                    "message" : "This mobile number is already registered to a vlife account"
                });
            }
            User.sendMessage(req.param('phone'), function(err, result) {
                if(err) {
                    return res.badRequest(err);
                }
                return res.ok({
                    "status":"success",
                    "code": result
                });
            });
        });
    }


};