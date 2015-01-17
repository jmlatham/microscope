Posts = new Mongo.Collection('posts');

Posts.allow({
//	insert: function(userId, doc) {
//    	// only allow posting if you are logged in
//		return !! userId; 
//	}
	update: function(userId, post) {
		return ownsDocument(userId, post);
	},
	remove: function(userId, post) {
		return ownsDocument(userId, post);
	}
});

Posts.deny({
	update: function(userId, post, fieldNames) {
		// may only edit the following two fields:
		return (_.without(fieldNames, 'url', 'title').length > 0); 
	}
});

validatePost = function (post) { 
	var errors = {};
	if ( !post.title ) {
		errors.title = "Please fill in a headline";
	}
	if ( !post.url ) {
		errors.url = "Please fill in a URL";
	}
	return errors; 
}

Meteor.methods({
	postInsert: function(postAttributes) {
//		check(Meteor.userId(), String);
		check(this.userId, String);
		check(postAttributes, {
			title: String,
			url: String
		});
		var errors = validatePost(postAttributes); 
		if ( errors.title || errors.url ) {
			throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
		}
		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		if (postWithSameLink) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id, 
			author: user.username, 
			submitted: new Date()
		});
		var postId = Posts.insert(post);
		return {
			_id: postId
		}; 
	},
	postUpdate: function(postAttributes){
		check(this.userId, String);
		check(postAttributes, {
			title: String,
			url: String
		});
		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		if (postWithSameLink) {
			return {
				urlExists: true,
				_id: postWithSameLink._id
			}
		}
		var user = Meteor.user();
		/*var post = _.extend(postAttributes, {
			userId: user._id, 
			author: user.username, 
			submitted: new Date()
		});*/
		var currentPostId = Posts.findOne({title: postAttributes.title});
		var postId = Posts.update(
			currentPostId, 
			{$set: postAttributes}, 
			function(error) { 
				if (error) {
					// display the error to the user
					alert(error.reason); 
				} else {
//this doesn't seem to be working correctly - keep getting a 404!!
					Router.go('postPage', {_id: currentPostId});
				}
			}
		);
		return {
			_id: postId
		}; 
	}
});