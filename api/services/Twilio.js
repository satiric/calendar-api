/**
 * Created by decadal on 13.06.17.
 */
var accountSid = 'ACdf391cfab28d2d90fefee8fcae27c8f2';
var authToken = '679fd84fcea59984ecda9c3155004ef3';
var from = '+14159935359';
module.exports = {
    sendMessage: function (message, phone, cb) {
        'use strict';
        var Twilio = require('twilio'),
            client = new Twilio(accountSid, authToken);
        client.messages.create({
            body: message,
            to: phone,  // Text this number
            from: from // From a valid Twilio number
        }, cb);
    }
};
