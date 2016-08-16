var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var TreeToc=require("ksana2015-treetoc").Component;
var TocResult=require("./tocresult");
var InputBox=require("./inputbox");
var ControlPanel = React.createClass({
  getInitialState:function() {
    return {filename:"jin",toc:[],tofind:"",order:0};
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
  ,renderToc:function(){
    if(this.state.tofind.trim()){
      return [E("br",{key:1}),
        E(TocResult,{key:2,tofind:this.state.tofind,toc:this.state.toc
        ,order:this.state.order
        ,onSelect:this.onSelect})
        ];
    }else{
      return E(TreeToc,{opts:{rainbow:true},
        toc:this.state.toc,onSelect:this.onSelect});
    }
  }
  ,onInputChanged:function(tofind,order){
    this.setState({tofind,order});
  }
  ,render:function(){
  	return E("div",{style:this.props.style},
      E(InputBox,{onInputChanged:this.onInputChanged}), 
      E("br"),
      this.renderToc()
    );
  }
});

module.exports=ControlPanel;