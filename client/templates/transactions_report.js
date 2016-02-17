
Template.transactions_report.onCreated(function () {
    instance = this;
    instance.parameters = new ReactiveVar({
        start: moment().subtract(90, 'days').format('YYYY-MM-DD'),
        end: moment().add(3, 'days').format('YYYY-MM-DD'),
    });
    instance.autorun( function () {
        start = instance.parameters.get().start;
        end = instance.parameters.get().end;
        subscription = instance.subscribe('Transactions', {msg: 'report', query: {date: {$gte: start, $lte: end}}});
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
        return Transactions.find({});
    },
    'start': function () {
        return Template.instance().parameters.get().start;
    },
    'end': function () {
        return Template.instance().parameters.get().end;
    }
})

Template.transactions_report.events( {
    'submit .js-transactions_report-form': function (event, template) {
        event.preventDefault();
        parameters = {
            start:template.$('input[name=start]').val(),
            end: template.$('input[name=end]').val(),
        }
        template.parameters.set(parameters);
    },
})