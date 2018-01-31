var app = angular.module('blog', [ 'vcRecaptcha', 'ngResource' ]);

app.factory('sessionService', function($resource) {
	var service = {};
	var a;
	service.register = function(recaptcha) {
		var Register = $resource("/angular-hashbang/verifyUser.do");
		Register.save({}, recaptcha, a);
	};
	return service;
});

app.controller("recapCtrl",
		function($scope, vcRecaptchaService, sessionService) {
			var vm = this;
			vm.signup = function() {
				if (vcRecaptchaService.getResponse() === "") { // if string is
																// empty
					alert("Please resolve the captcha and submit!")
				} else {
					alert(vcRecaptchaService.getResponse());
					sessionService.register(vcRecaptchaService.getResponse())
				}
			}
		});
