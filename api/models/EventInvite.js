/**
 * Created by decadal on 29.06.17.
 */

module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,
    tableName: "event_invites",
    attributes: {
        event_id: {
            model: 'Event',
            required: true
        },
        phone_id: {
            model: 'Phone'
        },
        email: {
            model: 'Email'
        },
        user_id: {
            model: 'User'
        },
        id: {
            type: "integer",
            primaryKey: true
        },
        status: {
            type: "integer"
        }
    },

    extendEventInvite: function(ei, cb) {
        //filter all where user_id is exists
        var userIds = ei.filter(function(value) {
            return value.user_id;
        });
        // make userIds as array of numbers
        userIds = userIds.map(function(value) {
            return value.user_id;
        });
        User.find({id: userIds}).populate('avatar').sort({name: 'asc'}) .exec(function(err, users){
            if(err) {
                return cb(err);
            }
            ei = ei.map(function(value){
                //todo extends model for guests
                if(value.phone_id) {
                    return {
                        phone: value.phone_id,
                        status: 0 //unregistred cant accept invite
                    };
                }
                if(value.email) {
                    return {
                        email: value.email,
                        status: 0
                    };
                }
                var us = users.find(function (element){
                        return element.id === value.user_id;
                    });
                us.status = (value.status || 0);
                return us;
            });
            return cb(null, ei);
        });
    },
    
    findEventsByFilter: function (user, filters, cb) {
        var params = {};
        if(filters.date) {
            params.date_start = {'<=': filters.date.split("T")[0] + " 23:59:59"};
            params.date_end =  {'>=': filters.date.split("T")[0]  + " 00:00:00"};
        }
        EventInvite.find({"user_id": user.id}).populate('event_id', { where:  params}).paginate({page: page, limit: pageSize}).exec(function (err, events) {
            if(err) {
                return cb(err);
            }
            EventInvite.count({"user_id": user.id}).populate('event_id', { where:  params}).exec(function (err, count) {
                if(err) {
                    return cb(err);
                }
                var ev = events.map(function(val){
                    return val.event_id.id;
                });
                sails.log(ev);
                Event.find({"id":ev}).exec(function(err, events){
                    if(err) {
                        return cb(err);
                    }
                    Event.extendEvent(events, function(err, results){
                        if(err) {
                            return cb(err);
                        }
                        return cb(null, {
                            "data": results || [],
                            "page": page,
                            "pageSize": pageSize,
                            "total": count
                        });
                    });
                });
            });
        });
        
    }

    // dropFromEvent: function(eventId, userIds, cb) {
    //     var sql = "";
    //     var arr = [];
    //     for(var i = 0, size = userIds.length; i < size; i++) {
    //         sql+=  "(user_id = ? AND event_id = ?)";
    //         arr.push(userIds[i]);
    //         arr.push(eventId);
    //
    //         if(i !== userIds.length - 1) {
    //             sql+= " OR ";
    //         }
    //     }
    //     EventInvite.query("DELETE FROM event_invites WHERE " + sql, arr ,function(err, rawResult) {
    //         return cb(err, rawResult);
    //     });
    // }
    // validationMessages: { //hand for i18n & l10n
    //     email: {
    //         required: 'Email is required',
    //         email: 'Email is not a valid email',
    //         unique: 'This email is already registered to a vlife account'
    //     },
    //     name: {
    //         required: "Name is required",
    //         validName: "Invalid Name: it must be more than 1 symbol and less than 26, without spaces"
    //     },
    //     second_name: {
    //         required: "Name is required",
    //         validName: "Invalid Last Name: it must be more than 1 symbol and less than 26, without spaces"
    //     },
    //     password: {
    //         required: "Password is required",
    //         password: "Invalid Password: it contain spaces on start or on end",
    //         minLength: "Invalid Password: it must be more than 7 symbols",
    //         maxLength: "Invalid Password: it must be less than 26 symbols"
    //     },
    //     phone: {
    //         required: "Phone is required",
    //         regex: "Phone must be valid phone like +12341231451"
    //     }
    // },
};