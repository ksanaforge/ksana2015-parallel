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
  				E(LeftView,{side:0,menu:this.props.leftMenu,rule:this.props.rule,
            doc:this.props.leftDoc,docs:this.props.leftDocs,scrollTo:this.props.scrollTo})),
  			E("div",{style:{flex:1}},
  				E(RightView,{side:1,menu:this.props.rightMenu,rule:this.props.rule,
            doc:this.props.rightDoc,docs:this.props.rightDocs,scrollTo:this.props.scrollTo}))
  		)
  	)
  }
});
module.exports=TwoColumn;