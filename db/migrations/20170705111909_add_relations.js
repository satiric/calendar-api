
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `phone` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL; "),
        knex.raw("ALTER TABLE `user` ADD FOREIGN KEY (avatar) REFERENCES `file` (`id`) ON UPDATE CASCADE ON DELETE SET NULL; "),
        knex.raw("ALTER TABLE `event` ADD FOREIGN KEY (founder) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `phone_subscribe` ADD FOREIGN KEY (phone_id) REFERENCES `phone` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `phone_subscribe` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `email_subscribe` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `email_subscribe` ADD FOREIGN KEY (email) REFERENCES `email` (`email`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `email` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;  "),
        knex.raw("ALTER TABLE `event_invites` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; "),
        knex.raw("ALTER TABLE `event_invites` ADD FOREIGN KEY (event_id) REFERENCES `event` (`id`) ON UPDATE CASCADE ON DELETE CASCADE; ")
    ]);
};

exports.down = function(knex, Promise) {
    
};
