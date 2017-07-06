/**
 * Created by decadal on 27.06.17.
 */

/**
 * contain all business logic for user authorization
 * @type {{login: module.exports.login, refreshToken: module.exports.refreshToken, getByPasswordResetToken: module.exports.getByPasswordResetToken, changePassByToken: module.exports.changePassByToken, changePassByAuthKey: module.exports.changePassByAuthKey, getUserByAuthToken: module.exports.getUserByAuthToken}}
 */
module.exports = {
    login: function(user, time, cb) {
        return Auth.login(user, time, function(err, token) {
            if(err) {
                return cb( err );
            }
            return require('./UserProfile').getFullUser(user.id, function(err, userProfile) {
                if(err) {
                    return cb( err );
                }
                return cb(null, {"user": userProfile[0], "token": token});
            });
        });
    },
    refreshToken: function(token, rToken, timeExp, cb) {
        AuthToken.findOne({
            "value": token,
            "refresh_token": rToken
        }).populate('owner').exec(function (err, result) {
            if(!result) {
                var LogicExc = require('../exceptions/Logic');
                return cb(new LogicExc("Token not found"));
            }
            AuthToken.destroy({
                'value': token
            }).exec(function (err) {
                if (err) {
                    return cb(err);
                }
                AuthToken.create({
                    'owner': result.owner.id,
                    'is_active' : 1,
                    'expire_date': new Date(Date.now() + timeExp)
                }).exec(function (err, token) {
                    if (err) {
                        return cb(err);
                    }
                    cb(err, token);
                });
            });

        });



    },

    getByPasswordResetToken: function(token, cb) {
        return User.find({
            'password_reset_token': token,
            'reset_token_created': {'>': new Date()} //todo check it
        }).exec(function(err, result) {
            if(err) {
                return cb(err);
            }
            if(!user || !user.length) {
                return cb(new Error("User not found"));
            }
            return cb(null, result[0]);
        });
    },
    changePassByToken: function(token, value, cb) {
        UserAuth.getByPasswordResetToken(token, function(err, user) {
            if(err) {
                return cb(err);
            }
            User.changePassword(user, value, function (err, changed) {
                if (err) {
                    return res.serverError(err);
                }
                (changed) ? res.ok({"status":"success"})
                    : res.badRequest({
                    "status":"error",
                    "message" : "Password doesn't changed"
                });
            });
        });
    },

    getUserByResetToken: function(token, cb) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); //yesterday
         User.findOne({
             'password_reset_token': token,
             'reset_token_created': {'>': yesterday}
         }).exec(cb);
    },

    // changePassByAuthKey: function(authKey, value, cb) {
    //     User.changePassword(req.session.me, value, function (err, changed) {
    //         (changed) ? res.ok({"status":"success"})
    //             : res.badRequest({
    //             "status":"error",
    //             "message" : "This email is already registered to a vlife account"
    //         });
    //     });
    // }, 
    getUserByAuthToken: function(token, cb) {
        AuthToken.findOne({
            'value': token,
            'expire_date': {'>': new Date()}
        }).populate('owner').exec(function(err, result){
            if(err) {
                return cb(err);
            }
            return cb(null, (result) ? result.owner : null);
        });
    }
};

