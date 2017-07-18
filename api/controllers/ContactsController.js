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
                return res.ok({"data":  result  });
            });
        });
    },
    /**
     * 
     * @param req
     * @param res
     * @returns {*}
     */
    invite: function (req, res) {
        var emails = req.param('emails');
        var phones = req.param('phones');
        if( (! phones || ! phones.length) && (! emails || ! emails.length)) {
            return res.badRequest({"message": "Empty emails and phones arrays"});
        }
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            require('../utils/Contacts').invite( emails, phones, user, function(err, result) {
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
            if(!Array.isArray(phones)) {
                return res.badRequest({"message": "phones must be an array"});
            }
            require('../utils/Contacts').block(user, emails, phones, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok();
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
            var emails = req.param('emails');
            var phones = req.param('phones');
            if(!Array.isArray(emails)) {
                return res.badRequest({"message": "emails must be an array"});
            }
            if(!Array.isArray(phones)) {
                return res.badRequest({"message": "phones must be an array"});
            }
            require('../utils/Contacts').destroy(user, emails, phones, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok();
            });
        });
    }
};