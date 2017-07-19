/**
 * Created by decadal on 27.06.17.
 */

var ValidationE = require('../exceptions/Validation');
var PermissionE = require('../exceptions/Permission');
var LogicE = require('../exceptions/Logic');
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
/**
 *
 * @param event
 * @param invites
 * @param cb
 * @returns {*}
 */
function inviteUsers(event, invites, cb) {
    //1. get phones for search in Phones
    var phones = invites.phones.map(function(value) {
        return PhoneIdentifier.extract(value);
    });
    var users = invites.users || [];


    //2. search all users with phones
    Phone.find({ user_id: {'!': null}, id: phones}).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        // 2.1 remove invited phones
        invites.phones = filterPhones(results, invites.phones);
        // 3. collect all founded user ids
        users = users.concat(mapUser(results));

        // 4. find all users with emails
        User.find({email: invites.emails}).exec(function (err, results) {
            if(err) {
                return cb(err);
            }
            //4.1 remove invited emails
            invites.emails = filterEmails(results, invites.emails);
            // 5. collect all founded user ids

            users = users.concat(mapUser(results, 'id'));
            if(users.length) {
                users = users.map(function(value) {
                    return {"user_id": value, "event_id": event.id, "status": 0};
                });
            } else {
                users = [];
            }
            // 6. create invite
            EventInvite.create(users).exec(function(err, result){
                //todo make a send notification
                if(err) {
                    return cb(err);
                }

                //array with id, status and value for user
                var invitedIds = mapUser(users);
                User.find({'id': invitedIds}).exec(function(err, result){
                    if(err) {
                        return cb(err);
                    }
                    var invitedExtract = result.map(function(value){
                        return {
                            'id': value.id,
                            'status': null,
                            'value': value.name + " " + value.second_name
                        };
                    });
                    return cb(null, invites, invitedExtract);
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

function sendEmail(emails, cb) {
    if(emails.length) {
        return Mailer.sendMultiMessage("Hi!", "Hi", emails, function(){
            return cb();
        });
    }
    return cb();
}

/**
 *
 * @param event
 * @param invites
 * @param cb
 */
function inviteGuests(event, invites, cb) {
    var emails = invites.emails;
    var phones = invites.phones;
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
            sendSms(phones, function(){
                sendEmail(emails, function(){
                    var eventInviteGuest = phones.map(function(value) {
                        return {"phone_id": PhoneIdentifier.extract(value), "event_id": event.id };
                    });

                    eventInviteGuest = eventInviteGuest.concat(
                        emails.map(function(value) {
                            return {"email": value, "event_id": event.id };
                        })
                    );

                    EventInviteGuest.create(eventInviteGuest).exec(function(err, result){
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


function dropUser(users, event, cb) {
    if(users && users.length) {
        var dropUInvite = users.map(function(v) {
            return {'user_id': v, 'event_id':event.id};
        });
        EventInvite.destroy({or:dropUInvite}).exec(function(err){
            if(err) {
                return cb(err);
            }
            return cb();
        });
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

        EventInviteGuest.destroy({or:dropEInvite}).exec(function(err) {
            if (err) {
                return cb(err);
            }
            return cb();
        });
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
        EventInviteGuest.destroy({or:dropPInvite}).exec(function(err){
            if(err) {
                return cb(err);
            }
            return cb();
        });
    }
    else {
        return cb();
    }
}

function dropInvites(invites, event, cb) {
    sails.log(event);
    dropUser(invites.users, event, function(){
        dropEmail(invites.emails, event, function(){
            dropPhone(invites.phones, event, function(){
                return cb();
            });
        });
    });
}


function makeInvite(event, invites, cb) {
    // 2. inviteUsers
    if(!invites) {
        return cb();
    }
    inviteUsers(event, invites, function(err, notInvited, extract){
        if(err) {
            return cb(err);
        }
        // 3. invite not invited person by phone or email
        inviteGuests(event, notInvited, function(err) {
            if(err) {
                return cb(err);
            }
            event.invited = extract;
            if(invites && invites.phones &&  invites.phones.length) {
                event.invited = event.invited.concat(invites.phones.map(function(value){
                    return {id:null, value: value, status: null};
                }));
            }
            if(invites && invites.emails &&  invites.emails.length) {
                event.invited = event.invited.concat(invites.emails.map(function(value){
                    return {id:null, value: value, status: null};
                }));
            }
            return cb(null, event);
        });
    });
}
/**
 * contain all business logic for user authorization
 * @type {{login: module.exports.login, refreshToken: module.exports.refreshToken, getByPasswordResetToken: module.exports.getByPasswordResetToken, changePassByToken: module.exports.changePassByToken, changePassByAuthKey: module.exports.changePassByAuthKey, getUserByAuthToken: module.exports.getUserByAuthToken}}
 */
module.exports = {
    create: function(event, userId, cb) {
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
            makeInvite(result, event.invites, cb);
        });
    },
    update: function(eventId, user, event, cb) {


        Event.update({id: eventId, "founder": user.id}, event).exec(function (err, result) {
            if(err) {
                return (err.Errors) ? cb(new ValidationE(err)) : cb(err);
            }
            if(!event.invites && !event.dropped_invites) {
                return cb(null, result);
            }
            if( !result || !result.length) {
                return cb(new PermissionE("Permission denied"));
            }
            makeInvite(result[0], event.invites, function(err){
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
    }
};

