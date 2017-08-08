/**
 * Created by decadal on 29.06.17.
 */

module.exports = {
    attributes: {
        title: {
            type: "string",
            required: true,
            maxLength: 25,
            trimSpaces: true
        },
        sphere: {
            type: "integer",
            isSphere: true
           // enum: ['Personal', 'Work']
        },
        date_start: {
            required: true,
            type: "datetime",
   //         isISOdatetime: true
        },
        date_end: {
            required: true,
            type: "datetime",
      //      isISOdatetime: true
        },
        repeat_type: {
            type: "integer",
            isRepeatType: true
      //      enum: ['Never', 'Day', 'Week', 'Fortnight', 'Month']
        },
        repeat_option: {
            type: "integer",
            isRepeatOption: true
        },
        end_repeat: {
            type: "datetime",
      //      isISOdatetime: true
        },
        location: {
            type: "string",
            trimSpaces: true
        },
        description: {
            type: "string",
            maxLength: 200
        },
        reminds: {
            type: "integer"
        },
        active: {
            type: "boolean",
            defaultsTo: true
        },
        founder: {
            model: 'User'
        }
    },


// Custom types / validation rules
// (available for use in this model's attribute definitions above)
types: {
    trimSpaces: function (value) {
        var oldLen = value.length;
        value = value.trim();
        return (value.length === oldLen);
    },
    isSphere: function (value) {
        return (value === 1 || value === 0);
    },
    isRepeatType: function (value) {
        var available = [1,2,4,8,16];
        return (available.indexOf(value) !== -1);
    },
    isRepeatOption: function (value) {
        return value < 128;
    }
    // isISOdatetime: function (value) {
    //     return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:(\.\d+([+-][0-2]\d:[0-5]\d|Z))|)/.test(value.toISOString());
    // }
},

    validationMessages: { //hand for i18n & l10n
        date_start: {
            required: 'Date start is required',
            datetime: 'Invalid type for Date start. Date start format is UTC',
        },
        date_end: {
            required: 'Date end is required',
            datetime: 'Invalid type for Date end. Date end format is UTC',
        },
        title: {
            required: 'Title is required',
            trimSpaces: 'Title should not contain spaces',
            maxLength: "Description must be less than 26 symbols"
        },
        description: {
            maxLength: "Description must be less than 200 symbols"
        },
        sphere:  {
            isSphere: "Sphere must be only 1 or 0"
        },
        repeat_type: {
            isRepeatType: "repeat_type must be 1, 2, 4, 8 or 16"
        },
        repeat_option: {
            isRepeatOption: "repeat_option must be less than 128"
        },
        location: {
            trimSpaces: "location shouldn't contain spaces in front or end of string"
        }

        // second_name: {
        //     required: "Name is required",
        //     validName: "Invalid Last Name: it must be more than 1 symbol and less than 26, without spaces"
        // },
        // password: {
        //     required: "Password is required",
        //     password: "Invalid Password: it contain spaces on start or on end",
        //     minLength: "Invalid Password: it must be more than 7 symbols",
        //     maxLength: "Invalid Password: it must be less than 26 symbols"
        // },
        // phone: {
        //     required: "Phone is required",
        //     regex: "Phone must be valid phone like +12341231451"
        // }
    },

    beforeCreate: function (values, next) {
        if(values.description){
            values.description = values.description.trim();
        }
        if(!values.end_repeat) {
            values.end_repeat = null;
        }
        next();
    },
    beforeUpdate: function (values, next) {
        if(values.description){
            values.description = values.description.trim();
        }
        next();
    },
    
    isoDate: function(date) {
        return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:(\.\d+([+-][0-2]\d:[0-5]\d|Z))|)/.test(date);
    },

    hasNotice: function(event) {
        if(!event.date_end) {
            return;
        }
        var dateEnd = (new Date(event.date_end)).getTime();
        if(event.date_start) {
            var dateStart = (new Date(event.date_start)).getTime();
            if(dateStart > dateEnd) {
                return "date_start must be less than date_end";
            }
        }
        if(event.end_repeat) {
            var endRepeat = (new Date(event.end_repeat)).getTime();
            if (endRepeat < dateEnd) {
                return "end_repeat must be more than date_end";
            }
        }
        return undefined; //todo remove?
    },

    /**
     * select userInfo and avatar for each founder 
     * @param events
     * @param cb
     */
    extendEvent: function(events, cb) {
        if(!events || !events.length) {
            return cb();
        }
        var userIds = events.map(function(value) {
            return value.founder;
        });
        User.find({id: userIds}).populate('avatar').exec(function(err, users){
            if(err) {
                return cb(err);
            }
            events = events.map(function(value){
                var id = value.founder;
                value.founder = users.find(function (element){
                    return element.id === id;
                });
                return value;
            });
            return cb(null, events);
        });
    },

    getEventsWithDate: function(userId, date, keyword, page, size, cb) {
        var params = [userId];
        var countParams = [userId];
        sails.log(keyword);
        var query = "SELECT e.* FROM event_invites as ei LEFT JOIN  event as e ON e.id = ei.event_id WHERE e.active = 1 AND ei.user_id = ? ";
        var queryCount = "SELECT count(1) AS cnt FROM event_invites as ei LEFT JOIN  event as e ON e.id = ei.event_id WHERE e.active = 1 AND ei.user_id = ? ";
        if (keyword) {
            keyword = "%" + keyword + "%";
            query += "AND (e.title LIKE ? OR e.description LIKE ?)";
            queryCount += "AND (e.title LIKE ? OR e.description LIKE ?)";
            params.push(keyword);
            params.push(keyword);
            countParams.push(keyword);
            countParams.push(keyword);
        }
        if(date) {
            params.push(date.split("T")[0] + " 23:59:59");
            params.push(date.split("T")[0]  + " 00:00:00");
            countParams.push(date.split("T")[0] + " 23:59:59");
            countParams.push(date.split("T")[0]  + " 00:00:00");
            query += " AND e.date_start <= ? AND e.date_end >= ? ORDER BY e.date_start DESC LIMIT ? OFFSET ?";
            queryCount += " AND e.date_start <= ? AND e.date_end >= ?";
        }
        else {
            query += " ORDER BY e.date_start DESC LIMIT ? OFFSET ?";
        }
        params.push(size);
        params.push((page-1) * size);
        Event.query(query, params, function(err, result){
            if(err) {
                return cb(err);
            }
            Event.query( queryCount, countParams, function(err, count){
                if(err) {
                    return cb(err);
                }
                return cb(err, result, count[0].cnt || 0);
            });
        });
    }
};