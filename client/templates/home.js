// counter starts at 0
Session.setDefault('counter', 0);

Template.home.helpers({
    get_template: function () {
        var data = Router.current().data();
        if (data.collection) return data.collection + "_listview";
    },
    counter: function () {
        return Session.get('counter');
    }
});

Template.home.events({
    'click button': function () {
        // increment the counter when button is clicked
        Session.set('counter', Session.get('counter') + 1);
    }
});