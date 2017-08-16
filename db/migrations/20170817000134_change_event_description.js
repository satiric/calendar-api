
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE event MODIFY COLUMN description TEXT NULL")
    ]);
};


exports.down = function(knex, Promise) {
  
};
