'use strict';

app.controller('BrowseController', function($scope, $routeParams, toaster, Task, Auth, Comment, Offer) {

	$scope.searchTask = '';		
	$scope.tasks = Task.all;

	$scope.signedIn = Auth.signedIn;

	$scope.listMode = true;

	$scope.user = Auth.user;
	
	if($routeParams.taskId) {
		var task = Task.getTask($routeParams.taskId).$asObject();
		$scope.listMode = false;
		setSelectedTask(task);	
	}	
		
	function setSelectedTask(task) {
		$scope.selectedTask = task;
		
		// We check isTaskCreator only if user signedIn 
		// so we don't have to check every time normal guests open the task
		if($scope.signedIn()) {

			Offer.isOffered(task.$id).then(function(data){
				$scope.alreadyOffered = data
			});

			// Check if the current login user is the creator of selected task
			$scope.isTaskCreator = Task.isCreator;
			
			// Check if the selectedTask is open
			$scope.isOpen = Task.isOpen;

			$scope.isAssignee = Task.isAssignee;
			$scope.isCompleted = Task.isCompleted;	
		}

		$scope.comments = Comment.comments(task.$id);
		$scope.offers = Offer.offers(task.$id);

		$scope.block = false;

		$scope.isOfferMaker = Offer.isMaker;
	};

	// --------------- TASK ---------------	

	$scope.cancelTask = function(taskId) {
		Task.cancelTask(taskId).then(function() {
			toaster.pop('success', "This task is cancelled successfully.");
		});
	};

	$scope.addComment = function() {
		var comment = {
			content: $scope.content,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		}

		Comment.addComment($scope.selectedTask.$id, comment).then(function() {
			$scope.content = '';
		})
	};

	$scope.makeOffer = function() {
		var offer = {
			total: $scope.total,
			description: $scope.description,
			uid: $scope.user.uid,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};

		Offer.makeOffer($scope.selectedTask.$id, offer).then(function(){
			toaster.pop('success', 'Your offer has been placed');
			$scope.total = '';
			$scope.description = '';
			// we don't let the same user make more than one offer, so the offer modal is disabled and the Bid Now button is removed
			$scope.block = true;
			$scope.alreadyOffered = true;

		});
	};

	$scope.cancelOffer = function(offerId) {
		Offer.cancelOffer($scope.selectedTask.$id, offerId).then(function(){
			toaster.pop('success', "Your offer has been cancelled");

// Then the current user can make a different offer, so we turn the button back on.
			$scope.alreadyOffered = false;
			$scope.block = false;
		});
	};

	$scope.acceptOffer = function(offerId, runnerId) {
		Offer.acceptOffer($scope.selectedTask.$id, offerId, runnerId)
			.then(function(){
				toaster.pop('success', 'Offer is accepted');
				console.log('accepting offer');
				Offer.notifyRunner($scope.selectedTask.$id, runnerId);
			});
	};

	$scope.completeTask = function(taskId) {
		Task.completeTask(taskId).then(function(){
			toaster.pop('success', 'Task marked complete');
		});
	};

	$scope.verifyTask = function(taskId) {
		Task.verifyTask(taskId).then(function(){
			toaster.pop('success', 'Task verified and closed');
		});
	}
});
