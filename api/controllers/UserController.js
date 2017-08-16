/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseE = require('../exceptions/BaseException');
var UserAuth = require("../utils/UserAuth");

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     * find user with his avatar by id
     * @param req
     * @param res
     */
    find: function (req, res) {
        if(!req.param('id')) {
            return res.badRequest({"message": "Id must be an integer."});
        }
        User.getPopulated([req.param('id')], function (err, users) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(! users || !users[0]) {
                return res.badRequest({"message": "User not found."});
            }
            return res.ok({ "data": users[0] });
        });
    },

    /**
     * change user information
     * @param req
     * @param res
     */
    update: function (req, res) {
        var authKey = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(authKey, function (err, user) {
            if (err) {
                return res.serverError({"data": err});
            }
            if (!user) {
                return res.badRequest({ "message": "User not found"});
            }
            require('../utils/UserProfile').updateProfile(user, req.allParams(), function(err, result){
                if(err) {
                    return (err instanceof BaseE) ? res.badRequest({ "message": err.message })
                        : res.serverError({"data": err});
                }
                return res.ok({data: result});
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
        require('../utils/UserSignup').signup(req.body, function (err, result) {
            if (err) {
                return (err instanceof BaseE) ? res.badRequest({"message": err.message})
                    : res.serverError({"data": err});
            }
            return res.ok({data: result});
        });
    },
    /**
     * create auth-token for unauthorizated user
     * @param req
     * @param res
     * @returns {*}
     */
    login: function (req, res) {
        //todo make login as auth util
        if(!req.body || !req.body.email || !req.body.password) {
            return res.badRequest({ "message": "Email and password is required"});
        }
        User.login(req.body.email, req.body.password, function (err, result) {
            if (err) {
                return res.badRequest({ "message": err.message});
            }
            return res.ok({"data":result});
        });
    },
    /**
     * remove auth-token, associated with logged-in user
     * @param req
     * @param res
     */
    logout: function (req, res) {
        var authKey = Auth.extractAuthKey(req);
        Auth.logout(authKey, function (err, result) {
            if (err) {
                return res.serverError({"data": err});
            }
            if (!result) {
                return res.badRequest({ "message": "This token isn't found."});
            }
            return res.ok();
        });
    },
    /**
     * for registred and unregistred users - both
     * @param req
     * @param res
     * @returns {*}
     */
    changePassword: function (req, res) {
        var value = req.body.password;
        //VLIF-162
        if( typeof value === "number") {
            return res.badRequest({"message": "Password can not be number"});
        }
        var token = req.body.token;
        var oldValue = req.body.old_password;
        var authKey = Auth.extractAuthKey(req);
        UserAuth.changePass(value, token, oldValue, authKey, function(err, result){
            if (err) {
                return (err instanceof BaseE) ? res.badRequest({"message": err.message})
                    : res.serverError({"data": err});
            }
            // don't check result because it isn't necessary
            return res.ok();
        });
    },

    /**
     * for unauthorizated user: send reset token to email
     * Next step for changing the password is sending query to /user/changePassword with reset-token
     * todo can refactor
     * @param req
     * @param res
     */
    resetPassword: function (req, res) {
        var hash = require("randomstring").generate(45);
        if(!req.body || !req.body.email ) {
            return res.badRequest({ "message": "Email is required"});
        }
        User.update({'email': req.body.email }, {"password_reset_token": hash, "reset_token_created": new Date()})
            .exec(function (err, users) {
                if (err) {
                    return res.serverError(err.message);
                }
                if (!users || !users.length) {
                    return res.badRequest({"message": "This email is not linked to a vlife account"});
                }
                return Mailer.sendResetMail(users[0], hash, function (err, resp) {
                    return (resp) ? res.ok() : res.badRequest({"message": err});
                });
            });
    },
    /**
     * for 1-st stage of signup: check email, if it exists in db as signed to some user account,
     * return error message else return "it's ok"
     * @param req
     * @param res
     */
    checkEmail: function (req, res) {
        User.find({'email': req.param('email')}).exec(function (err, user) {
            if (err) {
                return res.badRequest(err);
            }
            return (!user || !user.length) ? res.ok()
                : res.badRequest({ "message": "This email is already registered to a vlife account" });
        });
    },
    /**
     * check exists that phone and send sms with code (for user/verifyPhone action)
     * todo refactor it
     * @param req
     * @param res
     */
    checkPhone: function (req, res) {
        var noVerify = req.param('noVerify');
        User.findOne({'phone': req.param('phone')}).exec(function (err, user) {
            if (err) {
                return res.badRequest(err);
            }
            if (user) {
                return res.badRequest({"message": "This mobile number is already registered to a vlife account"});
            }
            if (noVerify) {
                return PhoneVerification.create({"phone": req.param('phone'), "code": "0000"}).exec(function(err, result){
                    if (err) {
                        return res.badRequest({"data":err});
                    }
                    return res.ok();
                });
            }
            User.sendMessage(req.param('phone'), function (err, result) {
                if (err) {
                    return res.badRequest(err);
                }
                PhoneVerification.create({"phone": req.param('phone'), "code": result}).exec(function(err, result){
                    if (err) {
                        return res.badRequest({"data":err});
                    }
                    return res.ok();
                });
            });
        });
    },

    /**
     * verify phone that's mean check code, sent on stage "user/checkPhone", and create special
     * security key for user/signup action
     * @param req
     * @param res
     */
    verifyPhone: function (req, res) {
        var secKey = require("randomstring").generate(60);
        if(!req.body || !req.body.phone || !req.body.code ) {
            return res.badRequest({ "message": "Phone and code is required"});
        }
        PhoneVerification.update({
            "phone": req.body.phone,
            "code": req.body.code
        }, {"security_hash":secKey}).exec(function (err, result) {
            if (err) {
                return res.serverError({"data": err});
            }
            if(!result || !result.length) {
                return res.badRequest({"message": "Verification Code is invalid"});
            }
            return res.ok({"data": {"security_key":secKey } });
        });
    },
    /**
     * for auth-token, create new auth token if previous token was retired
     * todo refactor it
     * @param req
     * @param res
     */
    refresh: function (req, res) {
        var token = Auth.extractAuthKey(req);
        if( ! req.body || ! req.body.refresh_token) {
            return res.badRequest({"message": "refresh_token is required"});
        }
        UserAuth.getUserByAuthToken(token, function (err, user) {
            if (err) {
                return res.serverError({"data": err});
            }
            if (!user) {
                return res.badRequest({"message": "User not found"});
            }
            UserAuth.refreshToken(token, req.body.refresh_token, 60 * 60 * 24 * 30 * 1000, function (err, newToken) {
                if (err) {
                    return (err instanceof BaseE) ? res.json(404, {"message": err.message})
                        : res.serverError({"data": err});
                }
                User.findOne({"id": user.id}).populate("avatar").exec(function(err, user) {
                    if (err) {
                        return res.serverError({"data": err});
                    }
                    res.ok({"data": {"user": user, "token": newToken}});
                });
            });
        }, true);
    }
};