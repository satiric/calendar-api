
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `event` ADD COLUMN googlePlaceId TEXT NULL DEFAULT NULL "),
        knex.raw("ALTER TABLE `event` ADD COLUMN fullAddress TEXT NULL DEFAULT NULL "),
        knex.raw("ALTER TABLE `event` ADD COLUMN latitude float NULL DEFAULT NULL "),
        knex.raw("ALTER TABLE `event` ADD COLUMN longitude float NULL DEFAULT NULL ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
