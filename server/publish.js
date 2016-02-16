Meteor.publish('Apartments', function() {
    return Apartments.find({});
});

Meteor.publish('Transactions', function(limit) {
    //Meteor._sleepForMs(2000);
    return Transactions.find({}, { limit: limit , sort: {number: 1}})
});

Meteor.publish('History', function() {
    return History.find({});
});

Meteor.publish('Currencies', function() {
    return Currencies.find({});
});
