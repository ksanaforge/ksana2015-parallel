const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CodeMirror=require("ksana-codemirror").Component;
const emptynote=require("../notes/emptynote");
const MAXLENGTH=65536;
const NoteView=React.createClass({
	getInitialState:function(){
		const text=emptynote();
		return {text,renderedText:" "};
	}
	,propType:{
		save:PT.func
	}
	,contextTypes:{
		listen:PT.func,
		unlistenAll:PT.func,
		action:PT.func,
		getter:PT.func

	}
	,componentDidMount:function(){
		this.context.listen("noteloaded",this.noteloaded,this);
		this.oldkposs=this.props.cor.extractKPos(this.state.text);
		this.renderText(this.state.text);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,scrollToAddress:function(address){
		const cm=this.refs.cm.getCodeMirror();
		var marks=cm.getAllMarks();
		marks=marks.filter(function(m){return m.address==address});
		if (!marks.length)return;
		for (var i=0;i<marks.length;i++) {
			const r=marks[i].find();
			cm.markText(r.from,r.to,{className:"gotomarker",clearOnEnter:true});	
		}
		cm.scrollIntoView(marks[marks.length-1].to,200);
	}
	,noteloaded:function(opts){
		const cm=this.refs.cm.getCodeMirror();
		cm.setOption('readOnly',(opts.id && !this.context.getter('user')));
		this.setState(opts,function(){
			this.renderText(opts.text);
			if (opts.scrollTo) this.scrollToAddress(opts.scrollTo);
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
				var transclusion=texts[i].join("");
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
  ,save:function(id,text){
    const kposs=this.props.cor.extractKPos(text);
    this.oldkposs=this.props.store.saveNote(id,text,kposs,this.oldkposs);
  }
	,onChange:function(e){
		clearTimeout(this.changetimer);
		this.changetimer=setTimeout(function(){
			this.state.id&&this.save(this.state.id,this.getSaveText());
		}.bind(this),2000);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const menuopts={noteid:this.state.id,deleteNote:this.props.deleteNote,
			title:this.state.title,store:this.props.store};
	  return	E("div",{},
	  	E(this.props.menu,menuopts),
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
