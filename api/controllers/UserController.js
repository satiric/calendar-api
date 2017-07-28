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
     * find user with his avatar by id
     * @param req
     * @param res
     */
    find: function (req, res) {
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
     *
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
                    return (err instanceof ValidationE || err instanceof LogicE)
                        ? res.badRequest({ "message": err.message })
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
                return (err instanceof ValidationE || err instanceof LogicE)
                    ? res.badRequest({"message": err.message})
                    : res.serverError({"data": err});
            }
            return res.ok({data: result});
        });
    },
    /**
     *
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
            if (!result) {
                return res.badRequest({"message": 'Invalid username/password combination.'});
            }
            return res.ok({"data":result});
        });
    },
    /**
     *
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
     * todo refactoring
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
        if (token) {
            return UserAuth.getUserByResetToken(token, function (err, user) {
                if (err) {
                    return res.serverError({"data": err});
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
                            return res.serverError({"data": err});
                        }
                        return res.ok();
                    });
                });
            });
        }
        return UserAuth.getUserByAuthToken(authKey, function (err, user) {
            if (err) {
                return res.serverError({"data": err});
            }
            if (!user) {
                return res.badRequest({"message": "User not found"});
            }
            PasswordEncoder.bcryptCheck(oldValue, user.password, function(err, result) {
                if(err || !result) {
                    return res.badRequest({"message": "Old password does not match."});
                }
                return User.changePassword(user, value, function (err, result) {
                    if (err) {
                        return (err instanceof ValidationE) ? res.badRequest({"message": err.message})
                            : res.serverError({"details": err});
                    }
                    return (!result) ? res.badRequest({"message": "User not found"}) : res.ok();
                });
            });
        });
    },


    /**
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
     * 
     * @param req
     * @param res
     */
    checkEmail: function (req, res) {
        User.find({'email': req.param('email')}).exec(function (err, user) {
            if (err) {
                return res.badRequest(err);
            }
            return (!user || !user.length) ? res.ok({"status": "success"}) : res.badRequest({
                "status": "error",
                "message": "This email is already registered to a vlife account"
            });
        });
    },
    /**
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
                return res.badRequest({
                    "message": "This mobile number is already registered to a vlife account"
                });
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
     * verificate phone number and save some token for it
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
                return res.badRequest({"message": "Code or phone number is invalid"});
            }
            return res.ok({"data": {"security_key":secKey } });
        });
    },
    /**
     * for auth key
     * @param req
     * @param res
     */
    refresh: function (req, res) {
        var token = Auth.extractAuthKey(req);
        //todo refactor it
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
                    return (err instanceof LogicE)
                        ? res.json(404, {"message": err.message})
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