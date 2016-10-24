const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const Login=require("../remote/login");
const MarkupMenu=require("./markupmenu");
const NoteTab=React.createClass({
	contextTypes:{
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired,
		action:PT.func.isRequired
	}
	,getInitialState:function(){
		return {user:""};
	}
	,componentDidMount:function(){
		this.context.listen("loggedin",this.loggedin,this);
		this.context.listen("logout",this.logout,this);
	}
	,componentWillUnmount:function(){
		this.unlistenAll(this);
	}
	,loggedin:function(opts){
		this.setState(opts);
	}
	,logout:function(user){
		this.setState({token:"",user:""});
	}
	,renderMarkupMenu:function(){
		if (!this.state.user) return;
		return E(MarkupMenu,this.props);
	}
	,render:function(){
		return E("div",{},
			E(Login,this.props),
			this.renderMarkupMenu()
		)
	}
});
module.exports=NoteTab;