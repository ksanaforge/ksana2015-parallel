const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const ControlPanel=require("./controlpanel");
const CorpusBinding=require("./corpusbinding");
var {action,listen,unlistenAll,getter,hasGetter,registerGetter,unregisterGetter}=require("./model");
const CorpusBindingMode=React.createClass({
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
    ,hasGetter: PT.func
    ,registerGetter:PT.func
    ,unregisterGetter:PT.func
  }
  ,getChildContext:function(){
    return {action,listen,unlistenAll,hasGetter,getter,registerGetter,unregisterGetter};
  }  
  ,render: function() {
    var props1=Object.assign({},this.props);
    props1.style=styles.controls;

    var props2=Object.assign({},this.props);
    props2.style=styles.body;
    props2.scrollTo=this.state.scrollTo;

    return E("div",{style:styles.topcontainer},
      E(CorpusBinding,props2),
      E(ControlPanel,props1)
    )
  }
})
const styles={
  topcontainer:{display:"flex"},
  controls:{flex:1,background:'gray',fontSize:"75%",
  height:"100%",overflowY:"scroll",overflowX:"hidden"},
  body:{flex:6},
}
module.exports=CorpusBindingMode;