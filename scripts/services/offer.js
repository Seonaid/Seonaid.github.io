'use strict'

app.factory('Offer', function(FURL, $firebase, $q, Auth, Task){
	var ref = new Firebase(FURL);
	var user = Auth.user;

	var Offer = {
		offers: function(taskId) {
			return $firebase(ref.child('offers').child(taskId)).$asArray();
		},

		makeOffer: function(taskId, offer) {
			var taskOffers = this.offers(taskId);

			if(taskOffers) {
				return taskOffers.$add(offer);
			}
		},
		isOffered: function(taskId) {
			if(user && user.provider) {
				var d = $q.defer();
				// go see whether the currently signed in user had already made an offer on this task
				$firebase(ref.child('offers').child(taskId).orderByChild('uid').equalTo(user.uid))
					.$asArray()
					.$loaded()
					.then(function(data){
						d.resolve(data.length > 0);
					}, function(){
						d.reject(false);
					});
				return d.promise
			}
		}, 

		isMaker: function(offer) {
			return (user && user.provider && user.uid === offer.uid);
		},

		getOffer: function(taskId, offerId) {
			return $firebase(ref.child('offers').child(taskId).child(offerId));
		}, 

		cancelOffer: function(taskId, offerId){
			return this.getOffer(taskId, offerId).$remove();
		},

		acceptOffer: function(taskId, offerId, runnerId) {
			var o = this.getOffer(taskId, offerId);
			return o.$asObject().$loaded().then(function(offer){
				console.log("Current offer is: ");
				console.log(offer);
				console.log('total is: ');
				console.log(offer.total);

				return o.$update({accepted: true}).then(function(){
					var task = Task.getTask(taskId);
					return task.$update({status: 'assigned', runner: runnerId, agreedPrice: offer.total});
				})
				.then(function(){
					//console.log('adding task to createUserTasks: ' + taskId);
					return Task.createUserTasks(taskId);
				});
			});
		},

		notifyRunner: function(taskId, runnerId) {
			//console.log('notifying runner');
			Auth.getProfile(runnerId).$loaded().then(function(runner){
				var n = {
					taskId: taskId,
					email: runner.email,
					name: runner.name
				};

				var notifications = $firebase(ref.child('notifications')).$asArray();
				console.log(n);
				return notifications.$add(n);
			});
		}

	};

	return Offer;
});