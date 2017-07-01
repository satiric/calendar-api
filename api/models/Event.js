/**
 * Created by decadal on 29.06.17.
 */

module.exports = {

    attributes: {
        title: {
            type: "string",
            required: true,
            minLength: 1
        },
        sphere: {
            type: "string",
            enum: ['Personal', 'Work']
        },
        event_date: {
            type: "datetime"
        },
        time_start: {
            type: "time"
        },
        time_end: {
            type: "time"
        },
        repeat: {
            type: "string",
            enum: ['Never', 'Day', 'Week', 'Fortnight', 'Month']
        },
        repeat_option: {
            type: "string"
        },
        end_repeat: {
            type: "datetime",
        },
        location: {
            type: "string"
        },
        description: {
            type: "string"
        },
        remind: {
            type: "int"
        }
    }
};
