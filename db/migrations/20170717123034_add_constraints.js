
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `phone` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL; ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
