var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var Viewers={
  default:require('./cmview'),
  taisho:require("./taishoview")
}

var TwoColumn = React.createClass({
  getInitialState:function() {
    return {};
  },
  render:function(){
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"default"];
  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:1}},
  				E(LeftView,{side:0,menu:this.props.leftMenu,
            doc:this.props.leftDoc,docs:this.props.leftDocs})),
  			E("div",{style:{flex:1}},
  				E(RightView,{side:1,menu:this.props.rightMenu,
            doc:this.props.rightDoc,docs:this.props.rightDocs}))
  		)
  	)
  }
});
module.exports=TwoColumn;