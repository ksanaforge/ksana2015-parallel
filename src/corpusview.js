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
	,getInitialState:function(){
		return {startkpos:0};
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
			this.setState({startkpos:r.start});
			this.context.action("loaded",
				{filename:r.filename,data:data.join("\n")
				,side:this.props.side,address:opts.address});
		});
	}
	,onLoaded:function(res){
		res.address&&this.scrollToAddress(res.address);
	}
	,scrollToAddress:function(address){
		const getLine=this.refs.cm.getLine;
		var {start,end}=this.props.cor.lineCharOffset(this.state.startkpos,address,getLine);
		this.refs.cm.jumpToRange(start,end);
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
		const cor=this.props.cor;
		if (!sels.length) return null;
		const sel=sels[0];
		var start=sel.anchor,end=sel.head,temp;
		if (start.line>end.line||(start.line==end.line && start.ch>end.ch)) {
			temp=start;start=end;end=temp;
		}
		
		const textbeforestart=cm.doc.getLine(start.line).substr(0,start.ch);
		const textbeforeend=cm.doc.getLine(end.line).substr(0,end.ch);
		const startkpos=cor.advanceLineChar(this.state.startkpos,start.line,textbeforestart);
		const endkpos=cor.advanceLineChar(this.state.startkpos,end.line,textbeforeend);

		return cor.makeKRange(startkpos,endkpos);
	}
	,onCopy:function(cm,evt){
		/*1p178a0103-15 copy and paste incorrect*/
		/* TODO,  address error crossing a page, has line 30 */
		const krange=this.kRangeFromCursor(cm);
		evt.target.value="@"+this.props.cor.stringify(krange)+';';
		evt.target.select();//reselect the hidden textarea
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursortimer=setTimeout(()=>{
			//const krange=this.kRangeFromCursor(cm);
			//console.log(this.props.cor.stringify(krange));
		},300);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const props=Object.assign({},this.props,
			{rule:defaultrule},
			{onCursorActivity:this.onCursorActivity},
			{onLoaded:this.onLoaded},
			{onCopy:this.onCopy},
			{ref:"cm"}
		);
		return E(CMView,props);
	}
})
module.exports=CorpusView;