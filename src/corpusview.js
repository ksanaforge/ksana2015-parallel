const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
const defaultrule=require("./defaultrule");

const CorpusView=React.createClass({
	contextTypes:{
		action:PT.func.isRequired,
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired
	}
	,goto:function(opts){
		opts=opts||{};
		const cor=this.props.cor;
		if (!cor)return;
		if (opts.corpus!==cor.meta.name) return;
		const range=cor.parseRange(opts.address);
		const r=cor.fileOf(range.start);
		if (!r)return;
		cor.getFile(r.at,(data)=>{
			this.context.action("loaded",
				{filename:r.filename,data:data.join("\n")
				,side:this.props.side,address:opts.address});
		});
	}
	,componentDidMount:function(){
		this.context.listen("goto",this.goto,this);
		if (!this.props.cor || !this.props.address) return;
		this.goto({address:this.props.address,corpus:this.props.cor.meta.name});
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
	}
	,kRangeFromCursor:function(cm){
		const sels=cm.listSelections();
		if (!sels.length) return null;
		const sel=sels[0];
		var start=sel.anchor,end=sel.head,temp;
		if (start.line>end.line||(start.line==end.line && start.ch>end.ch)) {
			temp=start;start=end;end=temp;
		}
		console.log(start,end)

	}
	,onCopy:function(cm,evt){
		console.log(evt)
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursortimer=setTimeout(()=>{
			const krange=this.kRangeFromCursor(cm);
			console.log(krange);
		},300);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const props=Object.assign({},this.props,
			{rule:defaultrule},
			{onCursorActivity:this.onCursorActivity},
			{onCopy:this.onCopy}
		);
		return E(CMView,props);
	}
})
module.exports=CorpusView;