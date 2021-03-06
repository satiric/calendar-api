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
            link: sails.config.constants.devUrl + "/redirect?token=" + hash
        }, {
            to: user.email,
            subject: "Reset password Email"
        }, cb);
    }, 
    "sendMessage": function (message, subject, email, cb) {
        'use strict';
        subject = subject || "Message from vLife";
        return sails.hooks.email.send("messageEmail", {
            Message: message
        }, {
            to: email,
            subject: subject
        }, cb);
    },
    sendMultiMessage: function (message, subject, emails, cb) {
        'use strict';
        for(var i = 0, size = emails.length; i < size; i++) {
            Mailer.sendMessage(message, subject, emails[i], function() {

            });
        }
        return cb();
    },
    sendInviteMessage: function(user, email, cb) {
        'use strict';
        return sails.hooks.email.send("inviteEmail", {
            Name: user.name,
            SecondName: user.second_name
        }, {
            to: email,
            subject: "Invite to vlife"
        }, cb);
    },

    /**
     * todo refactor it
     * @param user
     * @param event
     * @param email
     * @param cb
     * @returns {*}
     */
    sendInviteToEventMessage: function(user, event, email, cb) {
        'use strict';

        return sails.hooks.email.send("inviteToEventEmail", {
            Name: user.name,
            SecondName: user.second_name,
            EventTitle: event.title || 'EventTitle',
            EventLocation: event.fullAddress || '', //event.location || '',
            EventDate: event.date_start
        }, {
            to: email,
            subject: "Invite to event in vlife"
        }, cb);
    }
    
};