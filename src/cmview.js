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
			if (this.props.side) {
				setTimeout(function(){ //load file later than side 0
					this.context.getter("file",
						{filename:this.props.doc,side:this.props.side});
				}.bind(this),1000*this.props.side);
			} else {
				this.context.getter("file",
				{filename:this.props.doc,side:this.props.side});	
			}
		}
	}
	,onCursorActivity:function(cm){

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

		if (this.vptimer) clearTimeout(this.vptimer);
		var clearMarksBeyondViewport=function(f,t){
			var M=cm.doc.findMarks({line:0,ch:0},{line:f-1,ch:65536});
			M.forEach(function(m){m.clear()});

			var M=cm.doc.findMarks({line:0,ch:t},{line:cm.lineCount(),ch:65536});
			M.forEach(function(m){m.clear()});			
		}		
		this.vptimer=setTimeout(function(){ //marklines might trigger viewport change
			var vp=cm.getViewport(); //use current viewport instead of from,to
			clearMarksBeyondViewport(vp.from,vp.to+20);
			var rule=this.getDocRule();
			rule && rule.markLines(cm,vp.from,vp.to+20);
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