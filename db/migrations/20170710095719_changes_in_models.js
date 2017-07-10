
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw(" SET FOREIGN_KEY_CHECKS=0;"),
        knex.raw(" DROP TABLE phone"),
        knex.raw(" DROP TABLE phone_subscribe"),
        knex.raw("CREATE TABLE IF NOT EXISTS `phone` ( \
            `id` varchar(12) NOT NULL,\
            `phone` varchar(255) DEFAULT NULL,\
            `user_id` int(10) unsigned DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`),\
            UNIQUE KEY `phone` (`phone`),\
            UNIQUE KEY `user_id` (`user_id`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;"),
        knex.raw("  CREATE TABLE IF NOT EXISTS `phone_subscribe` (\
            `phone_id` varchar(12) NOT NULL,\
            `user_id` int(10) unsigned NOT NULL,\
            PRIMARY KEY (`phone_id`,`user_id`),\
            KEY `user_id` (`user_id`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"),
        knex.raw("ALTER TABLE `phone_subscribe` ADD FOREIGN KEY (phone_id) REFERENCES `phone` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `phone_subscribe` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),

        knex.raw("    CREATE TABLE `event_guest` (\
            `event_id` int(10) unsigned NOT NULL,\
        `phone_id` VARCHAR(12) NULL DEFAULT NULL,\
        `email` varchar(254) NULL DEFAULT NULL,\
        PRIMARY KEY (`event_id`, `phone_id`, `email`)\
        )"),
        knex.raw("ALTER TABLE `event_guest` ADD FOREIGN KEY (event_id) REFERENCES `event` (`id`) ON UPDATE CASCADE ON DELETE CASCADE"),
        knex.raw(" ALTER TABLE `event_guest` ADD FOREIGN KEY (phone_id) REFERENCES `phone` (`id`) ON UPDATE CASCADE ON DELETE CASCADE"),
        knex.raw("ALTER TABLE `event_guest` ADD FOREIGN KEY (email) REFERENCES `email` (`email`) ON UPDATE CASCADE ON DELETE CASCADE"),
        knex.raw("SET FOREIGN_KEY_CHECKS=1;")
    ]);
};

exports.down = function(knex, Promise) {
  
};
