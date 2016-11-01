const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
const defaultrule=require("../defaultrule");
const LinkedByPopup=require("./linkedbypopup");
const linkedBy=require("../linkedby");
const toMarkup=require("../bindings/tomarkup");
const addressHashTag=require("../units/addresshashtag");
const decorations=require("../decorations/");
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
		return {startkpos:1,popupX:0,popupY:0,article:{},
			links:[],layout:'p',linebreaks:[],pagebreaks:[]
		};
	}
	,goto:function(opts){
		opts=opts||{};
		const cor=this.props.cor;
		if (!cor)return;
		if (opts.corpus!==cor.meta.name) return;
		const range=cor.parseRange(opts.address);
		const article=cor.articleOf(range.start);
		if (!article)return;
		if (article.articlename&& this.props.store) {
			this.props.store.offLinkedBy&&this.props.store.offLinkedBy(article.articlename);
			this.props.store.offLink&&this.props.store.offLink(opts.corpus,article.articlename);
		}
		cor.getArticleText(article.at,function(text){
			if (!text)return;
			this.layout(article,text,opts.address);
		}.bind(this));
	}
	,toLogicalPos:function(address){
		return this.props.cor.toLogicalPos(this.state.linebreaks,address,this.getRawLine);		
	}
	,decorate:function(){
		this.props.decorations.forEach(function(d){
			decorations[d]&&decorations[d](this.props.cor,this.state.article,
				this.refs.cm.getCodeMirror(),this.toLogicalPos);
		}.bind(this));
	}
	,onLoaded:function(res){
		const store=this.props.store;
		if (store){
			store.onLinkedBy&&store.onLinkedBy(res.articlename,linkedBy,this);
			store.onLink&&store.onLink(this.props.cor.meta.name,res.articlename,toMarkup,this);	
		}		
		res.address&&this.scrollToAddress(res.address);
		this.decorate();
	}
	,getRawLine:function(line){
		if (!this.state.text)return "";
		return this.state.text[line];
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
					{articlename:article.articlename,data:layout.lines.join("\n"),side,address});
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
	,getArticle:function(opts,nav){
		const corpus=this.props.cor.meta.name;
		if (opts.corpus!==corpus) return;
		const r=this.props.cor.getArticle(this.state.article.at,nav);
		if(r) this.goto({corpus,address:r.start});
	}
	,nextArticle:function(opts){
		this.getArticle(opts,1);
	}
	,prevArticle:function(opts){
		this.getArticle(opts,-1);
	}
	,componentDidMount:function(){
		this.context.listen("goto",this.goto,this);
		this.context.listen("toggleLayout",this.toggleLayout,this);
		this.context.listen("highlightAddress",this.highlightAddress,this);
		this.context.listen("nextArticle",this.nextArticle,this);
		this.context.listen("prevArticle",this.prevArticle,this);
		if (!this.props.cor) return;
		var address=addressHashTag.getAddress(this.props.cor.meta.name);		
		if (!address)  address=this.props.address;
		address&this.goto({address,corpus:this.props.cor.meta.name});	
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll();
		if (this.props.store){
			this.props.store.offLinkedBy&&this.props.store.offLinkedBy(this.state.article.articlename);
			this.props.store.offLink&&this.props.store.offLink(this.props.cor.meta.name,this.state.article.articlename);
		}
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
					start:r.start,end:r.end,range}
			);
		}
	}
	,showLinkPopup:function(cm){
		const cursor=cm.getCursor();
		const cor=this.props.cor;
		const marks=cm.findMarksAt(cursor);
		const kRangeFromSel=this.kRangeFromSel;
		var links=marks.map(function(m){
			const p=m.find();
			const krange=kRangeFromSel(cm,p.from,p.to);
			const caption=cor.stringify(krange);
			return [caption,m.noteid]
		});
		links=links.filter(function(l){return l[1]});
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
			this.detectSelection(cm);
			this.showLinkPopup(cm);
		}.bind(this),300);
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const props=Object.assign({},this.props,
			{ref:"cm",rule:defaultrule,
			onCursorActivity:this.onCursorActivity,
			onLoaded:this.onLoaded,
			onCopy:this.onCopy,
			articlename:this.state.article.articlename
			}
		);
		const popupprops={x:this.state.popupX,y:this.state.popupY,links:this.state.links};
		return E("div",{},
			E(LinkedByPopup,popupprops),
			E(CMView,props)
		);
	}
})
module.exports=CorpusView;