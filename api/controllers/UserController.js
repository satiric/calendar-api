/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');
var UserAuth = require("../utils/UserAuth");
module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     *
     * @param req
     * @param res
     */
    find: function (req, res) {
        User.find({"id": req.param('id')}, function (err, user) {
            if (!user || !user.length) {
                return res.badRequest({"status": "error", "message": "User not found."});
            }
            return res.ok({"status": "success", "user": user[0]});
        });
    },

    /**
     *
     * @param req
     * @param res
     */
    update: function (req, res) {
        var authKey = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(authKey, function (err, user) {
            if (err) {
                return res.serverError({"details": err});
            }
            if (!user) {
                return res.badRequest({"status": "error", "message": "User not found"});
            }
            var paramsObj = {};
            var keys = ["name", "second_name", "avatar_id", "phone", "email"];
            for (var i = 0, size = keys.length; i < size; i++) {
                if(req.param(keys[i])) {
                    paramsObj[keys[i]] = req.param(keys[i]);
                }
            }
            User.update({"id": user.id}, paramsObj, function (err, user) {
                if (!user || !user.length) {
                    return res.badRequest({"message": "User not found."});
                }
                return res.ok({"user": user[0]});
            });
        });
    },
    /**
     * 1. save user
     * 2. send email
     * 3. login
     * @param req
     * @param res
     */
    signup: function (req, res) {
        User.create(req.body).exec(function (err, user) {
            if (err) {
                return (err.Errors)
                    ? res.badRequest({"message": _.values(err.Errors)[0][0].message, "status": "error"})
                    : res.serverError({"details": err, "status": "error"});
            }
            require('../utils/UserSignup').signup(user, function (err, result) {
                if (err) {
                    return res.serverError({"status": "error", "details": err});
                }
                return res.ok({user: result, "status": "success"});
            });
        });
    },
    /**
     *
     * @param req
     * @param res
     * @returns {*}
     */
    login: function (req, res) {
        // See `api/responses/login.js`
        return res.login(req.param('email'), req.param('password'));
    },

    logout: function (req, res) {
        'use strict';
        var authKey = Auth.extractAuthKey(req);
        Auth.logout(authKey, function (err, result) {
            if (err) {
                return res.serverError({"status": "error", "details": err});
            }
            if (!result) {
                return res.badRequest({"status": "error", "message": "This token isn't found."});
            }
            return res.ok({"status": "success"});
        });
    },
    changePassword: function (req, res) {
        var token = req.param('token');
        var value = req.param('value');
        var authKey = Auth.extractAuthKey(req);
        if (token) {
            return UserAuth.getUserByResetToken(token, function (err, user) {
                if (err) {
                    return res.serverError({"details": err});
                }
                if (!user) {
                    return res.badRequest({"message": "User not found"});
                }
                return User.changePassword(user, value, function (err, result) {
                    if (err) {
                        return (err instanceof ValidationE) ? res.badRequest({"message": err.message})
                            : res.serverError({"details": err});
                    }
                    if(!result) {
                        return  res.badRequest({"message": "User not found"});
                    }
                    return User.update({"id": user.id}, {"password_reset_token": null}, function (err, updated) {
                        if(err) {
                            return res.serverError({"details": err});
                        }
                        return res.ok();
                    });
                });
            });
        }
        return UserAuth.getUserByAuthToken(authKey, function (err, user) {
            if (err) {
                return res.serverError({"details": err});
            }
            if (!user) {
                return res.badRequest({"status": "error", "message": "User not found"});
            }
            return User.changePassword(user, value, function (err, result) {
                if (err) {
                    return (err instanceof ValidationE) ? res.badRequest({"message": err.message})
                        : res.serverError({"details": err});
                }
                return (!result) ? res.badRequest({"message": "User not found"}) : res.ok();
            });
        });
    },

    resetPassword: function (req, res) {
        'use strict';
        var hash = require("randomstring").generate(45);

        User.update({'email': req.param('email')}, {"password_reset_token": hash, "reset_token_created": new Date()})
            .exec(function (err, users) {
                if (err) {
                    return res.serverError(err.message);
                }
                if (!users || !users.length) {
                    return res.badRequest({
                        "status": "error",
                        "message": "This email is not linked to a vlife account"
                    });
                }
                return Mailer.sendResetMail(users[0], hash, function (err, resp) {
                    return (resp) ? res.ok({"status": "success"}) : res.badRequest({
                        "status": "error",
                        "message": err
                    });
                });
            });
    },
    checkEmail: function (req, res) {
        User.find({'email': req.param('email')}).exec(function (err, user) {
            if (err) {
                return res.badRequest(err);
            }
            sails.log(user);
            return (!user || !user.length) ? res.ok({"status": "success"}) : res.badRequest({
                "status": "error",
                "message": "This email is already registered to a vlife account"
            });
        });
    },

    checkPhone: function (req, res) {
        var noVerify = req.param('noVerify');
        User.findOne({'phone': req.param('phone')}).exec(function (err, user) {
            if (err) {
                return res.badRequest(err);
            }
            if (user) {
                return res.badRequest({
                    "status": "error",
                    "message": "This mobile number is already registered to a vlife account"
                });
            }
            if (noVerify) {
                return res.ok({
                    "status": "success",
                    "code": "0000"
                });
            }
            User.sendMessage(req.param('phone'), function (err, result) {
                if (err) {
                    return res.badRequest(err);
                }
                return res.ok({
                    "status": "success",
                    "code": result
                });
            });
        });
    },

    verifyPhone: function () {
        User.sendMessage(req.param('phone'), function (err, result) {
            if (err) {
                return res.badRequest(err);
            }
            return res.ok({
                "status": "success",
                "code": result
            });
        });
    },
    /**
     *
     * @param req
     * @param res
     */
    refresh: function (req, res) {
        var token = Auth.extractAuthKey(req);
        UserAuth.refreshToken(token, 60 * 60 * 24 * 30 * 1000, function (err, token) {
            if (err) {
                return (err instanceof LogicE)
                    ? res.badRequest({"status": "error", "message": err.message})
                    : res.serverError({"status": "error", "details": err});
            }
            return res.ok({"status": "success", "token": token});
        });
    }
};