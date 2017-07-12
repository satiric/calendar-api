
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw(" ALTER TABLE user ADD UNIQUE (phone);"),
    ]);
};

exports.down = function(knex, Promise) {
  
};
