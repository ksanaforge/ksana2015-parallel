const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
require("../units/loadfile");
var TopRightMenu=require("../toprightmenu");

const LocaFileView=React.createClass({
	componentDidMount:function(){
		if (this.props.doc) {
			this.context.getter("file",{filename:this.props.doc,side:this.props.side});
		}
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,contextTypes:{
		listen:PT.func,
		getter:PT.func
	}
	,getDocRule:function(doc){
		doc=doc||this.props.doc;
		var docs=this.props.docs;
		if (!docs)return defaultrule;
		for (var i=0;i<docs.length;i++) {
			if (docs[i].name==this.props.doc) {
				return docs[i].rule;
			}
		}
	}
	,onCopy:function(){
		var rule=this.getDocRule();
		if (this.copiedText===evt.target.value) {
			if (rule.excerptCopy){
				evt.target.value=rule.excerptCopy(evt.target.value, this.text, cm.indexFromPos(cm.getCursor()));
				evt.target.select();//reselect the hidden textarea
			}
		} else {
			this.copiedText=evt.target.value;
		}
	}
	,getScreenText:function(){
		var cm=this.refs.cm.getCodeMirror();
		var vp=cm.getViewport();
		var t="";
		for (var i=vp.from;i<=vp.to;i++) {
			t+=cm.doc.getLine(i)+"\n";
		}
		return t;
	}
	,markViewport:function(){
		var cm=this.refs.cm.getCodeMirror();
		var vp=cm.getViewport();
		this.vpfrom=-1;//force onViewport
		this.onViewportChange(cm,vp.from,vp.to);
	}
	,onViewportChange:function(cm,from,to) {
		var rule=this.props.rule;
		if (!rule)return;
		var clearMarksBeyondViewport=function(f,t){
			var M=cm.doc.findMarks({line:0,ch:0},{line:f-1,ch:65536});
			M.forEach(function(m){m.clear()});
			M=cm.doc.findMarks({line:0,ch:t},{line:cm.lineCount(),ch:65536});
			M.forEach(function(m){m.clear()});			
		}		
		if (this.vptimer) clearTimeout(this.vptimer);
		this.vptimer=setTimeout(function(){ //marklines might trigger viewport change			
			var vp=cm.getViewport(); //use current viewport instead of from,to
			if (Math.abs(this.vpfrom-vp.from)<2)return;
			//this will trigger another onViewport
			//clearMarksBeyondViewport(vp.from,vp.to+10);
			rule.markLines(cm,vp.from,vp.to+20,{note:true,pagebreak:true,link:true});
			this.vpfrom=vp.from,this.vpto=vp.to;
		}.bind(this),400); 
		//might be big enough, otherwise onViewport will be trigger again, causing endless loop
	}
	,onCursorActivity:function(){
		var c=cm.doc.getCursor();
		if (this.activeline==c.line) return;		
		var rule=this.props.rule;
		if (this.activeline) rule.markLine(cm,this.activeline,this.activeline,{note:true,pagebreak:true,link:true});
		rule.markLine(cm,c.line,c.line,{note:true,pagebreak:true,link:true});
		this.activeline=c.line;
	}
	,getDefaultProps:function(){
		return {menu:TopRightMenu};
	}
	,render:function(){
		var props=Object.assign({},this.props,{rule:this.getDocRule()});
		return E(CMView,props);
	}
});
module.exports=LocaFileView;