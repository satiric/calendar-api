/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'localMysqlServer',
    tableName: "phone_verification",
    attributes: {
        code: {
            type: "string",
            required: true
        },
        phone: {
            required: true,
            type: 'string',
            regex: /\+([0-9]){9,13}/
        }, 
        security_hash: {
            type: 'string'
        }
    }
};

