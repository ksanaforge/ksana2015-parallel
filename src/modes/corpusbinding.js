const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const {openCorpus,bsearch}=require("ksana-corpus");
const Viewers={
  default:require('../cmview/corpusview')
}
const Menus={
  default:require("../corpusmenu")
}
const CorpusBinding = React.createClass({
  getInitialState:function() {
    return {};
  },
  contextTypes:{
    action:PT.func.isRequired,
    listen:PT.func.isRequired,
    unlistenAll:PT.func.isRequired
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
  },
  componentWillUnmount:function(){
    this.context.unlistenAll(this);
  }
  ,counterpartcorpus:function(corpus){
    if (corpus==this.props.rightCorpus) return this.props.leftCorpus;
    else if (corpus===this.props.leftCorpus) return this.props.rightCorpus;
  }
  ,counterpartcor:function(corpus){
    if (corpus==this.props.rightCorpus) return this.state.leftCor;
    else if (corpus===this.props.leftCorpus) return this.state.rightCor;
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
    const book=opts.cor.bookOf(opts.start);
    const action=this.context.action;
    const targetcorpus=this.counterpartcorpus(opts.corpus);
    const onmouseenter=this.gotoSource;
    const caption=this.props.alignpage;//button caption
    opts.cor.getBookField(this.props.alignpage,book,function(data){
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
  ,createCounterPartLinks:function(opts){
    const action=this.context.action;
    const address=opts.cor.pageStart(opts.start);

    const widget=document.createElement("span");
    widget.onmouseenter=onmouseenter;
    widget.className="counterparts";
    widget.innerHTML="Nanchuan....";
    widget.dataset.corpus="nanchuan";
    widget.dataset.address=address;
    widget.onmouseenter=this.gotoCounterpart;

    action("lineWidget",{corpus:opts.corpus,address,widget});
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
  				E(LeftView,{side:0,cor:this.state.leftCor,corpus:this.props.leftCorpus,
            nav:this.props.nav,store:this.props.store,menu:LeftMenu,address:this.props.leftAddress})),
  			E("div",{style:{flex:this.props.rightFlex||1}},
  				E(RightView,{side:1,cor:this.state.rightCor,corpus:this.props.rightCorpus,
            nav:this.props.nav,store:this.props.store,menu:RightMenu,address:this.props.rightAddress}))
  		)
  	)
  }
});
module.exports=CorpusBinding;