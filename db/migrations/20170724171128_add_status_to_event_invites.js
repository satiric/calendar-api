
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw("ALTER TABLE `event_invites` ADD COLUMN status int(10) unsigned NOT NULL DEFAULT 0 ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
