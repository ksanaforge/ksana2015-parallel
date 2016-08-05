var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var ControlPanel = React.createClass({
  getInitialState:function() {
    return {filename:"jin"};
  }
  ,contextTypes:{
  	store:PT.object.isRequired,
  	getter:PT.func.isRequired,
  	action:PT.func.isRequired
  }
  ,load:function(){
  	var fn=this.state.filename;
		this.context.getter("file",fn,function(data){
			action("loaded",data);
		});
  	this.context.action("load","filename");
  }
  ,onFilenameChange:function(e){
  	this.setState({filename:e.target.value});
  }
  ,render:function(){
  	return E("div",{style:this.props.style},
  		E("input",{onChange:this.onFilenameChange,value:this.state.filename}),
  		E("button",{onClick:this.load},"Load"))
  }
});
module.exports=ControlPanel;