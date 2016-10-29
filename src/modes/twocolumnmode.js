const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const ControlPanel=require("../controlpanel");
const TwoColumn=require("./twocolumn");

const {action,listen,unlistenAll,getter,registerGetter,unregisterGetter}=require("../units/model");

const modemain = React.createClass({
  getInitialState:function() {
    return {rightDoc:this.props.rightDoc,leftDoc:this.props.LeftDoc};
  }
  ,onSetDoc:function({side,filename,scrollTo}){
    if (side===0) this.setState({leftDoc:filename,scrollTo});
    else if (side===1) this.setState({rightDoc:filename,scrollTo});
  }
  ,componentDidMount:function(){
    registerGetter("setDoc",this.onSetDoc);
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
    props2.rightDoc=this.state.rightDoc||props2.rightDoc;
    props2.leftDoc=this.state.leftDoc||props2.leftDoc;
    props2.scrollTo=this.state.scrollTo;

    return E("div",
      {style:styles.topcontainer},
      E(ControlPanel,props1),
      E(TwoColumn,props2)
    )
  }
});
const styles={
  topcontainer:{display:"flex"},
  controls:{flex:1,background:'gray',fontSize:"75%",
  height:"100%",overflowY:"scroll",overflowX:"hidden"},
  body:{flex:4},
}
module.exports=modemain;