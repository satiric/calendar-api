
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE event CHANGE sphere sphere integer(10) NOT NULL"),
        knex.raw("ALTER TABLE event CHANGE repeat_type repeat_type integer(10)"),
        knex.raw("ALTER TABLE event CHANGE repeat_option repeat_option integer(10)"),
        knex.raw("ALTER TABLE event CHANGE remind reminds integer(10)")
    ]);
};

exports.down = function(knex, Promise) {
  
};
