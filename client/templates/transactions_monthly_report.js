Transactions_Grouped_By_Month = new Mongo.Collection("Transactions_Grouped_By_Month");

Template.transactions_monthly_report.onCreated(function () {
    console.log("monthly")
    var instance = this;
    console.log("monthly")
    instance.period = new ReactiveVar({
        start: moment().subtract(12, 'months').startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD'),
    });
    var apartments_subscription = instance.subscribe('Apartments');
    instance.records = new ReactiveVar({});
    instance.autorun( function () {
        var start = instance.period.get().start;
        var end = instance.period.get().end;
        var query = {date: {$gte: start, $lte: end}, $and: [{apartment: {$ne: ''}}, {apartment: {$ne: null}}]};
        var subscription = instance.subscribe('Transactions_Grouped_By_Month', {query: query});
        console.log("en autorun")
        if (subscription.ready()) {
            console.log("subscription ready")
            var data = {};
            var start = instance.period.get().start;
            var end = instance.period.get().end;
            var query = {date: {$gte: start, $lte: end}, $and: [{apartment: {$ne: ''}}, {apartment: {$ne: null}}]};
            var recs = Transactions_Grouped_By_Month.find({}, {sort: {_id:-1}});
            _(recs.fetch()).each(function (rec) {
                if (!data[rec.month]) data[rec.month] = {};
                if (!data[rec.month][rec.apartment]) data[rec.month][rec.apartment] = 0.00
                data[rec.month][rec.apartment] += rec.amount;
                if (!data[rec.month][rec.user]) data[rec.month][rec.user] = 0.00
                data[rec.month][rec.user] += rec.amount
                if (!data[rec.month]['Total']) data[rec.month]['Total'] = 0.00
                data[rec.month]['Total'] += rec.amount
            })
            console.log(data)
            instance.records.set(data);
        }
    })
});


Template.transactions_monthly_report.onRendered(function () {
    this.$('.input-daterange').datepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
    });
})

Template.transactions_monthly_report.helpers( {
    'get_months': function () {
        console.log(Template.instance().records.get())
        Meteor.defer(function () {
            BaseRecord.setupScrollTables();
        })

        return Object.keys(Template.instance().records.get());
    },
    'get_apartment_amount': function (month, apartment) {
        var data = Template.instance().records.get();
        if (!data[month] || !data[month][apartment]) return "0.00";
        return data[month][apartment].toFixed(2);
    },
    'get_user_amount': function (month, user) {
        var data = Template.instance().records.get();
        if (!data[month] || !data[month][user]) return "0.00";
        return data[month][user].toFixed(2);
    },
    'get_total': function (month) {
        var data = Template.instance().records.get();
        if (!data[month] || !data[month]['Total']) return "0.00";
        return data[month]['Total'].toFixed(2);
    },
    'get_users': function () {
        return ['MEC','PDB','DAB','MAB','GMB']
    },
    'start': function () {
        return Template.instance().period.get().start;
    },
    'end': function () {
        return Template.instance().period.get().end;
    },
    'get_apartments': function () {
        return Apartments.find({},{sort:{code:1}})
    },
})

Template.transactions_monthly_report.events( {
    'click .js-apartment-amount': function () {
        var apartment = event.target.attributes.apartment.value;
        var month = event.target.attributes.month.value;
        console.log([apartment, month]);
        var nextTab = BaseRecord.addTab("Listado de Movimientos");
        var start = month + "-01";
        var end = moment(start, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
        Blaze.renderWithData(Template["transactions_report"], {period: new ReactiveVar({start:start, end:end}), apartment: apartment}, $("#"+nextTab)[0]);
    },
})