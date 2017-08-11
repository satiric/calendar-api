/**
 * Created by decadal on 27.06.17.
 */
var ValidationE = require('../exceptions/Validation');
var LogicE = require('../exceptions/Logic');

function updatePhones(user, phone, cb) {
    if(!phone || (phone === user.phone)) {
        return cb();
    }
    Phone.update({id: PhoneIdentifier.extract(user.phone)}, {user_id: null}).exec(function(err, result){
        if (err) {
            return cb(err);
        }
        Phone.update({id: PhoneIdentifier.extract(phone)}, {user_id: user.id}).exec(function(err, result){
            if (err) {
                return cb(err);
            }
            if(!result || !result.length) {
                Phone.create({id: PhoneIdentifier.extract(phone), "phone": phone, user_id: user.id}).exec(function(err, res){
                    if (err) {
                        return cb(err);
                    }
                    return cb();
                });
            }
            else {
                return cb();
            }

        });
    });
}

function updateEmails(user, email, cb) {
    if(!email || (email === user.email)) {
        return cb();
    }
    Email.update({email: user.email}, {user_id: null}).exec(function(err, result){
        if (err) {
            return cb(err);
        }
        Email.update({email: email}, {user_id: user.id}).exec(function(err, result){
            if (err) {
                return cb(err);
            }
            if(!result || !result.length) {
                Email.create({email: email, user_id: user.id}).exec(function(err, res){
                    if (err) {
                        return cb(err);
                    }
                    return cb();
                });
            }
            else {
                return cb();
            }
        });
    });
}


module.exports = {
    getFullUser: function(id, cb) {
        return User.find({"id":id}).populate('avatar').exec(cb);
    },
    getFullUserByEmail: function(email, cb) {
        return User.find({"email":email}).populate('avatar').exec(cb);
    },

    getAvatar: function(user, cb) {
        if(! user.avatar_id) {
            return cb();
        }
        return File.find({'id' : user.avatar_id }, function(err, file){
            if(!err && (!file || !file.length)) {
                err = new Error("file is not found");
            }
            if(err) {
                return cb(err);
            }
            return cb(null, file[0]);
        });
    },
    updateProfile: function(user, toUpdate, cb) {

        var paramsObj = {};
        var keys = ["name", "second_name", "avatar", "phone", "email"];
        //todo if phone or email - change ids
        for (var i = 0, size = keys.length; i < size; i++) {
            if(keys[i] in toUpdate) {
                paramsObj[keys[i]] = toUpdate[keys[i]];
            }
        }
        User.update({"id": user.id}, paramsObj, function (err, result) {
            if(err) {
                return (err.Errors)
                    ? cb(new ValidationE(err))
                    : cb(err);
            }
            if (!result || !result.length) {
                return new LogicE("User not found.");
            }
            updatePhones(user, paramsObj.phone, function(err){
                if(err) {
                    return (err.Errors)
                        ? cb(new ValidationE(err))
                        : cb(err);
                }
                updateEmails(user, paramsObj.email, function(err){
                    if(err) {
                        return (err.Errors)
                            ? cb(new ValidationE(err))
                            : cb(err);
                    }
                    User.findOne(user.id) // You may try something like User._model(user) instead to avoid another roundtrip to the DB.
                        .populate('avatar')
                        .exec(function(err, result) {
                            if (err) {
                                return cb(err);
                            }
                            return cb(null, result);
                        });
                });
            });
        });
    }
};