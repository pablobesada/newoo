trans_count = new Mongo.Collection("trans_count");

Template.transactions_report.onCreated(function () {
    var instance =  this;
    if (instance.data.period) {
        instance.period = instance.data.period
    } else {
        instance.period = new ReactiveVar({
            start: moment().subtract(3, 'months').format('YYYY-MM-DD'),
            end: moment().add(3, 'days').format('YYYY-MM-DD'),
        });
    }
    instance.apartment = new ReactiveVar(instance.data.apartment || '');
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
        var query = {date: {$gte: start, $lte: end}}
        if (apartment) query.apartment = apartment;
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
        var query = {date: {$gte: start, $lte: end}}
        if (apartment) {
            query.apartment = apartment;
        } else {
            query.apartment = '';
        }
        return Transactions.find(query, {sort: {number:-1}});
    },
    'currencies': ['ARS', 'USD'],
    'users': function () {
        var balances = trans_count.find({}).fetch();
        var users = {};
        _(balances).each(function (doc) {
            users[doc.user] = 1;
        })
        return Object.keys(users);
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
    },
    'click [data-toggle=collapse]': function (event, template) {
        event.preventDefault();
        var selector = event.target.attributes.target.value;
        template.$(selector).collapse('toggle');
        console.log("TOGGLE");
    }
});