const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const openCorpus=require("ksana-corpus").openCorpus;
const Tabs=require("../components/muitabs");
const StockTabs={
  search:require("../tabs/searchtab"),
  toc:require("../tabs/toctab"),
  config:require("../tabs/configtab"),
  dictionary:require("../tabs/dictionarytab"),
  source:require("../tabs/sourcetab")
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
  ,contextTypes:{
    _:PT.func.isRequired
  }
  ,buildPane:function(){
    var panes=[];
    for (var i=0;i<this.props.tabs.length;i++) {
      const name=this.props.tabs[i];
      const props=Object.assign({},this.props,{name});
      panes.push( E(StockTabs[name],props));
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
    var LeftMenu=Menus[this.props.leftMenu||"default"];

    const tabs=this.props.tabs.map(function(t){
      return [t,this.context._(t)]}.bind(this)//locale string
    );
  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:this.props.leftFlex||1}},
  				E(LeftView,{side:0,cor:this.state.cor,corpus:this.props.corpus,
            decorations:this.props.decorations,
            menu:LeftMenu,address:this.props.address,nav:this.props.nav})),
  			E("div",{style:{flex:this.props.rightFlex||1}}
          ,E(Tabs,{panes:this.state.panes,tabs}))
  		)
  	)
  }
});
module.exports=CorpusTab;