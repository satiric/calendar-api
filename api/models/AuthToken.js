/**
 * Created by decadal on 19.06.17.
 */


/**
 * User.js
 *
 * @description :: model is unused 
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        value: {
            type: "string",
            required: true,
            minLength: 40
        },
        expire_time: {
            type: 'int'
        },
        expire_metric: {
            type: 'string',
            enum: ['s', 'm', 'h', 'd']
        },
        is_active: {
            type: 'boolean',
            defaultsTo: function () {
                return true;
            }
        }
    },

    beforeCreate: function (values, next) {
        values.value = require("randomstring").generate(60);
        next();
    }
};

