/**
 * File.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: "string",
            required: true,
            minLength: 1
        },
        size: {
            type: "integer"
        },
        ext: {
            type: "string"
        },
        caption: {
            type: "string"
        },
        url: {
            required: true,
            type: 'string'
        }, 
        mini_url: {
            type: 'string'
        }
    }
};

