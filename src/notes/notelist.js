const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const styles={
	notetitle:{textDecoration:"underline",color:"blue",cursor:"pointer"}
}
const NoteList=React.createClass({
	contextTypes:{
		getter:PT.func,
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
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,logout:function(){
		this.props.store.unlistenUserNotes();
	}
	,loggedin:function(){
		this.props.store.getUserNotes(function(usernotes){
			this.setState({usernotes});
		}.bind(this));

		this.props.store.listenUserNotes(function(usernotes){
			this.setState({usernotes});
		}.bind(this));
	}
	,opennote:function(e){
		const id=e.target.dataset.id;
		id&&this.props.store.openNote(id,function(data){
			this.context.action("noteloaded",{id,text:data.content});
		}.bind(this));
	}
	,renderUserNote:function(item,key){
		return E("div",{key},
			E("span",{style:styles.notetitle,
				onClick:this.opennote,"data-id":item.key},item.title)
		);
	}
	,render:function(){
		return E("div",{},
				this.state.usernotes.map(this.renderUserNote)
		);
	}
});
module.exports=NoteList;