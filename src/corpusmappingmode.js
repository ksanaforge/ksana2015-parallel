const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const ControlPanel=require("./controlpanel");
const CorpusMapping=require("./corpusmapping");
var {action,listen,unlistenAll,getter,registerGetter,unregisterGetter}=require("./model");

const CorpusMappingMode=React.createClass({
  getInitialState:function() {
    return {};
  }
  ,componentDidMount:function(){
  }
  ,childContextTypes: {
    listen: PT.func
    ,unlistenAll:PT.func
    ,action: PT.func
    ,getter: PT.func
    ,registerGetter:PT.func
    ,unregisterGetter:PT.func
  }
  ,getChildContext:function(){
    return {action,listen,unlistenAll,getter,registerGetter,unregisterGetter};
  }  
  ,render: function() {
    var props1=Object.assign({},this.props);
    props1.style=styles.controls;

    var props2=Object.assign({},this.props);
    props2.style=styles.body;
    props2.scrollTo=this.state.scrollTo;

    return E("div",{style:styles.topcontainer},
      E(CorpusMapping,props2),
      E(ControlPanel,props1)
    )
  }
})
const styles={
  topcontainer:{display:"flex"},
  controls:{flex:1,background:'gray',fontSize:"75%",
  height:"100%",overflowY:"scroll",overflowX:"hidden"},
  body:{flex:4},
}
module.exports=CorpusMappingMode;