Meteor.methods({
    getHistoryBalance: function (d, checkIntegrity) {
        if (d < '2016-04-02T04:15:00') {
            return {ok: false, error: "La integridad solo funciona a partir del 2016-04-02T04:15:00"};
        }
        usercur = {
            'TOTAL': {'ARS': 0, 'USD': 0},
            'MEC': {'ARS': 0, 'USD': 0},
            'PDB': {'ARS': 0, 'USD': 0},
            'DAB': {'ARS': 0, 'USD': 0},
            'MAB': {'ARS': 0, 'USD': 0},
            'GMB': {'ARS': 0, 'USD': 0}
        };
        found_transactions = {}
        var q = {collection: 'Transactions'};
        if (!checkIntegrity) q['timestamp'] = {$lte: d};
        cursor = Histories.find(q, {sort: {timestamp: -1}}).fetch()
        for (var i=0;i<cursor.length;i++) {
            var h = cursor[i];
            if (h.record.number in found_transactions) continue;
            found_transactions[h.record.number] = true;
            var tr = null;
            if (checkIntegrity) tr = Transactions.findOne({number: h.record.number})
            switch (h.action) {
                case 'D':
                    if (checkIntegrity && tr != null) {
                        console.log(["DELETED IN HISTORY: ", h.record.number])
                        return {
                            ok: false,
                            error: "Integrity error: transaction deleted in history " + h.record.number
                        };
                    }
                    break;
                case 'U':
                case 'I':
                    var tr = Transactions.findOne({number: h.record.number})
                    if (checkIntegrity && !tr) {
                        console.log(["EXISTS ONLY IN HISTORY: ", h.record.number])
                        return {
                            ok: false,
                            error: "Integrity error: transaction exists only in history " + h.record.number
                        };
                    }
                    if (checkIntegrity && h.record.currency != tr.currency) {
                        console.log(['WRONG CURRENCY: ', h.record.number])
                        return {
                            ok: false,
                            error: "Integrity error: Wrong currency in transaction " + h.record.number
                        };
                    }
                    if (checkIntegrity && h.record.accounts.length != tr.accounts.length) {
                        console.log(['WRONG ROW QTY: ', h.record.number])
                        return {
                            ok: false,
                            error: "Integrity error: Wrong row count in transaction " + h.record.number
                        };
                    }
                    a = Number(h.record.amount);
                    ac = h.record.currency;
                    for (var rownr in h.record.accounts) {
                        ru = h.record.accounts[rownr].user
                        ra = Number(h.record.accounts[rownr].amount);
                        if (checkIntegrity && ru != tr.accounts[rownr].user) {
                            console.log(["WRONG ROW USER", tr.number])
                            return {
                                ok: false,
                                error: "Integrity error: Wrong row user in transaction " + tr.number
                            };
                        }
                        if (checkIntegrity && Math.abs(ra - Number(tr.accounts[rownr].amount)) > 0.0005) {
                            console.log(["WRONG ROW AMOUNT", tr.number, ra, Number(tr.accounts[rownr].amount), ra - Number(tr.accounts[rownr].amount)])
                            return {
                                ok: false,
                                error: "Integrity error: Wrong row amount in transaction " + tr.number + "  " + [ra, Number(tr.accounts[rownr].amount), ra - Number(tr.accounts[rownr].amount)]
                            };
                        }
                        usercur[ru][ac] += ra;
                    }
                    usercur['TOTAL'][ac] += a;
                    break;
            }
        };
        return {ok:true, "balances": usercur};
    }
});
