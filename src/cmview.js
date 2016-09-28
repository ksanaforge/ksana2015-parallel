var React=require("react");
var ReactDOM=require("react-dom");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;
var TopRightMenu=require("./toprightmenu");
var NotePopup=require("./notepopup");
require("./loadfile");

var CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty",popupX:0,popupY:0,popupText:""}
	}
	,contextTypes:{
		listen:PT.func,
		unlistenAll:PT.func,
		getter:PT.func,
		action:PT.func
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,defaultListeners:function(){
		this.context.listen("gopara",this.onGoPara,this);
		this.context.listen("leavingfrom",this.onLeavingFrom,this);
		this.context.listen("gokepan",this.onGoKepan,this);
		this.context.listen("tocready",this.onTocReady,this);
		this.context.listen("loaded",this.onLoaded,this);
		this.context.listen("showfootnote",this.showfootnote,this);
		this.context.listen("hidefootnote",this.hidefootnote,this);
	}
	,hasFootnoteInScreen:function(note){
		var screentext=this.getScreenText();
		var rule=this.getDocRule();
		var n=rule.makeFootnote(note);
		var m=screentext.match(rule.patterns.footnote);
		if (m) {
			var at=m.indexOf(n);
			return at>-1;
		}	
		return false;
	}
	,onTocReady:function(toc){
		if (this.props.side)return;
		var rule=this.getDocRule();
		rule.setToc(toc);
	}
	,leavingFrom:null
	,leavingClass:""
	,onLeavingFrom:function(link){
		if(this.leavingFrom) {
				this.leavingFrom.replacedWith.className=this.leavingClass;
				this.leavingFrom=null;
		}
		var cm=this.refs.cm.getCodeMirror();
		var screentext=this.getScreenText();
		var vp=cm.getViewport();
		var i=screentext.indexOf(link);
		if (i>-1) {
			var pos=cm.posFromIndex(i+cm.indexFromPos({line:vp.from,ch:1}));
			var marks=cm.findMarks(pos,{line:pos.line,ch:pos.ch+link.length});
			if (marks&&marks.length) for (var i=0;i<marks.length;i++) {
				var m=marks[i];
				if (m.replacedWith) {
					this.leavingClass=m.replacedWith.className;
					this.leavingFrom=m;
					m.replacedWith.className="link_visited";
				}				
			}
		}
	}
	,popupFootnote:function(){
			var rule=this.getDocRule();
			var ndeffile=rule.getNoteFile(this.note);
			var ndefs=this.context.getter("fileSync",ndeffile);
			this.setState({popupX:this.popupX,popupY:this.popupY,
				popupW:this.popupW,popupH:this.popupH,
				popupText:ndefs[this.note]})
	}
	,showfootnote:function(opts){
		if (this.hasFootnoteInScreen(opts.note)){
			var n=ReactDOM.findDOMNode(this).getBoundingClientRect();
			this.popupX=opts.x-n.left; this.popupY=opts.y-n.top;
			this.popupW=n.width; this.popupH=n.height;
			this.note=opts.note;
			this.loadNote(opts.note);
		}
	}
	,hidefootnote:function(note){
		if (this.hasFootnoteInScreen(note)){

		}
	}
	,componentDidMount:function(){
		this.defaultListeners();
		if (this.props.doc) {
			this.context.getter("file",{filename:this.props.doc,side:this.props.side});
		}
	}
	,getScreenText:function(){
		var cm=this.refs.cm.getCodeMirror();
		var vp=cm.getViewport();
		var rule=this.getDocRule();
		var t="";
		for (var i=vp.from;i<=vp.to;i++) {
			t+=cm.doc.getLine(i)+"\n";
		}
		return t;
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
	/*
			var screentext=this.getScreenText();
	*/
	,onGoKepan:function(kepan) {
		var rule=this.getDocRule();
		var kepantext=rule.makeKepan(kepan+" ");//prevent 37.1 jump to 37.10
		this.scrollToText(kepantext);
	}
	,onGoPara:function(para){
		var rule=this.getDocRule();
		var paratext=rule.makeParagraph(para);
		this.scrollToText(paratext);
	}
	,onNDefLoaded:function(arg){
		this.context.unlistenAll(this);
		this.defaultListeners();
		this.popupFootnote();
	}
	,markViewport:function(){
		var cm=this.refs.cm.getCodeMirror();
		var vp=cm.getViewport();
		this.vpfrom=-1;//force onViewport
		this.onViewportChange(cm,vp.from,vp.to);
		//var rule=this.getDocRule();
	}
	,loadNote:function(note){
		var rule=this.getDocRule();
		var filename=rule.getNoteFile(note);
		var d=this.context.getter("fileSync",filename);
		if (d){
			this.popupFootnote();
		} else {
			this.context.unlistenAll(this);
			this.context.listen("loaded",this.onNDefLoaded,this);
			this.context.getter("file",{filename,side:this.props.side});
		}
	}
	,onCursorActivity:function(cm){
		var c=cm.doc.getCursor();
		if (this.activeline==c.line) return;		
		var rule=this.getDocRule();
		if (this.activeline) rule.markLine(cm,this.activeline,this.activeline,{note:true,pagebreak:true,link:true});
		rule.markLine(cm,c.line,c.line,{note:true,pagebreak:true,link:true});
		this.activeline=c.line;
	}
	,onSetDoc:function(side,filename){
		this.context.getter("setDoc",{side,filename});
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
		if (res.side!==this.props.side) return;
		var cm=this.refs.cm.getCodeMirror();

		var rule=this.getDocRule();
		rule.setActionHandler(this.context.action);
		var oldtext=this.text;
		this.text=res.data;
		cm.setValue(res.data);
		if (oldtext) {
			this.markViewport();
			this.vpfrom=-2; //force mark viewport
		}
	}
	,onViewportChange:function(cm,from,to) {
		var rule=this.getDocRule();
		if (!rule)return;

		var clearMarksBeyondViewport=function(f,t){
			var M=cm.doc.findMarks({line:0,ch:0},{line:f-1,ch:65536});
			M.forEach(function(m){m.clear()});

			var M=cm.doc.findMarks({line:0,ch:t},{line:cm.lineCount(),ch:65536});
			M.forEach(function(m){m.clear()});			
		}		

		if (this.vptimer) clearTimeout(this.vptimer);
		this.vptimer=setTimeout(function(){ //marklines might trigger viewport change			
			//rule.clearNote();
			var vp=cm.getViewport(); //use current viewport instead of from,to
			if (Math.abs(this.vpfrom-vp.from)<2)return;
			
			//this will trigger another onViewport
			//clearMarksBeyondViewport(vp.from,vp.to+10);

			rule.markLines(cm,vp.from,vp.to+20,{note:true,pagebreak:true,link:true});
			this.vpfrom=vp.from,this.vpto=vp.to;
		}.bind(this),400); 
		//might be big enough, otherwise onViewport will be trigger again, causing endless loop
	}
	,copiedText:""
	,onCopy:function(cm,evt){
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
	,render:function(){
		var rule=this.getDocRule();
		return E("div",{},
			E(NotePopup,{x:this.state.popupX,y:this.state.popupY,
				w:this.state.popupW,h:this.state.popupH,
				rule,
				text:this.state.popupText}),
			E(TopRightMenu,{side:this.props.side,onSetDoc:this.onSetDoc,
				buttons:this.props.docs,selected:this.props.doc}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true,
  	  onCursorActivity:this.onCursorActivity
  	  ,onCopy:this.onCopy
  	  ,onViewportChange:this.onViewportChange})
  	 )
	}
})
module.exports=CMView;