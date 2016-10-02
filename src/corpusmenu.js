var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var CorpusMenu=React.createClass({
	getInitialState:function(){
		return {address:this.props.address};
	}
	,contextTypes:{
		action:PT.func.isRequired
	}
	,goto:function(){
		this.context.action("goto",{corpus:this.props.corpus,address:this.state.address});
	}
	,onChange:function(e){
		this.setState({address:e.target.value});
	}
	,onKeyPress:function(e){
		if (e.key==="Enter")this.goto();
	}
	,render:function(){
		return	E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					E("input",{value:this.state.address,onChange:this.onChange
						,onKeyPress:this.onKeyPress})
				)
		)
	}
})

var styles={
	button:{fontSize:20,borderRadius:"10%"},
	selectedButton:{background:"blue",color:"white"},
	container:{position:"relative",zIndex:100,opacity:0.7},
	viewcontrols:{position:"absolute",right:20,top:5} //for scrollbar
}
module.exports=CorpusMenu;