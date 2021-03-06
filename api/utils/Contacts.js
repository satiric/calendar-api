/** todo refactor it
 * Created by decadal on 01.07.17.
 */
var LogicE = require('../exceptions/Logic');

/**
 *
 * @param invites
 * @param results
 * @param inviter
 * @param mcc
 * @param cb
 */
function sendInvites(invites, results, inviter, mcc, cb) {
    sails.log('----1');
    var checkedEmails = results.emails;
    var checkedPhones = results.phones;

    invites = invites.filter(function(inv) {
        var emails = inv.emails;
        var phones = inv.phones;
        var stop = 0;
        if(emails && Array.isArray(emails)) {
           emails.forEach(function(email) {
               if( checkedEmails.indexOf(email.toLowerCase()) === -1 ) {
                   stop = 1;
               }
           });
        }

        if(phones && Array.isArray(phones)) {
           phones.forEach(function(phone) {
               if( checkedPhones.indexOf(phone) === -1 ) {
                   stop = 1;
               }
           });
        }
        return (!stop);
   });
    sails.log('----2');
    var emails = [];
    var phones = [];
    invites.forEach(function(inv){
        if(inv.emails && inv.emails[0] ) {
            emails.push(inv.emails[0]);
        }
        else {
            if(inv.phones && inv.phones[0]) {
                phones.push(inv.phones[0]);
            }
        }
    });
    sails.log(emails);
    sails.log(phones);
    sails.log('----3');
    results.emails = emails;
    results.phones = phones;
    cascadeSend(emails, inviter, 0, function(err, result) {
        //ignore errors!
        sails.log('----4');
        inviteByPhone(phones, inviter, mcc, function(err, res){
            //ignore errors!
            sails.log('----5');
            return cb(null, results);
        });
    });
}

function registInvited(emailsR, phonesR, cb) {

    registEmails(emailsR, true, function(err, r){
        if(err) {
            return cb(err);
        }
        // 5.1 remember each one phone that's sent invite
        registPhones(phonesR, true, cb);
    });
}

/**
 * map arrays
 * @param invites
 * @returns {{}}
 */
function extractPhonesAndEmails(invites) {
    var result = {};
    var keys = ['phones', 'emails'];
    keys.forEach(function(key){
        result[key] = [];
    });

    invites.forEach(function(inv) {
        function toLower(email) {
            return email.toLowerCase();
        }
        for(let i = 0; i < keys.length; i++) {
           if( inv[ keys[i] ] && Array.isArray( inv[keys[i]] ) ) {
               if( keys[i] === 'emails' ) {
                   inv[ keys[i] ] = inv[ keys[i] ].map(toLower);
               }
               result[ keys[i] ] = result[ keys[i] ].concat( inv[keys[i]] );
           }
        }
    });

    keys.forEach(function(key){
        result[key] = result[key].filter(function(entity) {
            return entity;
        });
    });

    return result;
}

function inviteByPhone(phones, inviter, mcc, cb) {
    
    module.exports.detectPhones(phones, mcc, inviter, function(err, mappedPhones) {
        sails.log('----phones');
        sails.log(mappedPhones);
        cascadeSmsSend(mappedPhones, inviter, 0, cb);
    });
}

/**
 *
 * @param phones
 * @param userId
 * @returns {Array}
 */
function preparePhoneSubscribers(phones, userId) {
    if(!phones) {
        return [];
    }
    var phoneRecords = [];
    phones.forEach(function(phone) {
        var phoneId = PhoneIdentifier.extract(phone);
        if( ! phoneId ) {
            return;
        }
        phoneRecords.push({"id": phoneId, "phone": phone, "user_id": userId});
    });
    return phoneRecords;
}

/**
 *
 * @param emails
 * @param userId
 * @returns {Array}
 */
function prepareEmailSubscribers(emails, userId) {
    if(!emails) {
        return [];
    }
    var emailRecords = [];
    emails.forEach(function(email){
        if(!email || !validateEmail(email)) {
            return;
        }
        emailRecords.push({"email": email, "user_id": userId});
    });
    return emailRecords;
}

/**
 * 
 * @param emails
 * @param asFriend
 * @param cb
 * @returns {*}
 */
function registEmails(emails, asFriend, cb) {
    if(!emails.length) {
        return cb();
    }
   // asFriend = asFriend || false;
    
    var emailsList = emails.map(function(value){
        return {email: value.email};
    });
    //1. find emails from contact in dictionary
    Email.find(emailsList).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        sails.log(results);
        results = results.map(function(obj){
            obj.email = obj.email.toLowerCase();
            return obj;
        });
        //if founded - we must check exists records
        var founded = results;
        var notFouneded = emailsList.filter(function(val) {
            return !(_.find(results, { 'email':val.email.toLowerCase() }));
        });
        //at first - create emails that not founded
        Email.create(notFouneded).exec(function(err, result) {
            if(err) {
                return cb(err);
            }
            //at second - subcribe to all
            EmailContacts.batchInsert(emails, function(err, result){
                if(err) {
                    return cb(err);
                }
                return cb(null,founded);
            });
        });
    });
}

/**
 *
 * @param phones
 * @param cb
 * @returns {*}
 */
function registPhones(phones, asFriend, cb) {
    if(!phones.length) {
        return cb();
    }
    asFriend = asFriend || false;
    var phoneList = phones.map(function(value) {
        return {"id" : value.id};
    });
    sails.log(phoneList);
    //1. find phones from contact in dictionary
    Phone.find(phoneList).exec(function(err, results){
        if(err) {
            return cb(err);
        }
    //if founded - we must check exists records
        var founded = results;
        var notFouneded = phones.filter(function(val) {
            return !(_.find(results, { 'id':val.id }));
        });

        notFouneded = notFouneded.map(function(val) {
            return {
                'id': val.id,
                'phone': val.phone
            };
        });
        sails.log(notFouneded);
        //at first - create phones that not founded
        Phone.create(notFouneded).exec(function(err, result) {
            // if(err) {
            //     return cb(err);
            // }

            //at second - subcribe to all
            PhoneContacts.batchInsert(phones, function(err, result){
                // if(err) {
                //     return cb(err);
                // }
                return cb(null,founded);
            });
        });
    });
}

/**
 *
 * @param emailRecords
 * @param phoneRecords
 * @param cb
 */
function registContacts(emailRecords, phoneRecords, cb) {
    registEmails(emailRecords, false, function(err, founded) {
        var contacts = [];
        if(err) {
            return cb(err);
        }
        if(founded) {
            for (var i = 0, size = founded.length; i < size; i++) {
                if (founded[i].user_id && (contacts.indexOf(founded[i].user_id) === -1)) {
                    contacts.push(founded[i].user_id);
                }
            }
        }
        registPhones(phoneRecords, false, function(err, founded) {
            if(err) {
                return cb(err);
            }
            if(founded) {
                for (var i = 0, size = founded.length; i < size; i++) {
                    if (founded[i].user_id && (contacts.indexOf(founded[i].user_id) === -1)) {
                        contacts.push(founded[i].user_id);
                    }
                }
            }
            return cb(null, contacts);
        });
    });
}


// function destroyEmails(emails, cb) {
//     if(!emails.length) {
//         return cb();
//     }
//     EmailContacts.destroy({ 'or' : emails } ).exec(cb);
// }
//
// function destroyPhones(phones, cb) {
//     if(!phones.length) {
//         return cb();
//     }
//     PhoneContacts.destroy({ 'or' : phones }).exec(cb);
// }


// for old logic with contacts
// function blockEmails(emails, cb) {
//     if(!emails.length) {
//         return cb();
//     }
//     EmailContacts.update({ 'or' : emails } , {"blocked":1}).exec(cb);
// }

// function blockPhones(phones, cb) {
//     if(!phones.length) {
//         return cb();
//     }
//     PhoneContacts.update({ 'or' : phones } , {"blocked":1}).exec(cb);
// }
//
//
// function unblockEmails(emails, cb) {
//     if(!emails.length) {
//         return cb();
//     }
//     EmailContacts.update({ 'or' : emails } , {"blocked":null}).exec(cb);
// }
//
// function unblockPhones(phones, cb) {
//     if(!phones.length) {
//         return cb();
//     }
//     PhoneContacts.update({ 'or' : phones } , {"blocked":null}).exec(cb);
// }

/**
 *
 * @param emails
 * @param founded
 * @param user
 * @param current
 * @param cb
 * @param info
 * @returns {*}
 */
function cascadeSend(emails, user, current, cb, info) {
    info = info || [];
    if(current >= emails.length) {
        return cb(null, info);
    }

    Mailer.sendInviteMessage(user, emails[current], function(err, result) {
        if(err) {
            info.push({
                'message': err,
                'email': emails[current]
            });
        }
        return cascadeSend(emails, user, current+1, cb, info);
    });
}


/**
 *  todo make it parallel
 * @param phones
 * @param user
 * @param current
 * @param cb
 * @param info
 * @returns {*}
 */
function cascadeSmsSend(phones,  user, current, cb, info) {
    info = info || [];
    if(current >= phones.length) {
        return cb(null, info);
    }
    if(!phones[current] ) {// || founded.indexOf(PhoneIdentifier.extract(phones[current])) !== -1) {
        info.push({
            'message': "phone is not exists",
            'phone': phones[current]
        });
        return cascadeSmsSend(phones, user, current+1, cb, info);
    }
    var msg = user.name + " " + user.second_name + " invited you to vlife-1st ever Calendar-Chat";
    msg += " app. Connect privately with Work&Social contacts. Click here for more info";

    //todo make as cascade
    Twilio.sendMessage(msg,phones[current], function(err, result) {
        if(err) {
            info.push({
                'message': err,
                'phone': phones[current]
            });
        }
        return cascadeSmsSend(phones, user, current+1, cb, info);
    });
}

/**
 *
 * @param email
 * @returns {boolean}
 */
function validateEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}
/**
 *
 * @param phone
 * @returns {boolean}
 */
function validatePhone(phone) {
    return PhoneIdentifier.extract(phone); ///\+([0-9]){9,13}/.test(phone);
}

/**
 *
 * @param emails
 * @param cb
 * @returns {*}
 */
function findEmailUsers(emails, cb) {
    if(!emails || !emails.length) {
        return cb();
    }
    for (var i = 0, size = emails.length; i < size; i++) {
        if(!validateEmail(emails[i])) {
            return cb(new LogicE("email '" + emails[i] + "' isn't valid" ));
        }
    }
    var prepEmails = emails.map(function(value) {
        return {"email": value.toLowerCase()};
    });
    User.find({or: prepEmails }).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

/**
 *
 * @param phones
 * @param cb
 * @returns {*}
 */
function findPhoneUsers(phones, cb) {
    if(!phones || !phones.length) {
        return cb();
    }
    for (var i = 0, size = phones.length; i < size; i++) {
        if(!validatePhone(phones[i])) {
            return cb(new LogicE("phone '" + phones[i] + "' isn't valid" ));
        }
    }
    var phoneIds = phones.map(function(value){
        return { phone: { 'like': '%' + PhoneIdentifier.extract(value) } };
    });

    User.find({ or: phoneIds }).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

/**
 *
 * @param user
 * @param friends
 * @param block
 * @param cb
 */
function changeBlock(user, friends, block, cb) {

    var friendsUser = friends.map(function(friend) {
        return {
            'user_who_id': user.id,
            'user_whom_id': friend
        };
    });
    sails.log(friendsUser);
    Friend.update({or: friendsUser }, {"blocked": block}).exec(function(err, results) {
        if(err) {
            return cb(err);
        }
        var usersList = results.map(function(friend) {
            return friend.user_whom_id;
        });
        sails.log(usersList);
        User.find(usersList).populate('avatar').exec(function (err, users) {
            if(err) {
                return cb(err);
            }
            return cb(null, users.map(function(user) {
                //because we block this user yet
                user.blocked = block;
                return user;
            }));
        });
    });

}


function forceUpdateFriends(userId, removed, force, cb) {

    if(!force || !removed || !removed.length) {
        return cb();
    }
    var friendsIds =  removed.map(function(friendId){
        return {
            'user_who_id': userId,
            'user_whom_id': friendId
        };
    });

    Friend.update({or: friendsIds}, {"removed": 0}).exec(cb);
}

/**
 *
 * @param userId
 * @param friendIds
 * @param force
 * @param cb
 */
function addFriends(userId, friendIds, force, cb) {
    var friends = friendIds.map(function(friendId){
        return {
            'user_who_id': userId,
            'user_whom_id': friendId
        };
    });
    Friend.find({or: friends}).exec(function(err, result){
        if(err) {
            return cb(err);
        }
        var blocked = [];
        var removed = [];
        result.forEach(function(friend){
            if(friend.blocked) {
                blocked.push(friend.user_whom_id);
            }
            if (friend.removed) {
                removed.push(friend.user_whom_id);
            }
        });
        Friend.insertIgnore(friends, function(err, result) {
            if(err) {
                return cb(err);
            }
            forceUpdateFriends(userId, removed, force, function(err, result) {
                if(err) {
                    return cb(err);
                }
                //userIds is list of id each one we need to add to friends
                if(!force) {
                    friendIds = friendIds.filter(function(id){
                        return removed.indexOf(id) === -1;
                    });
                }
                User.find({"id": friendIds}).populate('avatar').exec(function(err, users) {
                    if(err) {
                        return cb(err);
                    }

                    return cb(null, users.map(function(user) {
                        //because we create pair user-friend just now and didn't block it
                        user.blocked = +(blocked.indexOf(user.id) !== -1);
                        return user;
                    }));
                });
            } );
        });
    });
}
//for old logic with contacts
// function getEmailContacts(userId, cb) {
//     EmailContacts.find({ select: ['email'], user_id: userId }).exec(function(err, emails) {
//         if(err) {
//             return cb(err);
//         }
//         var emailsList = [];
//         for (var i = 0, size = emails.length; i < size; i++)  {
//             emailsList.push({"email":emails[i].email, user_id: {'!': null}});
//         }
//
//         Email.find({or: emailsList}).populate("user_id").exec(function(err, users) {
//             if(err) {
//                 return cb(err);
//             }
//             return cb(null, users);
//         });
//     });
//
// }

// function getPhoneContacts(userId, cb) {
//     PhoneContacts.find({ select: ['phone_id', 'blocked'], user_id: userId }).exec(function(err, phones) {
//         if(err) {
//             return cb(err);
//         }
//         var phoneList = [];
//         var blocked = [];
//         for (var i = 0, size = phones.length; i < size; i++)  {
//             phoneList.push({"id":phones[i].phone_id, user_id: {'!': null}});
//             if(phones[i].blocked) {
//                 blocked.push(phones[i].phone_id);
//             }
//         }
//
//         Phone.find({or: phoneList}).populate("user_id").exec(function(err, userPhones) {
//             if(err) {
//                 return cb(err);
//             }
//             if(!userPhones.length) {
//                 return cb(null, []);
//             }
//             userPhones.map(function(value){
//
//             });
//
//             var users = userPhones.map(function(value) {
//                 return {
//                     'id': value.user_id.id,
//                     'blocked' : + (blocked.indexOf(value.id) !== -1) //to int
//                 };
//             });
//             return cb(null, users);
//         });
//     });
// }
// Phone.find(phones).exec(function(err, results){
//     if(err) {
//         return cb(err);
//     }
//     var notFounded = phonesRecords.filter(function(val) {
//         return !(_.find(results, { 'id':val.id }));
//     });
//     Phone.create(notFounded).exec(function(err, result) {
//         if(err) {
//             return cb(err);
//         }
//         PhoneContacts.batchInsert(phoneSubscribe, function(err, result){
//             if(err) {
//                 return cb(err);
//             }
//             //get all contacts
//             return cb(null, {});
//         });
//     });
// });

module.exports = {
    detectPhones: function(phones, mcc, inviter, cb) {

        var countryCode = '';
        if(mcc) {
            var code = require('mcc-mnc-list').filter({'mcc':mcc});
            sails.log("FILTER MCC LIST: ");
            sails.log(code);
            if(code[0]) {
                countryCode = code[0].countryCode;
            }
        }

        if(!countryCode) {
            sails.log('unable to detect country by mcc. Try to detect country by inviter');
            let detectedInviterPhone = PhoneDictionary(inviter.phone, '');
            sails.log(detectedInviterPhone);
            sails.log(inviter.phone);
            countryCode = detectedInviterPhone[1];
        }

        var PNF = require('google-libphonenumber').PhoneNumberFormat;
        var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
        if (countryCode ) {
            sails.log('country code is defined---: '+countryCode);
            phones = phones.map(function(phone) {
                return (phone.indexOf('+') === -1 ) ? phoneUtil.format(phoneUtil.parse(phone, countryCode), PNF.INTERNATIONAL)
                    : phone;
            });
            sails.log(phones);
        }
        return cb(null, phones);
    },
    
    /**
     *
     * @param phones
     * @param cb
     */
    registerPhones: function(phones, cb) {
        var phoneIds = phones.map(function(value) {
            return value.id;
        });
        Phone.find(phoneIds).exec(function(err, results){
            if(err) {
                return cb(err);
            }

            var notFouneded = phones.filter(function(val) {
                return !(_.find(results, { 'id':val.id }));
            });
            //at first - create phones that not founded
            Phone.create(notFouneded).exec(function(err, result) {
                return cb(err,result);
            });
        });
    },
    /**
     *
     * @param emails
     * @param cb
     */
    registerEmails: function(emails, cb) {
        Email.find(emails).exec(function(err, results){
            if(err) {
                return cb(err);
            }
            var notFouneded = emails.filter(function(val) {
                return !(_.find(results, { 'email':val }));
            });
            notFouneded = notFouneded.map(function(value){
                return {"email": value};
            });
            //at first - create phones that not founded
            Email.create(notFouneded).exec(function(err, result) {
                return cb(err,result);
            });
        });
    },


    /**
     * ---with friends - done and tested.
     * @param userId
     * @param contacts
     * @param cb
     * @returns {*}
     */
    create: function(userId, contacts, cb) {
        var emailRecords = [];
        var phoneRecords = [];
        if(! (userId = parseInt(userId)) ) {
            return cb(new LogicE("userId must be integer."));
        }
        contacts.forEach(function(contact) {
            var emails = contact.emails || [];
            var phones = contact.phones || [];
            if(! Array.isArray(emails) || ! Array.isArray(phones)) {
                return cb(new LogicE("Phones and emails in contacts array must be an array."));
            }
            //make from emails and phones - valid objects for inserting to db
            emailRecords = emailRecords.concat(prepareEmailSubscribers(emails, userId));
            phoneRecords = phoneRecords.concat(preparePhoneSubscribers(phones, userId));
        });

        registContacts(emailRecords, phoneRecords, function(err, friendIds) {
            if(err) {
                return cb(err);
            }
            if(!friendIds || !friendIds.length) {
                return cb(null, []);
            }
            sails.log(friendIds);
            addFriends(userId, friendIds, false, cb);
        });
    },

    /**
     *
     * @param user
     * @param cb
     */
    find: function(user, cb) {

        Friend.find({user_who_id: user.id, removed:  { '!' : '1' } }, function(err, friends) {
            if(err) {
                return cb(err);
            }
            var blocked = [];
            var friendIds = friends.map(function(friend) {
                if(friend.blocked) {
                    blocked.push(friend.user_whom_id);
                }
                return friend.user_whom_id;
            });
            //userIds is list of id each one we need to add to friends
            User.find({"id": friendIds}).populate('avatar').exec(function(err, users) {
                if(err) {
                    return cb(err);
                }
                return cb(null, users.map(function(user) {
                    //because we create pair user-friend just now and didn't block it
                    user.blocked = + ( blocked.indexOf(user.id) !== -1 );
                    return user;
                }));
            });
        });
        // getPhoneContacts(userId, function(err, users) {
        //     if(err) {
        //         return cb(err);
        //     }
        //     var collected = users;
        //     getEmailContacts(userId, function (err, users) {
        //         if(err) {
        //             return cb(err);
        //         }
        //         var cacheUsers = users.map(function(value){
        //             return value.user_id.id;
        //         });
        //
        //         collected = collected.concat(cacheUsers.filter(function(value){
        //             return collected.indexOf(value) === -1;
        //         }));
        //
        //         User.find({id: collected}).populate('avatar').exec(function(err, users){
        //             return cb(err, users);
        //         });
        //     });
        // });
    },

    /**
     *
     * @param user
     * @param friends
     * @param cb
     */
    block: function (user, friends,cb) {
        return changeBlock(user, friends, 1, cb);
        // if(emails.length) {
        //     emails = emails.map(function(value) {
        //         return {
        //             'email': value,
        //             'user_id': user.id
        //         };
        //     });
        // }
        // if(phones.length) {
        //     phones = phones.map(function(value) {
        //         return {
        //             'phone_id': PhoneIdentifier.extract(value),
        //             'user_id': user.id
        //         };
        //     });
        // }
        // blockEmails(emails, function(err, result) {
        //     if(err) {
        //         return cb(err);
        //     }
        //     blockPhones(phones, function(err, result){
        //         if(err) {
        //             return cb(err);
        //         }
        //
        //         return cb(null, result);
        //     });
        // });
    },

    /**
     *
     * @param user
     * @param friends
     * @param cb
     */
    unblock: function (user,friends,cb) {
        return changeBlock(user, friends, 0, cb);


        // if(emails.length) {
        //     emails = emails.map(function(value) {
        //         return {
        //             'email': value,
        //             'user_id': user.id
        //         };
        //     });
        // }
        // if(phones.length) {
        //     phones = phones.map(function(value) {
        //         return {
        //             'phone_id': PhoneIdentifier.extract(value),
        //             'user_id': user.id
        //         };
        //     });
        // }
        // unblockEmails(emails, function(err, result) {
        //     if(err) {
        //         return cb(err);
        //     }
        //     unblockPhones(phones, function(err, result){
        //         if(err) {
        //             return cb(err);
        //         }
        //         return cb(null, result);
        //     });
        // });
    },


    /**
     *
     * @param user
     * @param friends
     * @param cb
     */
    destroy: function(user, friends, cb) {
        var friendsUser = friends.map(function(friend) {
            return {
                'user_who_id': user.id,
                'user_whom_id': friend
            };
        });
        Friend.update({or:friendsUser}, {'removed': 1}).exec(cb);
        // if(emails.length) {
        //     emails = emails.map(function(value) {
        //         return {
        //             'email': value,
        //             'user_id': user.id
        //         };
        //     });
        // }
        // if(phones.length) {
        //     phones = phones.map(function(value) {
        //         return {
        //             'phone_id': PhoneIdentifier.extract(value),
        //             'user_id': user.id
        //         };
        //     });
        // }
        // destroyEmails(emails, function(err, result) {
        //     if(err) {
        //         return cb(err);
        //     }
        //     destroyPhones(phones, function(err, result){
        //         if(err) {
        //             return cb(err);
        //         }
        //         return cb(null, result);
        //     });
        // });
    },

    /**
     *
     * @param invites
     * @param inviter
     * @param mcc
     * @param cb
     * @returns {*}
     */
    invite: function(invites, inviter, mcc, cb) {
        var results = {};
        var tmp = extractPhonesAndEmails(invites);
        var emails = tmp.emails;
        var phones = tmp.phones;
        if( (! phones.length) && (! emails.length)) {
            return cb(new LogicE("Empty emails and phones arrays"));
        }

        var foundedEmails = [], foundedPhones = [], friendIds = [];
        // firstly find all users, registred in vlife yet
        // 1. by email
        findEmailUsers(emails, function(err, result) {
            if(err) {
                return cb(err);
            }
            if( Array.isArray(result) ) {
                //1.1 collect all users with enumerated emails
                result.forEach(function(user){
                    foundedEmails.push(user.email);
                    friendIds.push(user.id);
                });
            }
            // 2. by phone
            findPhoneUsers(phones, function(err, result) {
                if(err) {
                    return cb(err);
                }
                if( Array.isArray(result) ) {
                    result.forEach(function(user){
                        //2.1 collect all users with enumerated phones
                        foundedPhones.push( PhoneIdentifier.extract(user.phone) );
                        if(friendIds.indexOf(user.id) === -1) {
                            friendIds.push(user.id);
                        }
                    });
                }
                // 3. add all users to friends if they exists by enumerated phones and emails
                addFriends(inviter.id, friendIds, true, function(err, friends) {
                    if(err) {
                        return cb(err);
                    }
                    results.users = friends || [];
                    // 4. send invite by email

                    results.emails  = emails.filter(function(value){
                            return (foundedEmails.indexOf(value.toLowerCase()) === -1);
                        }) || [];

                    results.phones = phones.filter(function(value){
                            return (foundedPhones.indexOf(PhoneIdentifier.extract(value)) === -1);
                        }) || [];

                    var emailRecords = prepareEmailSubscribers(results.emails, inviter.id);
                    var phoneRecords = preparePhoneSubscribers(results.phones, inviter.id);

                    registInvited(emailRecords, phoneRecords, function(err) {
                        if(err) {
                            return cb(err);
                        }
                        sendInvites(invites, results, inviter, mcc, function(err, r) {
                            if(err) {
                                return cb(err);
                            }
                            return cb(null, r);
                        });
                    });
                });
            });
        });
    }
};