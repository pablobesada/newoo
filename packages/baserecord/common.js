Meteor.methods({
    baserecord_save: function (collection_name, r) {
        // Make sure the user is logged in before inserting a task
        //if (! Meteor.userId()) {
        //    throw new Meteor.Error("not-authorized");
        //}

        console.log("saving: ");
        var collection = eval(collection_name); //chequear dps de esto que collection sea un Collection!
        var res;
        var history = {
            collection: collection_name,
            timestamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
            user: Meteor.user().username,
            record: r,
        }
        if (r._id) {
            console.log("updating... id: " + r._id);
            id = r._id;
            delete r._id;
            _sync = r._sync;
            r._sync++;
            res = collection.update({_id: id, _sync: _sync}, {$set: r});
            r._id = id;
            if (res) {
                history.old_id = id;
                history.new_id = id;
                history.action = 'U';
                Histories.insert(history);
            }
        } else {
            console.log("inserting: " + r._id);
            r._sync = 1;
            r._id = collection.insert(r);
            res = 1; //sure?
            if (res) {
                if (res) {
                    history.old_id = r._id;
                    history.new_id = r._id;
                    history.action = 'I';
                    Histories.insert(history);
                }
            }
        }
        console.log("Se grabaron: " + res);
        return {ok: res, record: r};
    },
    baserecord_delete: function (collection_name, id, _sync) {
        collection = eval(collection_name); //chequear dps de esto que collection sea un Collection!
        console.log("deleting... id: " + id);

        var r = collection.findOne({_id: id, _sync: _sync}); // en algun momento sera necesario para chequear alguna cosa del apartment
        var res = 0;
        if (r) {
            res = collection.remove({_id: id});
            if (res) {
                var history = {
                    collection: collection_name,
                    timestamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    user: Meteor.user().username,
                    record: r,
                    old_id: id,
                    new_id: id,
                    action: 'D',
                }
                Histories.insert(history);
            }
        }
        return {ok: res}
    },

});

if (Meteor.isServer) {
    Meteor.methods({
        baserecord_getRecord: function (collection_name, query) {
            console.log("getRecord: " + collection_name);
            var collection = eval(collection_name); //chequear dps de esto que collection sea un Collection!
            var res =  collection.findOne(query);
            return res;
        }
    })
}
console.log("en archivo de methos");