/** todo refactor it
 * Created by decadal on 01.07.17.
 */
var LogicE = require('../exceptions/Logic');

function registEmails(emails, emailSubscribe, cb) {
    //1. find emails from contact in dictionary
    if(!emails.length) {
        return cb();
    }
    Email.find(emails).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        // sails.log(emails);
//if founded - we must check exists records
        var founded = results;
        var notFouneded = emails.filter(function(val) {
            return !(_.find(results, { 'email':val.email }));
        });
        //at first - create emails that not founded
        Email.create(notFouneded).exec(function(err, result) {
            if(err) {
                return cb(err);
            }
            //at second - subcribe to all
            EmailContacts.batchInsert(emailSubscribe, function(err, result){
                if(err) {
                    return cb(err);
                }
                return cb(null,founded);
            });
        });
    });
}

function registPhones(phones, phonesRecords, phonesSubscribe, cb) {
    //1. find phones from contact in dictionary
    if(!phones.length) {
        return cb();
    }
    Phone.find(phones).exec(function(err, results){
        if(err) {
            return cb(err);
        }
//if founded - we must check exists records
        var founded = results;
        var notFouneded = phonesRecords.filter(function(val) {
            return !(_.find(results, { 'id':val.id }));
        });
        //at first - create phones that not founded
        Phone.create(notFouneded).exec(function(err, result) {
            if(err) {
                return cb(err);
            }
            //at second - subcribe to all
            PhoneContacts.batchInsert(phonesSubscribe, function(err, result){
                if(err) {
                    return cb(err);
                }
                return cb(null,founded);
            });
        });
    });
}

function destroyEmails(emails, cb) {
    if(!emails.length) {
        return cb();
    }
    EmailContacts.destroy({ 'or' : emails } ).exec(cb);
}

function destroyPhones(phones, cb) {
    if(!phones.length) {
        return cb();
    }
    PhoneContacts.destroy({ 'or' : phones }).exec(cb);
}


function blockEmails(emails, cb) {
    if(!emails.length) {
        return cb();
    }
    EmailContacts.update({ 'or' : emails } , {"blocked":1}).exec(cb);
}

function blockPhones(phones, cb) {
    if(!phones.length) {
        return cb();
    }
    PhoneContacts.update({ 'or' : phones } , {"blocked":1}).exec(cb);
}


function unblockEmails(emails, cb) {
    if(!emails.length) {
        return cb();
    }
    EmailContacts.update({ 'or' : emails } , {"blocked":null}).exec(cb);
}

function unblockPhones(phones, cb) {
    if(!phones.length) {
        return cb();
    }
    PhoneContacts.update({ 'or' : phones } , {"blocked":null}).exec(cb);
}


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
    create: function(userId, contacts, cb) {
        var emails = []; //for search, just list of emails
        var emailSubscribe = [];
        var phones = [];
        var phoneSubscribe = [];
        var phonesRecords = [];
        var j, size;
        for(var i = 0, sizeContacts = contacts.length; i < sizeContacts; i++) {
            contacts[i].emails = contacts[i].emails || [];
            contacts[i].phones = contacts[i].phones || [];
            if(! Array.isArray(contacts[i].phones) || ! Array.isArray(contacts[i].emails)) {
                return cb(new LogicE("Phones and emails in contacts array must be an array."));
            }
            for (j = 0, size =  contacts[i].emails.length; j < size; j++) {
                if(!contacts[i].emails[j]) {
                    continue;
                }
                emails.push({"email":contacts[i].emails[j]});
                emailSubscribe.push({"email": contacts[i].emails[j], "user_id": parseInt(userId)});
            }
            for (j = 0, size =  contacts[i].phones.length; j < size; j++) {
                if(!contacts[i].phones[j] || ! PhoneIdentifier.extract(contacts[i].phones[j])) {
                    continue;
                }
                phones.push({"id": PhoneIdentifier.extract(contacts[i].phones[j])});
                phonesRecords.push({"id": PhoneIdentifier.extract(contacts[i].phones[j]), "phone": contacts[i].phones[j]});
                phoneSubscribe.push({"id": PhoneIdentifier.extract(contacts[i].phones[j]), "phone": contacts[i].phones[j], "user_id":userId});
            }
        }

        registEmails(emails, emailSubscribe, function(err, founded) {
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
            registPhones(phones, phonesRecords, phoneSubscribe, function(err, founded) {
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
                User.find({"id": contacts}).populate('avatar').exec(cb);
            });
        });

    },
    find: function(userId, cb) {
        EmailContacts.find({ select: ['email'], user_id: userId }).exec(function(err, emails) {
            if(err) {
                return cb(err);
            }
            var emailsList = [];
            for (var i = 0, size = emails.length; i < size; i++)  {
                emailsList.push(emails[i].email);
            }
            Email.find({select: ['user_id'], "email": emailsList, user_id: {'!': null} }).populate("user_id").exec(function(err, users) {
               if(!users.length) {
                   return cb(err, []);
               }
                users = users.map(function(value) {
                    return value.user_id.id;
                });
                users = users.filter(function(value){
                    return (value);
                });
                User.find({id: users}).populate('avatar').exec(function(err, users){
                    return cb(err, users);
                });
            });
        });
    },

    block: function (user,emails,phones,cb) {
        if(emails.length) {
            emails = emails.map(function(value) {
                return {
                    'email': value,
                    'user_id': user.id
                };
            });
        }
        if(phones.length) {
            phones = phones.map(function(value) {
                return {
                    'phone_id': PhoneIdentifier.extract(value),
                    'user_id': user.id
                };
            });
        }
        blockEmails(emails, function(err, result) {
            if(err) {
                return cb(err);
            }
            blockPhones(phones, function(err, result){
                if(err) {
                    return cb(err);
                }

                return cb(null, result);
            });
        });
    },
    unblock: function (user,emails,phones,cb) {
        if(emails.length) {
            emails = emails.map(function(value) {
                return {
                    'email': value,
                    'user_id': user.id
                };
            });
        }
        if(phones.length) {
            phones = phones.map(function(value) {
                return {
                    'phone_id': PhoneIdentifier.extract(value),
                    'user_id': user.id
                };
            });
        }
        unblockEmails(emails, function(err, result) {
            if(err) {
                return cb(err);
            }
            unblockPhones(phones, function(err, result){
                if(err) {
                    return cb(err);
                }
                return cb(null, result);
            });
        });
    },

    destroy: function(user, emails, phones, cb) {
        if(emails.length) {
            emails = emails.map(function(value) {
                return {
                    'email': value,
                    'user_id': user.id
                };
            });
        }
        if(phones.length) {
            phones = phones.map(function(value) {
                return {
                    'phone_id': PhoneIdentifier.extract(value),
                    'user_id': user.id
                };
            });
        }
        destroyEmails(emails, function(err, result) {
            if(err) {
                return cb(err);
            }

            destroyPhones(phones, function(err, result){
                if(err) {
                    return cb(err);
                }

                return cb(null, result);
            });
        });
    },
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