
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `authtoken` ADD COLUMN refresh_token VARCHAR(40) NULL DEFAULT NULL ")
    ]);

};

exports.down = function(knex, Promise) {
  
};
