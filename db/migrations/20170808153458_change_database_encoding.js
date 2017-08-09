var config = require('../../config/local');
if(!config) {
    config = require('../../config/connections');
}
else {
    config = config.connections;
}


exports.up = function(knex, Promise) {
    var db = config.localMysqlServer.database;
    return Promise.all([
        knex.raw("ALTER DATABASE "+ db + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"),
        knex.raw("ALTER TABLE event CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")

    ]);
};

exports.down = function(knex, Promise) {
  
};
