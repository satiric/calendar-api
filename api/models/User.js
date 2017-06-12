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
        email: {
            type: "email",
            required: true,
            unique: true
        },
        password: {
            required: true,
            type: 'string',
            password: true // << defined below
        },
        phone: {
            required: false,
            type: 'string',
            phone: true
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
                if (err) {
                    sails.log(err);
                }
                if(!res) {
                    err = new Error('Password invalid');
                }
                return cb(err, result);
            });
        });
        // Create a user
    },

    beforeCreate: function (values, next) {
        PasswordEncoder.bcrypt(values, next);
    }
};

