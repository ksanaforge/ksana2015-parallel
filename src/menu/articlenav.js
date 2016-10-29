const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;

const ArticleNAV=React.createClass({
	contextTypes:{
		action:PT.func.isRequired
	}
	,nextArticle:function(){
		this.context.action("nextArticle",{corpus:this.props.corpus});
	}
	,prevArticle:function(){
		this.context.action("prevArticle",{corpus:this.props.corpus});
	}
	,render:function(){
		return E("span",{style:{position:"absolute",right:0}}
			,E("button",{onClick:this.prevArticle},"◀")
			,E("button",{},this.props.articlename)
			,E("button",{onClick:this.nextArticle},"▶")
			)
	}
});
module.exports=ArticleNAV;