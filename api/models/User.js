/**
 * User.js
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');

module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        name: {
            type: "string",
            required: true,
            validName: true
        },
        second_name: {
            type: "string",
            required: true,
            validName: true
        },
        email: {
            type: "email",
            required: true,
            unique: true
        },
        password: {
            required: true,
            type: 'string',
            minLength: 8,
            maxLength: 25,
            password: true,
            notNum: true
        },
        phone: {
            required: true,
            unique: true,
            type: 'string',
            regex: /\+([0-9]){9,13}/
        },
        password_reset_token: {
            type: 'string'
        },
        reset_token_created: {
            type: 'datetime'
        },
        state: {
            type: 'string',
            enum: ['active', 'blocked']
        },
        token: {
            collection:'AuthToken',
            via: 'owner'
        },
        avatar: {
            model:'File'
        },
        events: {
            collection: 'Event',
            via: 'founder'
        },
        calendar_tutorial_passed: {
            type: "integer"
        },
        contacts_tutorial_passed: {
            type: "integer"
        },
        // phoneContacts: {
        //     collection: 'Phone',
        //     via: 'subscribers',
        //     dominant: true
        // },
        // emailContacts: {
        //     collection: 'EmailContacts',
        //     via: 'user'
        // },
        
        // auth_tokens: {
        //     collection: 'AuthToken',
        //     via: 'owner'
        // },
        toJSON: function () {
            'use strict';
            var obj = this.toObject();
            delete obj.password;
            delete obj.password_reset_token;
            return obj;
        }
    },

    validationMessages: { //hand for i18n & l10n
        email: {
            required: 'Email is required',
            email: 'Email is not valid',
            unique: 'This email is already registered to a vlife account'
        },
        name: {
            required: "Name is required",
            validName: "Invalid Name: it must be more than 1 symbol and less than 26, without spaces"
        },
        second_name: {
            required: "Name is required",
            validName: "Invalid Last Name: it must be more than 1 symbol and less than 26, without spaces"
        },
        password: {
            required: "Password is required",
            password: "Password must not contain spaces on the start or on the end",
            minLength: "Invalid Password: it must be more than 7 symbols",
            maxLength: "Invalid Password: it must be less than 26 symbols",
            notNum: "Password must be string"
        },
        phone: {
            required: "Phone is required",
            regex: "Phone must be valid phone like +12341231451"
        }
    },

    // Custom types / validation rules
    // (available for use in this model's attribute definitions above)
    types: {
        password: function (value) {
            var oldLen = value.length;
            value = value.trim();
            return (value.length === oldLen);
        },
        notNum: function(value) {
            return _.isString(value);
        },
        validName: function (value) {
            'use strict';
            var oldLen = value.length;
            value = value.trim();
            if(value.length !== oldLen) {
                return false;
            }
            return (value.length >= 2 && value.length <= 25);
        }
    },

    getPopulated: function(ids, cb) {
        if (!Array.isArray(ids)) {
            return cb( new Error("Ids should be an array") );
        }
        User.find({"id": ids}).populate('avatar').exec(function (err, users) {
            if(err) {
                return cb(err);
            }
            return cb(null, users);
        });
    },


    login: function (email, pass, cb) {

        User.findOne({
            email: email
        }).populate('avatar').exec(function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                err = new LogicE('This email is not linked to a vlife account.');
                return cb(err);
            }
            PasswordEncoder.bcryptCheck(pass, user.password, function (err, res) {
                if (!res) {
                    err = new LogicE('Password is invalid');
                }
                if(err) {
                    return cb(err);
                }
                Auth.login(user, 60 * 60 * 24 * 30 * 1000, function(err, token) {
                    if(err) {
                        return cb(err);
                    }
                    return cb(err, {user: user, token: token});
                });
            });
        });
        // Create a user
    },
    sendMessage: function (phone, cb) {
        var firstPart = _.random(10, 99);
        var secondPart = _.random(10, 99);

        return Twilio.sendMessage(firstPart + ' ' + secondPart, phone, function (err) {
            if (err) {
                return cb(err);
            }
            return cb(null, firstPart.toString() + secondPart.toString());
        });
    },

    changePassword: function (user, value, cb) {
        User.update({'id': user.id}, {'password' : value}).exec(function (err, updated) {
            if(err) {
                return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
            }
            return cb(err, updated);
        });
    },
    /**
     *
     * @param ids
     * @param cb
     */
    getFullUser: function(ids, cb) {
        if(!Array.isArray(ids)) {
            ids = +ids;
        }
        else {
            ids = ids.join(',');
        }
        if(!ids) {
            return cb();
        }
        var query = "SELECT * FROM user as u LEFT JOIN  file as f ON f.id = u.avatar WHERE u.id = ? ";
        User.query(query, [ids], function(err, result){
            return cb(err, result);
        });
    },
//todo rework
    beforeCreate: function (values, next) {
        PasswordEncoder.bcryptEncode(values, next);
    },
    beforeUpdate: function (values, next) {
        PasswordEncoder.bcryptEncode(values, next);
    }
};
