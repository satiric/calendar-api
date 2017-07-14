
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `phone_subscribe` ADD COLUMN fictive_id INT NOT NULL AUTO_INCREMENT UNIQUE "),
        knex.raw("ALTER TABLE `email_subscribe` ADD COLUMN fictive_id INT NOT NULL AUTO_INCREMENT UNIQUE "),
    ]);
};

exports.down = function(knex, Promise) {
  
};
