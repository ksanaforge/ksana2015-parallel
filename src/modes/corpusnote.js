const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const openCorpus=require("ksana-corpus").openCorpus;
const emptynote=require("../notes/emptynote");
const LinkedByPopup=require("./linkedbypopup");
const linkedBy=require("./linkedby");
const toMarkup=require("../bindings/tomarkup");

const Viewers={
  default:require('../cmview/corpusview'),
  defaultnote:require("../cmview/noteview")
}
const Menus={
	defaultcorpusmenu:require("../corpusmenu"),
  defaultnotemenu:require("../notemenu")
}

const CorpusNote = React.createClass({
  getInitialState:function() {
    return {cor:null,popupX:0,popupY:0,links:[]};
  }
  ,contextTypes:{
    getter:PT.func.isRequired,
    action:PT.func.isRequired
  }
  ,componentDidMount:function(){
    openCorpus(this.props.corpus,(err,cor)=>{
       this.setState({cor,cor});
    });
  }
  ,deleteNote:function(noteid){
    const uid=this.context.getter("user").uid;
    const text=this.refs.note.getSaveText();
    const kposs=this.state.cor.extractKPos(text);
    this.props.store.deleteNote(uid,noteid,kposs);
    this.context.action("noteloaded",{id:"",text:emptynote()});
  }
  ,viewReady:function(opts){
    const store=this.props.store;
    const article=opts.article;
    if (store){
      store.onLinkedBy&&store.onLinkedBy(article.articlename,linkedBy,this);
      store.onLink&&store.onLink(opts.corpus,article.articlename,toMarkup,this); 
    }
    this.cm=opts.cm;
    this.kPosToLineCh=opts.kPosToLineCh;
  }
  ,viewLeaving:function(opts){
    const article=opts.article;
    if (article.articlename&& this.props.store) {
      this.props.store.offLinkedBy&&this.props.store.offLinkedBy(article.articlename);
      this.props.store.offLink&&this.props.store.offLink(opts.corpus,article.articlename);
    }
  }
  ,showLinkPopup:function(cm){
    const cursor=cm.getCursor();
    const cor=this.state.cor;
    const marks=cm.findMarksAt(cursor);
    const kRangeFromSel=this.refs.leftview.kRangeFromSel;
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
  ,onCursorChanged:function(cm){
      this.showLinkPopup(cm);
  }
  ,render:function(){
    if (!this.state.cor) {
      return E("div",{},"loading");
    }
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"defaultnote"];
    const leftMenu=Menus[this.props.leftMenu||"defaultcorpusmenu"];
    const rightMenu=Menus[this.props.rightMenu||"defaultnotemenu"];

    const popupprops={x:this.state.popupX,y:this.state.popupY,links:this.state.links};

  	return E("div",{style:this.props.style},
      E(LinkedByPopup,popupprops),      
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:1}},
  				E(LeftView,{ref:"leftview",side:0,cor:this.state.cor,corpus:this.props.corpus,
  					menu:leftMenu,nav:this.props.nav,viewReady:this.viewReady,
            store:this.props.store,address:this.props.address,
            onCursorChanged:this.onCursorChanged})),
  			E("div",{style:{flex:1}},
  				E(RightView,{side:1,corpus:this.props.corpus,cor:this.state.cor,
  					menu:rightMenu,store:this.props.store,ref:"note",
            deleteNote:this.deleteNote}))
  		)
  	)
  }
});
module.exports=CorpusNote;