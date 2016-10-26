const setuplisteners=function(){
	this.context.listen("leavingfrom",onLeavingFrom,this);
	this.context.listen("gokepan",onGoKepan,this);
	this.context.listen("gopara",onGoPara,this);
	this.context.listen("tocready",onTocReady,this);
}
const onTocReady=function(toc){
	if (this.props.side)return;
	var rule=this.props.rule;
	rule.setToc(toc);
}
const onLeavingFrom=function(link){
		if(this.leavingFrom) {
				this.leavingFrom.replacedWith.className=this.leavingClass;
				this.leavingFrom=null;
		}
		var cm=this.refs.cm.getCodeMirror();
		var screentext=this.getScreenText();
		var vp=cm.getViewport();
		var i=screentext.indexOf(link);
		if (i>-1) {
			var pos=cm.posFromIndex(i+cm.indexFromPos({line:vp.from,ch:1}));
			var marks=cm.findMarks(pos,{line:pos.line,ch:pos.ch+link.length});
			if (marks&&marks.length) for (var i=0;i<marks.length;i++) {
				var m=marks[i];
				if (m.replacedWith) {
					this.leavingClass=m.replacedWith.className;
					this.leavingFrom=m;
					m.replacedWith.className="link_visited";
				}				
			}
		}
}
const onGoKepan=function(kepan) {
	var rule=this.props.rule;
	var kepantext=rule.makeKepan(kepan+" ");//prevent 37.1 jump to 37.10
	this.scrollToText(kepantext);
}
const onGoPara=function(para){
		var rule=this.props.rule;
		var paratext=rule.makeParagraph(para);
		this.scrollToText(paratext);
}
module.exports={setuplisteners}
