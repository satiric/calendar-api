/**
 * Created by decadal on 27.06.17.
 */
var ValidateE = require("../exceptions/Validation");
var LogicE = require("../exceptions/Logic");
/**
 * register user phone to our dictionary for watchers of contacts.
 * @param user
 * @param cb
 */
function preparePhone (user, cb) {
    var phoneId = PhoneIdentifier.extract(user.phone);
    Phone.findOne({"id":phoneId}).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        if(result) {
            return Phone.update({"id":phoneId}, {"user_id": user.id}).exec(function(err, resultUpd){
                if(err) {
                    return cb(err);
                }
                registFriendsByPhone(user.id, user.phone, cb);
            });
            //call subscribers - this user in contacts
        }
        Phone.create({"id": phoneId, "phone":user.phone, "user_id": user.id}).exec(function(err, resultCrt) {
            if(err) {
                return cb(err);
            }
            return cb();
        });
    });
}

function checkAvatar(avatar, cb) {
    if(!avatar) {
        return cb();
    }
    File.findOne({id: avatar}).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        if(!result) {
            return cb(new LogicE("Avatar with id " + avatar + " is not found."));
        }
        return cb();
    });
}
/**
 *
 * @param key
 * @param phone
 * @param cb
 */
function checkSecurityKey(key, phone, cb) {
    var tenMinutesBefore = new Date((new Date()).getTime() - 10 * 60001);
    PhoneVerification.destroy({
        "security_hash": key,
        "phone": phone,
        "updatedAt": {'>': tenMinutesBefore }
    }).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        if(!result|| !result.length) {
            return cb(new LogicE("Did you verify your phone number? Security key is invalid or expired."));
        }
        return cb();
    });
}

/**
 * create user
 * @param data
 * @param cb
 */
function signupUser(data, cb) {
    User.create(data).exec(function (err, user) {
        if (err) {
            return (err.Errors)
                ? cb(new ValidateE(err))
                : cb(err);
        }
        if(!user) {
            return cb(new LogicE("User not saved"));
        }
        //todo make error callback for email
        Mailer.sendWelcomeMail(user);
        return cb(null, user);
    });
}

function registFriendsByEmail(userId, email, cb) {
    EmailContacts.find({email: email}).exec(function (err, result) {
        if(err) {
            return cb(err);
        }
        var friendRecords = result.map(function(value){
            return {
                'user_who_id': value.user_id,
                'user_whom_id': userId
            };
        });
        return Friend.insertIgnore(friendRecords, cb);
    });
}

function registFriendsByPhone(userId, phone, cb) {
    PhoneContacts.find({phone_id: PhoneIdentifier.extract(phone)}).exec(function (err, result) {
        if(err) {
            return cb(err);
        }
        var friendRecords = result.map(function(value){
            return {
                'user_who_id': value.user_id,
                'user_whom_id': userId
            };
        });
        return Friend.insertIgnore(friendRecords, cb);
    });
}

/**
 * register user email to our dictionary for watchers of contacts.
 * @param user
 * @param cb
 */
function prepareEmail(user, cb) {
    Email.findOne({"email":user.email}).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        if(result) {
            return Email.update({"email":user.email}, {"user_id": user.id}).exec(function(err, result) {
                if(err) {
                    return cb(err);
                }
                if(!result) {
                    return cb(
                        new LogicE("This user was not been register as email-owner for this email in Email-dictionary")
                    );
                }
                registFriendsByEmail(user.id, user.email, cb);
            });
            //call subscribers - this user in contacts
        }
        return Email.create({"email":user.email, "user_id": user.id}).exec(function (err, result) {
            if(err) {
                return cb(err);
            }
            if(!result) {
                return cb(new LogicE("This email was not been register in Email-dictionary"));
            }
            return cb();
        });
    });
}
/** todo make as class
 *  todo make with transaction
 * Main cascade of steps for signup.
 * @type {{signup: module.exports.signup}}
 */
module.exports = {
    signup: function(data, cb, timeLogin) {
        timeLogin = timeLogin || 60 * 60 * 24 * 30 * 1000;
        // 1. for guarantee that verification of email was completed
        checkSecurityKey(data.security_key, data.phone, function(err) {
            if(err) {
                return cb(err);
            }
            // 2. check avatar
            checkAvatar(data.avatar, function(err) {
                if(err) {
                    return cb(err);
                }
                // 3. create user and send email for him
                signupUser(data, function(err, user){
                    if(err) {
                        return cb(err);
                    }
                    // 4. register his email in dictionary
                    prepareEmail(user, function(err) {
                        if(err) {
                            return cb(err);
                        }
                        // 5. register his phone in dictionary
                        preparePhone(user, function(err) {
                            if(err) {
                                return cb(err);
                            }
                            // 6. login
                            return require('./UserAuth').login(user, timeLogin, cb);
                        });
                    });
                });
            });

        });
    }
};