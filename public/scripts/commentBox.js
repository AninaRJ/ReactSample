// Comment class that takes care of display of each comment
var Comment = React.createClass({
  rawMarkup: function(){
	var md = new Remarkable();
	var rawMarkup = md.render(this.props.children.toString());
	return { __html : rawMarkup};
  },
  
  clickDelete: function(e){
	  e.preventDefault();
	  var comment = {
			  "id": this.props.commentId,
			  "author": this.props.author,
			  "text": this.props.commentText
	  }
	 this.props.onCommentDelete(comment);
  },
	
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
          <button className="deleteComment" onClick={this.clickDelete} title="Delete Comment">X</button>
        </h2>
        <span dangerouslySetInnerHTML = {this.rawMarkup()} />
      </div>
    );
  }
});

// CommentList class that does a higher level up in displaying content
var CommentList = React.createClass({
	removeComment: function(comment){
		  this.props.deleteComment(comment);
	  },
  render: function() {
	 var commentNodes = this.props.data.map(function(comment){
		 return(
			 <Comment author = {comment.author} key={comment.id} commentText={comment.text} commentId={comment.id} onCommentDelete={this.removeComment}>
			 	{comment.text}
			 </Comment>
		 );
	 }.bind(this));
	 
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

// CommentForm has a form for user to submit and add a new comment
var CommentForm = React.createClass({
	getInitialState: function(){
		return{author: '', text: ''};
	},
	
	handleAuthorChange: function(e){
		this.setState({author: e.target.value});
	},
	
	handleTextChange: function(e){
		this.setState({text: e.target.value});
	},
	
	handlePost: function(e){
		e.preventDefault();
		
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		
		if(!text || !author){
			return;
		}
		
		this.props.onCommentSubmit({author: author, text: text});
		this.setState({author: '', text: ''});
	},
	
    render: function() {
	    return (
	      <form className="commentForm" onSubmit={this.handlePost}>
	      	<h3>Enter a new comment </h3>
	      	<input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange}/>
	      	<br/>
	      	<input type="text" placeholder="Say something!" value={this.state.text} onChange={this.handleTextChange}/>
	      	<br/>
	      	<input type="submit" value="Post"/>
	      </form>
	    );
	}
});

// Main definition of the page
var CommentBox = React.createClass({
	getInitialState: function(){
		return{data: []};
	},
	
	// Form submit method defined here
	handleCommentSubmit: function(comment){
		var comments = this.state.data;
		
		comment.id = Date.now();
		var newComments = comments.concat([comment]);
		this.setState({data: newComments})
		$.post({
			url: this.props.url,
			dataType: "json",
			data: comment,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				this.setState({data: comments});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	
	/* self defined function that gets called from componentDidMount which is a built-in function
	 * componentDidMount will call once when the CommentBox class gets loaded. 
	 */
	loadCommentsFromServer: function(){
		$.get({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	componentDidMount: function(){
		this.loadCommentsFromServer();
		//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	
	deleteComment: function(comment){
		// Removes the selected comment
		$.post({
			url: this.props.url + "/remove",
			dataType: "json",
			data: comment,
			success: function(data){
				this.setState({data: data});
			}.bind(this)
		});
	},
	
	render: function(){
		return (
			<div className="commentBox">
				<CommentList data={this.state.data} deleteComment={this.deleteComment}></CommentList>
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>
		);
	}
});

ReactDOM.render(<CommentBox url="/api/comments" pollInterval={2000}></CommentBox>, document.getElementById('content'));