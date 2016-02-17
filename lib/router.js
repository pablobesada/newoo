
Router.route('/test', {
    template: 'infiniteExample',
});

Router.route('/', {
    template: 'home',
    data: {template: 'transactions'}
});

Router.route('/apartments', {
    template: 'apartments'
});

Router.route('/transactions', {
    template: 'transactions'
});


Router.route('/history', {
    template: 'histories'
});



Router.route('/report/transactions', {
    template: 'transactions_report'
});