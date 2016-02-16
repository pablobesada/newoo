
var record_fields = [
    {name: '_sync', type: 'integer'},
    {name: 'code', type: 'string'},
    {name: 'address', type: 'string'},
    {name: 'accounts', type: 'array', fields: [
        {name:'code', type: 'string'},
        {name: 'percent', type: 'real'}
    ]}
];


record = registerRecord(Apartments, 'apartments', 'apartment', record_fields);
var listview_definition = ['code', 'address'];
record.listview_definition = listview_definition;


/*
Template.apartments = new Template('apartments', Template.recordlist.renderFunction);
Template.apartment = new Template('apartment', Template.record.renderFunction);

var baserecord = new Record(Apartments, 'apartment', record_fields);

Template.apartments.onCreated(baserecord.on_created);
Template.apartments.helpers(baserecord.recordlist_helpers);
Template.apartments.events(baserecord.recordlist_events);
Template.apartment.helpers(baserecord.record_helpers);
Template.apartment.events(baserecord.record_events);
*/

