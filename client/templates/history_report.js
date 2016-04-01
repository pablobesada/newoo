
Template.history_report.onCreated(function () {
    var instance =  this;
    var number = 0;
    if (instance.data && instance.data.record_number) number = instance.data.record_number;
    instance.params = new ReactiveVar({number: number});
    instance.subscribe("Histories", {}, {sort: {timestamp: 1}});
});


Template.history_report.onRendered(function () {
})

Template.history_report.helpers( {
    'records': function () {
        var params = Template.instance().params.get();
        console.log(params.number);
        return Histories.find({"record.number": parseInt(params.number)}, {sort: {timestamp: 1}})
    }
});

Template.history_report.events( {
    'submit .js-history_report-form': function (event, template) {
        event.preventDefault();
        console.log("Aca")
        var params = template.params.get();
        params.number = template.$('input[name=record_number]').val();
        template.params.set(params);
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