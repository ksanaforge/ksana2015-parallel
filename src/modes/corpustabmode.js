const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CorpusTab=require("./corpustab");
var {action,listen,unlistenAll,getter,registerGetter,
  unregisterGetter,hasGetter}=require("../model");


const CorpusTabMode=React.createClass({
  getInitialState:function() {
    //const store=Store(this.props.remotedata);
    //return {store};
    return {};
  }
  ,componentDidMount:function(){
  }
  ,childContextTypes: {
    listen: PT.func
    ,unlistenAll:PT.func
    ,action: PT.func
    ,hasGetter:PT.func
    ,getter: PT.func
    ,registerGetter:PT.func
    ,unregisterGetter:PT.func
  }
  ,getChildContext:function(){
    return {action,listen,unlistenAll,getter,hasGetter,registerGetter,unregisterGetter};
  }  
  ,render: function() {
    var props1=Object.assign({},this.props,
      {style:styles.controls});

    var props2=Object.assign({},this.props,
      {style:styles.body,scrollTo:this.state.ScrollTo});

    return E("div",{style:styles.topcontainer},
      E(CorpusTab,props2)
    )
  }
})
const styles={
  topcontainer:{display:"flex"},
  controls:{flex:1,background:'gray',fontSize:"75%",
  height:"100%",overflowY:"scroll",overflowX:"hidden"},
  body:{flex:4},
}
module.exports=CorpusTabMode;