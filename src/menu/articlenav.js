const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;

const ArticleNAV=React.createClass({
	contextTypes:{
		action:PT.func.isRequired,
		store:PT.object
	}
	,nextArticle:function(){
		this.context.action("nextArticle",{corpus:this.props.corpus});
	}
	,prevArticle:function(){
		this.context.action("prevArticle",{corpus:this.props.corpus});
	}
	,onCaptionClick:function(){
		const API=this.props.store.API;
		const articlename=this.props.articlename.replace(/\./g,"");
		//console.log(this.props.articlename)
		API.bind(this.props.corpus,articlename,"pts").child("bond1").set({from:1100191105027,to:52778185523202});
	}
	,render:function(){
		return E("span",{style:{position:"absolute",right:0}}
			,E("button",{onClick:this.prevArticle},"◀")
			,E("button",{onClick:this.onCaptionClick},this.props.articlename)
			,E("button",{onClick:this.nextArticle},"▶")
			)
	}
});
module.exports=ArticleNAV;