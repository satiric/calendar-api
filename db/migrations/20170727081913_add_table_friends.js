
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw("CREATE TABLE `friends` (\
                        `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,\
                        `user_who_id` int(10) unsigned NOT NULL,\
                        `user_whom_id` int(10) unsigned NOT NULL,\
                        `blocked` INTEGER NOT NULL DEFAULT 0,\
                        PRIMARY KEY (`id`)\
                    );"),
        knex.raw("ALTER TABLE `friends` ADD FOREIGN KEY (user_who_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;"),
        knex.raw("ALTER TABLE `friends` ADD FOREIGN KEY (user_whom_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;"),
        knex('authtoken').truncate(),
        knex.raw("ALTER TABLE `authtoken` ADD FOREIGN KEY (owner) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;")
    ]);
};

exports.down = function(knex, Promise) {
  
};
