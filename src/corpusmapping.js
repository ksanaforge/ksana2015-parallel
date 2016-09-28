const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus}=require("ksana-corpus");
const Viewers={
  default:require('./corpusview')
}

const CorpusMapping = React.createClass({
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
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"default"];
  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:1}},
  				E(LeftView,{side:0,cor:this.state.leftCor,menu:this.props.leftMenu,scrollTo:this.props.scrollTo})),
  			E("div",{style:{flex:1}},
  				E(RightView,{side:1,cor:this.state.rightCor,menu:this.props.rightMenu,scrollTo:this.props.scrollTo}))
  		)
  	)
  }
});
module.exports=CorpusMapping;