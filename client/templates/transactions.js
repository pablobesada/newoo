

var listview_definition = [
    {label: 'numero', field: 'number'},
    {label: 'fecha', field: 'date'},
    {label: 'descripcion', field: 'description'},
    {label: 'depto', field: 'apartment'},
    {label: 'moneda', field: 'currency'},
    {label: 'monto', field: 'amount'}];

var view_definition = {'number':'numero', 'date': 'fecha', 'description': 'descripcion', 'apartment': 'depto', 'currency': 'moneda', 'amount': 'monto'}
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
        {name: 'user', type: 'string'},
        {name: 'percent', type: 'real'},
        {name: 'amount', type: 'real'},
    ]},
];

Transaction.prototype.eventHandlers = {
    "changed apartment": function (record) {
        Meteor.call("baserecord_getRecord", "Apartments", {code: record.apartment}, function (error, result) {
            var apartment = result;
            console.log(apartment);
            if (apartment) {
                record.accounts.length = 0;
                apartment.accounts.forEach(function (aprow) {
                    var transRow = {};
                    transRow.user = aprow.user;
                    transRow.percent = aprow.percent;
                    transRow.amount = record.amount * aprow.percent / 100.0;
                    record.accounts.push(transRow);
                })
            }
        });
    },
    "changed amount": function (record, fieldname) {
        record.description = record.description + "A";
        record.accounts.forEach(function (row) {
            row.amount = record.amount * row.percent / 100.0;
        })
    },
    "canFocus number": function (record) {
        return false;
    },
    "changed accounts": function (record, rownr, fieldname) {
        console.log("changed accounts");
    },
    "changed accounts.percent": function (record, rownr) {
        record.accounts[rownr].amount = record.amount * record.accounts[rownr].percent / 100.0;
    },
    "saved": function (record) {
        console.log("saved");
    },
    "canSave": function (record) {
        var sumup = record.accounts.reduce(function (row1, row2) {return {amount: row1.amount+row2.amount, percent: row1.percent+row2.percent}}, {amount: 0, percent: 0});
        console.log(sumup);
        if (sumup.percent != 100.0) return false;
        if (sumup.amount != record.amount) return false;
        return true;
    },
    "beforeSave": function (record) {
        if (!record.number) {
            record.number = Transactions.findOne({}, {fields:{number:1}, sort: {number: -1}, limit :1}).number + 1;
        }
    },
    "canDelete": function (record) {
        return true;
    },
    "onCreate": function (record) {
        //newRecord.date = moment().format("%Y-%m-%d")
        record.date = moment().format("YYYY-MM-DD")
        record.user = Meteor.user().username;
    },
    "canAddRow": function (record, fieldname) {
        if (fieldname == "accounts") {
            return true;
        }
    },
    "canAddRow accounts": function (record) {
        return true;
    },
    "canDeleteRow": function (record, fieldname) {
        if (fieldname == "accounts") {
            return true;
        }
    },
    "canDeleteRow accounts": function (record) {
        return true;
    },
    /*
    "onCreateRow": function (record, detailname, newRow) {
        if (detailname == 'accounts') {
            newRow.percent = 0.0;
        }
    },
    "onCreateRow accounts": function (record, newRow) {
        newRow.user = Meteor.user().username;
    },*/

}

console.log("en transactions.js")

listviewdef = BaseRecord.registerRecord(Transactions, Transaction);
listviewdef.listview_definition = listview_definition;

BaseRecord.records.Transaction = Transaction