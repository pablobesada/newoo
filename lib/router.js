
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


Router.route('/history', {
    template: 'histories'
});



Router.route('/report/transactions', {
    template: 'transactions_report'
});