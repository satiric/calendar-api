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
        sails.log(userIds);
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
