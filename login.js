'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var mysql = require('mysql');
var mongo = require('mongodb');
const nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var app = express();

var url = 'mongodb://localhost:27017/webusers';

MongoClient.connect(url, function(err, database) {
	if(err) {
		console.log(err);
	}
	else {
		console.log('Connected to ',url);
	}
});

var session, usname;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessions({
	secret: '$%^f6$u%^'
}));
app.use('/cssfiles', express.static(__dirname + '/assets'));

app.get('/login', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/redirects');
	}
	response.sendFile('login.html', {root: __dirname});
});

app.post('/login', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/redirects');
	}
	var uname = request.body.username;
	var pass = request.body.password;
	
	MongoClient.connect(url, function(err, database) {
		if(err) {
			console.log(err);
		}
		else {
			var db = database.db('webusers');
			var collection = db.collection('users');
			collection.find({"username":uname, "password":pass}).toArray(function(err, result) {
				if(err) {
					console.log(err);
				}
				else if(result.length) {
					session.uniqueID = request.body.username;
					usname = request.body.username;
				}
				else {
				}
				response.redirect('/redirects');
				database.close();
			});
		}
	});
});

app.post('/signup', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/redirects');
	}
	var uname = request.body.username;
	// var ucasename = uname.charAt(0).toUpperCase() + uname.slice(1);
	var email = request.body.email;
	var pass = request.body.password;

	nodemailer.createTestAccount((err, account) => {

	    let transporter = nodemailer.createTransport({
	        service: 'Gmail',
	        auth: {
	            user: "ronakgupta799@gmail.com", // generated ethereal user
	            pass: "ronak2126"  // generated ethereal password
	        }
	    });

	    let mailOptions = {
	        from: '"Vatsal Shrivastav 👻" <vatsalshrivastav26@gmail.com>', // sender address
	        to: email, // list of receivers
	        subject: 'Email verification for ' + uname + ' ✔', // Subject line
	        text: 'Please click the below link to proceed', // plain text body
	        html: '<p>Please click the below link to proceed</p><a href="abcd.com">Click here</a>' // html body
	    };

	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	            return console.log(error);
	        }
	        console.log('Message sent: %s', info.messageId);
	        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	    });
	});

	MongoClient.connect(url, function(err, database) {
		if(err) {
			console.log(err);
		}
		else {
			var db = database.db('webusers');
			var collection = db.collection('users');
			collection.insert({"username": uname, "email": email, "password": pass, "confirmed":"0"}, function(err, res) {
				if(err) {
					console.log(err);
				}
				else {
					session.uniqueID = request.body.username;
					usname = request.body.username;
				}
				response.redirect('/redirects');
				database.close();
			});
		}
	});
});

app.post('/reset', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/redirects');
	}
	var uname = request.body.username;
	var cpass = request.body.currpassword;
	var npass = request.body.newpassword;
	var rs = -1;
	MongoClient.connect(url, function(err, database) {
		if(err) {
			console.log(err);
		}
		else {
			var db = database.db('webusers');
			var collection = db.collection('users');
			collection.find({"username":uname, "password":cpass}).toArray(function(err, result) {
				rs = result.length;
				database.close();
			});
		}
	});
	
	MongoClient.connect(url, function(err, database) {
		if(err) {
			console.log(err);
		}
		else {
			var db = database.db('webusers');
			var collection = db.collection('users');
			collection.update({"username":uname, "password":cpass}, {$set: {'password':npass}}, function(err, res) {
				if(err) {
					console.log(err);
				}
				else {
					if(rs >0){
						session.uniqueID = request.body.username;
						usname = request.body.username;
					}
				}
				response.redirect('/redirects');
				database.close();
			});
		}
	});
});

app.get('/logout', function(request, response) {
	request.session.destroy();
	response.redirect('/login');
});

app.get('/reset', function(request, response) {
	response.sendFile('reset.html', {root: __dirname});
});

app.get('/signup', function(request, response) {
	response.sendFile('signup.html', {root: __dirname});
});

app.get('/admin', function(request, response) {
	// session = request.session;
	// if(session.uniqueID != 'admin') {
	// 	response.send('Unauthorized Access');
	// }
	response.send('<p style="text-transform: capitalize;">Welcome ' + usname + '! <br>Please verify the link sent to your email ID <a href="/logout">LogOut</a></p>');
});

app.get('/redirects', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/admin');
	}
	else {
		response.send('Invalid credentials! <a href="/login">Back</a>');
	}
});

app.listen(1337, function() {
	console.log('Listening at port 1337');
});