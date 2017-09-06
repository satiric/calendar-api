
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw("ALTER TABLE user CHANGE tutorial_passed contacts_tutorial_passed TINYINT NOT NULL DEFAULT 0")
    ]);

};

exports.down = function(knex, Promise) {
  
};
