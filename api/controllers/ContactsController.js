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
        var contacts = req.param('contacts');
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
                    return res.serverError({"details":err});
                }
                return res.ok({"data": result});
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
            for(var i = 0, size = phones.length; i < size; i++) {
                Twilio.sendMessage("Hello from " + user.name + "!",phones[i]);
            }
            for(i = 0, size = emails.length; i < size; i++) {
                Mailer.sendMessage("Hello from " + user.name + "!", "Invite from vlife", emails[i]);
            }
            return res.ok();
        });
        
//        var token = Auth.extractAuthKey(req);
    }
};