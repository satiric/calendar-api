/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');
var UserAuth = require('../utils/UserAuth');
module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     *
     * @param req
     * @param res
     */
    find: function (req, res) {
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            require('../utils/Contacts').find(user.id, function(err, result) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"data": result});
            });
        });
    },

    /**
     *
     * @param req
     * @param res
     */
    create: function (req, res) {
        var contacts = req.body;
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            require('../utils/Contacts').create(user.id, contacts, function(err, result) {
                if(err) {
                    return res.serverError({"data":err});
                }
                return res.ok({"data": { contacts: result } });
            });
        });
    }, 
    invite: function (req, res) {
        var emails = req.param('emails');
        var phones = req.param('phones');

        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }

            var i, size;
            if(phones && phones.length) {
                var msg = user.name + " " + user.second_name + " invited you to vlife-1st ever Calendar-Chat";
                msg += " app. Connect privately with Work&Social contacts. Click here for more info";
                for(i = 0, size = phones.length; i < size; i++) {
                    if(!phones[i]) {
                        continue;
                    }
                    Twilio.sendMessage(msg,phones[i]);
                }
            }
            if(emails && emails.length) {
                for(i = 0, size = emails.length; i < size; i++) {
                    if(!emails[i]) {
                        continue;
                    }
                    Mailer.sendInviteMessage(user, emails[i], function() {});
                }
            }
            return res.ok();
        });
    },
    block: function(req, res) {
//todo refactor it
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            var emails = req.param('emails');
            var phones = req.param('phones');
            if(!Array.isArray(emails)) {
                return res.badRequest({"message": "emails must be an array"});
            }
            emails = emails.map(function(value) {
                if(!value) {
                    return value;
                }
                return {
                    'email': value,
                    'user_id': user.id
                };
            });
            emails = emails.filter(function(val){
                return (val);
            });

            EmailContacts.update(emails,{"blocked": 1}).exec(function(err){
                if(err) {
                    return res.serverError({"data": err});
                }

                if(!Array.isArray(phones)) {
                    return res.badRequest({"message": "phones must be an array"});
                }
                phones = phones.map(function(value) {
                    return {
                        'id': PhoneIdentifier.extract(value),
                        'phone': value,
                        'user_id': user.id
                    };
                });
                phones = phones.filter(function(val){
                    return (val);
                });
                if(phones.length){
                    return PhoneContacts.update(phones, {"blocked":1}).exec(function(err){
                        if(err) {
                            return res.serverError({"data": err});
                        }
                        return res.ok();
                    });
                }
                return res.ok();

            });
        });
    },


    destroy: function(req, res) {
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            var emails = req.param('emails');
            var phones = req.param('phones');
            if(!Array.isArray(emails)) {
                return res.badRequest({"message": "emails must be an array"});
            }
            emails = emails.map(function(value) {
                return {
                    'email': value, 
                    'user_id': user.id
                };
            });
            EmailContacts.destroy(emails).exec(function(err){
                if(err) {
                    return res.serverError({"data": err});
                }
                
                if(!Array.isArray(phones)) {
                    return res.badRequest({"message": "phones must be an array"});
                }
                phones = phones.map(function(value) {
                    return {
                        'id': PhoneIdentifier.extract(value),
                        'phone': value,
                        'user_id': user.id
                    };
                });
                PhoneContacts.destroy(phones).exec(function(err){
                    if(err) {
                        return res.serverError({"data": err});
                    }
                    return res.ok();
                });
            });
        });
    }
};