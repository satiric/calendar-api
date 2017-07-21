/**
 * Created by decadal on 29.06.17.
 */

module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,
    tableName: "event_invites",
    autoId : false,
    attributes: {
        status: {
            type: "integer"
        },
        event_id: {
            model: 'Event',
         //   primaryKey: true //NOT WORKING POPULATE WITH IT
        },
        user_id: {
            model: 'User',
            primaryKey: true
        }
    }, 
    extendEventInvite: function(ei, cb) {
            var userIds = ei.map(function(value) {
                return value.user_id;
            });
            User.find({id: userIds}).populate('avatar').exec(function(err, users){
                if(err) {
                    return cb(err);
                }
                sails.log(users);
                ei = ei.map(function(value){
                    var id = value.user_id;
                    value.user = users.find(function (element){
                        return element.id === id;
                    });
                    return value;
                });
                return cb(null, ei);
            });
        
    },

    dropFromEvent: function(eventId, userIds, cb) {
        var sql = "";
        var arr = [];
        for(var i = 0, size = userIds.length; i < size; i++) {
            sql+=  "(user_id = ? AND event_id = ?)";
            arr.push(userIds[i]);
            arr.push(eventId);

            if(i !== userIds.length - 1) {
                sql+= " OR ";
            }
        }
        EventInvite.query("DELETE FROM event_invites WHERE " + sql, arr ,function(err, rawResult) {
            return cb(err, rawResult);
        });
    }
    // validationMessages: { //hand for i18n & l10n
    //     email: {
    //         required: 'Email is required',
    //         email: 'Email is not a valid email',
    //         unique: 'This email is already registered to a vlife account'
    //     },
    //     name: {
    //         required: "Name is required",
    //         validName: "Invalid Name: it must be more than 1 symbol and less than 26, without spaces"
    //     },
    //     second_name: {
    //         required: "Name is required",
    //         validName: "Invalid Last Name: it must be more than 1 symbol and less than 26, without spaces"
    //     },
    //     password: {
    //         required: "Password is required",
    //         password: "Invalid Password: it contain spaces on start or on end",
    //         minLength: "Invalid Password: it must be more than 7 symbols",
    //         maxLength: "Invalid Password: it must be less than 26 symbols"
    //     },
    //     phone: {
    //         required: "Phone is required",
    //         regex: "Phone must be valid phone like +12341231451"
    //     }
    // },
};
