'use strict'

app.factory('Dashboard', function(FURL, $firebase, $q, Task){
	var ref = new Firebase(FURL);

	var Dashboard = {
		getTasksForUser: function(uid) {
			var defer = $q.defer();

			$firebase(ref.child('user_tasks').child(uid))
				.$asArray()
				.$loaded()
				.then(function(tasks){
					defer.resolve(tasks);
				}, function(err){
					defer.reject();
				});

				return defer.promise;
		}

		// getTaskCategories: function(tasks) {
		//  The goal here is to divide up the tasks into 4 categories:
		// 1) "assigned or completed" and current user = poster (user_tasks.type = true)
		// 2) "assigned" and current user = runner (user_tasks.type = false)
		// 3) "verified" and current user = poster
		// 4) "completed or verified" and current user = runner

// actually, the dashboard should provide at least 3 separate list of "things you need to take action on", 
// things that you are waiting on, and "things that are completed (and presumably paid for)"

// I'd also like to add some totals of "Outstanding costs of the tasks people are running for you" 
// and "How much you have earned" sort of thing.
		// }
	};

	return Dashboard;
});