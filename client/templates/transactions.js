

var listview_definition = ['number', 'date','description', 'apartment', 'currency', 'amount']

var Transaction = function() {};

Transaction.prototype.fieldDefinitions = [
    {name: '_sync', type: 'integer'},
    {name: 'number', type: 'integer'},
    {name: 'date', type: 'date'},
    {name: 'description', type: 'string'},
    {name: 'amount', type: 'real'},
    {name: 'currency', type: 'string'},
    {name: 'apartment', type: 'string'},
    {name: 'user', type: 'string'},
    {name: 'accounts', type: 'array', fields: [
        {name: 'code', type: 'string'},
        {name: 'percent', type: 'real'},
        {name: 'amount', type: 'real'},
    ]},
];

Transaction.prototype.eventHandlers = {
    "changed amount": function () {
        this.accounts.forEach(function (row) {
            row.amount = this.amount * row.percent / 100.0;
        })
    },
    "changed": function (fieldname) {
        this.accounts.forEach(function (row) {
            row.amount = this.amount * row.percent / 100.0;
        })
    },
    "canFocus": function (fieldname) {
        return true;
        if (this.number == 5) return true;
        if (fieldname != 'number') return false;
        return true;
    },
    "changed accounts": function (rownr, fieldname) {
        console.log("changed accounts");
    },
    "changed accounts.percent": function (rownr) {
        this.accounts[rownr].amount = this.amount * record.accounts[rownr].percent / 100.0;
    },
    "saved": function (record) {
        console.log("saved");
    },
    "onCreate": function () {
        //newRecord.date = moment().format("%Y-%m-%d")
        this.date = moment().format("Y-M-D")
        this.user = Meteor.user().username;
    }

}



record = BaseRecord.registerRecord(Transactions, 'transactions', 'transaction', Transaction);
console.log(Template.transactions)
console.log(Template['transactions'])
record.listview_definition = listview_definition;