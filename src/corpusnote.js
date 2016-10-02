const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus}=require("ksana-corpus");
const Viewers={
  default:require('./corpusview'),
  defaultnote:require("./noteview")
}
const Menus={
	defaultcorpus:require("./corpusmenu")
}

const CorpusNote = React.createClass({
  getInitialState:function() {
    return {cor:null};
  },
  componentDidMount:function(){
    openCorpus(this.props.corpus,(err,cor)=>{
       this.setState({cor,cor});
    });
  },
  render:function(){
    if (!this.state.cor) {
      return E("div",{},"loading");
    }
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"defaultnote"];
    const leftMenu=Menus[this.props.leftMenu||"defaultcorpus"];
  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:1}},
  				E(LeftView,{side:0,cor:this.state.cor,corpus:this.props.corpus,
  					menu:leftMenu,address:this.props.address})),
  			E("div",{style:{flex:1}},
  				E(RightView,{side:1,menu:this.props.rightMenu}))
  		)
  	)
  }
});
module.exports=CorpusNote;