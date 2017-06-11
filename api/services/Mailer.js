/**
 * Created by decadal on 09.06.17.
 */

module.exports = {
    "sendWelcomeMail": function (obj) {
        'use strict';
        sails.hooks.email.send("welcomeEmail", {
            Name: obj.name
        }, {
            to: obj.email,
            subject: "Welcome Email"
        }, function (err) {
            console.log(err || "Mail Sent!");
        });
    },
    "sendResetMail": function (obj) {
        'use strict';
        sails.hooks.email.send("resetEmail", {
            Name: obj.name
        }, {
            to: obj.email,
            subject: "Reset password Email"
        }, function (err) {
            console.log(err || "Mail Sent!");
        });
    }
};