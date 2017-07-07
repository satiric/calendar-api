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
        var page = req.param('page', 1);
        if (page < 0 ) {
            page = 1;
        }
        var pageSize = req.param('pageSize', 10);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            Event.find({"founder": user.id}).paginate({page: page, limit: pageSize}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"data":err});
                }
                Event.count({"founder": user.id}).exec(function (err, count) {
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    return res.ok({"data": events, "page": page, "pageSize": pageSize, "total": count});
                });
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
    },

    /**
     *
     * @param req
     * @param res
     */
    update: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var eventId = req.param('id');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"details": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            req.body.founder = user.id;
            Event.update({id: eventId, "founder": user.id}, req.body).exec(function (err, event) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"event": event});
            });
        });
    },
    search: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var searchValue = req.param('value');
        var page = req.param('page');
        var pageSize = req.param('pageSize');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            // if(err) {
            //     return res.serverError({"details": err});
            // }
            // if(!user) {
            //     return res.badRequest({"message": "User not found"});
            // }
            Event.find({"founder": user.id}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"event": events});
            }).paginate({page: page, limit: pageSize});
        });
    },
};