
var History = function() {}

History.prototype.fieldDefinitions = record_fields = [
    ['_sync', 'integer'],
    ['collection', 'string'],
    ['timestamp', 'timestamp'],
    ['username', 'string'],
    ['action', 'string'],
    ['oldRecord', 'object'],
    ['newRecord', 'object'],
];



BaseRecord.registerRecord(History, 'histories', 'history', History);
