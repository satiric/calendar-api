/**
 * Created by decadal on 01.07.17.
 */
module.exports = {
    create: function(userId, contacts, cb) {
        var emails = [];
        var emailContacts = [];
//        var emails = [];
        for(var i = 0, size = contacts.length; i < size; i++) {
            emails.push(contacts[i].email);
            emailContacts.push(contacts[i].email);
            emailContacts.push(userId);
        }
        Email.batchInsert(emails, function(err){
            if(err) {
                return cb(err);
            }
            sails.log("----");
            sails.log(emailContacts);
            return EmailContacts.batchInsert(userId, emailContacts, cb);
        });

    },
    find: function(userId, cb) {
        
    }
};