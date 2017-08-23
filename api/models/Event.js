/**
 * Created by decadal on 29.06.17.
 */

function getTimeZoneByOffset(offset) {
    var result = parseInt(offset / 60);
    var sign = (result < 0 ) ? "-" : "+";
    result = sign + result + ":00";
    return result;
}

function mapLocation(values){
    if(values.location) {
        if(values.location.googlePlaceId) {
            values.googlePlaceId = values.location.googlePlaceId;
        }
        if(values.location.fullAddress) {
            values.fullAddress = values.location.fullAddress;
        }
    }
    return values;
}


function fillByGooglePlaceId(values, cb) {
    var id = values.googlePlaceId;
    GooglePlaces.get(id, function(err, result) {
        if(!result) {
            return cb();
        }
        if(result.result && result.result.geometry && result.result.geometry.location ) {
            values.latitude = result.result.geometry.location.lat;
            values.longitude = result.result.geometry.location.lng;
        }

        return cb();
    });
}
/**
 *
 * @param iter
 * @param date
 * @returns {{query: string, params: *[]}}
 */
function buildQueryWeekly(iter, date) {
    // all values from repeat_options
    var days = [1, 2, 4, 8, 16, 32, 64];
    // mysql DAYOFWEEK function return 2 for monday, 1 for sunday etc.
    var dayOfWeek = [2, 3, 4, 5, 6, 7, 1];
    var totalCount = 7;
    var q =  " (repeat_option & "+ days[iter] + " = " + days[iter] + " AND (" +
        "IF ( " +
        "( " + dayOfWeek[iter] + "+ DATEDIFF(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) > " + totalCount + "), " + // condition
        "( " + dayOfWeek[iter] + " <= DAYOFWEEK(?) OR  DAYOFWEEK(?) <= ( " + dayOfWeek[iter] +" - " + totalCount + " + DATEDIFF(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE))) ), " + // if true
        "( " + dayOfWeek[iter] + " <= DAYOFWEEK(?) AND  DAYOFWEEK(?) <= ( " + dayOfWeek[iter] + " + DATEDIFF(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE))) ) " + // else
        ") " +
        "))" + ((iter < days.length - 1) ? " OR " : "");
    return {
        "query": q,
        "params": [date, date, date, date] //4 question marks
    };
}

/**
 *
 * @param date
 * @returns {{query: string, params: *[]}}
 */
function buildQueryMonthly(date) {
    var q =  "IF( " +
        "DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE))," +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) AND DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE)), " +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) OR DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE)) " +
        ")";
    return {
        'query' : q,
        'params' : [date, date, date, date]
    };
}

/**
 *
 * @param date
 * @returns {{query: string, params: *[]}}
 */
function buildQueryFornight(date) {
    var q =  "(IF( " +
        "DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE))," +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) AND DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE)), " +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE)) OR DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE)) " +
        ") OR IF(" +
        "DAYOFMONTH(DATE_ADD(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY)) <= DAYOFMONTH(DATE_ADD(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY))," +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY)) AND DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY)), " +
        "DAYOFMONTH(?) >= DAYOFMONTH(DATE_ADD(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY)) OR DAYOFMONTH(?) <= DAYOFMONTH(DATE_ADD(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), INTERVAL 14 DAY)) " +
        "))";
    return {
        'query' : q,
        'params' : [date, date, date, date, date, date, date, date]
    };
}



function eventsWithRepeat(dateStart, dateEnd) {
    // i hope you stay alive because that isn't worst query in our life.
    var partOfWeeklyQuery = "";
    var params = [dateStart, dateEnd, dateStart, dateStart]; // for first 4 questions mark in query before the part of weekly query
    var tmp;
    for (var i = 0; i < 7; i++) {
        tmp = buildQueryWeekly(i, dateStart);
        partOfWeeklyQuery += tmp.query;
        params = params.concat(tmp.params);
    }
    tmp = buildQueryFornight(dateStart);
    var partOfFornight = tmp.query;
    params = params.concat(tmp.params);

    tmp = buildQueryMonthly(dateStart);
    var partOfMonthly = tmp.query;
    params = params.concat(tmp.params);
    var q = "( " +
        "(DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE) <= ? AND DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE) >= ?)" +
        "OR (" +
        " DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE) < ? " +
        " AND (end_repeat IS NULL OR date(end_repeat) >= date(?) ) " + // firstly, check that end_repeat doesn't block the event
        " AND (" + //after that check types of repeat
        "repeat_type = 2" + // DAILY
        " OR (repeat_type = 4 AND (" + //WEEKLY
        partOfWeeklyQuery +
        ")" +
        " ) " +
        // " OR (repeat_type = 4 AND DAYOFWEEK(date_start) = DAYOFWEEK(?))" + // WEEKLY without options
        " OR (repeat_type = 8 AND (" +// FORNIGHT working as weekly
        partOfFornight +
        ")" +
        ")" +
        " OR (repeat_type = 16 AND (" + // MONTHLY
        partOfMonthly +
        ")" +
        ")" +
        " )" +
        " )" +
        ")";
    //  params.push(dateStart);
    return {
        'query': q,
        // depends of count '?' symbols in the query: the same date used in all placeholders marked as '?',
        // except the second parameter: dateEnd for comparing with date_end field
        'params': params
    };

}

function execAddReq(req, cb) {
    if(!req) {
        return cb();
    }
    Event.query(req, [], cb);
}

module.exports = {
    MY_EVENTS: 1,
    NOT_MY_EVENTS: 2,
    ALL_EVENTS: 3,
    tzOffset: 0,
    attributes: {
        title: {
            type: "string",
            required: true,
            maxLength: 50,
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
            defaultsTo: null
            //      isISOdatetime: true
        },
        description: {
            type: "string",
            maxLength: 500
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
        },
        googlePlaceId : {
            type: "string"
        },
        fullAddress : {
            type: "string"
        },
        latitude : {
            type: "float"
        },
        longitude : {
            type: "float"
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
        values = mapLocation(values);
        if(values.googlePlaceId) {
            fillByGooglePlaceId(values, next);
        }
        else {
            next();
        }
    },
    beforeUpdate: function (values, next) {
        if(values.description){
            values.description = values.description.trim();
        }
        values = mapLocation(values);

        if(values.googlePlaceId) {
            fillByGooglePlaceId(values, next);
        }
        else {
            next();
        }
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
                value.location = {
                    "googlePlaceId": value.googlePlaceId,
                    "latitude": value.latitude,
                    "longitude": value.longitude,
                    "fullAddress": value.fullAddress
                };
                delete value.googlePlaceId;
                delete value.latitude;
                delete value.longitude;
                delete value.fullAddress;
                return value;
            });
            return cb(null, events);
        });
    },
    getMyEvents: function(userId) {
        return {
            'query': ' WHERE e.active = 1 AND (e.founder = ?) ',
            'params': [userId]
        };
    },

    getAllEvents: function(userId, acceptOnly) {
        var acceptPart = (acceptOnly) ? ' AND ei.status = 1 ' : '';
        return {
            "query": " LEFT JOIN event_invites as ei ON e.id = ei.event_id AND ei.user_id = ? WHERE e.active = 1 AND (ei.user_id = ? or e.founder = ?) " + acceptPart,
            'params': [userId, userId, userId]
        };
    },

    getNotMyEvents: function(userId, acceptOnly) {

        var acceptPart = (acceptOnly) ? ' AND ei.status = 1 ' : '';
        return {
            "query": " LEFT JOIN event_invites as ei ON e.id = ei.event_id WHERE e.active = 1 AND ei.user_id = ? " + acceptPart,
            'params': [userId]
        };
    },
    getPartByType: function(type, userId, acceptOnly) {
        switch(type) {
            case Event.MY_EVENTS : return Event.getMyEvents(userId);
            case Event.NOT_MY_EVENTS : return Event.getNotMyEvents(userId, acceptOnly);
            case Event.ALL_EVENTS : return Event.getAllEvents(userId, acceptOnly);
            default: return null;
        }
    },
    findWithMap: function(ids, cb) {
        if(!ids || !ids.length) {
            return cb(null, []);
        }
        sails.log("--Timezone offset: --");
        sails.log(Event.tzOffset);
        var query = "SELECT id, longitude, latitude, googlePlaceId, fullAddress, title, sphere, repeat_type, repeat_option, location, description, " +
            "reminds, active, founder, end_repeat, createdAt, updatedAt, date_start, date_end, " +
            "DATE_ADD(date_start, INTERVAL " + Event.tzOffset + " MINUTE) AS date_start_r, " +
            "DATE_ADD(date_end, INTERVAL " + Event.tzOffset + " MINUTE) AS date_end_r " +
            "FROM event WHERE id IN (" + ids.join() + ") ORDER BY date_start DESC";
        Event.query(query, [], cb);
    },
    getEventsByConfig: function(userId, config, cb) {
        var type = config.type || Event.ALL_EVENTS;
        var date = config.date || null;
        var keyword = config.keyword || null;
        var page = config.page || 1;
        var size = config.pageSize || 10;
        //   var acceptOnly = config.acceptOnly || false;
        var tmpParts = Event.getPartByType(type, userId, config.acceptOnly);
        var params = tmpParts.params.slice();
        var countParams = tmpParts.params.slice();

        var query = "SELECT e.longitude, e.latitude, e.googlePlaceId, e.fullAddress, e.id, e.title, e.sphere, e.repeat_type, e.repeat_option, e.end_repeat, " +
            "e.description, e.reminds, e.active, e.founder, e.createdAt, e.updatedAt, " +
            "DATE_ADD(e.date_start, INTERVAL " + Event.tzOffset + " MINUTE) AS date_start_r," +
            "DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE) AS date_end_r," +
            "DATEDIFF(DATE_ADD(e.date_end, INTERVAL " + Event.tzOffset + " MINUTE), DATE_ADD(e.date_start, INTERVAL " + Event.tzOffset + " MINUTE) ) as duration, (SELECT COUNT(1)+1 FROM event_invites where event_id = e.id) AS count_members FROM event as e " + tmpParts.query; //LEFT JOIN event_invites as ei ON e.id = ei.event_id WHERE e.active = 1 AND (ei.user_id = ? or e.founder = ?)
        var queryCount = "SELECT count(1) AS cnt FROM event as e " + tmpParts.query; //  LEFT JOIN event_invites as ei ON e.id = ei.event_id WHERE e.active = 1 AND (ei.user_id = ? or e.founder = ?)

        if (keyword) {
            //add all parameters for keyword-mode
            keyword = "%" + keyword + "%";
            query += " AND (e.title LIKE ? OR e.description LIKE ?) ";
            queryCount += " AND (e.title LIKE ? OR e.description LIKE ?) ";
            params.push(keyword);
            params.push(keyword);
            countParams.push(keyword);
            countParams.push(keyword);
        }
        if(date) {
            var tmp = eventsWithRepeat(date.split("T")[0] + " 23:59:59", date.split("T")[0]  + " 00:00:00");
            query += " AND " + tmp.query;
            queryCount += " AND " + tmp.query;
            params = params.concat(tmp.params);
            countParams = countParams.concat(tmp.params);
        }

        query += " ORDER BY e.date_start DESC LIMIT ? OFFSET ?";

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
                var totalCount = count[0].cnt || 0;
                Event.query( queryCount + " AND e.sphere = 1", countParams, function(err, count){
                    if(err) {
                        return cb(err);
                    }
                    result = result || [];
                    var countWork = count[0].cnt || 0;
                    return cb(err, result, totalCount, (totalCount - countWork), countWork);
                });
            });
        });
    }
};