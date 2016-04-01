Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

/*
function(doc) {
    var n = doc.record.number;
    var a = Number(doc.record.amount);
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
            total[n] = total[n] - lastamount + a;
            lastamount = a;
            break;
    }
    print(doc.timestamp, doc.record.number, doc.action, a, total[n], lastamount);
    lastnumber = doc.record.number;
    lastaction = doc.record.action;
}
*/