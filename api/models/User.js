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
            minLength: 2
        },
        second_name: {
            type: "string",
            required: true,
            minLength: 2
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
        toJSON: function() {
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
                err = new Error('User not found');
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
        // return cb(null, "0000");
        var firstPart = _.random(10, 99);
        var secondPart = _.random(10, 99);
        return Twilio.sendMessage(firstPart + ' ' + secondPart, phone, function (err) {
            if (err) {
                return cb(err);
            }
            return cb(null, firstPart.toString() + secondPart.toString());
        });
    },

    beforeCreate: function (values, next) {
        PasswordEncoder.bcryptEncode(values, next);
    }
};

