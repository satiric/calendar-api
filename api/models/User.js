/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        name: {
            type: "string",
            required: true,
            minLength: 2,
            maxLength: 25,
            validName: true
        },
        second_name: {
            type: "string",
            required: true,
            minLength: 2,
            maxLength: 25,
            validName: true
        },
        email: {
            type: "email",
            required: true,
            unique: true
        },
        password: {
            required: true,
            unique: true,
            type: 'string',
            minLength: 8,
            password: true // << defined below
        },
        phone: {
            required: true,
            type: 'string',
            phone: true
        },
        password_reset_token: {
            type: 'string'
        },
        reset_token_created: {
            type: 'datetime'
        },
        state: {
            type: 'string',
            enum: ''
        },
        // auth_tokens: {
        //     collection: 'AuthToken',
        //     via: 'owner'
        // },
        toJSON: function () {
            'use strict';
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },

    // Custom types / validation rules
    // (available for use in this model's attribute definitions above)
    types: {
        password: function (value) {
            'use strict';
            return _.isString(value) && value.length >= 8;
        },
        phone: function (value) {
            'use strict';
            //todo make normal validation
            return _.isString(value) && value.length >= 8;
        },
        validName: function (value) {
            'use strict';
            value = value.trim();
            if (value.length < 2) {
                return false;
            }
            return true;

        }
    },

    login: function (email, pass, cb) {

        User.findOne({
            email: email
        }).exec(function (err, result) {

            if (err) {
                sails.log(err);
                return cb(err);
            }
            if (!result) {
                err = new Error('Incorrect email or password.');
                return cb(err);
            }

            PasswordEncoder.bcryptCheck(pass, result.password, function (err, res) {
                console.log(res);
                if (err) {
                    sails.log(err);
                }
                if (!res) {
                    err = new Error('Password invalid');
                }
                return cb(err, result);
            });
        });
        // Create a user
    },
    sendMessage: function (phone, cb) {
   //     return cb(null, "1111");
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
        console.log(user);
        PasswordEncoder.bcryptEncodeValue(value, function (err, encoded) {
            if (err) {
                return cb(err, false);
            }
            User.update({'id': user.id}, {'password' : encoded}).exec(function (err, updated) {
                if (!updated.length) {
                    return cb(new Error("isnt updated: token is not active"));
                }
                return cb(err, updated);
            });
        });
    },

    beforeCreate: function (values, next) {
        PasswordEncoder.bcryptEncode(values, next);
    }
};

