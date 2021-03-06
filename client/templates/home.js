// counter starts at 0
Session.setDefault('counter', 0);

Template.home.helpers({
    get_template: function () {
        var data = Router.current().data();
        if (data.collection) return data.collection + "_listview";
    },
    counter: function () {
        return Session.get('counter');
    },
});

Template.home.events({
    'click #addTab': function (event, template) {
        console.log("add tab");
        var nextTab = BaseRecord.addTab();

        //Blaze.renderWithData(Template.transactions_report, {}, $("#tab"+nextTab)[0])
        //Blaze.renderWithData(Template.Transactions_listview, {}, $("#tab"+nextTab)[0])
    },
    'click .js-remove-tab': function (event, template) {
        template.$("#"+event.target.attributes.tab.value).remove()
        //console.log(event);
        template.$(event.target).parents("li").remove();
        $('#tabs li:first-of-type a').tab('show');

    }
});

Template.home.onRendered(function () {
    var instance = this;
    Meteor.defer(function () {
        instance.$('a[data-toggle=tab]').on('shown.bs.tab', function (e) {
        var target = $(".home-tab-container>.tab-pane.active")
        console.log("refitting")
        BaseRecord.setupScrollTables(target);
        });
    });
})