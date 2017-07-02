/**
 * Created by decadal on 01.07.17.
 */
// module.exports = {
//     connection: 'localMysqlServer',
//     attributes: {
//         phone: {
//             required: true,
//             type: 'string',
//             unique: true,
//             regex: /\+([0-9]){9,13}/,
//             primaryKey: true
//         },
//         subscribers: {
//             collection: 'User',
//             via: 'phoneContacts'
//         }
//     },
//
//     validationMessages: { //hand for i18n & l10n
//         phone: {
//             required: "Phone is required",
//             regex: "Phone must be valid phone like +12341231451"
//         },
//
//     },
//     batchInsert: function(phones, cb) {
//         var placeholders = (new Array(phones.length)).join('(?),') + '(?)';
//         var sql = 'INSERT INTO phone (phone) VALUES '+ placeholders + ' ON DUPLICATE KEY UPDATE phone=phone';
//         sails.log(sql);
//         Email.query(sql, emails ,function(err, rawResult) {
//             //if (err) { return res.serverError(err); }
//
//             sails.log(rawResult);
//             // ...grab appropriate data...
//             // (result format depends on the SQL query that was passed in, and the adapter you're using)
//
//             // Then parse the raw result and do whatever you like with it.
//             return cb(err, rawResult);
//             //return res.ok();
//
//         });
//     }
// };
//
