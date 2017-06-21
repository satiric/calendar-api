/**
 * Created by decadal on 21.06.17.
 */


/**
 * File.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        key: {
            type: "string",
            required: true,
            minLength: 1
        },
        value: {
            type: "string",
            required: true
        },
        caption: {
            type: "string"
        },
        description: {
            type: 'string'
        }
    }
};

