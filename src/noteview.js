const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");

const NoteView=React.createClass({
	componentDidMount:function(){
		//load data from firebase
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		return E(CMView,this.props)
	}
})
module.exports=NoteView;
