const React=require("react");
const E=React.createElement;
//var store=require("../stores/user");
//var action=require("../actions/user");
const Firebase=require("./firebase");
const loginbuttonstyle={verticalAlign: "middle",cursor:"pointer"};

var LoginBox=React.createClass({
  getInitialState: function () {
  	const store=Firebase(this.props.dataurl);
    return {store,user:null,token:null};
  }
  ,componentDidMount:function(){
  	
  }
  ,signOut:function() {
    this.state.store.logout(function(){
    	this.setState({user:null,token:null});
    }.bind(this));
  }
  ,googleSignIn:function() {
    this.state.store.login(function(user,token){
    	this.setState({user,token});
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
         E("span",{style:{fontSize:"60%"}}, this.state.user.displayName)
        ,E("button",{onClick:this.signOut},"Sign out")
        ,E("img",{width:40,height:40,style:{borderRadius:"50%"},src:this.state.user.photoURL})
       )
    	);
  }
  ,render:function() {
     return (this.state.user)?this.renderUser():this.renderSignin();
  }
})

module.exports=LoginBox;