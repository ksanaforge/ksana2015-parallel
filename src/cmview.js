var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;
var TopRightMenu=require("./toprightmenu");
require("./loadfile");

var CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty"}
	}
	,contextTypes:{
		store:PT.object,
		getter:PT.func
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,componentDidMount:function(){
		this.context.store.listen("loaded",this.onLoaded,this);
		if (this.props.doc) {
			this.context.getter("file",
				{filename:this.props.doc,side:this.props.side});	
		}
	}
	,onCursorActivity:function(cm){

	}
	,onSetDoc:function(side,filename){
		this.context.getter("setDoc",side,filename);
	}
	,getDocRule:function(doc){
		doc=doc||this.props.doc;
		var docs=this.props.docs;
		for (var i=0;i<docs.length;i++) {
			if (docs[i].name==this.props.doc) {
				return docs[i].rule;
			}
		}
	}
	,onLoaded:function(res){
		if (res.side!=this.props.side) return;
		this.refs.cm.getCodeMirror().setValue(res.data);
		var rule=this.getDocRule();
		var cmdoc=this.refs.cm.getCodeMirror().doc;
		rule && rule.markAllLine(cmdoc);
	}
	,render:function(){
		return E("div",{},
			E(TopRightMenu,{side:this.props.side,onSetDoc:this.onSetDoc,
				buttons:this.props.docs,selected:this.props.doc}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true,
  	  onCursorActivity:this.onCursorActivity})
  	 )
	}
})
module.exports=CMView;