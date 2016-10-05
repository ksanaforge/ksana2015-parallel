const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
const defaultrule=require("./defaultrule");
const LinkedByPopup=require("./linkedbypopup");
const linkedBy=require("./linkedby");
const CorpusView=React.createClass({
	contextTypes:{
		action:PT.func.isRequired,
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired
	}
	,propTypes:{
		store:PT.object
	}
	,getInitialState:function(){
		return {startkpos:0,popupX:0,popupY:0,links:[]};
	}
	,goto:function(opts){
		opts=opts||{};
		const cor=this.props.cor;
		if (!cor)return;
		if (opts.corpus!==cor.meta.name) return;
		const range=cor.parseRange(opts.address);
		const r=cor.fileOf(range.start);
		if (!r)return;
		if (this.state.filename&& this.props.store) {
			this.props.store.offLinkedBy(this.state.filename);
		}
		cor.getFile(r.at,function(data){
			if (!data)return;
			this.context.action("loaded",
				{filename:r.filename,data:data.join("\n")
				,side:this.props.side,address:opts.address});

			this.setState({startkpos:r.start,filename:r.filename});
		}.bind(this));
	}
	,onLoaded:function(res){
		this.props.store&&this.props.store.onLinkedBy(res.filename,linkedBy,this);
		res.address&&this.scrollToAddress(res.address);
	}
	,scrollToAddress:function(address){
		const getLine=this.refs.cm.getLine;
		const r=this.props.cor.lineCharOffset(this.state.startkpos,address,getLine);
		this.refs.cm.jumpToRange(r.start,r.end);
	}
	,highlightAddress:function(address){
		this.highlight&&this.highlight.clear();
		if (!address) return;
		const getLine=this.refs.cm.getLine;
		const r=this.props.cor.lineCharOffset(this.state.startkpos,address,getLine);
		this.highlight=this.refs.cm.markText(r.start,r.end,{className:"highlight",clearOnEnter:true});
	}
	,componentDidMount:function(){
		this.context.listen("goto",this.goto,this);
		this.context.listen("highlightAddress",this.highlightAddress,this);
		if (!this.props.cor || !this.props.address) return;
		this.goto({address:this.props.address,corpus:this.props.cor.meta.name});
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
		this.props.store.offLinkedBy(this.state.filename);
	}
	,kRangeFromSel:function(cm,from,to){
		const cor=this.props.cor;
		const textbeforestart=cm.doc.getLine(from.line).substr(0,from.ch);
		const textbeforeend=cm.doc.getLine(to.line).substr(0,to.ch);
		const startkpos=cor.advanceLineChar(this.state.startkpos,from.line,textbeforestart);
		const endkpos=cor.advanceLineChar(this.state.startkpos,to.line,textbeforeend);
		return cor.makeKRange(startkpos,endkpos);
	}
	,kRangeFromCursor:function(cm){
		const sels=cm.listSelections();
		if (!sels.length) return null;
		var from=sels[0].anchor,to=sels[0].head,temp;
		if (from.line>to.line||(from.line==to.line && from.ch>to.ch)) {
			temp=from;from=to;to=temp;
		}
		return this.kRangeFromSel(cm,from,to);
	}
	,onCopy:function(cm,evt){
		/*1p178a0103-15 copy and paste incorrect*/
		/* TODO,  address error crossing a page, has line 30 */
		const krange=this.kRangeFromCursor(cm);
		evt.target.value="@"+this.props.cor.stringify(krange)+';';
		evt.target.select();//reselect the hidden textarea
	}
	,showLinkPopup:function(cm){
		const cursor=cm.getCursor();
		const cor=this.props.cor;
		const marks=cm.findMarksAt(cursor);
		const kRangeFromSel=this.kRangeFromSel;
		const links=marks.map(function(m){
			const p=m.find();
			const krange=kRangeFromSel(cm,p.from,p.to);
			const caption=cor.stringify(krange);
			return [caption,m.noteid]
		});
		if (links.length) {
			const coords=cm.charCoords(cursor);
			this.setState({popupX:coords.left,popupY:coords.top+30,links});
		} else if (this.state.links.length) {
			this.setState({links:[]});
		}		
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursortimer=setTimeout(function(){
			this.showLinkPopup(cm);
		}.bind(this),300);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const props=Object.assign({},this.props,
			{ref:"cm",rule:defaultrule},
			{onCursorActivity:this.onCursorActivity},
			{onLoaded:this.onLoaded},
			{onCopy:this.onCopy}
		);
		const popupprops={x:this.state.popupX,y:this.state.popupY,links:this.state.links};
		return E("div",{},
			E(LinkedByPopup,popupprops),
			E(CMView,props)
		);
	}
})
module.exports=CorpusView;