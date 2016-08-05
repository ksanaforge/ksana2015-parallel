var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CMView=require('./cmview');
var TwoColumn = React.createClass({
  getInitialState:function() {
    return {};
  },
  render:function(){
  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:1}},E(CMView)),
  			E("div",{style:{flex:1}},E(CMView))
  		)
  	)
  }
});
module.exports=TwoColumn;