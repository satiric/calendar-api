/**
 * Created by decadal on 27.06.17.
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');

/**
 * 
 * @param token
 * @param value
 * @param cb
 * @returns {*}
 */
function changePassByToken(token, value, cb) {
    return module.exports.getUserByResetToken(token, function (err, user) {
        if (err) {
            return cb(err);
        }
        if (!user) {
            return cb(new LogicE("The link has expired"));
        }
        User.changePassword(user, value, function (err, result) {
            if (err) {
                return cb(err);
            }
            return User.update({"id": user.id}, {"password_reset_token": null}, function (err, updated) {
                if (err) {
                    return cb(err);
                }
                return cb();
            });
        });
    });
}

function changePassByAuthKey(authKey, oldValue, value, cb) {
    module.exports.getUserByAuthToken(authKey, function (err, user) {
        if (err) {
            return cb(err);
        }
        if (!user) {
            return cb(new LogicE("User not found"));
        }
        PasswordEncoder.bcryptCheck(oldValue, user.password, function(err, result) {
            if(err || !result) {
                return cb(new LogicE("Old password does not match."));
            }
            return User.changePassword(user, value, function (err, result) {
                if (err) {
                    return cb(err);
                }
                return (!result) ? cb(new LogicE("User not found")) 
                    : cb();
            });
        });
    });
}

/**
 * 
 * @type {{login: module.exports.login, refreshToken: module.exports.refreshToken, getByPasswordResetToken: module.exports.getByPasswordResetToken, getUserByResetToken: module.exports.getUserByResetToken, getUserByAuthToken: module.exports.getUserByAuthToken, changePass: module.exports.changePass}}
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

    getUserByResetToken: function(token, cb) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); //yesterday
         User.findOne({
             'password_reset_token': token,
             'reset_token_created': {'>': yesterday}
         }).exec(cb);
    },
    getUserByAuthToken: function(token, cb, expired) {
        var params = {
            'value': token
        };
        if(!expired) {
            params.expire_date =  {'>': new Date()};
        } 
        AuthToken.findOne(params).populate('owner').exec(function(err, result){
            if(err) {
                return cb(err);
            }
            return cb(null, (result) ? result.owner : null);
        });
    },

    changePass: function(value, token, oldValue, authKey, cb) {
        if (token) {
            return changePassByToken(token, value, cb);
        }
        return changePassByAuthKey(authKey, oldValue, value, cb);
    }
};

