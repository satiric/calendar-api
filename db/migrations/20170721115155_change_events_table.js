
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw("ALTER TABLE `event_guest` ADD COLUMN user_id int(10) unsigned NULL DEFAULT NULL "),
        knex.raw("ALTER TABLE `event_guest` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("DROP TABLE event_invites"),
        knex.raw("RENAME TABLE event_guest TO event_invites ")

    ]);
};

exports.down = function(knex, Promise) {

};
