/**
 * Created by decadal on 29.06.17.
 */

module.exports = {
    attributes: {
        title: {
            type: "string",
            required: true,
            maxLength: 25,
            trimSpaces: true
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


// Custom types / validation rules
// (available for use in this model's attribute definitions above)
types: {
    trimSpaces: function (value) {
        var oldLen = value.length;
        value = value.trim();
        return (value.length === oldLen);
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
        title: {
            trimSpaces: 'Title should not contain spaces',
        },
        description: {
            maxLength: "Description must be less than 200 symbols"
        }

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

    hasNotice: function(event) {
        if(!event.date_end) {
            return;
        }
        var dateEnd = (new Date(event.date_end)).getTime();
        if(event.date_start) {
            var dateStart = (new Date(event.date_start)).getTime();
            if(dateStart > dateEnd) {
                return "date_start must be less than date_end";
            }
        }
        if(event.end_repeat) {
            var endRepeat = (new Date(event.end_repeat)).getTime();
            if (endRepeat < dateEnd) {
                return "end_repeat must be more than date_end";
            }
        }
        return undefined;
    }
};
