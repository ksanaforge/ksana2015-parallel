const React=require("react");
const E=React.createElement;
const NoteControls=require("./notecontrol");
const NoteList=require("./notelist");
const Login=require("./login");

const NoteTab=React.createClass({
	render:function(){
		return E("div",{},
			E(Login,this.props),
			E(NoteControls,this.props),
			E(NoteList,this.props)
			)
	}
});
module.exports=NoteTab;