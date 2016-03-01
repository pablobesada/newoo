
function genericPublish(params) {
    var instance = this;
    //Meteor._sleepForMs(2000);
    console.log("Publish de " + this._name);
    console.log(this._name);
    var args = params || {};
    var options = args.options || {};
    var query = args.query || {};
    var clientCollection = options.collection_name || this._name
    console.log(["publishing query: ",query]);
    console.log(["publishing options: ",options]);
    //return Transactions.find(query, options);
    var collection = eval(this._name);
    var cursor = collection.find(query, options)

    var initializing = true;
    var handle = cursor.observeChanges({
        added: function(id, doc) {
            if (!initializing) {
                console.log("adding.. " + doc.number);
                instance.added(clientCollection, id, doc);
            }
        },
        changed: function(id, doc) {
            console.log("trying changed.. " + doc.number);

            if (!initializing) instance.changed(clientCollection, id, doc);
        },
        removed: function(id) {
            console.log("trying removed.. " + id);

            if (!initializing) instance.removed(clientCollection, id);
        },
        error: function (err) {
            throw err;
        }
    });

    initializing = false;
    _(cursor.fetch()).forEach(function (doc) {
        instance.added(clientCollection, doc._id, doc);
    });
    // mark the subscription as ready
    instance.onStop(function () {
        handle.stop();
    });

    instance.ready();
}

Meteor.publish('Transactions', genericPublish);
Meteor.publish('Apartments', genericPublish);


Meteor.publish("Account_Balances", function () {
    ReactiveAggregate(this, Transactions,[{$match: {}}, {$unwind: "$accounts"}, {
        $group: {
            _id: {
                user: "$accounts.user",
                currency: "$currency"
            }, amount: {$sum: "$accounts.amount"}
        }},
        {$project: {_id: {$concat: ["$_id.user", "|", "$_id.currency"]}, user: "$_id.user", currency: "$_id.currency", amount: "$amount"}}
    ], { clientCollection: "trans_count" });
});

Meteor.publish("Transactions_Grouped_By_Month", function (params) {
    var args = params || {};
    var options = args.options || {};
    var query = args.query || {};
    ReactiveAggregate(this, Transactions,[{$match: query}, {$unwind: "$accounts"},
        {$group: {
            _id: {
                year: {$substr: ['$date', 0, 4]},
                month: {$substr: ['$date', 5, 2]},
                apartment: "$apartment",
                user: "$accounts.user"
            },
            amount: {$sum: '$accounts.amount'}}},
        {$project: {_id: {$concat: ["$_id.year", "-", "$_id.month", "|", "$_id.apartment", "|", "$_id.user"]}, apartment: "$_id.apartment", month: {$concat: ["$_id.year", "-", "$_id.month"]}, amount: "$amount", user: "$_id.user"}}
    ], { clientCollection: "Transactions_Grouped_By_Month" });
});

Meteor.publish('Histories', genericPublish);


Meteor.publish('Currencies', function() {
    return Currencies.find({});
});
