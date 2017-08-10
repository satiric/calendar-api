/**
 * Created by decadal on 27.07.17.
 */


/**
 * Friend.js
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    tableName: "friends",
    attributes: {
        id: {
            type: "integer",
            primaryKey: true
        },
        user_who_id: {
            model: "User"
        },
        user_whom_id: {
            model: "User"
        },
        blocked: {
            type: "integer"
        },
        removed: {
            type: "integer"
        }
    },

    insertIgnore: function(fields, cb) {
        var ids = [];
        var placeholders = '';
        if(!fields.length) {
            return cb();
        }
        fields.forEach(function(value, index){
            placeholders+= (index !== (fields.length - 1))
                ? '(?, ?, ?),'
                : '(?, ?, ?)';
            ids.push(value.user_who_id);
            ids.push(value.user_whom_id);
            ids.push((value.blocked || 0));
        });

        var sql = 'INSERT IGNORE INTO friends (user_who_id, user_whom_id, blocked) VALUES '+ placeholders;

        Friend.query(sql, ids ,function(err, rawResult) {
            return cb(err, rawResult);
        });
    }

    // validationMessages: { //hand for i18n & l10n
    //
    // },
};
