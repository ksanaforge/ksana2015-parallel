var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var TreeToc=require("ksana2015-treetoc").Component;

var ControlPanel = React.createClass({
  getInitialState:function() {
    return {filename:"jin",toc:[]};
  }
  ,contextTypes:{
  	store:PT.object.isRequired,
  	getter:PT.func.isRequired,
  	action:PT.func.isRequired
  }
  ,componentDidMount:function(){
    this.context.getter("file","kepan");
    this.context.store.listen("loaded",this.treeloaded,this);
  }
  ,treeloaded:function(obj){
    if (obj.filename!=="kepan")return;
  	this.setState({toc:obj.data});
  }
  ,onSelect:function(ctx,node,i,nodes){
    this.context.action("gokepan",node.l);
  }
  ,render:function(){
  	return E("div",{style:this.props.style},
      //E("span",{},"Search"),
      //E("input",{}),
      E(TreeToc,{opts:{rainbow:true},
        toc:this.state.toc,onSelect:this.onSelect}));
  }
});

module.exports=ControlPanel;