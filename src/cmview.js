const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;
const NotePopup=require("./notepopup");
const Footnote=require("./footnote");
const Helper=require("./cmviewhelper");

const CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty",popupX:0,popupY:0,popupText:""}
	}
	,propTypes:{
		markViewport:PT.func
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
	,onLoaded:function(res){
		console.log("loaded",res)
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