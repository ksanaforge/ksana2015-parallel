const ReactDOM=require("react-dom");
const setuplisteners=function(){
		this.context.listen("showfootnote",showfootnote,this);
		this.context.listen("hidefootnote",hidefootnote,this);	
}
const loadNote=function(note){
	var rule=this.props.rule;
	var filename=rule.getNoteFile(note);
	var d=this.context.getter("fileSync",filename);
	if (d){
		this.popupFootnote();
	} else {
		this.context.unlistenAll(this);
		this.context.listen("loaded",onNDefLoaded,this);
		this.context.getter("file",{filename,side:this.props.side});
	}
}
const onNDefLoaded=function(arg){
		this.context.unlistenAll(this);
		this.defaultListeners();
		this.popupFootnote();
}

const hasFootnoteInScreen=function(note){
		var screentext=this.getScreenText();
		var rule=this.props.rule;
		var n=rule.makeFootnote(note);
		var m=screentext.match(rule.patterns.footnote);
		if (m) {
			var at=m.indexOf(n);
			return at>-1;
		}	
		return false;
	}
const popupFootnote=function(){
		var rule=this.props.rule;
		var ndeffile=rule.getNoteFile(this.note);
		var ndefs=this.context.getter("fileSync",ndeffile);
		this.setState({popupX:this.popupX,popupY:this.popupY,
			popupW:this.popupW,popupH:this.popupH,
			popupText:ndefs[this.note]})
}
const showfootnote=function(opts){
	if (this.hasFootnoteInScreen(opts.note)){
		var n=ReactDOM.findDOMNode(this).getBoundingClientRect();
		this.popupX=opts.x-n.left; this.popupY=opts.y-n.top;
		this.popupW=n.width; this.popupH=n.height;
		this.note=opts.note;
		loadNote.call(this,opts.note);
	}
}

const hidefootnote=function(note){
	if (hasFootnoteInScreen.call(this.note)){

	}
}
module.exports={setuplisteners};