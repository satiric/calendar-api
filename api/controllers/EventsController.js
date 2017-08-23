/**
 * EventsController
 *
 * @description :: Server-side logic for managing Events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ValidationE = require('../exceptions/Validation');
var PermissionE = require('../exceptions/Permission');
var BaseE = require('../exceptions/BaseException');
var UserAuth = require("../utils/UserAuth");

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /** todo refactor it
     * find all events which created by the user
     * 'user' - means authorized user, identified by auth-token in header.
     * 'was created' - means the user is founder of the event
     * @param req
     * @param res
     */
    findMy: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var page = Math.abs(parseInt(req.param('page', 1)));
        var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        var date = req.param('date');
        var keyword = req.param('keyword');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            require('../utils/Events').find(user, {
                'page': page, 'pageSize': pageSize, 'keyword': keyword, 'date': date,
                'type': Event.MY_EVENTS
            }, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok(result);
            });
        });



        // var token = Auth.extractAuthKey(req);
        // var date = req.param('date');
        // var page = Math.abs(parseInt(req.param('page', 1)));
        // var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        // var keyWord = req.param('keyword');
        // UserAuth.getUserByAuthToken(token, function(err, user) {
        //     if(err) {
        //         return res.serverError({"data": err});
        //     }
        //     if(!user) {
        //         return res.badRequest({"message": "User not found"});
        //     }
        //     var params = {"founder": user.id, 'active':true};
        //     if( keyWord ) {
        //         params.or = [
        //             { title : { 'like': '%'+keyWord+'%' } },
        //             { description : { 'like': '%'+keyWord+'%' } }
        //         ];
        //     }
        //     if(date) {
        //         params.date_start = {'<=': date.split("T")[0] + " 23:59:59"};
        //         params.date_end =  {'>=': date.split("T")[0]  + " 00:00:00"};
        //     }
        //     Event.find(params).sort({date_start: 'desc'}).paginate({page: page, limit: pageSize}).exec(function (err, events) {
        //         if(err) {
        //             return res.serverError({"data":err});
        //         }
        //         Event.count(params).exec(function (err, count) {
        //             if(err) {
        //                 return res.serverError({"data":err});
        //             }
        //             params.sphere = 0;
        //             Event.count(params).exec(function (err, countWork) {
        //                 if(err) {
        //                     return res.serverError({"data":err});
        //                 }
        //                 params.sphere = 1;
        //                 Event.count(params).exec(function (err, countPers) {
        //                     if(err) {
        //                         return res.serverError({"data":err});
        //                     }
        //                     Event.extendEvent(events, function(err, results){
        //                         if(err) {
        //                             return res.serverError({"data":err});
        //                         }
        //                         var mainPercent = (!count) ? 0 : (countWork / count)*100;
        //                         return res.ok({
        //                             "data": results || [] ,
        //                             "page": page,
        //                             "pageSize": pageSize,
        //                             "total": count,
        //                             percentage: {
        //                                 personal: mainPercent.toFixed(2),
        //                                 work: (results) ? (100 - mainPercent).toFixed(2) : 0
        //                             }
        //                         });
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });
    },

    /** todo refactor it
     * find all events that's the user was invited
     * 'user' - means authorized user, identified by auth-token in header.
     * 'was invited' - means the user isn't founder of the event, only invited
     * @param req
     * @param res
     */
    find: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var page = Math.abs(parseInt(req.param('page', 1)));
        var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        var date = req.param('date');
        var keyword = req.param('keyword');
        var type = +(req.param('type', Event.ALL_EVENTS)); 
        var acceptedOnly = req.param('acceptedOnly');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            require('../utils/Events').find(user, {
                'page': page, 'pageSize': pageSize, 'keyword': keyword, 'date': date, 
                'type': type, 'acceptOnly': acceptedOnly
            }, function(err, result){
                if(err) {
                    return res.serverError({"data": err});
                }
                return res.ok(result);
            });
        });
    },
    /** todo refactor it
     * find from all
     * @param req
     * @param res
     */
    findInvited: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var page = Math.abs(parseInt(req.param('page', 1)));
        var pageSize = Math.abs(parseInt(req.param('pageSize', 10)));
        var eventId = req.param('id');
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }

            EventInvite.find({"event_id":eventId}).populate('event_id').paginate({page: page, limit: pageSize}).exec(function(err, result){
                if(err) {
                    return res.serverError({"data":err});
                }
                EventInvite.count({"event_id":eventId}).exec(function (err, count) {
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    EventInvite.extendEventInvite(result, function(err, ei){
                        if(err) {
                            return res.serverError({"data":err});
                        }
                        ei = (ei || []).filter(function(ei) {
                            return !ei.id || (ei.id !== result[0].event_id.founder);
                        });
                        return res.ok({
                            "data": ei,
                            "page": page,
                            "pageSize": pageSize,
                            "total": count
                        });
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
            require('../utils/Events').detailed(eventId, user, function(err, result) {
                if(err) {
                    return (err instanceof BaseE) ? res.badRequest({ "message": err.message })
                        : res.serverError({ "data": err });
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
        var token = Auth.extractAuthKey(req);
        var mcc = req.headers.mcc || '';
        sails.log("MCC :"+ mcc);

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
            require('../utils/Events').create(req.body, user.id, mcc, function(err, result) {
                if(err) {
                    return (err instanceof ValidationE) ? res.badRequest({"message": err.message}) : res.serverError({"data":err});
                }
                Event.extendEvent([result], function(err, event){
                    if(err) {
                        return res.serverError({"data":err});
                    }
                    return res.ok({"data": event[0]});
                });
            });
        });
    },

    /**
     * todo refactor it
     * @param req
     * @param res
     */
    update: function (req, res) {
        var token = Auth.extractAuthKey(req);
        var eventId = req.param('id');
        var mcc = req.headers.mcc || '';
        sails.log("MCC :"+ mcc);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            Event.findOne({"id": eventId, "active": true}).exec(function(err, founded){
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
                require("../utils/Events").update(eventId, user, req.body, mcc, function(err, result) {
                    if(err) {
                        if (err instanceof PermissionE) {
                            return res.json(403, {"status": "error","message": err.message});
                        }
                        if (err instanceof ValidationE) {
                            return res.badRequest({"message": err.message});
                        }
                        if(err.Errors) {
                            err = new ValidationE(err);
                            return res.badRequest({"message": err.message});
                        }
                        return res.serverError({"data":err});
                    }
                    Event.findOne(founded.id).exec(function(err, resultEvent) {
                        if(err) {
                            return res.serverError({"data": err});
                        }
                        Event.extendEvent([resultEvent], function(err, event){
                            if(err) {
                                return res.serverError({"data":err});
                            }
                            var response = (event) ? event[0] : null;
                            
                            return res.ok({"data": response});
                        });
                    });
                });
            });
        });
    } //, 


    // PAY ATTENTION that action isn't tested, but idea of the action can be useful in future

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

};