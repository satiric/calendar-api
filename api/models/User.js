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
        }
    },

    // Custom types / validation rules
    // (available for use in this model's attribute definitions above)
    types: {
        password: function (value) {
            'use strict';
            return _.isString(value) && value.length >= 8;
        }
    },

    login: function (inputs, cb) {
        // Create a user
        User.findOne({
            email: inputs.email,
            // TODO: But encrypt the password first
            password: inputs.password
        })
            .exec(cb);
    }
    // signup: function (inputs, cb) {
    //     // Create a user
    //     User.create({
    //         name: inputs.name,
    //         email: inputs.email,
    //         // TODO: But encrypt the password first
    //         password: inputs.password
    //     })
    //         .exec(cb);
    // },
};

