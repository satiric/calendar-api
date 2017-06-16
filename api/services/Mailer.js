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
    "sendResetMail": function (user, hash, cb) {
        'use strict';
        return sails.hooks.email.send("resetEmail", {
            Name: user.name,
            link: "http://lastshelter.net:1337/api/v1/user/red?token=" + hash
        }, {
            to: user.email,
            subject: "Reset password Email"
        }, cb);
    }
};