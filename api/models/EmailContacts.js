/**
 * Created by decadal on 01.07.17.
 */


/**
 * Created by decadal on 01.07.17.
 */

// module.exports = {
//     connection: 'localMysqlServer',
//     attributes: {
//         email: {
//             model: "Email",
//             type: 'string',
//             primaryKey: true,
//             size: 100
//         }, 
//         user: {
//             model: "User",
//             primaryKey: true
//         }
//     },
//
//     batchInsert: function(userId, emails, cb) {
//         var placeholders = (new Array(parseInt(emails.length / 2))).join('(?, ?),') + '(?, ?)';
//         var sql = 'INSERT INTO emailcontacts (email, user) VALUES '+ placeholders + ' ON DUPLICATE KEY UPDATE email=email, user=user';
//         sails.log(placeholders);
//         Email.query(sql, emails ,function(err, rawResult) {
//             //if (err) { return res.serverError(err); }
//             sails.log(rawResult);
//             // ...grab appropriate data...
//             // (result format depends on the SQL query that was passed in, and the adapter you're using)
//             return cb(err, rawResult);
//
//         });
//     },
// };
//
//
