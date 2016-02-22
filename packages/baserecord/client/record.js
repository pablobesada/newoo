
BaseRecord = {}

ListViewDefinition = function(collection, record_template, record_class, cur_rec) {
    var thisRecordDefinition = this;

    this.listview_onCreated = function () {
        var instance = this;
        instance.cur_rec = cur_rec
        instance.limit = new ReactiveVar(30);
        instance.event_handler = record_class.prototype.eventHandlers;
        instance.fields_map = {};
        instance.columns = thisRecordDefinition.listview_definition;
        if (!record_class.prototype.eventHandlers) record_class.prototype.eventHandlers = {};
        record_class.prototype.fieldDefinitions.forEach(function (f) {
            if (f.type != 'array') {
                instance.fields_map[f.name] = f
            } else {
                detail_map = {};
                f.fields.forEach(function (rf) {
                    detail_map[rf.name] = rf;
                });
                instance.fields_map[f.name] = detail_map;
            }

        });
        instance.autorun(function () {
            var limit = instance.limit.get();
            subscription = instance.subscribe(collection._name, {msg: 'record', options: {limit: limit}}, {
                onStop: function (error) {
                    console.log("en OnStop de Subscribe " + collection._name + "  " + error);
                }
            });
        });
    };

    this.listview_onDestroy = function () {
        console.log("Destroying template");
    }

    this.recordlist_helpers = {
        records: function () {
            var cursor = collection.find({}, {sort: {number: 1}});
            return cursor;
        },
        current: function () {
            return Template.instance().cur_rec.get();
        },
        list_fields: function () {
            return record_class.prototype.fieldDefinitions.filter(function (f) {
                return f.type != 'array';
            });
        },
        get_field_value: function (rec, fn) {
            return rec[fn];
        },
        recordTemplate: function () {
            return record_template;
        },
        get_columns: function () {
            return Template.instance().columns;
        },
        get_column_value: function (rec, column_idx) {
            return rec[Template.instance().columns[column_idx]];
        }
    };


    this.recordlist_events = {
        "click .js-add-record": function (event, template) {
            event.preventDefault();
            //var record = Object.create(record_class);
            var record = {};
            record_class.prototype.fieldDefinitions.forEach(function (field) {
                if (field.type == 'array') {
                    if (!record[field.name]) record[field.name] = [];
                } else {
                    record[field.name] = BaseRecord.utils['blank_' + field.type];
                }
            });
            decorateRecord(record, record_class.prototype.fieldDefinitions);
            if (template.event_handler) {
                if (template.event_handler['onCreate']) template.event_handler['onCreate'](record);
            }
            setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
        },
        "click .js-record-row": function (event, template) {
            record = this;
            decorateRecord(record, record_class.prototype.fieldDefinitions);
            setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions);
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
                    target.data("visible", false);
                }
            }
        },
    };
};

function decorateRecord(record, fieldDefs) {
    record._observer = new ReactiveVar(0);
    record._observe_func = function(changes) {
        if (record._observer) record._observer.set(record._observer.get()+1);
    }
    Object.observe(record, record._observe_func)
    fieldDefs.forEach(function (field) {
        if (field.type == 'array') {
            //decorateArray(record, field);


            record[field.name]._observe_func = function (changes) {
                record._observer.set(record._observer.get()+1);
                _(changes).each(function(change) {
                    if (change.type=='add') decorateRecord(record[field.name][change.name], field.fields)
                })
            }
            Object.observe(record[field.name], record[field.name]._observe_func);
            _(record[field.name]).each(function (row) {
                decorateRecord(row, field.fields);
            })



        }
    });
}

function undecorateRecord(record, fieldDefs) {
    Object.unobserve(record, record._observe_func);
    delete record._observer;
    delete record._observe_func;

    fieldDefs.forEach(function (field) {
        if (field.type == 'array') {
            Object.unobserve(record[field.name], record[field.name]._observe_func);
            delete record[field.name]._observer
            delete record[field.name]._observe_func
            _(record[field.name]).each(function (row) {
                undecorateRecord(row, field.fields);
            })
        }
    });
}

/*
function decorateRecord(record, fieldDefs) {
    fieldDefs.forEach(function (field) {
        if (field.type == 'array') {
            record[field.name]._length = new ReactiveVar(record[field.name].length);
            decorateArray(record, field);
            _(record[field.name]).each (function (row) {
                decorateRecord(row, field.fields);
                row.__record = record;
            });
        } else {
            if (typeof record[field.name] !== ReactiveVar) record['_'+field.name] = new ReactiveVar(record[field.name]);
            Object.defineProperty(record, field.name, {
                get: function () {
                    //if (field.name == "description") console.log("description.. returning: " + record["_" + field.name].get())
                    return record["_" + field.name].get();
                },
                set: function (v) {
                    //if (field.name == "percent") console.log("setting percent.. : " + v)
                    record["_" + field.name].set(v);
                    if (record.__record) {
                        record.__record.__has_changes = true;
                    } else {
                        record.__has_changes = true;
                    }
                },
            })
        }
    });
}
*/

function setWindowRecord(cur_rec, record, fieldsDef) {
    if (record) {
        if (!record._observer || !(record._observer instanceof ReactiveVar)) {
            decorateRecord(record, fieldsDef);
        }
    }
    cur_rec.set(record);
}


ViewDefinition = function(collection, record_template, record_class, cur_rec) {
    var thisRecordDefinition = this;

    this.recordview_onCreated = function() {
        var instance = this;
        instance.cur_rec = cur_rec;
        if (instance.data.record_variable) {
            instance.cur_rec = instance.data.record_variable;
        }
        instance.event_handler = record_class.prototype.eventHandlers;
        instance.observerHandle = null;
        instance.fields_map = {};
        if (!record_class.prototype.eventHandlers) record_class.prototype.eventHandlers = {};
        record_class.prototype.fieldDefinitions.forEach(function (f) {
            if (f.type != 'array') {
                instance.fields_map[f.name] = f
            } else {
                detail_map = {};
                f.fields.forEach(function (rf) {
                    detail_map[rf.name] = rf;
                });
                instance.fields_map[f.name] = detail_map;
            }

        });
        instance.castValue = function(type, value) {
            switch (type)  {
                case 'integer':
                case 'real':
                    return Number(value);
                    break;
                case 'date':
                default:
                    return value;
            }
        }
        instance.canFocus = function (rec, fn) {
            var canfocus = true;
            if (instance.event_handler) {
                if (instance.event_handler["canFocus"]) canfocus = instance.event_handler["canFocus"](rec, fn);
                if (canfocus && instance.event_handler["canFocus " + fn]) canfocus = instance.event_handler["canFocus " + fn](rec);
            }
            return canfocus;
        }

        instance.autorun( function () {
            var rec = instance.cur_rec.get();
            if (!rec) return;
            subscription = instance.subscribe(collection._name, {query: {_id: rec._id}, options: {limit: 1}}, {
                onStop: function () {
                    if (instance.observerHandle)
                    {
                        instance.observerHandle.stop();
                        instance.observerHandle = null;
                    }
                }
            })
            if (this.observerHandle) this.observerHandle.stop();
            var cursor = collection.find({_id: rec._id});
            instance.observerHandle = cursor.observe({
                changed: function (newDocument, oldDocument, index) {
                    console.log("record changed");
                    if (rec && oldDocument._id == rec._id) {
                        setWindowRecord(instance.cur_rec, newDocument, record_class.prototype.fieldDefinitions);
                    }
                },
                removed: function (oldDocument, index) {
                    if (rec && oldDocument._id == rec._id) {
                        setWindowRecord(instance.cur_rec, null, record_class.prototype.fieldDefinitions);
                    }
                }
            })
        })
    };

    this.recordview_onDestroyed = function () {
    }

    this.record_helpers = {
        afterRender: function () {
            Meteor.defer(function () {$('.input-group.date').datepicker({
                format: "yyyy-mm-dd",
                autoclose: true,
            })});
        },
        record: function () {
            return Template.instance().cur_rec.get();
        },
        get_field_value: function (rec, fn) {
            rec._observer.get();
            return rec[fn];
        },
        get_field_readonly: function (rec, fn) {
            return !Template.instance().canFocus(rec, fn);
        },
        get_detail_records: function (rec, dn) {
            rec._observer.get();
            //return [rec[dn][0]];
            return rec[dn];
        },
        get_row_field_value: function (rec, dn, idx, fn) {
            //return rec[dn][idx]["_"+fn].get();
            if (rec[dn][idx]._observer) rec[dn][idx]._observer.get();
            return rec[dn][idx][fn];
        },
        fields: function() {
            return record_class.prototype.fieldDefinitions.filter(function (f) {return f.type != 'array';});
        },
        detail_fields: function() {
            return record_class.prototype.fieldDefinitions.filter(function (f) {return f.type == 'array';});
        },
        create_object: function(params) {
            return params.hash;
        },
        get_input_template: function(ftype) {
            return ftype + "_input";
        },
    };

    this.record_events = {
        "click .js-add-record-row": function (event, template) {
            event.preventDefault();
            var record = template.cur_rec.get();
            if (!record) return;
            var dn = event.target.attributes.fieldname.value;
            var canAddRow = true;
            if (template.event_handler) {
                if (template.event_handler["canAddRow"]) canAddRow = template.event_handler["canAddRow"](record, dn);
                if (canAddRow && template.event_handler["canAddRow " + dn]) canAddRow = template.event_handler["canAddRow " + dn](record)
            }
            if (canAddRow) {
                record_class.prototype.fieldDefinitions.filter(function (f) {return f.type == 'array';}).forEach( function (detail) {
                    if (!record[detail.name]) {
                        record[detail.name] = [];
                    }
                    var new_row = {};
                    detail.fields.forEach( function (field) {
                        new_row[field.name] = BaseRecord.utils['blank_' + field.type];
                    });
                    if (template.event_handler) {
                        if (template.event_handler['onCreateRow']) template.event_handler['onCreateRow'](record, detail.name, new_row);
                        if (template.event_handler['onCreateRow ' + detail.name]) template.event_handler['onCreateRow ' + detail.name](record, new_row);
                    }
                    record[detail.name].push(new_row);
                });
                //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
            }
        },
        "change .js-record-field": function (event, template) {
            var record = template.cur_rec.get();
            var fn = event.target.name;
            record[fn] = template.castValue(template.fields_map[fn].type, event.target.value);
            if (template.event_handler) {
                if (template.event_handler["changed"]) template.event_handler["changed"](record, fn);
                if (template.event_handler["changed " + event.target.name]) template.event_handler["changed " + fn](record)
            }
            //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
        },
        "focus .js-record-field": function (event, template) {
            var record = template.cur_rec.get();
            var fn = event.target.name;
            return !template.canFocus(record, fn);
        },
        "change .js-row-field": function (event, template) {
            var record = template.cur_rec.get();
            var dn = event.target.attributes.detailname.value;
            var rownr = event.target.attributes.row.value;
            var fn = event.target.name;
            record[dn][rownr][fn] = template.castValue(template.fields_map[dn][fn].type, event.target.value);
            if (template.event_handler) {
                if (template.event_handler["changed " +  dn]) template.event_handler["changed " + dn](record, rownr, fn);
                if (template.event_handler["changed " + dn + "." + fn]) template.event_handler["changed " + dn + "." + fn](record, rownr)
            }
            //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
        },
        "click .js-delete-row": function (event, template) {
            event.preventDefault();
            var record = template.cur_rec.get();
            if (!record) return;
            var dn = event.target.attributes.detailname.value;
            var rownr = event.target.attributes.row.value;
            event.preventDefault();
            var canDeleteRow = true;
            if (template.event_handler) {
                if (template.event_handler["canDeleteRow"]) canDeleteRow = template.event_handler["canDeleteRow"](record, dn);
                if (canDeleteRow && template.event_handler["canDeleteRow " + dn]) canDeleteRow = template.event_handler["canDeleteRow " + dn](record)
            }
            if (canDeleteRow) {
                record[dn].splice(rownr, 1);
                //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
            }
        },
        "click .js-delete-record": function (event, template) {
            event.preventDefault();
            var canDelete = true;
            if (template.event_handler) {
                if (template.event_handler["canDelete"]) canDelete = template.event_handler["canDelete"](record);
            }
            if (canDelete) {
                if (window.confirm("Seguro quieres borrar este registro?")) {
                    Meteor.call("baserecord_delete", collection._name, this._id, function () {
                        setWindowRecord(template.cur_rec, null, record_class.prototype.fieldDefinitions)
                    });
                }
            }
        },

        "click .js-save-record": function (event, template) {
            // Prevent default browser form submit
            event.preventDefault();
            record = template.cur_rec.get();
            // Insert a task into the collection
            if (!record) return;
            var canSave = true;
            if (template.event_handler) {
                if (template.event_handler["canSave"]) canSave = template.event_handler["canSave"](record);
                if (canSave && template.event_handler["beforeSave"]) {
                    template.event_handler["beforeSave"](record);
                    //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
                }
            }
            if (canSave) {
                undecorateRecord(record, record_class.prototype.fieldDefinitions);
                //record.accounts[0].pepito = 'yuyu'
                //setWindowRecord(template.cur_rec, null, record_class.prototype.fieldDefinitions)
                Meteor.call("baserecord_save", collection._name, record, function (error, result) {

                    if (!error && result.ok) {

                        console.log("result ok: settings current_record with sync: " + result.record._sync)
                        if (template.event_handler) {
                            if (template.event_handler["saved"]) template.event_handler["saved"](record);
                        }
                        setWindowRecord(template.cur_rec, result.record, record_class.prototype.fieldDefinitions)

                    } else {
                        console.log("error returned from save")
                        console.log(arguments);
                    }
                });
                //setWindowRecord(template.cur_rec, record, record_class.prototype.fieldDefinitions)
            }
        },
    };
}

BaseRecord.utils = {}
BaseRecord.utils.blank_string = "";
BaseRecord.utils.blank_date = "";
BaseRecord.utils.blank_integer = 0;
BaseRecord.utils.blank_real = 0.0;


BaseRecord.registerRecord = function (collection, record_class) {
    var recordlist_template = collection._name + "_listview";
    var record_template = collection._name + "_view";
    var cur_rec = new ReactiveVar(null);

    Template[recordlist_template] = new Template(recordlist_template, Template.recordlist.renderFunction);
    var listviewdef = new ListViewDefinition(collection, record_template, record_class, cur_rec);
    Template[recordlist_template].onCreated(listviewdef.listview_onCreated);
    Template[recordlist_template].onRendered(function () {});
    Template[recordlist_template].onDestroyed(listviewdef.listview_onDestroy);
    Template[recordlist_template].helpers(listviewdef.recordlist_helpers);
    Template[recordlist_template].events(listviewdef.recordlist_events);
    Template[record_template] = new Template(record_template, Template.record.renderFunction);
    var viewdef = new ViewDefinition(collection, record_template, record_class, cur_rec);
    Template[record_template].onCreated(viewdef.recordview_onCreated);
    Template[record_template].onRendered(function () {
        this.$('.input-group.date').datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
        });
    });
    Template[record_template].helpers(viewdef.record_helpers);
    Template[record_template].events(viewdef.record_events);
    return listviewdef;
}

BaseRecord.records = {}
BaseRecord.setWindowRecord = setWindowRecord;


