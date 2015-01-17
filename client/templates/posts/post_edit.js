Template.postEdit.events({ 
	'submit form': function(e) {
		e.preventDefault();
		var currentPostId = this._id;
		var postProperties = {
			url: $(e.target).find('[name=url]').val(), 
			title: $(e.target).find('[name=title]').val()
		}
		
		var errors = validatePost(postProperties); 
		if ( errors.title || errors.url ) {
			return Session.set('postEditErrors', errors);
		}

	/*	Posts.update(
			currentPostId, 
			{$set: postProperties}, 
			function(error) { 
				if (error) {
					// display the error to the user
					alert(error.reason); 
				} else {
					Router.go('postPage', {_id: currentPostId});
				}
			}
		);
	*/
		Meteor.call('postUpdate', postProperties, 
			function( error, result ) {
				if (error) {
					//return alert( error.reason );
					throwError( error.reason );
				}
				if (result.urlExists) {
					//alert('This url has already been posted');
					throwError( 'This url has already been posted' );
				}
				Router.go('postPage', {_id: result._id});
			}
		);
	},
	'click .delete': function(e) { 
		e.preventDefault();
		if (confirm("Delete this post?")) { 
			var currentPostId = this._id; 
			Posts.remove(currentPostId); 
			Router.go('postsList');
		} 
	}
});


Template.postEdit.created = function() { 
	Session.set('postEditErrors', {});
}

Template.postEdit.helpers({ 
	errorMessage: function(field) {
		return Session.get('postEditErrors')[field]; 
	},
	errorClass: function (field) {
		return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
	}
});