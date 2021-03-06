const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;
//const NotePopup=require("./notepopup");
//const Footnote=require("./footnote");
//const Helper=require("./cmviewhelper");

const CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty",popupX:0,popupY:0,popupText:""}
	}
	,propTypes:{
		markViewport:PT.func,
		onLoaded:PT.func
	}
	,contextTypes:{
		listen:PT.func,
		unlistenAll:PT.func,
		action:PT.func
	}
	,defaultListeners:function(){
		this.context.listen("loaded",this.onLoaded,this);
		//Footnote.setuplisteners.call(this);
		//Helper.setuplisteners.call(this);
	}
	,componentDidMount:function(){
		this.defaultListeners();
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
	}
	,jumpToRange:function(from,to){
		const cm=this.refs.cm.getCodeMirror();
		const cursor=cm.getCursor();
		if (from.ch!==to.ch||from.line!==to.line) {
			cm.markText(from,to,{className:"gotomarker",clearOnEnter:true});
		}
		const linedown=(from.line+100>=cm.lineCount())?cm.linecount:from.line+100;
		const vp=cm.getViewport();
		const vpm=cm.getOption("viewportMargin");
		if (cursor.line>vp.to-vpm||cursor.line<vp.from-vpm) {
			cm.scrollIntoView({line:linedown,ch:from.ch});
			cm.scrollIntoView(from,200);			
		}
		cm.setCursor(from);
	}
	,scrollToText:function(t){
		var cm=this.refs.cm.getCodeMirror();
		var text=cm.getValue();
		var at=text.indexOf(t);
		if (at>-1) {
			var pos=cm.doc.posFromIndex(at);
			//scroll to last line , so that the paragraph will be at top
			cm.scrollIntoView({line:cm.doc.lineCount()-1,ch:0})
			if (pos.line) pos.line--;
			cm.scrollIntoView(pos);
		}
	}
	,getAllMarks:function(){
		return this.refs.cm.getCodeMirror().getAllMarks();
	}
	,markText:function(){
		var cm=this.refs.cm.getCodeMirror();
		return cm.doc.markText.apply(cm.doc,arguments);
	}
	,getCodeMirror:function(){
		return this.refs.cm.getCodeMirror();
	}
	,getLine:function(i){
		var cm=this.refs.cm.getCodeMirror();
		return cm.doc.getLine(i);
	}
	,onLoaded:function(res){
		if (res.side!==this.props.side) return;
		var cm=this.refs.cm.getCodeMirror();

		var rule=this.props.rule;
		rule.setActionHandler(this.context.action);
		var oldtext=this.text;
		this.text=res.data;
		cm.setValue(res.data);
		this.props.onLoaded&&this.props.onLoaded(res);
		if (oldtext) {
			this.props.markViewport&&this.props.markViewport();
		}
	}
	,onCopy:function(cm,evt){
		this.props.onCopy&&this.props.onCopy(cm,evt);
	}
	,onKeyPress:function(cm,e){
		//if (e.key==" ") this.toggleMark(cm);
	}
	,render:function(){
		var rule=this.props.rule;
		return E("div",{},
			//E(NotePopup,{x:this.state.popupX,y:this.state.popupY,
			//	w:this.state.popupW,h:this.state.popupH,
			//	rule,
			//	text:this.state.popupText}),
			E(this.props.menu,this.props),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true,
  	  onCursorActivity:this.props.onCursorActivity
  	  ,onKeyPress:this.onKeyPress
  	  ,onCopy:this.onCopy
  	  ,onViewportChange:this.props.onViewportChange})
  	 )
	}
})
module.exports=CMView;