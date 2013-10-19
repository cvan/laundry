var restify = require('restify');

// // Creates a JSON client.
// var client = restify.createJsonClient({
//     url: 'https://api.twilio.com'
// });

// client.basicAuth('ACea48ba030c98bce233f61bf2912ad549', 'f3128cbd59337438c49126436627e506');

// function respond(req, res, next) {
//     client.post('/2010-04-01/Accounts/ACea48ba030c98bce233f61bf2912ad549/SMS/Messages.json',
//         {From: '16502273217', To: req.params.phone || '', Body: 'Laundry ready!'}, function(err, req, res, obj) {
//         assert.ifError(err);
//         console.log('%d -> %j', res.statusCode, res.headers);
//         console.log('%j', obj);
//     });
//     res.setHeader('content-type', 'application/json');
//     res.send({sucesss: true});
// }

var twilio = require('twilio');

// Create a new REST API client to make authenticated requests against the
// twilio back end.
var client = new twilio.RestClient('ACea48ba030c98bce233f61bf2912ad549',
                                   'f3128cbd59337438c49126436627e506');

function sms(recipient) {
    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialzation for you.
    client.sms.messages.create({
        to: recipient,
        from: '16502273217',
        body: 'Laundry done!'
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);

            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
}

function respond(req, res, next) {
    sms(req.params.phone);
    res.setHeader('content-type', 'application/json');
    res.send({sucesss: true});
}

var server = restify.createServer();
server.use(restify.bodyParser());
server.post('/notify', respond);

server.listen(5000, function() {
    console.log('%s listening at %s', server.name, server.url);
});
