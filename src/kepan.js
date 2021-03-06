var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var TreeToc=require("ksana2015-treetoc").Component;
var TocResult=require("./tocresult");
var InputBox=require("./inputbox");
var ReactDOM=require("react-dom");
var KepanControl=React.createClass({
  onClick:function(){
    this.props.onReset();
  },
  render:function(){
    return E("div",{style:{position:"relative"}},
        E("button",{onClick:this.onClick,
          style:{position:"absolute",right:3,top:10,zIndex:500}},"收")
    )
  }
});

var KepanPanel = React.createClass({
  getInitialState:function() {
    return {filename:"jin",toc:[],tofind:"",order:0,scrollTo:-1};
  }
  ,contextTypes:{
  	listen:PT.func.isRequired,
  	getter:PT.func.isRequired,
  	action:PT.func.isRequired
  }
  ,componentDidMount:function(){
    this.context.getter("file",{filename:"kepan",cb:this.treeloaded});
    this.context.listen("openkepan",this.onOpenKepan,this);
  }
  ,findById:function(id){
    for (var i=0;this.state.toc.length;i++){
      if (this.state.toc[i].l==id){
        return i;
      }
    }
    return -1;
  }
  ,onOpenKepan:function(id){
    var scrollTo=this.findById(id);
    if (scrollTo>-1) {
      this.setState({scrollTo});
      var n=this.state.toc[scrollTo];
      this.context.action("gokepan",n.l);
      if (n.l2) this.context.action("gokepan",this.state.toc[scrollTo].l2);
    }
  }
  ,treeloaded:function(obj){
    this.context.action("tocready",obj.data);
  	this.setState({toc:obj.data});
  }
  ,onSelect:function(ctx,node,i,nodes){
    this.context.action("gokepan",node.l);
    if (node.l2) this.context.action("gokepan",node.l2);
  }
  ,onScrollTop:function(t){
    var container=ReactDOM.findDOMNode(this);
    container.parentElement.scrollTop+=t-250;//make it show at middle
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
        toc:this.state.toc,onSelect:this.onSelect,
        scrollTo:this.state.scrollTo,
        onScrollTop:this.onScrollTop});
    }
  }
  ,onInputChanged:function(tofind,order){
    this.setState({tofind,order,scrollTo:-1});
  }
  ,onReset:function(){
    var toc=this.state.toc;
    for (var i=1;i<toc.length;i++) {
      toc[i].o=false;
    }
    this.setState({toc,scrollTo:-1});
  }
  ,render:function(){
  	return E("div",{style:this.props.style},
      E(InputBox,{onInputChanged:this.onInputChanged}), 
      E(KepanControl,{onReset:this.onReset}),
      E("br"),
      this.renderToc()
    );
  }
});

module.exports=KepanPanel;