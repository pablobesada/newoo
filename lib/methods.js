Meteor.methods({


    insertTransaction: function (r) {
        // Make sure the user is logged in before inserting a task
        //if (! Meteor.userId()) {
        //    throw new Meteor.Error("not-authorized");
        //}

        Transactions.insert({
            number: r.number,
            description: r.description,
            createdAt: new Date(),
            currency: r.currency,
            amount: r.amount,
            apartment: r.apartment,
            accounts: r.accounts,
            //userId: Meteor.userId(),
            //userName: Meteor.user().username
        });
    },
});

