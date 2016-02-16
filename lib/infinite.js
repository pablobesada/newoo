if (Meteor.isServer) {

} else if (Meteor.isClient) {

    var ITEMS_INCREMENT = 20;
    Session.setDefault('itemsLimit', ITEMS_INCREMENT);
    //Meteor.subscribe('Transactions', Session.get('itemsLimit'));
    console.log("aca")
    Deps.autorun(function() {
        Meteor.subscribe('Transactions', Session.get('itemsLimit'));
    });

    Template.infiniteExample.helpers({
        items: function () {
            console.log("y aca")
            console.log(Transactions.find().count())
            return Transactions.find();
        },
        moreResults:function() {
            // If, once the subscription is ready, we have less rows than we
            // asked for, we've got all the rows in the collection.
            return !(Transactions.find().count() < Session.get("itemsLimit"));
        }
    });

    // whenever #showMoreResults becomes visible, retrieve more results
    function showMoreVisible() {
        var threshold, target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(this).scrollTop() + $(this).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                // console.log("target became visible (inside viewable area)");
                target.data("visible", true);
                Session.set("itemsLimit",
                    Session.get("itemsLimit") + ITEMS_INCREMENT);
            }
        } else {
            if (target.data("visible")) {
                // console.log("target became invisible (below viewable arae)");
                target.data("visible", false);
            }
        }
    }

// run the above func every time the user scrolls
    $(window).scroll(showMoreVisible);

}