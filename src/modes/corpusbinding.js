const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus}=require("ksana-corpus");
const Viewers={
  default:require('../cmview/corpusview')
}
const Menus={
  default:require("../corpusmenu")
}
const CorpusBinding = React.createClass({
  getInitialState:function() {
    return {};
  },
  componentDidMount:function(){
    openCorpus(this.props.leftCorpus,(err,leftCor)=>{
      openCorpus(this.props.rightCorpus,(err2,rightCor)=>{
        this.setState({rightCor,leftCor});
      })
    });
  },
  render:function(){
    if (!this.state.rightCor||!this.state.leftCor) {
      return E("div",{},"loading");
    }
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"default"];
    var LeftMenu=Menus[this.props.leftMenu||"default"];
    var RightMenu=Menus[this.props.RightMenu||"default"];

  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:this.props.leftFlex||1}},
  				E(LeftView,{side:0,cor:this.state.leftCor,corpus:this.props.leftCorpus,
            store:this.props.store,menu:LeftMenu,address:this.props.leftAddress})),
  			E("div",{style:{flex:this.props.rightFlex||1}},
  				E(RightView,{side:1,cor:this.state.rightCor,corpus:this.props.rightCorpus,
            store:this.props.store,menu:RightMenu,address:this.props.rightAddress}))
  		)
  	)
  }
});
module.exports=CorpusBinding;