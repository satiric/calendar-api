
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `phone_subscribe` ADD COLUMN blocked INT NULL DEFAULT NULL "),
        knex.raw("ALTER TABLE `email_subscribe` ADD COLUMN blocked INT NULL DEFAULT NULL "),
    ]);
};

exports.down = function(knex, Promise) {
  
};
