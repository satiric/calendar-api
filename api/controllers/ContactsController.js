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
            require('../utils/Contacts').find(user, function(err, result) {
                if(err) {
                    return res.serverError({"data":err});
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
        if(!Array.isArray(contacts)) {
            return res.badRequest({"message": "body of request must be an array"});
        }
        var token = Auth.extractAuthKey(req);
     //   var mcc = req.headers.mcc || '';
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }

            require('../utils/Contacts').create(user.id, contacts, function(err, result) {
                if(err) {
                    return (err.Errors) ? res.badRequest({"message": (new ValidationE(err)).message})
                        : res.serverError({"data": err});
                }
                return res.ok({"data":  result  });
            });
        });
    },
    /**
     * send to emails and phones invite-message, if this emails and phones aren't connected to vlife-users
     * 'emails and phones' means list of string values, which was sent in request
     * 'invite' means invite to vlife app, not in event.
     *
     * @param req
     * @param res
     * @returns {*}
     */
    invite: function (req, res) {
        var emails = req.param('emails');
        if(emails && Array.isArray(emails)) {
            emails = emails.map(function(e) {
                return e.toLowerCase();
            });

        }
        var phones = req.param('phones');
        var mcc = req.headers.mcc || '';
        sails.log("MCC :"+ mcc);
        
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            require('../utils/Contacts').invite( emails, phones, user, mcc,  function(err, result) {
                if(err) {
                    return (err instanceof LogicE) ? res.badRequest({"message": err.message})
                        : res.serverError({"data": err});
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
    block: function(req, res) {
//todo refactor it
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            var friends = req.param('friends');
            if(!Array.isArray(friends)) {
                if(typeof friends !== "number" ) {
                    return res.badRequest({"message": "friends must be an array or integer"});
                }
                friends = [friends];
            }
            require('../utils/Contacts').block(user, friends, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok({"data":result});
            });
        });
    },
    /**
     *
     * @param req
     * @param res
     */
    unblock: function(req, res) {
//todo refactor it
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            var friends = req.param('friends');
            if(!Array.isArray(friends)) {
                if(typeof friends !== "number" ) {
                    return res.badRequest({"message": "friends must be an array or integer"});
                }
                friends = [friends];
            }
            require('../utils/Contacts').unblock(user, friends, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
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
    destroy: function(req, res) {
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            var friends = req.param('friends');
            if(!Array.isArray(friends)) {
                if(typeof friends !== "number" ) {
                    return res.badRequest({"message": "friends must be an array or integer"});
                }
                friends = [friends];
            }
            require('../utils/Contacts').destroy(user, friends, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok();
            });
        });
    }
};