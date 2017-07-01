/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    'get /': {
        view: 'homepage'
    },

    'post /api/v1/user/signup': {
        controller: 'UserController',
        action: 'signup',
        skipAssets: 'true'
    },
    'post /api/v2/user/signup': {
        controller: 'v2/UserController',
        action: 'signup',
        skipAssets: 'true'
    },

    'post /api/v1/user/login': {
        controller: 'UserController',
        action: 'login',
        skipAssets: 'true'
    },
    'post /api/v2/user/login': {
        controller: 'v2/UserController',
        action: 'login',
        skipAssets: 'true'
    },
    
    'post /api/v1/file': {
        controller: 'FileController',
        action: 'create',
        skipAssets: 'true'
    },
    'get /api/v1/user/logout': {
        controller: 'UserController',
        action: 'logout',
        skipAssets: 'true'
    },
    'get /api/v1/user/info/:id?': {
        controller: 'UserController',
        action: 'find'
    },
    'put /api/v1/user/info': {
        controller: 'UserController',
        action: 'update'
    },
    'get /redirect': {
        controller: 'RedirectController',
        action: 'deepLink'
    },
    'put /api/v1/user/changePassword': {
        controller: 'UserController',
        action: 'changePassword'
    },
    'get /api/v1/user/checkEmail': {
        controller: 'UserController',
        action: 'checkEmail'
    },
    'get /api/v1/user/checkPhone': {
        controller: 'UserController',
        action: 'checkPhone'
    },

    'post /api/v1/user/resetPassword': {
        controller: 'UserController',
        action: 'resetPassword'
    },
    'post /api/v1/user/refreshToken': {
        controller: 'UserController',
        action: 'refresh'
    },
    'get /api/v1/user/verifyPhone': {
        controller: 'UserController',
        action: 'verifyPhone'
    }

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

};
