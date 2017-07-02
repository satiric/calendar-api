
exports.up = function(knex, Promise) {
    knex.schema.createTable('subscribers', function (table) {
        table.increments();
        table.string('name');
        table.timestamps();
    })
    
    CREATE TABLE `` (
        `email` VARCHAR(254) NOT NULL,
        `user_id` INTEGER NOT NULL,
        PRIMARY KEY (`email`, `user_id`)
    );
    ALTER TABLE `subscribers` ADD FOREIGN KEY (email) REFERENCES `email` (`email`);
    ALTER TABLE `subscribers` ADD FOREIGN KEY (user_id) REFERENCES `user` (`id`);

};

exports.down = function(knex, Promise) {
  
};
