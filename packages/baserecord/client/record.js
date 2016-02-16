console.log("EN BASE RECORD");

console.log(Template);



Record = function(collection, record_template, record_fields, event_handler) {
    var thisRecord = this;
    var observerHandle = null;
    var cur_rec = new ReactiveVar(null);
    var cur_rec_changed = new ReactiveVar(0);
    var fields_map = {}
    record_fields.forEach(function (f) {fields_map[f.name] = f});

    this.listview_onCreated = function() {
        console.log(this);
        var instance = this;
        instance.limit = new ReactiveVar(30);
        instance.autorun(function () {
            var limit = instance.limit.get();
            subscription = instance.subscribe(collection._name, limit, {
                onStop: function (error) {
                    console.log("en OnStop de Subscribe " + collection._name + "  " + error);
                    //observerHandle.stop()
                }
            });
        });
    };

    this.listview_onDestroy = function() {
        console.log("Destroying template");
        observerHandle.stop();
    }

    this.recordlist_helpers = {
        records: function () {
            var cursor = collection.find({}, {sort: {number: 1}});
            observerHandle = cursor.observe( {
                changed: function (newDocument, oldDocument, index) {
                    console.log("cursor record changed: " + oldDocument._id + "   " + oldDocument._sync + "   " + newDocument._sync)
                    var rec = cur_rec.get();
                    if (rec && oldDocument._id == rec._id) {
                        cur_rec.set(newDocument);
                    }
                },
                removed: function(oldDocument, index) {
                    console.log("cursor record removed: " + oldDocument._id + "   " + oldDocument._sync)
                    var rec = cur_rec.get();
                    if (rec && oldDocument._id == rec._id) {
                        cur_rec.set({});
                    }
                }
            })
            return cursor;
        },
        current: function () {
            console.log("getting current from records... ");
            return cur_rec.get();
        },
        list_fields: function() {
            return record_fields.filter(function (f) {return f.type != 'array';});
        },
        get_field_value: function (rec, fn) {
            return rec[fn];
        },
        recordTemplate: function () {
            return record_template;
        },
        view_definition: function () {
            return thisRecord.listview_definition;
        }
    };

    this.recordlist_events = {
        "click .js-add-record": function (event) {
            event.preventDefault();
            record = {};
            record_fields.filter(function (f) {return f.type == 'array';}).forEach( function (detail) {
                if (!record[detail.name]) record[detail.name] = [];
            });
            console.log("nuevo");
            cur_rec.set(record);
        },
        "click .js-record-row": function (event) {
            cur_rec.set(this);
        },
        "click .js-delete-record": function (event) {
            event.preventDefault();
            Meteor.call("baserecord_delete", collection._name, this._id);
        },
        "scroll .js-recordlist_container": function (event, instance) {
            event.preventDefault();
            var threshold, target = instance.$("#showMoreResults");
            if (!target.length) return;
            var container = event.target;
            //threshold = instance.$(container).scrollTop() + instance.$(container).height() - target.height() - 100;
            threshold = instance.$(container).offset().top + instance.$(container).height() - target.height() + 5;
            if (target.offset().top <= threshold) {
                if (!target.data("visible")) {
                    instance.limit.set(instance.limit.get() + 20);
                    target.data("visible", true);
                }
            } else {
                if (target.data("visible")) {
                    // console.log("target became invisible (below viewable arae)");
                    target.data("visible", false);
                }
            }
        },
    };


    this.record_helpers = {
        record: function () {
            return cur_rec.get();
        },
        get_field_value: function (rec, fn) {
            return rec[fn];
        },
        get_field_readonly: function (rec, fn) {
            return !canFocus(rec, fn);
        },

        get_detail_records: function (rec, dn) {
            return rec[dn];
        },
        get_row_field_value: function (rec, dn, idx, fn) {
            return rec[dn][idx][fn];
        },
        fields: function() {
            return record_fields.filter(function (f) {return f.type != 'array';});
        },
        detail_fields: function() {
            return record_fields.filter(function (f) {return f.type == 'array';});
        },
        create_object: function(params) {
            return params.hash;
        },
        input_template: function(ftype) {
            return ftype + "_input";
        },
    };

    var canFocus = function (rec, fn) {
        var canfocus = true;
        if (event_handler) {
            if (event_handler["canFocus"]) canfocus = event_handler["canFocus"](rec, fn);
        }
        return canfocus;
    }

    this.recordview_onCreated = function() {
    };

    this.record_events = {
        "click .js-add-record-row": function (event) {
            event.preventDefault();
            record =cur_rec.get();
            if (record) {
                record_fields.filter(function (f) {return f.type == 'array';}).forEach( function (detail) {
                    if (!record[detail.name]) record[detail.name] = [];
                    var new_row = {};
                    detail.fields.forEach( function (field) {
                        new_row[field.name] = '';
                    });
                    record[detail.name].push(new_row);
                });
                cur_rec.set(record);
            }
        },
        "change .js-record-field": function (event) {
            record = cur_rec.get();
            fn= event.target.name;
            value = event.target.value;
            console.log(fields_map);
            switch (fields_map[fn].type)  {
                case 'integer':
                case 'real':
                    record[fn] = Number(value);
                    break;
                case 'date':
                default:
                    record[fn] = value;

            }

            if (event_handler) {
                if (event_handler["changed"]) event_handler["changed"](record, fn);
                if (event_handler["changed " + event.target.name]) event_handler["changed " + fn](record)
            }
            cur_rec.set(record);
        },
        "focus .js-record-field": function (event) {
            record = cur_rec.get();
            fn = event.target.name;
            return !canFocus(record, fn);
        },
        "change .js-row-field": function (event) {
            record = cur_rec.get();
            dn = event.target.attributes.detailname.value;
            rownr = event.target.attributes.row.value;
            fn = event.target.name;
            record[dn][rownr][fn] = event.target.value;
            if (event_handler) {
                if (event_handler["changed " +  dn]) event_handler["changed " + dn](record, rownr, fn);
                if (event_handler["changed " + dn + "." + fn]) event_handler["changed " + dn + "." + fn](record, rownr)
            }
            cur_rec.set(record);
        },
        "click .js-delete-row": function (event) {
            event.preventDefault();
            record = cur_rec.get();
            dn = event.target.attributes.detailname.value;
            rownr = event.target.attributes.row.value;
            record[dn].splice(rownr, 1);
            cur_rec.set(record);
        },
        "submit .js-record-form": function (event) {
            // Prevent default browser form submit
            event.preventDefault();

            record = cur_rec.get();
            // Insert a task into the collection
            Meteor.call("baserecord_save", collection._name, record, function (error, result) {
                console.log("returning from save:" + error + " -- " + result.ok);
                if (!error && result.ok) {
                    console.log("result ok: settings current_record with sync: " + result.record._sync)
                    if (event_handler) {
                        if (event_handler["saved"]) event_handler["saved"](record);
                    }
                    cur_rec.set(result.record);
                }
            });
        },
    };

}

registerRecord = function (collection, recordlist_template, record_template, fields, event_handler) {
    Template[recordlist_template] = new Template(recordlist_template, Template.recordlist.renderFunction);
    Template[record_template] = new Template(record_template, Template.record.renderFunction);

    var baserecord = new Record(collection, record_template, fields, event_handler);

    Template[recordlist_template].onCreated(baserecord.listview_onCreated);
    Template[recordlist_template].onRendered(function () {
        console.log("template rendered");
    });
    Template[recordlist_template].onDestroyed(baserecord.listview_onDestroy);
    Template[recordlist_template].helpers(baserecord.recordlist_helpers);
    Template[recordlist_template].events(baserecord.recordlist_events);

    Template[record_template].onCreated(baserecord.recordview_onCreated);
    Template[record_template].onRendered(function () {
        console.log("RECORD TEMPLATE Rendered");
    });
    Template[record_template].onDestroyed(function () {
        console.log("RECORD TEMPLATE destroyed");
    });
    Template[record_template].helpers(baserecord.record_helpers);
    Template[recordlist_template].events(baserecord.record_events);
    return baserecord;
}



