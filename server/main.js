Meteor.startup(function () {
    Transactions._ensureIndex( {number:1}, {name:'number', unique:true})
    Apartments._ensureIndex( {code:1}, {name:'code', unique:true})
    Histories._ensureIndex({"record.number":1, collection: 1}, {name:'collection_number'})
});