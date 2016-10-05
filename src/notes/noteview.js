const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;
const MAXLENGTH=65536;
const NoteView=React.createClass({
	getInitialState:function(){
		const text=localStorage.getItem(this.props.corpus+"_note")
		||"abc@2p178a0202-06;xyz@2p179c2902-09;aaaa";
		return {text,renderedText:" "};
	}
	,propType:{
		save:PT.func
	}
	,contextTypes:{
		listen:PT.func,
		unlistenAll:PT.func,
		action:PT.func
	}
	,componentDidMount:function(){
		this.context.listen("noteloaded",this.noteloaded,this);
		this.renderText(this.state.text);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,noteloaded:function(obj){
		var cm=this.refs.cm.getCodeMirror();
		this.setState(obj,function(){
			this.renderText(obj.text);
		}.bind(this))
	}
	,renderText:function(str){
		var ranges=[];
		const cor=this.props.cor;
		const cm=this.refs.cm.getCodeMirror();
		str.replace(cor.addressRegex,function(m,m1){
			ranges.push(m1);
		});
		cor.getText(ranges,function(texts){
			var transclusions=[];
			var i=0,replacedLength=0,transclusionlength=0;
			var renderedText=str.replace(cor.addressRegex,function(m,m1,idx){
		
				var transclusion=texts[i].join("\n");
				const markpos=idx+transclusionlength-replacedLength;
				i++;

				transclusions.push([markpos,transclusion.length,m1]);
				transclusionlength+=transclusion.length;
				replacedLength+=m.length;
				return transclusion;
			});

			cm.setValue(renderedText);
			this.updateTransclusion(transclusions);
		}.bind(this));		
	}
	,insertTransclusion:function(cm,address){
		if (this.findTransclusionAtCursor(cm)) return;
		this.props.cor.getText(address,(data)=>{
			const str=data.join("");
			const cur=cm.getCursor();
			cm.doc.replaceSelection(str);
			const start={line:cur.line,ch:cur.ch};
			const end={line:cur.line,ch:cur.ch+str.length};
			this.renderTransclusion(start,end,address);
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

		const t=cm.doc.findMarks(start,end);

		if (t.length) return t[0];
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursorTimer=setTimeout(()=>{
			var t=this.findTransclusionAtCursor(cm);
			t&&this.context.action("goto",{corpus:this.props.corpus,address:t.address});
		},500);
	}
	,clearTransclusion:function(){
		const doc=this.refs.cm.getCodeMirror().doc;
		var marks=doc.getAllMarks();
		marks=marks.filter(function(m){return m.className=="transclusion"});
		marks.forEach(function(m){m.clear()});
	}		
	,renderTransclusion:function(start,end,address){
		const doc=this.refs.cm.getCodeMirror().doc;
		doc.markText(start,end,{address,className:'transclusion',
				atomic:true,clearWhenEmpty:true});
	}
	,updateTransclusion:function(T){
		const doc=this.refs.cm.getCodeMirror().doc;
		this.clearTransclusion();

		for (var i=0;i<T.length;i++){
			const start=doc.posFromIndex(T[i][0]);
			const end=doc.posFromIndex(T[i][0]+T[i][1]);
			this.renderTransclusion(start,end,T[i][2]);
		}		
	}
	,getSaveText:function(){
		const cm=this.refs.cm.getCodeMirror();
		var screentext=cm.getValue();
		var text="";
		var marks=cm.doc.getAllMarks();
		
		marks=marks.filter(function(m){return m.className=="transclusion"});
		var last=0;
		for (var i=0;i<marks.length;i++) {
			const pos=marks[i].find();
			var s=cm.doc.indexFromPos(pos.from);
			var e=cm.doc.indexFromPos(pos.to);

			text+=screentext.substring(last,s);
			var address=marks[i].address;
			if (address[0]!=="@") address="@"+address;
			if (address[address.length-1]!==";")address+=";";
			text+=address;
			last=e;
		}
		text+=screentext.substr(last);
		
		if (text.length>MAXLENGTH) {
			console.warn("text too long truncated",screentext.length)
			text=text.substr(0,MAXLENGTH);
		}
		return text;
	}

	,onChange:function(e){
		clearTimeout(this.changetimer);
		this.changetimer=setTimeout(function(){
			if (this.state.id) {
				const text=this.getSaveText();
				this.props.save&&this.props.save(this.state.id,text);
			}
		}.bind(this),2000);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
	  return	E("div",{},
	  	E(this.props.menu),
	  	E(CodeMirror,{ref:"cm",
	  	onCursorActivity:this.onCursorActivity,
	  	onPaste:this.onPaste,
	  	onChange:this.onChange,
	  	value:"loading"})
	  )
	  ;
	}
})
module.exports=NoteView;
