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
    instance.mode = new ReactiveVar('total');
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
            var administration_percents = {};
            _(Apartments.find({}, {code:1, administration_percent:1}).fetch()).each( function (doc) {
                administration_percents[doc.code] = doc.administration_percent;
            });

            _(recs.fetch()).each(function (rec) {
                if (!data[rec.month]) data[rec.month] = {};
                if (!data[rec.month][rec.apartment]) data[rec.month][rec.apartment] = {}
                if (!data[rec.month][rec.apartment][rec.user]) data[rec.month][rec.apartment][rec.user] = 0.0
                if (!data[rec.month][rec.apartment]['total']) data[rec.month][rec.apartment]['total'] = 0.0
                if (!data[rec.month][rec.apartment]['administration']) data[rec.month][rec.apartment]['administration'] = 0.0
                data[rec.month][rec.apartment][rec.user] += rec.amount;
                data[rec.month][rec.apartment]['total'] += rec.amount;
                data[rec.month][rec.apartment]['administration'] += administration_percents[rec.apartment] * rec.amount / 100.0;

                if (!data[rec.month][rec.user]) data[rec.month][rec.user] = {}
                if (!data[rec.month][rec.user]['total']) data[rec.month][rec.user]['total'] = 0.00
                if (!data[rec.month][rec.user]['administration']) data[rec.month][rec.user]['administration'] = 0.00
                data[rec.month][rec.user]['total'] += rec.amount
                data[rec.month][rec.user]['administration'] += administration_percents[rec.apartment] * rec.amount / 100.0;

                if (!data[rec.month]['Total']) data[rec.month]['Total'] = {}
                if (!data[rec.month]['Total']['total']) data[rec.month]['Total']['administration'] = 0.00;
                if (!data[rec.month]['Total']['administration']) data[rec.month]['Total']['total'] = 0.00;
                data[rec.month]['Total']['total'] += rec.amount
                data[rec.month]['Total']['administration'] += administration_percents[rec.apartment] * rec.amount / 100.0;
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
        return Object.keys(Template.instance().records.get());
    },
    'get_apartment_amount': function (month, apartment) {
        var mode = Template.instance().mode.get();
        var data = Template.instance().records.get();
        if (!data[month] || !data[month][apartment]) return "0.00";
        var res = "0.0";
        if (mode == 'total') {
            res = data[month][apartment]['total'];
        } else if (mode == 'administration') {
            res = data[month][apartment]['administration'];
        }
        return res.toFixed(2);
    },
    'get_user_amount': function (month, user) {
        var mode = Template.instance().mode.get();
        var data = Template.instance().records.get();
        if (!data[month] || !data[month][user]) return "0.00";
        var res = "0.0";
        if (mode == 'total') {
            res = data[month][user]['total'];
        } else if (mode == 'administration') {
            res = data[month][user]['administration'];
        }
        return res.toFixed(2);
    },
    'get_total': function (month) {
        var mode = Template.instance().mode.get();
        var data = Template.instance().records.get();
        if (!data[month] || !data[month]['Total']) return "0.00";
        var res = "0.00";
        if (mode == 'total') {
            res = data[month]['Total']['total'];
        } else if (mode == 'administration') {
            res = data[month]['Total']['administration'];
        }
        return res.toFixed(2);
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
    'isCurrentMode': function (mode) {
        return mode == Template.instance().mode.get();
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
    'click .js-mode': function (event, template) {
        template.mode.set(template.$(event.target).parent().attr('mode'));
        Meteor.defer(function () {
           BaseRecord.setupScrollTables(template.$('div.transactions_monthly_report'))
        });
    },
    'click [data-toggle=collapse]': function (event, template) {
        event.preventDefault();
        var selector = event.target.attributes.target.value;
        template.$(selector).collapse('toggle');
        console.log("TOGGLE");
    }
})