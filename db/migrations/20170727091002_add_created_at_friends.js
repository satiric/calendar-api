
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `friends` ADD COLUMN createdAt datetime DEFAULT NULL "),
        knex.raw("ALTER TABLE `friends` ADD COLUMN updatedAt datetime DEFAULT NULL ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
