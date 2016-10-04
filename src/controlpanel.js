var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var Tabs={
	kepan:require("./kepan"),
	login:require("./login")
}
var ControlPanel = React.createClass({
  getInitialState:function() {
    return {order:0};
  }
  ,render:function(){
    var Tab=Tabs[this.props.ControlTab];
  	return E("div",{style:this.props.style},
        Tab?E(Tab,this.props):null
    );
  }
});

module.exports=ControlPanel;