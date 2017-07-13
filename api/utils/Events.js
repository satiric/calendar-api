/**
 * Created by decadal on 27.06.17.
 */

var ValidationE = require('../exceptions/Validation');


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
            sails.log('---');
            sails.log(results);
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
            cb(err);
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
                sails.log( eventInviteGuest);
                EventInviteGuest.create(eventInviteGuest).exec(function(err, result){
                    if(err) {
                        return cb(err);
                    }
                    return cb(null, result);
                });
            });
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
            // 2. inviteUsers
            inviteUsers(result, event.invites, function(err, notInvited, extract){
                if(err) {
                    return cb(err);
                }
                // 3. invite not invited person by phone or email
                inviteGuests(result, notInvited, function(err) {
                    if(err) {
                        return cb(err);
                    }
                    result.invited = extract;

                    return cb(null, result);
                });
            });
        });
    },
    update: function(eventId, eventInfo, cb) {
        Event.update({"id": eventId}, eventInfo).exec(function (err, result) {
            if(err) {
                return cb(err);
            }
            // 2. inviteUsers
            inviteUsers(result, event.invites, function(err, notInvited){
                if(err) {
                    return cb(err);
                }
                // 3. invite not invited person by phone or email
                inviteGuests(result, notInvited, function(err) {
                    if(err) {
                        return cb(err, result);
                    }
                });
            });
        });
    }
};

