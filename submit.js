var cc = require('config-multipaas');
var mongojs = require('mongojs');
var validateEntry = require('./validate');
var city = process.env.YOW_CITY || 'Melbourne';
var config = cc({ 
    collection_name : process.env.OPENSHIFT_APP_NAME || 'entries'
})
var db_config = config.get('MONGODB_DB_URL');
var collection_name = config.get('collection_name');
var db = mongojs(db_config + collection_name, [collection_name]);
 
var add_entry = function (name, company, email, entry) {
    if (!name || !company || !email || !entry) {
        return { 'result': 'invalid', 'error': 'missing parameter' };
    }
    if (validateEntry(entry) == 'invalid') {
        return { 'result': 'invalid', 'error': 'invalid game entry' };
    }
    if (false) { //TODO
        return { 'result': 'invalid', 'error': 'entrant already registered' };
    }
    //db[collection_name].find( 
    var unique = false;
    db[collection_name].insert({ "submission" : entry, "name": name, "company": company, "email": email, "unique": unique, city: city});
    return { 'result': unique };
};

var init_db = function () {
    db[collection_name].ensureIndex({"submission": 1});
    db[collection_name].ensureIndex({"email": 1}, { "unique": true});
    return db.close();
};

module.exports = exports = {
    initDB: init_db,
    addEntry: add_entry
};
