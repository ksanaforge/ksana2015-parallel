const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const store=require("./notestore");
const NoteControl=React.createClass({
	contextTypes:{
		action:PT.func
	}
	,newNote:function(){
		this.props.store.newNote();
	}
	,render:function(){
		return E("div",{},
			E("button",{onClick:this.newNote},"Create")
			);
	}
});
module.exports=NoteControl;