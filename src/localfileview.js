const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
require("./loadfile");

const LocaFileView=React.createClass({
	componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,contextTypes:{
		listen:PT.func,
		getter:PT.func
	}
	,render:function(){
		return E(CMView,this.props)
	}
});
module.exports=LocaFileView;