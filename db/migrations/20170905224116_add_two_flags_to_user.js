
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE `user` ADD COLUMN tutorial_passed TINYINT NOT NULL DEFAULT 0 "),
        knex.raw("ALTER TABLE `user` ADD COLUMN calendar_tutorial_passed TINYINT NOT NULL DEFAULT 0 ")
    ]);
};

exports.down = function(knex, Promise) {
  
};
