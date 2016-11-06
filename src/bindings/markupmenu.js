const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;

const MarkupMenu=React.createClass({
	contextTypes:{
		listen:PT.func.isRequired,
		unlistenAll:PT.func.isRequired
	}
	,getInitialState:function(){
		return {linkable:false}
	}
	,componentDidMount:function(){
		this.context.listen("selection",this.onSelection,this);
	}
	,onSelection:function(opts){
		const store=this.props.store;
		opts.end>opts.start?store.setSelection(opts.corpus,opts.article,opts.range)
			:store.setSelection(opts.corpus,opts.article,null);	

		const sels=store.getSelections();
		const linkable=Object.keys(sels).length==2;
		if (this.state.linkable!==linkable) this.setState({linkable});
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}	
	,onlink:function(){
		this.props.store.createBinding();
	}
	,render:function(){
		return E("div",{},
			E("button",{className:"mui-btn",
				onClick:this.onlink,disabled:!this.state.linkable},"  Link  ")
		);
	}
});

module.exports=MarkupMenu;