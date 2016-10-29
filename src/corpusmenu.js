const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const TOCNav=require("./menu/tocnav");
const ArticleNav=require("./menu/articlenav");

var CorpusMenu=React.createClass({
	getInitialState:function(){
		return {address:this.props.address};
	}
	,render:function(){
		const hasnav=this.props.nav.includes.bind(this.props.nav);
		return	E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					hasnav("toc")?E(TOCNav,this.props):null,
					E("br"),
					hasnav("article")?E(ArticleNav,this.props):null
				)
		)
	}
})

const styles={
	button:{fontSize:20,borderRadius:"10%"},
	container:{position:"relative",zIndex:100,opacity:0.9},
	viewcontrols:{position:"absolute",top:0,right:18} //for scrollbar
}
module.exports=CorpusMenu;