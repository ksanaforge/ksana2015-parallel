const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const BreadCrumbTOC=require("ksana2015-breadcrumbtoc").Component;

TOCNav=React.createClass({
	getInitialState:function(){
		return {toc:[]};
	}
	,contextTypes:{
		action:PT.func.isRequired,
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired
	}
	,componentDidMount:function(){
		this.context.listen("selection",this.onSelection,this);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,onSelection:function(opts){
		const kpos=opts.start;
		opts.cor.getSubTOC(opts.start+1,function(tocs){
			this.setState({toc:tocs[0]||[],kpos});
		}.bind(this));
	}
	,onSelect:function(idx,address){
		this.context.action("goto",{corpus:this.props.corpus,address});
	}
	,render:function(){

		return E(BreadCrumbTOC,{toc:this.state.toc,pos:this.state.kpos
						,buttonStyle:styles.buttonStyle
						,onSelect:this.onSelect
						,activeButtonStyle:styles.activeButtonStyle
						,untrimDepth:2//last two level is visible
					})
	}
});
styles={
	activeButtonStyle:{opacity:0.9,fontWeight:700},
	buttonStyle:{opacity:0.7,fontWeight:700,color:"red"},	
	selectedButton:{background:"blue",color:"white"}
}
module.exports=TOCNav;
