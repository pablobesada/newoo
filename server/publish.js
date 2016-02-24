
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
