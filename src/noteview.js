const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;

const NoteView=React.createClass({
	getInitialState:function(){
		const text=localStorage.getItem(this.props.corpus+"_note")
		||"abc@2p178a0202-06;xyz@2p179c2902-09;aaaa";
		return {text,renderedText:" ",transclusions:[]};
	}
	,contextTypes:{
		action:PT.func
	}
	,renderText:function(str){
		var ranges=[];
		const cor=this.props.cor;
		str.replace(cor.addressRegex,function(m,m1){
			ranges.push(m1);
		});
		cor.getText(ranges,(texts)=>{
			var i=0,transclusions=[],replacedLength=0,transclusionlength=0;
			var renderedText=str.replace(cor.addressRegex,function(m,m1,idx){
				
				var transclusion=texts[i].join("\n");
				const markpos=idx+transclusionlength-replacedLength;
				transclusions.push([markpos,transclusion.length,ranges[i]]);
				i++;
				
				transclusionlength+=transclusion.length;
				replacedLength+=m.length;
				return transclusion;
			});
			this.setState({renderedText,transclusions});
		});
	}
	,insertTransclusion:function(cm,address){
		if (this.findTransclusionAtCursor(cm)) return;
		this.props.cor.getText(address,(data)=>{
			const str=data.join("");
			const cur=cm.getCursor();
			cm.doc.replaceSelection(str);
			const end={line:cur.line,ch:cur.ch+str.length};
			var transclusions=this.state.transclusions;
			transclusions.push( [cm.indexFromPos(cur), str.length, address]);
			this.setState({transclusions});
		});
	}
	,onPaste:function(cm,evt){
 		const clipboardData = evt.clipboardData || window.clipboardData;
		const pastedData = clipboardData.getData('Text');
		
		const m=pastedData.match(this.props.cor.addressRegex);
		if (m && m[0]==pastedData) {
			evt.stopPropagation();
			evt.preventDefault();
			this.insertTransclusion(cm,m[0]);
		}
	}
	,findTransclusionAtCursor:function(cm){
		const sels=cm.listSelections();
		const cor=this.props.cor;
		if (!sels.length) return null;
		const sel=sels[0];
		var start=sel.anchor,end=sel.head,temp;
		if (start.line>end.line||(start.line==end.line && start.ch>end.ch)) {
			temp=start;start=end;end=temp;
		}

		const s=cm.doc.indexFromPos(start);
		const e=cm.doc.indexFromPos(end);
		const t=this.state.transclusions.filter((T)=>{
			return (s>T[0] && e<T[0]+T[1]);
		});
		if (t.length) return t[0];
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursorTimer=setTimeout(()=>{
			var t=this.findTransclusionAtCursor(cm);
			t&&this.context.action("goto",{corpus:this.props.corpus,address:t[2]});
		},500);
	}
	,updateTransclusion:function(transclusions){
		const doc=this.refs.cm.getCodeMirror().doc;
		const T=transclusions||this.state.transclusions;
		for (var i=0;i<T.length;i++){
			const start=doc.posFromIndex(T[i][0]);
			const end=doc.posFromIndex(T[i][0]+T[i][1]);
			doc.markText(start,end,{address:T[i][2],className:'transclusion',readOnly:true});
		}		
	}
	,componentDidUpdate:function(){
		this.updateTransclusion();
	}
	,componentDidMount:function(){
		this.renderText(this.state.text);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
	  return	E(CodeMirror,{ref:"cm",
	  	onCursorActivity:this.onCursorActivity,
	  	onPaste:this.onPaste,
	  	value:this.state.renderedText});
	}
})
module.exports=NoteView;
