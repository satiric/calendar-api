/**
 * Created by decadal on 01.07.17.
 */
function registEmails(emails, emailSubscribe, cb) {
    //1. find emails from contact in dictionary
    Email.find(emails).exec(function(err, results){
        if(err) {
            return cb(err);
        }
        // sails.log(emails);
        sails.log("RESULTS:");
        sails.log(results);
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
                sails.log("FOUNDED:");
                sails.log(founded);
                return cb(null,founded);
            });
        });
    });

}



module.exports = {
    create: function(userId, contacts, cb) {
        var emails = []; //for search, just list of emails
        var emailSubscribe = [];
        var phones = [];
        var phoneSubscribe = [];
        var phonesRecords = [];
        for(var i = 0, size = contacts.length; i < size; i++) {
            emails.push({"email": contacts[i].email});
            emailSubscribe.push({"email": contacts[i].email, "user_id": parseInt(userId)});
            phones.push({"id": PhoneIdentifier.extract(contacts[i].phone)});
            phonesRecords.push({"id": PhoneIdentifier.extract(contacts[i].phone), "phone": contacts[i].phone});
            phoneSubscribe.push({"id": PhoneIdentifier.extract(contacts[i].phone), "phone": contacts[i].phone, "user_id":userId});
        }

        registEmails(emails, emailSubscribe, function(err, founded) {
            var contacts = [];
            if(founded) {
                for (var i = 0, size = founded.length; i < size; i++) {
                    if(founded[i].user_id) {
                        contacts.push(founded[i].user_id);
                    }
                }
            }
            User.find({"id": contacts}).exec(cb);

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

        });


       // Phones.find(phones).exec();
        // Email.batchInsert(emails, function(err){
        //     if(err) {
        //         return cb(err);
        //     }
        //     sails.log("----");
        //     sails.log(emailContacts);
        //     return EmailContacts.batchInsert(userId, emailContacts, cb);
        // });

    },
    find: function(userId, cb) {
        
    }
};