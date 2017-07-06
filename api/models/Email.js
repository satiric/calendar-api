/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        email: {
            type: "email",
            size: 254,
            required: true,
            unique: true,
            primaryKey: true
        },
        //owner
        user_id: {
            type: "integer",
            unique: true
        }
        // subscribers: {
        //     collection: 'EmailContacts',
        //     via: 'email'
        // }
    },

    validationMessages: { //hand for i18n & l10n
        email: {
            required: 'Email is required',
            email: 'Email is not a valid email',
            unique: 'This email is already registered to a vlife account'
        },
        user_id: {
            type: "integer",
            unique: true
        }
    },


    batchInsert: function(emails, cb) {
        var placeholders = (new Array(emails.length)).join('(?),') + '(?)';
        var sql = 'INSERT INTO email (email) VALUES '+ placeholders + ' ON DUPLICATE KEY UPDATE email=email';
        sails.log(sql);
        Email.query(sql, emails ,function(err, rawResult) {
            //if (err) { return res.serverError(err); }
            sails.log(rawResult);
            // ...grab appropriate data...
            // (result format depends on the SQL query that was passed in, and the adapter you're using)
            return cb(err, rawResult);

        });
    },
};


