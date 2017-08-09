/**
 * Created by decadal on 27.06.17.
 */

var ValidationE = require('../exceptions/Validation');
var PermissionE = require('../exceptions/Permission');
var LogicE = require('../exceptions/Logic');

function getEventByDate(date, page, size, cb) {
    Event.getEventsByDate(date, page, size, cb);
}



function mapUser(list, key) {
    key = key || 'user_id';
    return list.map(function(value) {
        return value[key];
    });
}

function filterPhones(invitedPhoneRecords, phones) {
    var phoneList = invitedPhoneRecords.map(function(value){
        return value.id;
    });
    return phones.filter(function(value){
        return phoneList.indexOf(PhoneIdentifier.extract(value)) === -1;
    });
}
function filterEmails(invitedEmailRecords, emails) {
    var emailList = invitedEmailRecords.map(function(value){
        return value.email;
    });
    if(!emails || !emails.length) {
        return [];
    }
    return emails.filter(function(value){
        return emailList.indexOf(value) === -1;
    });
}

function findUserPhone(phones, cb) {

    if(!Array.isArray(phones)) {
        return cb(null, phones, []);
    }
    phones = phones.filter(function(phone) {
        return PhoneIdentifier.extract(phone);
    });
    //1. get phones for search in Phones
    phonesIds = phones.map(function(value) {
        return PhoneIdentifier.extract(value);
    });
    //2. search all users with phones
    Phone.find({ user_id: {'!': null}, id: phonesIds}).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        //3. filter founded phones
        return cb(null, filterPhones(results, phones), mapUser(results));
    });
}



function findUserEmail(emails, cb) {

    if(!Array.isArray(emails)) {
        return cb(null, emails, []);
    }
    //1. search emails
    User.find({email: emails}).exec(function (err, results) {
        if(err) {
            return cb(err);
        }
        //2. filter invited emails
        return cb(null, filterEmails(results, emails), mapUser(results, 'id'));
    });
}

/**
 *
 * @param event
 * @param invites
 * @param cb
 * @returns {*}
 */
function inviteUsers(event, invites, cb) {

    var collectedUsers = invites.users || [];

    if(!invites) {
        return cb(null, [], []);
    }
    // firstly find all users what can related with this phones
    findUserPhone((invites.phones || []), function(err, phones, users) {
        if(err) {
            return cb(err);
        }
        //filtred phones without each one which related to users
        invites.phones = phones;
        collectedUsers = collectedUsers.concat(users);
        // same for emails
        findUserEmail((invites.emails || []), function(err, emails, users){
            if(err) {
                return cb(err);
            }
            collectedUsers = collectedUsers.concat(users);
            invites.emails = emails;
            collectedUsers = collectedUsers.map(function(userId) {
                return {
                    'user_id': userId,
                    'event_id': event.id
                };
            });
            // get all already has invites
            EventInvite.find({or:collectedUsers}).exec(function(err, result){
                //todo make a send notification
                if(err) {
                    return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
                }
                var founded = [];
                if(result) {
                    founded = result.map(function(value){
                        return value.user_id;
                    });
                }

                collectedUsers = collectedUsers.filter(function(value) {
                    return (founded.indexOf(value.user_id) === -1) && value.user_id !== event.founder;
                });
                if(!collectedUsers.length) {
                    return cb(null, invites, []);
                }
                EventInvite.create(collectedUsers).exec(function(err, result){
                    if(err) {
                        return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
                    }
                    //array with id, status and value for user
                    var invitedIds = mapUser(collectedUsers);
                    User.find({'id': invitedIds}).exec(function(err, result){
                        if(err) {
                            return cb(err);
                        }
                        var invitedExtract = result.map(function(value){
                            return {
                                'id': value.id,
                                'status': 0,
                                'value': value.name + " " + value.second_name,
                                'type': 1
                            };
                        });
                        return cb(null, invites, invitedExtract);
                    });
                });
            });
        });
    });
}

function sendSms(phones, cb){
    if(phones.length) {
        return Twilio.sendMultiMessage("Hi!", phones, function(){
            return cb();
        });
    }
    return cb();
}

function sendEmail(user, event, emails, cb) {
    if(emails.length) {
        emails.forEach(function(element){
            Mailer.sendInviteToEventMessage(user, event, element, function(){});
        });
    }
    return cb();
}


/**
 *
 * @param user
 * @param event
 * @param invites
 * @param cb
 */
function inviteGuests(user, event, invites, cb) {
    var emails = invites.emails || [];
    var phones = invites.phones || [];

    require('./Contacts').registerPhones(phones.map(function(value){
        return {'id':PhoneIdentifier.extract(value), 'phone': value};
    }), function(err){
        if(err) {
            return cb(err);
        }

        require('./Contacts').registerEmails(emails, function(err) {
            if (err) {
                return cb(err);
            }
            sails.log(phones);
            sendSms(phones, function(){
                sendEmail(user, event, emails, function(){
                    var eventInviteGuest = phones.map(function(value) {
                        return {"phone_id": PhoneIdentifier.extract(value), "event_id": event.id };
                    });

                    eventInviteGuest = eventInviteGuest.concat(
                        emails.map(function(value) {
                            return {"email": value, "event_id": event.id };
                        })
                    );

                    EventInvite.create(eventInviteGuest).exec(function(err, result){
                        if(err) {
                            return cb(err);
                        }
                        return cb(null, result);
                    });
                });
            });
        });
    });
}

function generalDropInvite(criteria, cb) {
    EventInvite.destroy({or:criteria}).exec(function(err) {
        if (err) {
            return cb(err);
        }
        return cb();
    });
}


function dropUser(users, event, cb) {
    if(users && users.length) {
        var dropUInvite = users.map(function(v) {
            return {'user_id': v, 'event_id':event.id};
        });
        return generalDropInvite(dropUInvite, cb);
    }
    else {
        return cb();
    }
}

function dropEmail(emails, event, cb) {
    if(emails && emails.length) {
        var dropEInvite = emails.map(function(v) {
            return {'email': v, 'event_id':event.id};
        });
        return generalDropInvite(dropEInvite, cb);
    }
    else {
        return cb();
    }
}

function dropPhone(phones, event, cb) {
    if(phones && phones.length) {
        var dropPInvite = phones.map(function(v) {
            return {'phone_id': PhoneIdentifier.extract(v), 'event_id':event.id};
        });
        return generalDropInvite(dropPInvite, cb);
    }
    else {
        return cb();
    }
}

function dropInvites(invites, event, cb) {
    dropUser(invites.users, event, function(){
        dropEmail(invites.emails, event, function(){
            dropPhone(invites.phones, event, function(){
                return cb();
            });
        });
    });
}

/**
 *
 * @param user
 * @param event
 * @param invites
 * @param cb
 * @returns {*}
 */
function makeInvite(user, event, invites, cb) {
    // 1. inviteUsers
    if(!invites) {
        return cb();
    }
    inviteUsers(event, invites, function(err, notInvited, invitedUsers){
        if(err) {
            return cb(err);
        }
        // 2. invite not invited person by phone or email
        inviteGuests(user, event, notInvited, function(err) {
            if(err) {
                return cb(err);
            }
            event.invited = invitedUsers;
            if(invites && invites.phones &&  invites.phones.length) {
                event.invited = event.invited.concat(invites.phones.map(function(value){
                    return {id:null, value: value, status: 0, type: 2};
                }));
            }
            if(invites && invites.emails &&  invites.emails.length) {
                event.invited = event.invited.concat(invites.emails.map(function(value){
                    return {id:null, value: value, status: 0, type: 3};
                }));
            }
            return cb(null, event);
        });
    });
}


function fillInvitedContainer(value, status, type, id ) {
    id = id || null;
    return {
        id: id,
        status: status,
        value: value,
        type: type
    };
}

/**
 * 
 * @type {{create: module.exports.create, update: module.exports.update, detailed: module.exports.detailed}}
 */
module.exports = {

    /**
     * 
     * @param user
     * @param page
     * @param pageSize
     * @param keyword
     * @param date
     * @param cb
     * @returns {*}
     */
    find: function(user, page, pageSize, keyword, date, cb) {
        return Event.getEventsWithDate(user.id, date, keyword, page, pageSize, function(err, events, count){

            var ev = (Array.isArray(events)) ? events.map(function(val){
                return val.id;
            }) : [];
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
    },
    /**
     *
     * @param event
     * @param userId
     * @param cb
     */
    create: function(event, userId, cb) {
        User.findOne(userId).exec(function(err, user){
            if(err) {
                return cb(err);
            }
            if(!user) {
                return cb(new LogicE("Founder for event isn't found"));
            }
            event.founder = userId;
            // 1. create event
            Event.create(event).exec(function (err, result) {
                if(err) {
                    return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
                }
                if(!event.invites) {
                    return cb(null, result);
                }
                if(!result) {
                    return cb(new LogicE("error wasn't created"));
                }
                makeInvite(user, result, event.invites, cb);
            });
        });
    },
    /**
     * 
     * @param eventId
     * @param user
     * @param event
     * @param cb
     */
    update: function(eventId, user, event, cb) {
        Event.update({id: eventId, "founder": user.id}, event).exec(function (err, result) {
            if(err) {
                return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
            }
            if( !result || !result.length) {
                return cb(new PermissionE("Permission denied"));
            }

            if(!event.invites && !event.dropped_invites) {
                return cb(null, result);
            }
            makeInvite(user, result[0], event.invites, function(err){
                if(err) {
                    return cb(err);
                }
                var droppedInvites = event.dropped_invites;
                sails.log(droppedInvites);
                if(droppedInvites) {
                    return dropInvites(droppedInvites, result[0], function(err){
                        if(err) {
                            return cb(err);
                        }
                        return cb(null, result[0]);
                    });
                }
                else {
                    return cb(null, event);
                }
            });
        });
    },

    /**
     *
     * @param eventId
     * @param user
     * @param cb
     */
    detailed: function(eventId, user, cb) {
        Event.findOne(eventId).exec(function (err, event) {
            if(err) {
                return cb(err);
            }
            if(!event) {
                return cb( new LogicE("Event not exist") );
            }
            EventInvite.find({'event_id': eventId }).populate('user_id').populate('phone_id').exec(function(err, invited){
                if(err) {
                    return cb(err);
                }
                sails.log(invited);
                var inv = invited.map(function(value){
                    if(value.phone_id) {
                        return fillInvitedContainer(value.phone_id.id, 0, 2);
                    }
                    if(value.email) {
                        return fillInvitedContainer(value.email, 0, 3);
                    }
                    //todo check it
                    return fillInvitedContainer(
                        value.user_id.name + " " + value.user_id.second_name, //value
                        value.status, 1, value.user_id.id);
                });
                Event.extendEvent([event], function(err, event){
                    if(err) {
                        return cb(err);
                    }
                    if(!event || !event[0]) {
                        return cb( new LogicE("Event not exist while extending") );
                    }
                    var response = event[0];
                    response.invited = inv;
                    return cb(null, response);
                });
            });
        });
    }
};