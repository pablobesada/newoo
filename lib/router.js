Router.route('/test', {
    template: 'infiniteExample',
});

Router.route('/', {
    template: 'home',
    data: {collection: 'Transactions'}
});

Router.route('/apartments', {
    template: 'home',
    data: {collection: 'Apartments'}
});

Router.route('/transactions', {
    template: 'home',
    data: {collection: 'Transactions'}
});

Router.route('/transactions/:number', {
    subscriptions: function () {
        // returning a subscription handle or an array of subscription handles
        // adds them to the wait list.
        return Meteor.subscribe('Transactions', {query: {number: parseInt(this.params.number)}});
    },
    action: function () {
        console.log(this.params.number);
        var record = Transactions.findOne({number: parseInt(this.params.number)});
        console.log(record);
        if (!this.cur_rec) this.cur_rec = new ReactiveVar();
        if (this.ready()) {
            var record = Transactions.findOne({number: parseInt(this.params.number)});
            this.render('Transactions_view', {data: {record_variable: this.cur_rec}});
            BaseRecord.setWindowRecord(this.cur_rec, record, BaseRecord.records.Transaction.prototype.fieldDefinitions);
        } else {
            this.render('Transactions_view', {data: {record_variable: this.cur_rec}});
        }
    }
});


Router.route('/history', {
    template: 'histories'
});


Router.route('/report/transactions', {
    template: 'transactions_report'
});