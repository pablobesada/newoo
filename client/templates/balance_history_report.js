
Template.balance_history_report.onCreated(function () {
    var instance =  this;
    var timestamp = '2020-12-31T00:00:00';
    instance.params = new ReactiveVar({timestamp: timestamp});
    instance.balances = new ReactiveVar({});
    instance.alerts = new ReactiveVar([]);
    instance.subscribe("Histories", {}, {sort: {timestamp: 1}});
});


Template.balance_history_report.onRendered(function () {
})

Template.balance_history_report.helpers( {
    'balances': function () {
        console.log("en balances")
        var template = Template.instance();
        var params = template.params.get();
    },
    'getAmount': function (user, currency) {
        var template = Template.instance();
        var balances = template.balances.get();
        if (!balances[user] || !balances[user][currency]) return 'N/A';
        return template.balances.get()[user][currency].toFixed(2);
    },
    'timestamp': function () {
        return Template.instance().params.get().timestamp;
    },
    get_alerts: function () {
        return Template.instance().alerts.get();
    }

});

Template.balance_history_report.events( {
    'submit .js-history_report-form': function (event, template) {
        event.preventDefault();
        var params = template.params.get();
        params.timestamp = template.$('input[name=timestamp]').val();
        console.log(params.timestamp)
        template.params.set(params);
        Meteor.call("getHistoryBalance", params.timestamp, false, function (error, result){
            console.log(result)
            if (result.ok) {
                console.log(result.balances)
                template.balances.set(result.balances)
            } else {
                var alerts = template.alerts.get();
                alerts.push({type:'danger', title: result.error});
                template.alerts.set(alerts);
            }

        });

    },
    'click [data-toggle=collapse]': function (event, template) {
        event.preventDefault();
        var selector = event.target.attributes.target.value;
        template.$(selector).collapse('toggle');
        console.log("TOGGLE");
    },
    "click .js-record-select": function (event, template) {
        event.preventDefault();
        var record = this.record;
        var cur_rec_variable = new ReactiveVar();
        var nextTab = BaseRecord.addTab("Transactions" + " " + record.number);
        Blaze.renderWithData(Template["Transactions_view"], {record_variable: cur_rec_variable}, $("#"+nextTab)[0]);
        BaseRecord.setWindowRecord(cur_rec_variable, record, BaseRecord.records.Transaction.prototype.fieldDefinitions);
    },

});