Meteor.startup(function () {
    if (Apartments.find().count() === 0) {
        var data = [
            {code: "RIV2D", _sync:1
            },
            {code: "CAB5B", _sync:1
            },
            {code: "SAL2B", _sync:1
            },
            {code: "CAT1B", _sync:1
            },
        ];

        _.each(data, function(apartment) {
            var apartment_id = Apartments.insert({code: apartment.code});
        });
    }
});