
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `phone_subscribe` ADD COLUMN becomes_friend INT NOT NULL DEFAULT 0 "),
        knex.raw("ALTER TABLE `email_subscribe` ADD COLUMN becomes_friend INT NOT NULL DEFAULT 0 "),
        knex.raw("ALTER TABLE `friends` ADD COLUMN removed INT NOT NULL DEFAULT 0 ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
