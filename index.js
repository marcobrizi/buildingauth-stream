var buildingauth = require('@bibocreation/buildingauth');
var generator = require('nick-generator');
var stream = require('stream');
var MongoClient = require('mongodb').MongoClient;
var miss = require('mississippi');

var remainingUsers = 100;

MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
    console.log("Connected succesfully to server");

    auth = buildingauth({
        db
    });

    var readable = new stream.Readable({
        objectMode: true,
        read: function(size) {
            for (var i = 0; i < remainingUsers && i < size; i++) {
                remainingUsers--;

                var name = generator();
                var username = name.split(" ").join("").toLowerCase().substr(0, 15);
                var password = username.toUpperCase() + "!";
                var email = username + "@" + "cinubo.it";

                this.push({
                    'username': username,
                    'password': password,
                    'email': email
                });
            }

            if (remainingUsers === 0) {
                this.push(null);
            }
        }
    });

    var writable = new stream.Writable({
        objectMode: true,
        write: function(chunk, encoding, callback) {

            console.log(chunk);

            auth.addUser(chunk.username, chunk.password, chunk.email, function(err) {

                if (err) {
                    throw err;
                }

                console.log("user " + chunk.username + " added");
                callback();
            });
        }
    });

    miss.pipe(readable, writable, function(err) {
        if (err) {
            console.error('Stream error!', err)
        }
        db.close();
    });

});
