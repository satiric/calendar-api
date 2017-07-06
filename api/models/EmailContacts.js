/**
 * Created by decadal on 01.07.17.
 */


/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    tableName: "email_subscribe",
    connection: 'localMysqlServer',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        email: {
            model: "Email",
            type: 'string',
            size: 254
        },
        user_id: {
            model: "User"
        }
    },

    batchInsert: function(emails, cb) {
        var pc = [];
        for(var i = 0, size = emails.length; i < size; i++) {
            pc.push(emails[i].email);
            pc.push(emails[i].user_id);
        }
        var placeholders = (new Array(parseInt(pc.length / 2))).join('(?, ?),') + '(?, ?)';
        var sql = 'INSERT INTO email_subscribe (email, user_id) VALUES '+ placeholders + ' ON DUPLICATE KEY UPDATE email=email, user_id=user_id';


        EmailContacts.query(sql, pc ,function(err, rawResult) {
            //if (err) { return res.serverError(err); }
            sails.log(rawResult);
            // ...grab appropriate data...
            // (result format depends on the SQL query that was passed in, and the adapter you're using)
            return cb(err, rawResult);
        });
    }
};
