
var History = function() {}
History.prototype.collection_name ="Histories"

History.prototype.fieldDefinitions = record_fields = [
    ['_sync', 'integer'],
    ['collection', 'string'],
    ['timestamp', 'timestamp'],
    ['user', 'string'],
    ['action', 'string'],
    ['record', 'object'],
    ['new_id', 'string'],
    ['old_id', 'string'],
];



BaseRecord.registerRecord(History);
