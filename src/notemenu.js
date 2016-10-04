var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var NoteMenu=React.createClass({
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
	,render:function(){
		return	E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					E("button",{},"button")
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
module.exports=NoteMenu;