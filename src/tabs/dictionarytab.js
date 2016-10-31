const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const DictionaryTab=React.createClass({
	contextTypes:{
		listen:PT.func.isRequired
		,unlistenAll:PT.func.isRequired
		,getActiveTab:PT.func.isRequired
	}
	,getInitialState:function(){
		return {caretText:""};
	}
	,componentDidMount:function(){
		this.context.listen("selection",this.onSelection,this);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,onSelection:function(opts){
		if (this.context.getActiveTab()==this.props.name) {
			this.setState({caretText:opts.caretText});
		} else {
			console.log("dictionary not active")
		}
	}
	,render:function(){
		return E("div",{},"Dictionary Tab"
			,E("div",{},"searching"+this.state.caretText)
		);
	}
});
module.exports=DictionaryTab;