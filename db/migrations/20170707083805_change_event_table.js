
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE event DROP COLUMN event_date; "),
        knex.raw("ALTER TABLE event CHANGE time_start date_start datetime NOT NULL"),
        knex.raw("ALTER TABLE event CHANGE time_end date_end datetime NOT NULL"),
    ]);
};

exports.down = function(knex, Promise) {
  
};
