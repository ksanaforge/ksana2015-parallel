var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var ControlPanel=require("./controlpanel");
var TwoColumn=require("./twocolumn");


var {action,store,getter,registerGetter,unregisterGetter}=require("./model");

var modemain = React.createClass({
  getInitialState:function() {
    return {rightDoc:this.props.rightDoc,leftDoc:this.props.LeftDoc};
  }
  ,onSetDoc:function(side,filename){
    if (side===0) this.setState({leftDoc:filename});
    else if (side===1) this.setState({rightDoc:filename});
  }
  ,componentDidMount:function(){
    registerGetter("setDoc",this.onSetDoc);
  }
  ,childContextTypes: {
    store: PT.object
    ,action: PT.func
    ,getter: PT.func
    ,registerGetter:PT.func
    ,unregisterGetter:PT.func
  }
  ,getChildContext:function(){
    return {action,store,getter,registerGetter,unregisterGetter};
  }  
  ,render: function() {
    var props1=Object.assign({},this.props);
    props1.style=styles.controls;

    var props2=Object.assign({},this.props);
    props2.style=styles.body;
    props2.rightDoc=this.state.rightDoc||props2.rightDoc;
    props2.leftDoc=this.state.leftDoc||props2.leftDoc;

    return E("div",
      {style:styles.topcontainer},
      E(ControlPanel,props1),
      E(TwoColumn,props2)
    )
  }
});
var styles={
  topcontainer:{display:"flex"},
  controls:{flex:1,background:'gray',fontSize:"75%",
  height:"100%",overflowY:"scroll",overflowX:"hidden"},
  body:{flex:4},
}
module.exports=modemain;