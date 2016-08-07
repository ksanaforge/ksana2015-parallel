var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;
var TopRightMenu=require("./toprightmenu");
require("./loadfile");

var CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty"}
	}
	,contextTypes:{
		store:PT.object,
		getter:PT.func
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.doc!==this.props.doc) {
			this.context.getter("file",{filename:nextProps.doc,side:nextProps.side});	
		}
	}
	,componentDidMount:function(){
		this.context.store.listen("loaded",this.onLoaded,this);
		if (this.props.doc) {
			this.context.getter("file",{filename:this.props.doc,side:this.props.side});
		}
	}
	,onNDefLoaded:function(arg){
		this.context.store.unlistenAll(this);
		this.context.store.listen("loaded",this.onLoaded,this);
		//trigger viewport change
		console.log("ndef loaded",arg.filename);

		this.markViewport();
	}
	,markViewport:function(){
		var cm=this.refs.cm.getCodeMirror();
		var vp=cm.getViewport();
		this.vpfrom=-1;//force onViewport
		this.onViewportChange(cm,vp.from,vp.to);
	}
	,getNoteFile:function(cm,nline){
		if (!nline&&nline!==0) {
			var c=cm.doc.getCursor();
			nline=c.line;
		}
		var rule=this.getDocRule();
		if (!rule)return;
		var line=cm.doc.getLine(nline);
		var notes=rule.getNotes(line);
		if (notes&&notes.length) {
			return rule.getNoteFile(notes[0]);
		}
	}
	,loadNote:function(cm,line){
		var filename=this.getNoteFile(cm,line);
		if (!filename) {
			this.markViewport();
			return;
		}
		if (this.context.getter("fileSync",filename)){
			this.markViewport();
		} else {
			this.context.store.unlistenAll(this);
			this.context.store.listen("loaded",this.onNDefLoaded,this);

			this.context.getter("file",{filename,side:this.props.side});
		}
	}
	,onCursorActivity:function(cm){
		var c=cm.doc.getCursor();
		if (this.activeline==c.line) return;
		this.loadNote(cm,c.line);
	}
	,onSetDoc:function(side,filename){
		this.context.getter("setDoc",side,filename);
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
		if (res.side!=this.props.side) return;
		var cm=this.refs.cm.getCodeMirror();
		cm.setValue(res.data);
	}
	,onViewportChange:function(cm,from,to) {
		var rule=this.getDocRule();
		if (!rule)return;
		if (this.vpfrom==from && this.vpto==to)return;
		
		if (this.vptimer) clearTimeout(this.vptimer);
		var clearMarksBeyondViewport=function(f,t){
			var M=cm.doc.findMarks({line:0,ch:0},{line:f-1,ch:65536});
			M.forEach(function(m){m.clear()});

			var M=cm.doc.findMarks({line:0,ch:t},{line:cm.lineCount(),ch:65536});
			M.forEach(function(m){m.clear()});			
		}		
		this.vptimer=setTimeout(function(){ //marklines might trigger viewport change
			rule.clearNote();			
			var vp=cm.getViewport(); //use current viewport instead of from,to
			clearMarksBeyondViewport(vp.from,vp.to+20);
			var ndeffile=this.getNoteFile(cm);
			var ndefs=this.context.getter("fileSync",ndeffile);
			rule.markLines(cm,vp.from,vp.to+20,ndefs);
			this.vpfrom=vp.from,this.vpto=vp.to;
		}.bind(this),50);
	}
	,render:function(){
		return E("div",{},
			E(TopRightMenu,{side:this.props.side,onSetDoc:this.onSetDoc,
				buttons:this.props.docs,selected:this.props.doc}),
	  	E(CodeMirror,{ref:"cm",value:"",theme:"ambiance",readOnly:true,
  	  onCursorActivity:this.onCursorActivity
  	  ,onViewportChange:this.onViewportChange})
  	 )
	}
})
module.exports=CMView;