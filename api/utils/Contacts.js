/** todo refactor it
 * Created by decadal on 01.07.17.
 */
var LogicE = require('../exceptions/Logic');

function registEmails(emails, cb) {
    if(!emails.length) {
        return cb();
    }
    var emailsList = emails.map(function(value){
        return {email: value.email};
    });
    //1. find emails from contact in dictionary

    Email.find(emailsList).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        // sails.log(emails);
//if founded - we must check exists records
        var founded = results;
        var notFouneded = emailsList.filter(function(val) {
            return !(_.find(results, { 'email':val.email }));
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

function registPhones(phones, cb) {

    if(!phones.length) {
        return cb();
    }

    var phoneList = phones.map(function(value) {
        return {"id" : value.id};
    });
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
        //at first - create phones that not founded
        Phone.create(notFouneded).exec(function(err, result) {
            if(err) {
                return cb(err);
            }
            //at second - subcribe to all
            PhoneContacts.batchInsert(phones, function(err, result){
                if(err) {
                    return cb(err);
                }
                return cb(null,founded);
            });
        });
    });
}

function registContacts(emailRecords, phoneRecords, cb) {

    registEmails(emailRecords, function(err, founded) {
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
        registPhones(phoneRecords, function(err, founded) {
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


function cascadeSend(emails, founded, user, current, cb, info) {
    info = info || [];
    if(current >= emails.length) {
        return cb(null, info);
    }
    if(!emails[current] || founded.indexOf(emails[current]) !== -1) {
        return cascadeSend(emails, founded, user, current+1, cb, info);
    }
    //todo make as cascade
    Mailer.sendInviteMessage(user, emails[current], function(err, result) {
        if(err) {
            info.push({
                'message': err,
                'email': emails[current]
            });
        }
        return cascadeSend(emails, founded, user, current+1, cb, info);
    });
}


/**
 *  todo make it parallel
 * @param phones
 * @param founded
 * @param user
 * @param current
 * @param cb
 * @param info
 * @returns {*}
 */
function cascadeSmsSend(phones, founded, user, current, cb, info) {
    info = info || [];
    if(current >= phones.length) {
        return cb(null, info);
    }
    if(!phones[current] || founded.indexOf(PhoneIdentifier.extract(phones[current])) !== -1) {
        info.push({
            'message': "phone is alredy in vlife or not exists",
            'phone': phones[current]
        });
        return cascadeSmsSend(phones, founded, user, current+1, cb, info);
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
        return cascadeSmsSend(phones, founded, user, current+1, cb, info);
    });
}


function validateEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}
function validatePhone(phone) {
    return true; //  /\+([0-9]){9,13}/  - dont use
}

function sendEmails(emails, user, cb) {
    if(!emails || !emails.length) {
        return cb();
    }
    for (var i = 0, size = emails.length; i < size; i++) {
        if(!validateEmail(emails[i])) {
            return cb(new LogicE("email '" + emails[i] + "' isn't valid" ));
        }
    }

    var prepEmails = emails.map(function(value) {
        return {"email": value};
    });
    User.find({or: prepEmails }).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        var founded = (Array.isArray(result))
            ? result.map(function(value){
                return value.email;
            })
            : [];

        cascadeSend(emails, founded, user, 0, function(result) {
            return cb(null, emails.filter(function(value){
                return (founded.indexOf(value) === -1);
            }));
        });
    });
}

//todo make cascade
function sendPhones(phones, user, cb) {
    if(!phones || !phones.length) {
        return cb();
    }
    for (var i = 0, size = phones.length; i < size; i++) {
        if(!validatePhone(phones[i])) {
            return cb(new LogicE("phone '" + phones[i] + "' isn't valid" ));
        }
    }

    var notice = [];
    var phoneIds = phones.map(function(value){
        return { phone: { 'like': '%' + PhoneIdentifier.extract(value) } };
    });
    User.find({ or: phoneIds }).exec(function(err, result) {
        if(err) {
            return cb(err);
        }
        var founeded = (Array.isArray(result)) ?
            result.map(function(value){
                return PhoneIdentifier.extract(value.phone);
            })
            : [];
        cascadeSmsSend(phones, founeded, user, 0, cb);
    });

}

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
        sails.log('-------');
        var usersList = results.map(function(friend) {
            return friend.user_whom_id;
        });
        sails.log(usersList);
        User.find(usersList).exec(function (err, users) {
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
        //todo can split it

        contacts.forEach(function(contact) {
            var emails = contact.emails || [];
            var phones = contact.phones || [];
            if(! Array.isArray(emails) || ! Array.isArray(phones)) {
                return cb(new LogicE("Phones and emails in contacts array must be an array."));
            }
            //make from emails and phones - valid objects for inserting to db
            emails.forEach(function(email) {
                if(!email) {
                    return;
                }
                emailRecords.push({"email": email, "user_id": userId});
            });
            phones.forEach(function(phone) {
                var phoneId = PhoneIdentifier.extract(phone);
                if( ! phoneId ) {
                    return;
                }
                phoneRecords.push({"id": phoneId, "phone": phone, "user_id": userId});

            });
        });
        registContacts(emailRecords, phoneRecords, function(err, friendIds) {
            if(err) {
                return cb(err);
            }
            if(!friendIds || !friendIds.length) {
                return cb(null, []);
            }
            var friends = friendIds.map(function(friendId){
                return {
                    'user_who_id': userId,
                    'user_whom_id': friendId
                };
            });
            Friend.insertIgnore(friends, function(err, result) {
                if(err) {
                    return cb(err);
                }
                //userIds is list of id each one we need to add to friends
                User.find({"id": friendIds}).populate('avatar').exec(function(err, users) {
                    if(err) {
                        return cb(err);
                    }
                    return cb(null, users.map(function(user) {
                        //because we create pair user-friend just now and didn't block it
                        user.blocked = 0;
                        return user;
                    }));
                });
            });
        });
    },

    /**
     *
     * @param user
     * @param cb
     */
    find: function(user, cb) {

        Friend.find({user_who_id: user.id}, function(err, friends) {
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
        sails.log(friendsUser);
        Friend.destroy({or:friendsUser}).exec(cb);
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
     * @param emails
     * @param phones
     * @param inviter
     * @param cb
     */
    invite: function(emails, phones, inviter, cb) {
        var results = {};
        sendEmails(emails, inviter, function(err, result) {
            if(err) {
                return cb(err);
            }
            results.emails = result || [];
            sendPhones(phones, inviter, function(err, result) {
                if(err) {
                    return cb(err);
                }
                results.phones = result || [];
                return cb(null, results);
            });
        });
    }
};