trans_count = new Mongo.Collection("trans_count");

Template.transactions_report.onCreated(function () {
    instance = this;
    instance.cur_rec = ReactiveVar(null);
    instance.parameters = new ReactiveVar({
        start: moment().subtract(90, 'days').format('YYYY-MM-DD'),
        end: moment().add(3, 'days').format('YYYY-MM-DD'),
        apartment: '',
    });
    account_balances_subscription = instance.subscribe('Account_Balances');
    apartments_subscription = instance.subscribe('Apartments');
    instance.autorun( function () {
        start = instance.parameters.get().start;
        end = instance.parameters.get().end;
        apartment = instance.parameters.get().apartment;
        var query = {date: {$gte: start, $lte: end}}
        if (apartment) query.apartment = apartment;
        transactions_subscription = instance.subscribe('Transactions', {query: query});
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
        start = instance.parameters.get().start;
        end = instance.parameters.get().end;
        apartment = instance.parameters.get().apartment;
        var query = {date: {$gte: start, $lte: end}}
        if (apartment) query.apartment = apartment;
        return Transactions.find(query, {sort: {number:-1}});
    },
    'currencies': ['ARS', 'USD'],
    'users': function () {
        balances = trans_count.find({}).fetch();
        var users = {};
        _(balances).each(function (doc) {
            users[doc.user] = 1;
        })
        return Object.keys(users);
    },
    'get_amount': function(user, currency) {
        balance = trans_count.findOne({user: user, currency: currency});
        return (balance && balance.amount) || 0.0;
    },
    'get_total': function (currency) {
        balances = trans_count.find({currency: currency}).fetch();
        res = 0.0
        _(balances).each(function (doc) {
            res += doc.amount;
        })
        return res;
    },
    'start': function () {
        return Template.instance().parameters.get().start;
    },
    'end': function () {
        return Template.instance().parameters.get().end;
    },
    'cur_apartment': function () {
        return Template.instance().parameters.get().apartment;
    },
    'isARS': function (currency) {
        return currency == 'ARS'
    },
    'cur_record': function () {
        console.log("en cur_record");
        //  console.log(Template.instance().cur_rec.get());
        return Template.instance().cur_rec;
    },
    'get_apartments': function () {
        return Apartments.find({},{sort:{code:1}})
    },
    'isCurrentApartment': function (apartment_code) {
        //  console.log(Template.instance().cur_rec.get());
        return Template.instance().parameters.get().apartment === apartment_code;
    },
})

Template.transactions_report.events( {
    "click .js-record-row": function (event, template) {
        console.log("clicked");
        console.log(this)
        BaseRecord.setWindowRecord(Template.instance().cur_rec, this, BaseRecord.records.Transaction.prototype.fieldDefinitions);
        //template.cur_rec.set(this);
    },
    'click .js-apartment': function(event, template) {
        event.preventDefault();
        var parameters = template.parameters.get();
        parameters.apartment = event.target.attributes.apartment_code.value;
        template.parameters.set(parameters);
    },
    'submit .js-transactions_report-form': function (event, template) {
        event.preventDefault();
        parameters = {
            start:template.$('input[name=start]').val(),
            end: template.$('input[name=end]').val(),
            apartment: template.$('input[name=apartment]').val(),
        }
        template.parameters.set(parameters);
    },
})