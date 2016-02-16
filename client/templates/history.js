var record_fields = [
    ['_sync', 'integer'],
    ['collection', 'string'],
    ['timestamp', 'timestamp'],
    ['username', 'string'],
    ['action', 'string'],
    ['oldRecord', 'object'],
    ['newRecord', 'object'],
];

var eventHandler = {
}

registerRecord(History, 'histories', 'history', record_fields, eventHandler);
