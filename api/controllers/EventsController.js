/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');
var PermissionE = require('../exceptions/Permission');
var UserAuth = require("../utils/UserAuth");
module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     * find of my
     * @param req
     * @param res
     */
    findMy: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var date = req.param('date');
        var page = Math.abs(parseInt(req.param('page', 1)));
        var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        var keyWord = req.param('keyword');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            var params = {"founder": user.id, 'active':true};
            if( keyWord ) {
                params.or = [
                    { title : { 'like': '%'+keyWord+'%' } },
                    { description : { 'like': '%'+keyWord+'%' } }
                ];
            }
            if(date) {
                params.date_start = {'<=': date};
                params.date_end =  {'>=': date };
            }


            Event.find(params).sort({date_start: 'asc'}).paginate({page: page, limit: pageSize}).exec(function (err, events) {
                if(err) {
                    return res.serverError({"data":err});
                }
                Event.count(params).exec(function (err, count) {
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    params.sphere = 0;
                    Event.count(params).exec(function (err, countWork) {
                        if(err) {
                            return res.serverError({"data":err});
                        }
                        params.sphere = 1;
                        Event.count(params).exec(function (err, countPers) {
                            if(err) {
                                return res.serverError({"data":err});
                            }
                            var mainPercent = (countWork / count)*100;
                            return res.ok({
                                "data": events,
                                "page": page,
                                "pageSize": pageSize,
                                "total": count,
                                percentage: {
                                    personal: mainPercent.toFixed(2),
                                    work: (100 - mainPercent).toFixed(2)
                                }
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * find from all
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

    //
    // /**
    //  * find from all
    //  * @param req
    //  * @param res
    //  */
    // findAll: function (req, res) {
    //     var token = Auth.extractAuthKey(req);
    //     var page = Math.abs(parseInt(req.param('page', 1)));
    //     var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
    //     var keyword = req.param('keyword');
    //     UserAuth.getUserByAuthToken(token, function(err, user) {
    //         if(err) {
    //             return res.serverError({"data": err});
    //         }
    //         if(!user) {
    //             return res.badRequest({"message": "User not found"});
    //         }
    //         EventInvite.find({"user_id": user.id}).populate('event_id').paginate({page: page, limit: pageSize}).exec(function (err, events) {
    //             if(err) {
    //                 return res.serverError({"data":err});
    //             }
    //             EventInvite.count({"user_id": user.id}).exec(function (err, count) {
    //                 if(err) {
    //                     return res.serverError({"data":err});
    //                 }
    //                 return res.ok({"data": events, "page": page, "pageSize": pageSize, "total": count});
    //             });
    //         });
    //     });
    // },

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
            Event.findOne(eventId).populate("founder").exec(function (err, event) {
                if(err) {
                    return res.serverError({"data":err});
                }
                if(!event) {
                    return res.badRequest({"message":"Event not exist"});
                }
                EventInvite.find({'event_id': eventId }).populate('user_id').exec(function(err, invited){
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    var inv = invited.map(function(value){
                        return {
                            id: value.user_id.id,
                            status: value.status,
                            value: value.user_id.name + " " + value.user_id.second_name
                        };
                    });
                    EventInviteGuest.find({'event_id': eventId }).exec(function(err, invited) {
                        if(err) {
                            return res.serverError({"data":err});
                        }
                        sails.log(invited);
                        for (var i = 0, size = invited.length; i < size; i++) {
                            inv.push({
                                "id": null,
                                status: null,
                                "value": (invited[i].phone_id || invited[i].email)
                            });
                        }
                        event.invited = inv;
                        return res.ok({data: event});
                    });
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
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }

            var errorMsg  = Event.hasNotice(req.body);
            if(errorMsg) {
                return res.badRequest({"message": errorMsg});
            } //todo do with it something
            if(!Event.isoDate(req.body.date_start) || !Event.isoDate(req.body.date_end) ||
                (req.body.end_repeat && !Event.isoDate(req.body.end_repeat) )) {
                return res.badRequest({"message": "Incorrect type for date. Is required ISO format"});
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

                if((req.body.date_start && !Event.isoDate(req.body.date_start)) ||
                    (req.body.date_end && !Event.isoDate(req.body.date_end)) ||
                    (req.body.end_repeat && !Event.isoDate(req.body.end_repeat) )) {
                    return res.badRequest({"message": "Incorrect type for date. Is required ISO format"});
                }

                require("../utils/Events").update(eventId, user, req.body, function(err, result) {
                    if(err) {
                        return (err instanceof PermissionE)
                            ? res.json(403, {"status": "error","message": err.message})
                            : res.serverError({"data":err});
                    }
                    return res.ok({"data":result});
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