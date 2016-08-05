var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;

var CMView=React.createClass({
	getInitialState:function(){
		return {data:this.props.data||"empty"}
	}
	,onCursorActivity:function(cm){

	}

	,render:function(){
		return E("div",{},
			E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					E("button",{style:styles.button},"經"),
					E("button",{style:styles.button},"論"),
					E("button",{style:styles.button},"英")
			)),
	  	E(CodeMirror,{ref:"cm",value:this.state.data,theme:"ambiance",
  	  onCursorActivity:this.onCursorActivity})
  	 )
	}
})
var styles={
	button:{fontSize:20},
	container:{position:"relative",zIndex:100,opacity:0.7},
	viewcontrols:{position:"absolute",right:20,top:5} //for scrollbar
}
module.exports=CMView;