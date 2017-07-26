
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("CREATE TABLE IF NOT EXISTS `apikey` ( `id` int(10) unsigned NOT NULL AUTO_INCREMENT," +
            "`value` varchar(255) DEFAULT NULL," +
            "`createdAt` datetime DEFAULT NULL, `updatedAt` datetime DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `value` (`value`)" +
            ") ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1"),

        knex.raw("CREATE TABLE IF NOT EXISTS `authtoken` ( \
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `value` varchar(255) DEFAULT NULL,\
            `expire_date` datetime DEFAULT NULL,\
            `is_active` tinyint(1) DEFAULT NULL,\
            `owner` int(10) unsigned NOT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`),\
            UNIQUE KEY `owner` (`owner`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;"),
        knex.raw("CREATE TABLE IF NOT EXISTS `email` ( \
            `email` varchar(254) NOT NULL,\
            `user_id` int(10) unsigned, \
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`email`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"),
        knex.raw("  CREATE TABLE IF NOT EXISTS `email_subscribe` (\
            `email` varchar(254) NOT NULL,\
            `user_id` int(10) unsigned NOT NULL,\
            PRIMARY KEY (`email`,`user_id`),\
            KEY `user_id` (`user_id`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"),
        knex.raw("  CREATE TABLE IF NOT EXISTS `phone_subscribe` (\
            `phone_id` int(10) unsigned NOT NULL,\
            `user_id` int(10) unsigned NOT NULL,\
            PRIMARY KEY (`phone_id`,`user_id`),\
            KEY `user_id` (`user_id`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"),
        knex.raw("CREATE TABLE IF NOT EXISTS `event` ( \
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `title` varchar(255) DEFAULT NULL,\
            `sphere` varchar(255) DEFAULT NULL,\
            `event_date` datetime DEFAULT NULL,\
            `time_start` varchar(255) DEFAULT NULL,\
            `time_end` varchar(255) DEFAULT NULL,\
            `repeat_type` varchar(255) DEFAULT NULL,\
            `repeat_option` longtext,\
            `end_repeat` datetime DEFAULT NULL,\
            `location` varchar(255) DEFAULT NULL,\
            `description` varchar(255) DEFAULT NULL,\
            `remind` varchar(255) DEFAULT NULL,\
            `active` tinyint(1) DEFAULT NULL,\
            `founder` int(10) unsigned NOT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;"),

        knex.raw("CREATE TABLE IF NOT EXISTS `file` (\
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `name` varchar(255) DEFAULT NULL,\
            `size` int(11) DEFAULT NULL,\
            `ext` varchar(255) DEFAULT NULL,\
            `caption` varchar(255) DEFAULT NULL,\
            `url` varchar(255) DEFAULT NULL,\
            `mini_url` varchar(255) DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1"),

        knex.raw("CREATE TABLE IF NOT EXISTS `phone` ( \
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `phone` varchar(255) DEFAULT NULL,\
            `user_id` int(10) unsigned DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`),\
            UNIQUE KEY `phone` (`phone`),\
            UNIQUE KEY `user_id` (`user_id`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;"),
        
        knex.raw("CREATE TABLE IF NOT EXISTS `phone_verification` ( \
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `code` varchar(255) DEFAULT NULL,\
            `phone` varchar(255) DEFAULT NULL,\
            `security_hash` varchar(255) DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;"),


        knex.raw("CREATE TABLE IF NOT EXISTS `setting` (\
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `key` varchar(255) DEFAULT NULL,\
            `value` varchar(255) DEFAULT NULL,\
            `caption` varchar(255) DEFAULT NULL,\
            `description` varchar(255) DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`)\
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;"),
        
        knex.raw("CREATE TABLE `event_invites` ( \
            `user_id` int(10) unsigned NOT NULL,\
        `event_id` int(10) unsigned NOT NULL,\
        `status` VARCHAR(20) NULL DEFAULT NULL,\
        PRIMARY KEY (`user_id`, `event_id`));"),

        knex.raw("CREATE TABLE IF NOT EXISTS `user` (\
            `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\
            `name` varchar(255) DEFAULT NULL,\
            `second_name` varchar(255) DEFAULT NULL,\
            `email` varchar(255) DEFAULT NULL,\
            `password` varchar(255) DEFAULT NULL,\
            `phone` varchar(255) DEFAULT NULL,\
            `avatar` int(10) unsigned NULL, \
            `password_reset_token` varchar(255) DEFAULT NULL,\
            `reset_token_created` datetime DEFAULT NULL,\
            `state` varchar(255) DEFAULT NULL,\
            `createdAt` datetime DEFAULT NULL,\
            `updatedAt` datetime DEFAULT NULL,\
            PRIMARY KEY (`id`),\
            UNIQUE KEY `email` (`email`)\
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;"),
        knex.raw("INSERT INTO apikey (value) VALUES ('test')," +
            "('059zZmWOYJU0bLf7RrjnLMPbfCYf3uve5KYGs8o3jWxYE1bBQoz5ZKKVafsn')," +
            "('e3vsnAAywNnawmocHUE8EyeFdYRLMV071JGMUs-CwXLxSQukaUSMiQz0yJi4')  ;"),
    ]);
};

exports.down = function(knex, Promise) {

};
