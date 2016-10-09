const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const styles={
	notetitle:{textDecoration:"underline",color:"blue",cursor:"pointer"}
}
const NoteList=React.createClass({
	contextTypes:{
		getter:PT.func,
		hasGetter:PT.func,
		action:PT.func,
		listen:PT.func,
		unlistenAll:PT.func
	}
	,getInitialState:function(){
		return {usernotes:[]};
	}
	,componentDidMount:function(){
		this.context.listen("loggedin",this.loggedin,this);
		this.context.listen("logout",this.logout,this);
		this.context.listen("opennote",this.openNote,this);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,logout:function(uid){
		this.props.store.unlistenUserNotes(uid);
		this.setState({usernotes:[]});
	}
	,loggedin:function(){
		this.props.store.getUserNotes(function(usernotes){
			this.setState({usernotes});
		}.bind(this));

		this.props.store.listenUserNotes(function(usernotes){
			this.setState({usernotes});
		}.bind(this));
	}
	,newNote:function(){
		this.props.store.newNote(function(r){
			const id=r.id,text=r.text,title=r.title;
			this.context.action("noteloaded",{id,text,title});
		}.bind(this));
	}	
	,openNote:function(opts){
		opts=opts||{};
		if (!opts.id)return;
		this.props.store.openNote(opts.id,function(data){
			this.context.action("noteloaded",
				{id:opts.id,text:data.text,title:data.title,scrollTo:opts.scrollTo});
		}.bind(this));
	}
	,openNoteClick:function(e){
		const id=e.target.dataset.id;
		id&&this.openNote({id});
	}

	,renderUserNote:function(item,key){
		return E("div",{key},
			E("span",{style:styles.notetitle,
				onClick:this.openNoteClick,"data-id":item.key},item.title)
		);
	}
	,renderButtons:function(){
		if (!this.context.hasGetter("user"))return;
		var user=this.context.getter("user");
		return user?E("button",{onClick:this.newNote
			,className:"mui-btn mui-btn--primary"},"New Note"):null;
	}
	,render:function(){
		return E("div",{},
				this.renderButtons(),
				this.state.usernotes.map(this.renderUserNote)
		);
	}
});
module.exports=NoteList;