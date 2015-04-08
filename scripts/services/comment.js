'use strict'

app.factory('Comment', function(FURL, $firebase){
	var ref = new Firebase(FURL);

	var Comment = {
		comments: function(taskId) {
			return $firebase(ref.child('comments').child(taskId)).$asArray();
		},

		addComment: function(taskId, comment) {
			var task_comments = this.comments(taskId);
			comment.datetime = Firebase.ServerValue.TIMESTAMP;

			console.log(taskId + " just got this comment: " + JSON.stringify(comment));

			if(task_comments) {
				return task_comments.$add(comment);
			}
		}
	};

	return Comment;
});