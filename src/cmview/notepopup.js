var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;

var NotePopup=React.createClass({
	getInitialState:function(){
		return {close:true};
	},
	propTypes:{
		rule:PT.object.isRequired,
		x:PT.number.isRequired,
		y:PT.number.isRequired,
		text:PT.string.isRequired
	},
	close:function(){
		this.setState({close:true});
	},
	componentWillReceiveProps:function(nextProps){
		if (nextProps.text) this.setState({close:false});
	},
	componentDidUpdate:function(){
		var cm=this.refs.cm;
		if (!cm)return;
		cm=cm.getCodeMirror();
		this.props.rule.markLines(cm,0,cm.lineCount()-1,
			{note:true,pagebreak:true,link:true});
	},
	render:function(){
		if (!this.props.text||this.props.x<0 ||this.state.close){
			return E("div",{});
		}
		var style=JSON.parse(JSON.stringify(styles.viewcontrols));
		style.left=this.props.x;
		style.top=this.props.y;
		style.height=150;
		style.width=320;
		if (style.left+style.width>this.props.w) {
				style.left-=style.left+style.width-this.props.w+20;
		} 
		if (style.top+style.height>this.props.h) {
				style.top-=style.top+style.height-this.props.h+20;
		} 
		return	E("div",{style:styles.container},
				E("div",{style},
					E("button",{style:styles.button,onClick:this.close},"x"),
					E(CodeMirror,{ref:"cm",readOnly:true,value:this.props.text})
				)
		)
	}
})

var styles={
	button:{position:"absolute",right:0,
	fontSize:20,borderRadius:"50%",zIndex:103,opacity:0.5},
	container:{background:"blue",position:"relative",zIndex:101},
	viewcontrols:{position:"absolute"} //for scrollbar
}
module.exports=NotePopup;