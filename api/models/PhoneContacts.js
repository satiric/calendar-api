/**
 * Created by decadal on 01.07.17.
 */


/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    tableName: "phone_subscribe",
    connection: 'localMysqlServer',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        phone_id: {
            model: "Phone"
        },
        user_id: {
            model: "User"
        }
    },

    batchInsert: function(phones, cb) {
        var pc = [];

        if(!phones) {
            sails.log("-----------");
            return cb();
        }
        for(var i = 0, size = phones.length; i < size; i++) {
            pc.push(phones[i].id);
            pc.push(phones[i].phone);
            pc.push(phones[i].user_id);
        }

        var placeholders = (new Array(parseInt(pc.length / 3))).join('(?, ?, ?),') + '(?, ?, ?)';
        var sql = 'INSERT INTO phone_subscribe (id, phone, user_id) VALUES '+ placeholders + ' ON DUPLICATE KEY UPDATE id=id, phone = phone, user_id=user_id';


        PhoneContacts.query(sql, pc ,function(err, rawResult) {
            return cb(err, rawResult);
        });
    }
};
