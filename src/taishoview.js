var React=require("react");
var ReactDOM=require("react-dom");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;
var TopRightMenu=require("./toprightmenu");
var NotePopup=require("./notepopup");
require("./loadfile");

var TaishoView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty"};
	}
	,contextTypes:{
		store:PT.object,
		getter:PT.func,
		action:PT.func
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,componentDidMount:function(){
		this.defaultListeners();
		if (this.props.doc) {
			this.context.getter("file",{filename:this.props.doc,side:this.props.side});
		}
	}
	,onCopy:function(cm,event){
		//event.target.value=event.target.value.replace(/[，！。；：]/g,"");
		//event.target.select();
	}
	,defaultListeners:function(){
		this.context.store.listen("loaded",this.onLoaded,this);
		this.context.store.listen("layout",this.onLayout,this);
		this.context.store.listen("toggleLineNumber",this.onToggleLineNumber,this);
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
	,onLayout:function(mode){
		var rule=this.getDocRule();
		if (!rule)return;
		var cm=this.refs.cm.getCodeMirror();
		var {pointers,text}=rule.breakline(this.data,mode||"lb");
		this.pointers=pointers;
		cm.setValue(text);
	}
	,onToggleLineNumber:function(side){
		if (side!==this.props.side)return;
		var cm=this.refs.cm.getCodeMirror();
		var lineNumbers=cm.getOption("lineNumbers");
		cm.setOption("lineNumbers",!lineNumbers);
	}
	,onLoaded:function(res){
		if (res.side!==this.props.side) return;
		var cm=this.refs.cm.getCodeMirror();

		var rule=this.getDocRule();
		rule.setActionHandler(this.context.action);
		rule.afterLoad(res.data);
		var {pointers,text}=rule.breakline(res.data,"lb");
		this.data=res.data;
		this.pointers=pointers;
		cm.setValue(text);
	}
	,onCursorActivity:function(cm){
		var cursor=cm.listSelections();
		//console.log(cursor);
	}
	,pointers:[]
	,lineNumberFormatter:function(line){
		var rule=this.getDocRule();
		if (!rule)return line;
		var pointer=this.pointers[line-1];
		if (!pointer) return "";

		var marker=rule.formatPointer(pointer);

		marker=marker.substr(3,7);
		while (marker[0]=="0")marker=marker.substr(1);
		return marker;
	}
	,render:function(){
		var Menu=this.props.menu||TopRightMenu;
		return E("div",{},
			E(Menu,{side:this.props.side,onSetDoc:this.onSetDoc,
				buttons:this.props.docs,selected:this.props.doc}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true
	  		,onCopy:this.onCopy
	  		,lineNumbers:true
	  		,lineNumberFormatter:this.lineNumberFormatter
	  		,onCursorActivity:this.onCursorActivity})
			);
	}	
})
module.exports=TaishoView;