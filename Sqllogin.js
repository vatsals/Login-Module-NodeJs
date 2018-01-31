'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var mysql = require('mysql');
const nodemailer = require('nodemailer');
var app = express();

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Vatsal&294',
	database: 'webusers'
});

connection.connect(function(error) {
	if(!!error) {
		console.log(error);
	}
	else {
		console.log('Succesfully connected');
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
	var sql = 'Select * FROM users WHERE username = ' + connection.escape(uname);
	connection.query(sql, function(error, rows, fields) {
		if(!!error) {
			console.log(error);
		}
		else {
			if(rows.length >0){
				if(rows[0].password == pass){
					session.uniqueID = request.body.username;
					usname = request.body.username;
				}
			}
			else {
				
			}
		}
		response.redirect('/redirects');
	});
});

app.post('/signup', function(request, response) {
	session = request.session;
	if(session.uniqueID) {
		response.redirect('/redirects');
	}
	var uname = request.body.username.toUpperCase();
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

	var sql= "insert into users(username, email, password) values ('"+uname+"', '"+email+"', '"+pass+"')";
	connection.query(sql, function(error, rows, fields) {
		if(!!error) {
			console.log(error);
		}
		else {
			session.uniqueID = request.body.username;
			usname = request.body.username;
		}
		response.redirect('/redirects');
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
	var sqlCheck = "Select * FROM users WHERE username = " + connection.escape(uname) + "and password = " + connection.escape(cpass);
	connection.query(sqlCheck, function(error, rows, fields) {
		rs = rows.length;
	});
	var sql= "update users set password = " + connection.escape(npass) + "where username = " + connection.escape(uname) + 'and password = ' + connection.escape(cpass);
	connection.query(sql, function(error, rows, fields) {
		if(!!error) {
			console.log(error);
		}
		else {
			if(rs >0){
				session.uniqueID = request.body.username;
				usname = request.body.username;
			}
		}
		response.redirect('/redirects');
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