/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');
var UserAuth = require("../utils/UserAuth");
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
                return res.serverError({"details": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            Event.find({"founder": user.id}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"event": events});
            });
        });
    },

    /**
     *
     * @param req
     * @param res
     */
    create: function (req, res) {
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"details": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            req.body.founder = user.id;
            Event.create(req.body).exec(function (err, event) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"event": event});
            });
        });
    }
};