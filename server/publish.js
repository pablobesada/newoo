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

/*
var trans_count = [];
var trans_count_initialized = false;
Meteor.publish('Account_Balances', function () {
    console.log("en publish account_balances");
    self = this;
    var initializing = true;

    var refresh = function() {
        balances = Transactions.aggregate([{$match: {}}, {$unwind: "$accounts"}, {
            $group: {
                _id: {
                    user: "$accounts.user",
                    currency: "$currency"
                }, total: {$sum: "$accounts.amount"}
            }
        }]);
        console.log(trans_count);
        _(trans_count).each(function (doc) {
            console.log("removing: " + doc._id);
            self.removed('trans_count', doc._id);
        });
        trans_count.length = 0;
        _(balances).each(function (balance) {
            console.log("adding: " + balance._id + ": " + balance.total);
            var newId = new Mongo.ObjectID()._str;
            var doc = {_id: newId, currency: balance._id.currency, user: balance._id.user, total: balance.total};
            self.added('trans_count', newId, doc);
            trans_count.push(doc);
        });
        trans_count_initialized = true;
        self.ready();
    }
    var observerHandler = Transactions.find({}).observe({
        added: function() {
            if (!initializing) refresh();
        },
        changed: function() {
            console.log("observed see change, initializing: " + initializing);
            if (!initializing) refresh();
        },
        removed: function() {
            if (!initializing) refresh();
        },
    });
    initializing = false;
    if (trans_count_initialized) {
        console.log("serving from cache");
        _(trans_count).each(function(doc) {
            self.added("trans_count", doc._id, doc);
        });
        self.ready();
    } else {
        refresh();
    }
    self.onStop(function () {
        observerHandler.stop();
    });
})
*/

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


Meteor.publish('History', function() {
    return History.find({});
});

Meteor.publish('Currencies', function() {
    return Currencies.find({});
});
