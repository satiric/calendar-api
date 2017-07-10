/**
 * Created by decadal on 29.06.17.
 */

module.exports = {
    attributes: {
        title: {
            type: "string",
            required: true,
            maxLength: 25
        },
        sphere: {
            type: "integer"
           // enum: ['Personal', 'Work']
        },
        date_start: {
            required: true,
            type: "datetime"
        },
        date_end: {
            required: true,
            type: "datetime"
        },
        repeat_type: {
            type: "integer",
      //      enum: ['Never', 'Day', 'Week', 'Fortnight', 'Month']
        },
        repeat_option: {
            type: "integer"
        },
        end_repeat: {
            type: "datetime"
        },
        location: {
            type: "string"
        },
        description: {
            type: "string",
            maxLength: 200
        },
        reminds: {
            type: "integer"
        },
        active: {
            type: "boolean",
            defaultsTo: true
        },
        founder: {
            model: 'User'
        }
    },
    validationMessages: { //hand for i18n & l10n
        date_start: {
            required: 'Date start is required',
            datetime: 'Invalid type for Date start. Date start format is UTC',
        },
        date_end: {
            required: 'Date end is required',
            datetime: 'Invalid type for Date end. Date end format is UTC',
        },
        // second_name: {
        //     required: "Name is required",
        //     validName: "Invalid Last Name: it must be more than 1 symbol and less than 26, without spaces"
        // },
        // password: {
        //     required: "Password is required",
        //     password: "Invalid Password: it contain spaces on start or on end",
        //     minLength: "Invalid Password: it must be more than 7 symbols",
        //     maxLength: "Invalid Password: it must be less than 26 symbols"
        // },
        // phone: {
        //     required: "Phone is required",
        //     regex: "Phone must be valid phone like +12341231451"
        // }
    },

    beforeCreate: function (values, next) {
        if(values.description){
            values.description = values.description.trim();
        }
        next();
    },
    beforeUpdate: function (values, next) {
        if(values.description){
            values.description = values.description.trim();
        }
        next();
    },

    isValid: function(event) {
        // if(
        // 2). time_end should be > time_start
        // 3). end_repeat >= event_date

    }
};
