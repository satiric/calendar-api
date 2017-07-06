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
//            required: true, // coz generation binded to beforecreate action
            minLength: 40
        },
        expire_date: {
            type: 'datetime'
        },
        is_active: {
            type: 'boolean',
            defaultsTo: function () {
                return true;
            }
        },
        refresh_token: {
            type: "string",
//            required: true, // coz generation binded to beforecreate action
            maxnLength: 40
        },
        owner:{ //for avatar
            model:'User',
            unique: true
        }
    },

    beforeCreate: function (values, next) {
        values.value = require("randomstring").generate(60);
        values.refresh_token = require("randomstring").generate(40);
        next();
    }
};

