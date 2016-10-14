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
		return {startkpos:0,popupX:0,popupY:0,
			links:[],layout:'p',linebreaks:[],pagebreaks:[]};
	}
	,goto:function(opts){
		opts=opts||{};
		const cor=this.props.cor;
		if (!cor)return;
		if (opts.corpus!==cor.meta.name) return;
		const range=cor.parseRange(opts.address);
		const article=cor.articleOf(range.start);
		if (!article)return;
		if (this.state.articlename&& this.props.store) {
			this.props.store.offLinkedBy(this.state.articlename);
		}
		cor.getArticle(article.at,function(text){
			if (!text)return;
			this.layout(article,text,opts.address);
		}.bind(this));
	}
	,onLoaded:function(res){
		this.props.store&&this.props.store.onLinkedBy(res.articlename,linkedBy,this);
		res.address&&this.scrollToAddress(res.address);
	}
	,getRawLine:function(line){
		const firstline=this.props.cor.bookLineOf(this.state.startkpos);
		return this.state.text[line-firstline];
	}
	,scrollToAddress:function(address){
		const r=this.props.cor.toLogicalRange(this.state.linebreaks,address,this.getRawLine);
		this.refs.cm.jumpToRange(r.start,r.end);
	}
	,highlightAddress:function(address){
		this.highlight&&this.highlight.clear();
		if (!address) return;
		const r=this.props.cor.toLogicalRange(this.state.linebreaks,address,this.getRawLine);
		this.highlight=this.refs.cm.markText(r.start,r.end,{className:"highlight",clearOnEnter:true});
	}
	,toggleLayout:function(opts){
		if (opts.corpus!==this.props.corpus||opts.side!==this.props.side) return;
		const article=this.props.cor.articleOf(this.state.startkpos);
		this.layout(article,this.state.text);
	}
	,layout:function(file,text,address){
		const cor=this.props.cor;
		const side=this.props.side;
		const layouttag="p";

		if (typeof address=="undefined"){
			//scroll to the selection after layout
			address=this.kRangeFromCursor(this.refs.cm.getCodeMirror());
		}
		const book=cor.bookOf(address);

		const changetext=function(layout){
			this.setState({text,linebreaks:layout.linebreaks,startkpos:file.start,
				pagebreaks:layout.pagebreaks,layout:this.state.layout?'':layouttag});
			this.context.action("loaded",
					{articlename:file.articlename,data:layout.lines.join("\n"),side,address});
		}

		if (this.state.layout=='') {
			cor.getBookField(layouttag,book,function(book_p){
				const p=cor.trimField(book_p,file.start,file.end);
				changetext.call(this, cor.layoutText(text,file.start,p.pos) );
			}.bind(this));
		} else {
			changetext.call(this, cor.layoutText(text,file.start) );
		}
	}
	,componentDidMount:function(){
		this.context.listen("goto",this.goto,this);
		this.context.listen("toggleLayout",this.toggleLayout,this);
		this.context.listen("highlightAddress",this.highlightAddress,this);
		if (!this.props.cor || !this.props.address) return;
		this.goto({address:this.props.address,corpus:this.props.cor.meta.name});
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
		this.props.store.offLinkedBy(this.state.articlename);
	}
	,kRangeFromSel:function(cm,from,to){
		const f=this.props.cor.fromLogicalPos.bind(this.props.cor);
		const s=f(cm.doc.getLine(from.line),from.ch,this.state.linebreaks[from.line],this.getRawLine);
		const e=f(cm.doc.getLine(to.line),to.ch,this.state.linebreaks[to.line],this.getRawLine);
		return this.props.cor.makeKRange(s,e);
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
	,showCursorKPos:function(cm){
		const cor=this.props.cor;
		const cursor=cm.getCursor();
		const krange=this.kRangeFromSel(cm,cursor,cursor);
		console.log(cor.stringify(krange));
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
			this.showCursorKPos(cm);
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