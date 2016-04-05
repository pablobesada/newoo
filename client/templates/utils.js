Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

/*
var ff= function(doc) {
    var n = doc.record.number;
    var a = Number(doc.record.amount);
    done[n] = n;
    if (typeof total[n] == 'undefined') total[n] = 0.0
    switch (doc.action) {
        case 'D':
            total[n] = total[n] - lastamount; lastamount = 0;
            break;
        case 'I':
            if (doc.record.number == lastnumber) {
                total[n] = total[n] - lastamount;
            }
            total[n] = total[n] + a;
            lastamount = a;
            break;
        case 'U':
            if (doc.record.number == lastnumber) {
                total[n] = total[n] - lastamount + a;
            } else {
                total[n] = total[n] + a;
            }
            lastamount = a;
            break;
    }
    print(doc._id, doc.timestamp, doc.record.number, doc.action, a, total[n], lastamount);
    lastnumber = doc.record.number;
    lastaction = doc.record.action;
}

function sumTotals(total) {
var tt = 0.0
  for (var k in total) {
    tt += total[k]
  }
  print(tt)
}

 var gg = function (record) { if (record.amount != total[record.number]) print(record.number, record.amount, total[record.amount]); delete done[record.number]}

 currency='ARS';limit=900000;done={};total={};lastaction=null;lastnumber=null;db.Histories.find({collection:'Transactions', "record.currency": currency}).sort({"record.number":1, timestamp:1}).limit(limit).forEach(ff);db.Transactions.find({currency:currency}).forEach(gg);sumTotals(total); printjson(done)


// check history integrity - comparando cada transaccion con su historia
cur = {'ARS': 0, 'USD': 0}; usercur = {'MEC': {'ARS': 0, 'USD': 0}, 'PDB':{'ARS': 0, 'USD': 0}, 'DAB': {'ARS': 0, 'USD': 0}, 'MAB': {'ARS': 0, 'USD': 0}, 'GMB': {'ARS': 0, 'USD': 0}}; db.Transactions.find({}).forEach(function (tr) {
    var a = 0; var ac=null;
    cursor = db.Histories.find({collection: 'Transactions', "record.number": tr.number}).sort({timestamp:-1}).limit(1);
    if (!cursor.hasNext()) {
        print(['NO HISTORY: ', tr.number])
        return;
    }
    var h = cursor.next();
    switch (h.action) {
        case 'D':
            print(['DELETED: ', h.record.number])
            break;
        case 'U':
        case 'I':
            if (h.record.currency != tr.currency) {
                print(['WRONG CURRENCY: ', h.record.number])
                break;
            }
            if (h.record.accounts.length != tr.accounts.length) {
                print(['WRONG ROW QTY: ', h.record.number])
                break;
            }
            a = Number(h.record.amount);
            ac = h.record.currency;
            for (var rownr in h.record.accounts) {
                ru = h.record.accounts[rownr].user
                ra = Number(h.record.accounts[rownr].amount);
                if (ru != tr.accounts[rownr].user) {
                    print(["WRONG ROW USER", tr.number])
                    return;
                }
                if (Math.abs(ra - Number(tr.accounts[rownr].amount)) > 0.0005) {
                    print(["WRONG ROW AMOUNT", tr.number, ra, Number(tr.accounts[rownr].amount), ra - Number(tr.accounts[rownr].amount)])
                    return;
                }
                usercur[ru][ac] += ra;
            }
            cur[ac] += a;
            break;
        }
    return;
}); printjson(cur); printjson(usercur);

// check history integrity - comparando cada transaccion con su historia



function getHistorySaldo(d, checkIntegrity) {
    if (d < '2016-04-02T04:15:00') {
        print("La integridad solo funciona a partir del 2016-04-02T04:15:00");
        return {};
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
    cursor = db.Histories.find(q).sort({timestamp: -1});
    while (cursor.hasNext()) {
        var h = cursor.next();
        if (h.record.number in found_transactions) continue;
        found_transactions[h.record.number] = true;
        var tr = null;
        if (checkIntegrity) tr = db.Transactions.findOne({number: h.record.number})
        switch (h.action) {
            case 'D':
                if (checkIntegrity && tr != null) print(["DELETED IN HISTORY: ", h.record.number])
                break;
            case 'U':
            case 'I':
                var tr = db.Transactions.findOne({number: h.record.number})
                if (checkIntegrity && !tr) print(["EXISTS ONLY IN HISTORY: ", h.record.number])
                if (checkIntegrity && h.record.currency != tr.currency) {
                    print(['WRONG CURRENCY: ', h.record.number])
                    break;
                }
                if (checkIntegrity && h.record.accounts.length != tr.accounts.length) {
                    print(['WRONG ROW QTY: ', h.record.number])
                    break;
                }
                a = Number(h.record.amount);
                ac = h.record.currency;
                for (var rownr in h.record.accounts) {
                    ru = h.record.accounts[rownr].user
                    ra = Number(h.record.accounts[rownr].amount);
                    if (checkIntegrity && ru != tr.accounts[rownr].user) {
                        print(["WRONG ROW USER", tr.number])
                        return;
                    }
                    if (checkIntegrity && Math.abs(ra - Number(tr.accounts[rownr].amount)) > 0.0005) {
                        print(["WRONG ROW AMOUNT", tr.number, ra, Number(tr.accounts[rownr].amount), ra - Number(tr.accounts[rownr].amount)])
                        return;
                    }
                    usercur[ru][ac] += ra;
                }
                usercur['TOTAL'][ac] += a;
                break;
        }
    }
    return usercur;
}; printjson(getHistorySaldo(null,true)); printjson(getHistorySaldo('2016-04-02T05:10:00'));
*/

