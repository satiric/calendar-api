/**
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

            sails.log(phonesSubscribe);

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
    create: function(userId, contacts, cb) {
        var emails = []; //for search, just list of emails
        var emailSubscribe = [];
        var phones = [];
        var phoneSubscribe = [];
        var phonesRecords = [];
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
    }
};