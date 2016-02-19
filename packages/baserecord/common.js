Meteor.methods({
    baserecord_save: function (collection_name, r) {
        // Make sure the user is logged in before inserting a task
        //if (! Meteor.userId()) {
        //    throw new Meteor.Error("not-authorized");
        //}
        console.log("saving: ");
        var collection = eval(collection_name); //chequear dps de esto que collection sea un Collection!
        console.log(r._id);
        console.log(r.number);
        var res;
        if (r._id) {
            console.log("updating... id: " + r._id);
            id = r._id;
            delete r._id;
            _sync = r._sync;
            r._sync++;
            res = collection.update({_id: id, _sync: _sync}, {$set: r});
            r._id = id;
        } else {
            console.log("inserting: " + r._id);
            r._sync = 1;
            r._id = collection.insert(r);
            res = 1; //sure?
        }
        console.log("Se grabaron: " + res);
        return {ok: res, record: r};
    },
    baserecord_delete: function (collection_name, id) {
        collection = eval(collection_name); //chequear dps de esto que collection sea un Collection!
        console.log("deleting... id: " + id);

        var r = collection.findOne({_id: id}); // en algun momento sera necesario para chequear alguna cosa del apartment
        res = collection.remove({_id: id});
        return {ok: res}
    },
});

console.log("en archivo de methos");