const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
const defaultrule=require("../defaultrule");
const addressHashTag=require("../units/addresshashtag");
const decorations=require("../decorations/");
const decorateBond=require("../decorations/bond");
const CorpusView=React.createClass({
	contextTypes:{
		action:PT.func.isRequired,
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired
	}
	,propTypes:{
		cor:PT.object.isRequired,
		corpus:PT.string.isRequired,
		decorations:PT.array,
		side:PT.number,
		store:PT.object,
		onViewReady:PT.func,
		onViewLeaving:PT.func,
		onCursorActivity:PT.func,
		onViewport:PT.func
	}
	,getInitialState:function(){
		return {startkpos:1,article:{},layout:'p',linebreaks:[],pagebreaks:[]};
	}
	,componentDidMount:function(){
		this.context.listen("goto",this.goto,this);
		this.context.listen("toggleLayout",this.toggleLayout,this);
		this.context.listen("highlightAddress",this.highlightAddress,this);
		this.context.listen("nextArticle",this.nextArticle,this);
		this.context.listen("prevArticle",this.prevArticle,this);
		this.context.listen("charWidget",this.charWidget,this);
		this.context.listen("lineWidget",this.lineWidget,this);
		this.context.listen("addBond",decorateBond.addBond,this);
		this.context.listen("setActiveBond",decorateBond.setActiveBond,this);
		if (!this.props.cor) return;
		var address=addressHashTag.getAddress(this.props.cor.meta.name);
		if (!address)  address=this.props.address;
		address&this.goto({address,cor:this.props.cor,corpus:this.props.cor.meta.name});
	}
	,componentWillReceiveProps:function(nextProps){//cor changed
		if (nextProps.corpus!==this.props.corpus
			||nextProps.address!==this.props.address){
			this.goto(nextProps,nextProps.cor);
		}
	}	
	,goto:function(opts){
		opts=opts||{};
		const cor=opts.cor||this.props.cor;
		if (opts.corpus!==cor.meta.name) return;
		if (typeof opts.side!=="undefined" && this.props.side!==opts.side){
			return;
		}
		const range=cor.parseRange(opts.address);
		const article=cor.articleOf(range.start);
		if (!article)return;

		if (article.at==this.state.article.at){
			this.scrollToAddress(opts.address);
			return;
		}

		this.viewLeaving(this.state.article);
		
		cor.getArticleText(article.at,function(text){
			if (!text)return;
			this.layout(article,text,opts.address);
		}.bind(this));
	}
	,toLogicalPos:function(address){
		return this.props.cor.toLogicalPos(this.state.linebreaks,address,this.getRawLine);		
	}
	,toLogicalRange:function(range){
		return this.props.cor.toLogicalRange(this.state.linebreaks,range,this.getRawLine);
	}
	,fromLogicalPos:function(linech){
		const cm=this.refs.cm.getCodeMirror();
		const firstline=this.props.cor.bookLineOf(this.state.startkpos); //first of of the article
		const text=cm.doc.getLine(linech.line);
		const lb=this.state.linebreaks[linech.line];
		return this.props.cor.fromLogicalPos(text,linech.ch,lb,firstline,this.getRawLine);
	}
	,decorate:function(){
		if (!this.props.decorations)return;
		this.props.decorations.forEach(function(d){
			decorations[d]&&decorations[d](this.props.cor,this.state.article,
				this.refs.cm.getCodeMirror(),this.toLogicalPos);
		}.bind(this));
	}
	,viewLeaving:function(article){
		const corpus=this.props.corpus,cor=this.props.cor,side=this.props.side;
		const cm=this.refs.cm.getCodeMirror();
		this.props.onViewLeaving&&this.props.onViewLeaving({article,cor,corpus,side,cm});
	}
	,viewReady:function(article){
		const corpus=this.props.corpus,cor=this.props.cor,side=this.props.side;
		const cm=this.refs.cm.getCodeMirror();
		const toLogicalRange=this.toLogicalRange;
		this.props.onViewReady&&this.props.onViewReady({article,cor,corpus,side,cm,toLogicalRange});
	}
	,onLoaded:function(res){
		res.address&&this.scrollToAddress(res.address);
		this.decorate();
		this.viewReady(res.article);
	}
	,getRawLine:function(line){
		if (!this.state.text)return "";
		return this.state.text[line];
	}
	,lineWidget:function(opts){
		if (opts.corpus!==this.props.corpus)return;
		if (opts.side!==this.props.side)return;
		const cm=this.refs.cm.getCodeMirror();
		const linech=this.toLogicalPos(opts.address);
		if (linech.line==-1)return;
		if (this.linewidget) this.linewidget.clear();
		this.linewidget=cm.setBookmark(linech,{widget:opts.widget,handleMouseEvents:true});
	}
	,scrollToAddress:function(address){
		const r=this.props.cor.toLogicalRange(this.state.linebreaks,address,this.getRawLine);
		if (!r || r.start.line<0)return;
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
	,layout:function(article,text,address){
		const cor=this.props.cor;
		const side=this.props.side;
		const layouttag="p";

		if (!address){
			//scroll to the selection after layout
			address=this.kRangeFromCursor(this.refs.cm.getCodeMirror());
		}
		var book=cor.bookOf(article.start);

		const changetext=function(layout){
			this.setState({text,linebreaks:layout.linebreaks,startkpos:article.start,
				pagebreaks:layout.pagebreaks,article});
			this.context.action("loaded",
					{article,articlename:article.articlename,
						data:layout.lines.join("\n"),side,address});
		}

		if (this.state.layout=='') {
			cor.getBookField(layouttag,book,function(book_p){
				if (!book_p) {
					console.log(layouttag,book)
					debugger;
				}
				const p=cor.trimField(book_p,article.start,article.end);
				changetext.call(this, cor.layoutText(text,article.start,p.pos) );
			}.bind(this));
		} else {
			changetext.call(this, cor.layoutText(text,article.start) );
		}
	}
	,gotoArticle:function(opts,nav){
		const corpus=this.props.cor.meta.name;
		if (opts.corpus!==corpus) return;
		const r=this.props.cor.getArticle(this.state.article.at,nav);
		if(r) this.goto({corpus,address:r.start});
	}
	,nextArticle:function(opts){
		this.gotoArticle(opts,1);
	}
	,prevArticle:function(opts){
		this.gotoArticle(opts,-1);
	}
	,charWidget:function(opts){
		if (opts.corpus!=this.props.corpus)return;
		const linech=this.toLogicalPos(opts.address);
		const cm=this.refs.cm.getCodeMirror();
		if (this.charwidget)this.charwidget.clear();
		this.charwidget=cm.setBookmark(linech,{widget:opts.widget,handleMouseEvents:true});
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
		this.viewLeaving&&this.viewLeaving(this.state.article);
	}
	,kRangeFromSel:function(cm,from,to){
		if (!from||!to)return 0;
		const f=this.props.cor.fromLogicalPos.bind(this.props.cor);
		const firstline=this.props.cor.bookLineOf(this.state.startkpos); //first of of the article
		const s=f(cm.doc.getLine(from.line),from.ch,this.state.linebreaks[from.line],firstline,this.getRawLine);
		const e=f(cm.doc.getLine(to.line),to.ch,this.state.linebreaks[to.line],firstline,this.getRawLine);
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
	,getCaretText:function(cm){ //get caretText for checking dictionary
		const from=cm.getCursor();
		var ch=from.ch;
		if (ch>2) ch-=2; //include two char before
		//should check punc backward
		var caretText=cm.doc.getRange({line:from.line,ch},{line:from.line+1,ch:256});
		caretText=caretText.replace(/\r?\n/g,"");
		const m=caretText.match(/^[.？,。，！；「」『』—－：、（）｛｝【】《》]*(.*?)[.？,。，！；「」『』—－：、（）｛｝【】《》]/);
		if (m){
			caretText=m[1];
		}
		return caretText;
	}
	,detectSelection:function(cm){
		const sels=cm.listSelections();	
		if (sels.length>0){
			const sel=sels[0];
			const range=this.kRangeFromSel(cm,sel.head,sel.anchor);
			const r=this.props.cor.parseRange(range);
			const selectionText=cm.doc.getSelection();

			this.context.action("selection",
				{cor:this.props.cor,corpus:this.props.corpus,
					caretText:this.getCaretText(cm),selectionText,
					article:this.state.article.articlename,
					side:this.props.side,
					start:r.start,end:r.end,range}
			);
		}
	}
	,onCursorActivity:function(cm){
		clearTimeout(this.cursortimer);
		this.cursortimer=setTimeout(function(){
			this.detectSelection(cm);
			this.props.onCursorChanged&&this.props.onCursorChanged(cm);
		}.bind(this),300);
	}
	,onViewportChange:function(cm,from,to){
		if (!this.props.onViewport)return;
		clearTimeout(this.viewporttimer);
		this.viewporttimer=setTimeout(function(){
			const opts={cm,from,to,side:this.props.side,cor:this.props.cor
				,fromLogicalPos:this.fromLogicalPos
				,toLogicalPos:this.toLogicalPos
				,toLogicalRange:this.toLogicalRange
				,corpus:this.props.corpus,article:this.state.article,articlename:this.state.article.articlename}
			this.props.onViewport(opts);
		}.bind(this),300);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const props=Object.assign({},this.props,
			{ref:"cm",rule:defaultrule,
			onCursorActivity:this.onCursorActivity,
			onLoaded:this.onLoaded,
			onCopy:this.onCopy,
			onViewportChange:this.onViewportChange,
			articlename:this.state.article.articlename
			}
		);
		return E(CMView,props);
	}
})
module.exports=CorpusView;