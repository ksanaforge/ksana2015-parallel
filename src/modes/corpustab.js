const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus}=require("ksana-corpus");
const Tabs=require("../components/muitabs");
const StockTabs={
  search:require("../tabs/searchtab"),
  toc:require("../tabs/toctab")
}
const Viewers={
  default:require('../cmview/corpusview')
}
const Menus={
  default:require("../corpusmenu")
}
const CorpusTab = React.createClass({
  getInitialState:function() {
    return {panes:this.buildPane()};
  }
  ,buildPane:function(){
    var panes=[];
    for (var i=0;i<this.props.tabs.length;i++) {
      const tabname=this.props.tabs[i];
      panes.push( E(StockTabs[tabname],this.props));
    }
    return panes;
  }
  ,propTypes:function(){
    tabs:PT.array.isRequired
  }
  ,componentWillReceiveProps:function(nextProps,nextState){
    if (nextProps.tabs!==this.props.tabs){
      nextState.panes=this.buildPane();
    }
  }
  ,componentDidMount:function(){
    openCorpus(this.props.corpus,(err,cor)=>{
      this.setState({cor});
    });
  },
  render:function(){
    if (!this.state.cor) {
      return E("div",{},"loading");
    }
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"default"];
    var LeftMenu=Menus[this.props.leftMenu||"default"];
    var RightMenu=Menus[this.props.RightMenu||"default"];

  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:this.props.leftFlex||1}},
  				E(LeftView,{side:0,cor:this.state.cor,corpus:this.props.corpus,
            menu:LeftMenu,address:this.props.address})),
  			E("div",{style:{flex:this.props.rightFlex||1}}
          ,E(Tabs,{panes:this.state.panes,tabs:this.props.tabs}))
  		)
  	)
  }
});
module.exports=CorpusTab;