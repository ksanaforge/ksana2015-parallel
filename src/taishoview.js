var React=require("react");
var ReactDOM=require("react-dom");
require("./loadfile");

var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;
var TopRightMenu=require("./toprightmenu");
var NotePopup=require("./notepopup");
var coordinate=require("./coordinate");
var verbose=true;

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
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side,cb:this.onLoaded});
		}
	}
	,componentDidMount:function(){
		this.defaultListeners();
		if (this.props.doc) {
			this.context.getter("file",{filename:this.props.doc,side:this.props.side,cb:this.onLoaded});
		}
	}
	,onCopy:function(cm,event){
		var rp=coordinate.getRangePointer(this.data,this.rule,cm);
		var f=this.rule.formatPointer(rp);
		event.target.value=f;
		event.target.select();
	}
	,defaultListeners:function(){
		//this.context.store.listen("loaded",this.onLoaded,this); , callback supply in getter
		this.context.store.listen("layout",this.onLayout,this);
		this.context.store.listen("toggleLineNumber",this.onToggleLineNumber,this);
		this.context.store.listen("goto",this.goto,this);
	}
	,goto:function(str){
		if(this.props.side)return;

		var p=this.rule.parsePointer(str);
		if (!p) return;

		this.context.getter("setDoc",this.props.side,p.file);
	}
	,getDocRule:function(doc){
		doc=doc||this.props.doc;
		var docs=this.props.docs;
		for (var i=0;i<docs.length;i++) {
			if (docs[i].name==this.props.doc) {
				return docs[i].rule;
			}
		}
		return this.props.rule;
	}
	,onLayout:function(mode){
		var rule=this.getDocRule();
		if (!rule)return;
		this.rule=rule;
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
		this.rule=this.getDocRule();
		this.rule.setActionHandler(this.context.action);
		this.rule.afterLoad(res.data);
		var {pointers,text}=this.rule.breakline(res.data,"lb");
		this.data=res.data;
		this.pointers=pointers;
		cm.setValue(text);
	}

	,atPointer:function(pointer){
		if (verbose) console.log(pointer,this.rule.formatPointer(pointer));
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursortimer=setTimeout(function(){
			var cm=this.refs.cm.getCodeMirror();
			var pointer=coordinate.getPointer(this.data,this.rule,cm,cm.getCursor());
			this.atPointer(pointer);
		}.bind(this),300);
	}
	,pointers:[]
	,lineNumberFormatter:function(line){
		if (!this.rule)return line;
		var pointer=this.pointers[line-1];
		if (!pointer) return "";

		var marker=this.rule.formatPointer(pointer);

		marker=marker.substr(5,7);

		while (marker[0]=="0")marker=marker.substr(1);
		return marker;
	}
	,onBeforeChange:function(cm,chobj){
		if (chobj.origin=="setValue") return;
		chobj.cancel();
	}
	,render:function(){
		var Menu=this.props.menu||TopRightMenu;
		return E("div",{},
			E(Menu,{side:this.props.side,buttons:this.props.docs,selected:this.props.doc}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance"
	  		,onCopy:this.onCopy
	  		,onBeforeChange:this.onBeforeChange
	  		,lineNumbers:true
	  		,lineNumberFormatter:this.lineNumberFormatter
	  		,onCursorActivity:this.onCursorActivity})
			);
	}	
})
module.exports=TaishoView;