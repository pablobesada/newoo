Apartment = function() {}

Apartment.prototype.collection_name = "Apartments"
Apartment.prototype.fieldDefinitions = [
    {name: '_sync', type: 'integer'},
    {name: 'code', type: 'string'},
    {name: 'address', type: 'string'},
    {name: 'administration_percent', type: 'real'},
    {name: 'accounts', type: 'array', fields: [
        {name:'user', type: 'string'},
        {name: 'percent', type: 'real'}
    ]}
];


var view_definition = {code:'codigo', 'address': 'direccion', 'administration_percent': '% administracion'}
Apartment.prototype.view_definition = view_definition;


listviewdef = BaseRecord.registerRecord(Apartment);
var listview_definition = [
    {label:'codigo', field: 'code'},
    {label:'direccion', field: 'address'}];
listviewdef.listview_definition = listview_definition;

