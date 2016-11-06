const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus,bsearch}=require("ksana-corpus");

const Viewers={
  default:require('../cmview/corpusview')
}
const Menus={
  default:require("../corpusmenu")
}
const CounterPartNav=require("../menu/counterpartnav");
const CorpusBinding = React.createClass({
  getInitialState:function() {
    return {leftCorpus:this.props.leftCorpus,leftAddress:this.props.leftAddress,
      rightCorpus:this.props.rightCorpus,rightAddress:this.props.rightAddress};
  },
  contextTypes:{
    action:PT.func.isRequired,
    listen:PT.func.isRequired,
    unlistenAll:PT.func.isRequired
  }
  ,propTypes:{
    store:PT.object.isRequired
  }
  ,deleteBinding:function(opts){
    const article=this._corpusarticle[opts.corpus];
    const targetcorpus=this.counterpartcorpus(opts.corpus);
    this.props.store.deleteBinding(opts.corpus,article,targetcorpus,opts.key);
  }
  ,componentDidMount:function(){
    openCorpus(this.props.leftCorpus,function(err,leftCor){
      openCorpus(this.props.rightCorpus,function(err2,rightCor){
         this.setState({rightCor,leftCor});
         if (this.props.alignpage) {
           this.context.listen("selection",this.onSelection,this);
         }
      }.bind(this));
    }.bind(this));
    this.context.listen("corpusgoto",this.corpusgoto,this);
    this.context.listen("deleteBinding",this.deleteBinding,this);
    this.context.listen("createBinding",this.createBinding,this);
  }
  ,createBinding:function(){
    const action=this.context.action;
    this.props.store.createBinding(function(){
      setTimeout(function(){
        action("clearSelection");
      },10);
    }.bind(this));
  }
  ,componentWillUnmount:function(){
    this.context.unlistenAll(this);
  }
  ,bondAdded:function(key,data,corpus,article,targetcorpus){//from firebase
    const r=key.split("_");
    const source=parseInt(r[0],36),target=parseInt(r[1],36);
    const seq=this.seq=this.seq||0;
    this.context.action("addBond",{corpus,address:source,key,seq});
    this.context.action("addBond",{corpus:targetcorpus,address:target,key,seq,shadow:true});
    this.seq++;
  }
  ,bondRemoved:function(key,data){
    this.context.action("removeBond",key);
  }  
  ,_corpusarticle:{}
  ,onViewReady:function(opts){
    const store=this.props.store;
    const targetcorpus=this.counterpartcorpus(opts.corpus);
    const context={corpus:opts.corpus,targetcorpus};
    const handlers={added:this.bondAdded,removed:this.bondRemoved};
    this._corpusarticle[opts.corpus]=opts.article.articlename;
    store.onBinding&&store.onBinding(opts.corpus,opts.article.articlename,targetcorpus,handlers,context);
  }
  ,onViewLeaving:function(opts){
    const article=opts.article;
    const store=this.props.store;
    const targetcorpus=this.counterpartcorpus(opts.corpus);
    if (article.articlename) {
      store.offBinding&&store.offBinding(opts.corpus,article.articlename,targetcorpus);
    }
  }
  ,corpusgoto:function(opts){
    openCorpus(opts.corpus,function(err,cor){
      if (opts.side==1) {
        this.setState({rightCor:cor,rightCorpus:opts.corpus,rightAddress:opts.address});
      } else {
        this.setState({leftCor:cor,leftCorpus:opts.corpus,leftAddress:opts.address});  
      }
    }.bind(this));
  }
  ,counterpartcorpus:function(corpus){
    if (corpus==this.state.rightCorpus) return this.state.leftCorpus;
    else if (corpus===this.state.leftCorpus) return this.state.rightCorpus;
  }
  ,counterpartcor:function(corpus){
    if (corpus==this.state.rightCorpus) return this.state.leftCor;
    else if (corpus===this.state.leftCorpus) return this.state.rightCor;
  }  
  ,gotoCounterpart:function(e){
    clearTimeout(this.aligncounterpart);
    const corpus=e.target.dataset.corpus;
    //move caret to next char in order to show up counter part menu
    const address=parseInt(e.target.dataset.address,10)+1;
    const action=this.context.action;
    this.aligncounterpart=setTimeout(function(){
      action("goto",{corpus,address});
    }.bind(this),300);
  }
  ,gotoSource:function(e){
    clearTimeout(this.aligncounterpart);
    const corpus=e.target.dataset.corpus;
    //move caret to next char in order to show up counter part menu
    const address=parseInt(e.target.dataset.address,10)+1;
    const action=this.context.action;
    this.aligncounterpart=setTimeout(function(){
      action("goto",{corpus,address});
    }.bind(this),300);
  }
  ,createSourcePageLink:function(opts){
    const article=opts.cor.articleOf(opts.start);
    const action=this.context.action;
    const targetcorpus=this.counterpartcorpus(opts.corpus);
    const onmouseenter=this.gotoSource;
    const caption=this.props.alignpage;//button caption
    opts.cor.getArticleField(article,this.props.alignpage,function(data){
      if (!data.pos) return;
      const at=bsearch(data.pos,opts.start,true);
      if (at<1) return;
      const targetaddress=data.value[at-1];
      const widget=document.createElement("span");
      widget.onmouseenter=onmouseenter;
      widget.className="sourcepage";
      widget.innerHTML=caption;
      widget.dataset.corpus=targetcorpus;
      widget.dataset.address=targetaddress;
      action("charWidget",{corpus:opts.corpus,address:data.pos[at-1],widget});
    });    
  }
  ,sideCorpus:function(side){
    if (side==1) return this.state.rightCorpus;
    else return this.state.leftCorpus;
  }
  ,onSelect:function(corpus,pbaddress,side){
    //pbaddress is foreign address in alignpage
    if (!corpus)return;
    const alignpage=this.props.alignpage;
    const action=this.context.action;

    if (alignpage==corpus) {
      action("corpusgoto",{corpus,address:pbaddress,side});
      return;
    }

    openCorpus(corpus,function(err,cor){
      if (err)return;
      cor.findAField(alignpage,pbaddress,function(err,address){
        if (!err) action("corpusgoto",{corpus,address:address+1,side});//+1 next char
      })
    });
  }
  ,createCounterPartLinks:function(opts){
    const action=this.context.action;
    const address=opts.cor.pageStart(opts.start);
    const side=1-opts.side;
    const widget=document.createElement("div");
    widget.className="counterparts";
    ReactDOM.render(E(CounterPartNav,{address,
      onSelect:this.onSelect, side,
      counterParts:this.props.counterParts})
    ,widget);
    
    action("lineWidget",{corpus:opts.corpus,address,widget,side:opts.side});
  }
  ,onSelection:function(opts){
    if (opts.corpus==this.props.alignpage) {
      this.createCounterPartLinks(opts);
    } else { //create a line widget to jump to other 
      this.createSourcePageLink(opts);
    }
  }
  ,render:function(){
    if (!this.state.rightCor||!this.state.leftCor) {
      return E("div",{},"loading");
    }
    var LeftView=Viewers[this.props.leftView||"default"];
    var RightView=Viewers[this.props.rightView||"default"];
    var LeftMenu=Menus[this.props.leftMenu||"default"];
    var RightMenu=Menus[this.props.RightMenu||"default"];

  	return E("div",{style:this.props.style},
  		E("div",{style:{display:'flex'}},
  			E("div",{style:{flex:this.props.leftFlex||1}},
  				E(LeftView,{side:0,cor:this.state.leftCor,corpus:this.state.leftCorpus,
            nav:this.props.nav,store:this.props.store,menu:LeftMenu,address:this.state.leftAddress
            ,onViewReady:this.onViewReady,onViewLeaving:this.onViewLeaving})),
  			E("div",{style:{flex:this.props.rightFlex||1}},
  				E(RightView,{side:1,cor:this.state.rightCor,corpus:this.state.rightCorpus,
            nav:this.props.nav,store:this.props.store,menu:RightMenu,address:this.state.rightAddress
            ,onViewReady:this.onViewReady,onViewLeaving:this.onViewLeaving}))
  		)
  	)
  }
});
module.exports=CorpusBinding;