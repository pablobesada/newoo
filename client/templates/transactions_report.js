trans_count = new Mongo.Collection("trans_count");

Template.transactions_report.onCreated(function () {
    var instance =  this;
    if (instance.data.period) {
        instance.period = instance.data.period
    } else {
        instance.period = new ReactiveVar({
            start: moment().subtract(3, 'months').format('YYYY-MM-DD'),
            end: moment("2050-12-31", "YYYY-MM-DD").format('YYYY-MM-DD'),
        });
    }
    instance.apartment = new ReactiveVar(instance.data.apartment || '');
    instance.account = new ReactiveVar(instance.data.account || null);
    console.log("instance");
    console.log(instance);
    account_balances_subscription = instance.subscribe('Account_Balances');
    var apartments_subscription = instance.subscribe('Apartments');
    instance.autorun( function () {
        console.log("start")
        var start = instance.period.get().start;
        var end = instance.period.get().end;
        console.log(instance);
        console.log(instance.apartment);
        var apartment = instance.apartment.get();
        var account = instance.account.get();
        console.log(apartment);
        var query = {date: {$gte: start, $lte: end}}
        var options = {sort: {date: -1, number: -1}}
        if (apartment && apartment != 'ALL') query.apartment = apartment;
        var transactions_subscription = instance.subscribe('Transactions', {query: query});
        transactions_subscription.ready()
    })
});


Template.transactions_report.onRendered(function () {
    this.$('.input-daterange').datepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
    });
})

Template.transactions_report.helpers( {
    'transactions': function () {
        var start = Template.instance().period.get().start;
        var end = Template.instance().period.get().end;
        var apartment = Template.instance().apartment.get();
        var account = Template.instance().apartment.get();
        var query = {date: {$gte: start, $lte: end}}
        if (apartment && apartment != 'ALL') {
            query.apartment = apartment;
        } else if (apartment == 'ALL') {
        } else {
                query.apartment = '';
        }
        return Transactions.find(query, {sort: {date: -1, number:-1}});
    },
    'currencies': ['ARS', 'USD'],
    'users': function () {
        return ['MEC','PDB','DAB','MAB','GMB'];
    },
    'get_amount': function(user, currency) {
        var balance = trans_count.findOne({user: user, currency: currency});
        return ((balance && balance.amount) || 0.0).toFixed(2);
    },
    'get_total': function (currency) {
        var balances = trans_count.find({currency: currency}).fetch();
        res = 0.0
        _(balances).each(function (doc) {
            res += doc.amount;
        })
        return res.toFixed(2);
    },
    'start': function () {
        return Template.instance().period.get().start;
    },
    'end': function () {
        return Template.instance().period.get().end;
    },
    'cur_apartment': function () {
        return Template.instance().apartment.get();
    },
    'cur_account': function () {
        return Template.instance().account.get();
    },
    'match_account': function (transaction) {
        var acc = Template.instance().account.get();
        if (!acc || !transaction.accounts) return true;
        console.log(acc, transaction)
        for (var i=0;i<transaction.accounts.length; i++) {
            if (transaction.accounts[i].user == acc && transaction.accounts[i].amount != 0) return true;
        }
        return false;
    },

    'get_amount': function (transaction) {
        var acc = Template.instance().account.get();
        if (!acc || !transaction.accounts) return transaction.amount;
        for (var i=0;i<transaction.accounts.length; i++) {
            if (transaction.accounts[i].user == acc) return transaction.accounts[i].amount;
        }
        return null
    },

    'isARS': function (currency) {
        return currency == 'ARS'
    },
    'get_apartments': function () {
        return Apartments.find({},{sort:{code:1}})
    },
    'isCurrentApartment': function (apartment_code) {
        //  console.log(Template.instance().cur_rec.get());
        return (Template.instance().apartment.get() === apartment_code) ||
            (Template.instance().apartment.get() === '' && apartment_code === '')
    },
});

Template.transactions_report.events( {
    "click .js-record-select": function (event, template) {
        event.preventDefault();
        var record = this;
        var cur_rec_variable = new ReactiveVar();
        var nextTab = BaseRecord.addTab("Transactions" + " " + record.number);
        Blaze.renderWithData(Template["Transactions_view"], {record_variable: cur_rec_variable}, $("#"+nextTab)[0]);
        BaseRecord.setWindowRecord(cur_rec_variable, record, BaseRecord.records.Transaction.prototype.fieldDefinitions);

    },
    'click .js-apartment': function(event, template) {
        event.preventDefault();
        template.apartment.set(template.$(event.target).parent().attr('apartment_code'));
    },
    'click .js-new-transaction': function(event, template) {
        event.preventDefault();
        var newrec = BaseRecord.createRecord(BaseRecord.records.Transaction);
        newrec.apartment = template.apartment.get();
        BaseRecord.records.Transaction.prototype.eventHandlers['changed apartment'](newrec);
        var cur_rec_variable = new ReactiveVar();
        var nextTab = BaseRecord.addTab();
        Blaze.renderWithData(Template["Transactions_view"], {record_variable: cur_rec_variable}, $("#"+nextTab)[0]);
        BaseRecord.setWindowRecord(cur_rec_variable, newrec, BaseRecord.records.Transaction.prototype.fieldDefinitions);
    },
    'submit .js-transactions_report-form': function (event, template) {
        event.preventDefault();
        var period = {
            start:template.$('input[name=start]').val(),
            end: template.$('input[name=end]').val(),
        };
        template.period.set(period);
        template.apartment.set(template.$('input[name=apartment]').val());
        template.account.set(template.$('input[name=account]').val());
    },
    'click [data-toggle=collapse]': function (event, template) {
        event.preventDefault();
        var selector = event.target.attributes.target.value;
        template.$(selector).collapse('toggle');
        console.log("TOGGLE");
    }
});