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
            type: "string",
            enum: ['Personal', 'Work']
        },
        event_date: {
            type: "datetime"
        },
        time_start: {
            required: true,
            type: "string"
        },
        time_end: {
            required: true,
            type: "string"
        },
        repeat: {
            type: "string",
            enum: ['Never', 'Day', 'Week', 'Fortnight', 'Month']
        },
        repeat_option: {
            type: "array"
        },
        end_repeat: {
            type: "datetime"
        },
        location: {
            type: "string"
        },
        description: {
            type: "string"
        },
        remind: {
            type: "int"
        },
        active: {
            type: "boolean",
            defaultsTo: true
        },
        founder: {
            model: 'User'
        }
    },
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
