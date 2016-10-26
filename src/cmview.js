const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;
const NotePopup=require("./notepopup");
const Footnote=require("./footnote");
const Helper=require("./cmviewhelper");
/* TODO
array of startkpos of each line
to support one line per p
and not blank line when crossing page
*/
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
		Footnote.setuplisteners.call(this);
		Helper.setuplisteners.call(this);
	}
	,componentDidMount:function(){
		this.defaultListeners();
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
	}
	,jumpToRange:function(from,to){
		var cm=this.refs.cm.getCodeMirror();
		if (from.ch!==to.ch&&from.line!==to.line) {
			cm.markText(from,to,{className:"gotomarker",clearOnEnter:true});
		}
		cm.setCursor(to);
		cm.focus();
		cm.scrollIntoView(to,200);
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
		if (oldtext) {
			this.props.markViewport&&this.props.markViewport();
			this.vpfrom=-2; //force mark viewport
		}
		this.props.onLoaded&&this.props.onLoaded(res);
	}
	,onCopy:function(cm,evt){
		this.props.onCopy&&this.props.onCopy(cm,evt);
	}
	,render:function(){
		var rule=this.props.rule;
		return E("div",{},
			E(NotePopup,{x:this.state.popupX,y:this.state.popupY,
				w:this.state.popupW,h:this.state.popupH,
				rule,
				text:this.state.popupText}),
			E(this.props.menu,{side:this.props.side,address:this.props.address,
				buttons:this.props.docs,selected:this.props.doc,corpus:this.props.corpus}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true,
  	  onCursorActivity:this.props.onCursorActivity
  	  ,onCopy:this.onCopy
  	  ,onViewportChange:this.props.onViewportChange})
  	 )
	}
})
module.exports=CMView;