

var listview_definition = [
    {label: 'numero', field: 'number'},
    {label: 'fecha', field: 'date'},
    {label: 'descripcion', field: 'description'},
    {label: 'depto', field: 'apartment'},
    {label: 'moneda', field: 'currency'},
    {label: 'monto', field: 'amount'}];

var view_definition = {number:'numero', 'date': 'fecha', 'description': 'descripcion', 'apartment': 'depto', 'currency': 'moneda', 'amount': 'monto'}

var Transaction = function() {}
Transaction.prototype.collection_name ="Transactions";
Transaction.prototype.view_definition = view_definition;


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
        if (record.apartment) {
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
        } else {
            record.accounts.length = 0;
            ['MEC','PDB','DAB','MAB','GMB'].forEach(function (acc) {
                var transRow = {};
                transRow.user = acc;
                transRow.percent = 20.0;
                transRow.amount = record.amount * transRow.percent / 100.0;
                record.accounts.push(transRow);
            })

        }
    },
    "changed amount": function (record, fieldname) {
        record.accounts.forEach(function (row) {
            row.amount = record.amount * row.percent / 100.0;
        })
    },
    "canFocus number": function (record) {
        return false;
    },
    "canFocus accounts.percent": function (record, rownr) {
        console.log("canFocus accounts.percent")
        if (record.apartment) return false;
        return true;
    },

    "changed accounts": function (record, rownr, fieldname) {
        console.log("changed accounts");
    },
    "changed accounts.percent": function (record, rownr) {
        record.accounts[rownr].amount = record.amount * record.accounts[rownr].percent / 100.0;
    },
    "changed accounts.amount": function (record, rownr) {
        var sum = _.reduce(record.accounts, function(memo, row){ return memo + row.amount; }, 0);
        record.amount = sum;
        //_.map(record.accounts, function (row) {row.percent = row.amount / record.amount * 100.0}) //mmm... es medio raro esto..
    },
    "saved": function (record) {
        console.log("saved");
    },
    "canSave": function (record) {
        if (Meteor.user().username != 'PDB' && moment().diff(moment(record.date, "YYYY-MM-DD"), 'days') > 15) return "No se puede modificar porque el registro tiene mas de 15 dias";
        var sumup = record.accounts.reduce(function (row1, row2) {return {amount: row1.amount+row2.amount, percent: row1.percent+row2.percent}}, {amount: 0, percent: 0});
        console.log(sumup);
        var currencies = ['ARS', 'USD']
        if (sumup.percent != 100.0) return "Los porcentajes deben sumar 100";
        if (Math.abs(sumup.amount - record.amount) > 0.0005) return "Los montos en las cuentas deben ser iguales al monto total";
        if (currencies.indexOf(record.currency) < 0) return "La moneda es incorrecta";
        if (record.apartment != '' && !Apartments.findOne({code: record.apartment})) return "El departamento es incorrecto";
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
        record.currency = 'ARS'
    },
    "canAddRow": function (record, fieldname) {
        if (fieldname == "accounts") {
            return true;
        }
    },
    "canAddRow accounts": function (record) {
        if (record.apartment) return false;
        return true;
    },
    "canDeleteRow": function (record, fieldname) {
        if (record.apartment) return false;
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

listviewdef = BaseRecord.registerRecord(Transaction);
listviewdef.listview_definition = listview_definition;

BaseRecord.records.Transaction = Transaction

//var subscription2 = instance.subscribe(collection._name, {query: {}, options: {sort: {number: -1}, limit: 1}});
Template.Transactions_view.onCreated(function () {
    var instance = this;
    var subscription2 = instance.subscribe("Transactions", {query: {}, options: {sort: {number: -1}, limit: 1}});
    var subscription3 = instance.subscribe("Apartments");
    console.log("Transactions_view:oncreated")

})