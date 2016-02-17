Meteor.publish('Apartments', function() {
    return Apartments.find({});
});

Meteor.publish('Transactions', function(args) {

    //Meteor._sleepForMs(2000);
    console.log(args.msg);
    var options = args.options || {};
    var query = args.query || {};
    console.log(["publishing query: ",query]);
    console.log(["publishing options: ",options]);
    return Transactions.find(query, options)
});

Meteor.publish('History', function() {
    return History.find({});
});

Meteor.publish('Currencies', function() {
    return Currencies.find({});
});
