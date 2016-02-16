var record_fields = [
    {name: '_sync', type: 'integer'},
    {name: 'number', type: 'integer'},
    {name: 'date', type: 'date'},
    {name: 'description', type: 'string'},
    {name: 'amount', type: 'real'},
    {name: 'currency', type: 'string'},
    {name: 'apartment', type: 'string'},
    {name: 'accounts', type: 'array', fields: [
        {name: 'code', type: 'string'},
        {name: 'percent', type: 'real'},
        {name: 'amount', type: 'real'},
    ]},
];

var listview_definition = ['number', 'date','description', 'apartment', 'currency', 'amount']
var eventHandler = {
    "changed amount": function (record) {
        record.accounts.forEach(function (row) {
            row.amount = record.amount * row.percent / 100.0;
        })
    },
    "changed": function (record, fieldname) {
        record.accounts.forEach(function (row) {
            row.amount = record.amount * row.percent / 100.0;
        })
    },
    "canFocus": function (record, fieldname) {
        if (record.number == 5) return true;
        if (fieldname != 'number') return false;
        return true;
    },
    "changed accounts": function (record, rownr, fieldname) {
        console.log("changed accounts");
    },
    "changed accounts.percent": function (record, rownr) {
        record.accounts[rownr].amount = record.amount * record.accounts[rownr].percent / 100.0;
    },
    "saved": function (record) {
        console.log("saved");
    }

}

record = registerRecord(Transactions, 'transactions', 'transaction', record_fields, eventHandler);
console.log(Template.transactions)
console.log(Template['transactions'])
record.listview_definition = listview_definition;