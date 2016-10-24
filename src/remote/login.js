const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const Firebase=require("./firebase");
const loginbuttonstyle={verticalAlign: "middle",cursor:"pointer"};

var LoginBox=React.createClass({
  getInitialState: function () {
  	const store=Firebase(this.props.remotedata);
    return {store,user:null,token:null};
  }
  ,getDefaultProps:function(){
    return {lskey:"_user"};
  }
  ,propTypes:{
    lskey:PT.string
  }
  ,contextTypes:{
    action:PT.func,
    registerGetter:PT.func,
    unregisterGetter:PT.func
  }
  ,componentDidMount:function(){
  	if (localStorage.getItem(this.props.lskey)){
  		this.googleSignIn();
  	}
    this.context.registerGetter("user",this.getUser);
  }
  ,componentWillUnmount:function(){
    this.context.unregisterGetter("user");
  }
  ,getUser:function(){
    if (this.state.user) return this.state.user;
  }
  ,signOut:function() {
    const uid=this.state.user.uid;
    this.state.store.logout(function(){
    	this.setState({user:null,token:null});
    	localStorage.setItem(this.props.lskey,"");
      this.context.action("logout",uid);
    }.bind(this));
  }
  ,googleSignIn:function() {
    this.state.store.login(function(user,token){
    	this.setState({user,token});
      this.context.action("loggedin",{user,token});
    	localStorage.setItem(this.props.lskey,user.displayName);
    }.bind(this));
  }
  ,renderSignin:function() {
    return E("p",{style:{textAlign: "center"}},
    		E("img",{style:loginbuttonstyle,src:"img/google-sign-in.png",
    	 onClick:this.googleSignIn})
    	);
  }
  ,renderUser:function() {
    return (
    	E("div",{style:{textAlign:"center"}},
         E("span",{style:{fontSize:"60%"}}, this.state.user.email)
        ,E("button",{className:"mui-btn mui-btn--danger" ,
              onClick:this.signOut},"Sign out")
        ,E("img",{width:40,height:40,style:{borderRadius:"50%"},src:this.state.user.photoURL})
       )
    	);
  }
  ,render:function() {
     return (this.state.user)?this.renderUser():this.renderSignin();
  }
})

module.exports=LoginBox;