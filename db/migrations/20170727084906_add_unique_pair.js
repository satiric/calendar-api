
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw("ALTER TABLE friends ADD constraint unique_pairs_ids unique index(user_who_id, user_whom_id);")
    ]);

};

exports.down = function(knex, Promise) {
  
};
