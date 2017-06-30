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
        description: {
            type: "string"
        },
        location: {
            type: "string"
        },
        url: {
            required: true,
            type: 'string'
        }
    }
};
