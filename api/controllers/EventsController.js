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
    findMy: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var page = Math.abs(req.param('page', 1));
        var pageSize = req.param('pageSize', 10);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            Event.find({"founder": user.id, 'active':true}).paginate({page: page, limit: pageSize}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"data":err});
                }
                Event.count({"founder": user.id, 'active':true}).exec(function (err, count) {
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
    find: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var page = Math.abs(parseInt(req.param('page', 1)));
        var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            EventInvite.find({"user_id": user.id}).populate('user_id').paginate({page: page, limit: pageSize}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"data":err});
                }
                EventInvite.count({"user_id": user.id}).exec(function (err, count) {
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
    detail: function (req, res) {
        var eventId = req.param('id');
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            Event.find({"founder": user.id}).exec(function (err, events) {
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
        // Name of the Event Creator
        // Profile Picture of the Event Creator
        // Event Name
        // Sphere for the Event [Work / Personal]
        // Event Description
        // Location (Native Maps Application would be opened)
        // Date of the Event
        // Start & End Time of the Event
        // Visual Indicator of any earlier Accepted event (Along with Event Name, Start & End
        // Time) which will create conflict with this Event if a user Accepts it
        // Paginated List of Users (Who have been Invited to the Event) in Alphabetical Order
        // with following Details:
        //     > Name of the User
        // > Profile Picture of the User
        // > Visual Indicator if the Event Invite has been Accepted by the User or Not
        // User (Guests) should be able to Accept / Reject the Event Invite


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
            var errorMsg  = Event.hasNotice(req.body);
            if(errorMsg) {
                return res.badRequest({"message": errorMsg});
            }
            require('../utils/Events').create(req.body, user.id, function(err, result) {
                if(err) {
                    return (err instanceof ValidationE) ? res.badRequest({"message": err.message}) : res.serverError({"data":err});
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
    update: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var eventId = req.param('id');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            req.body.founder = user.id;
            Event.findOne(eventId).exec(function(err, founded){
                if(err) {
                    return res.serverError({"data": err});
                }
                if(!founded) {
                    return res.json(404, {"status":"error", "message": "Event isn't found"});
                }
                var errorMsg  = Event.hasNotice(req.body);
                if(errorMsg) {
                    return res.badRequest({"message": errorMsg});
                }
                Event.update({id: eventId, "founder": user.id}, req.body).exec(function (err, event) {
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    if( !event ) {
                        return res.json(403, {"status": "error","message":"Permission denied"});
                    }
                    return res.ok({"data": {"event":event}});
                });
            });

        });
    },
    // search: function (req, res) {
    //     var token = Auth.extractAuthKey(req);
    //     var searchValue = req.param('value');
    //     var page = req.param('page');
    //     var pageSize = req.param('pageSize');
    //     UserAuth.getUserByAuthToken(token, function(err, user) {
    //         // if(err) {
    //         //     return res.serverError({"details": err});
    //         // }
    //         // if(!user) {
    //         //     return res.badRequest({"message": "User not found"});
    //         // }
    //         Event.find({"founder": user.id}).exec(function (err, events) {
    //             if(err) {
    //                 return res.serverError({"details":err});
    //             }
    //             return res.ok({"event": events});
    //         }).paginate({page: page, limit: pageSize});
    //     });
    // }
};