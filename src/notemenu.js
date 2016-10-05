const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const NoteMenu=React.createClass({
	getInitialState:function(){
		return {address:this.props.address,title:this.props.title};
	}
	,propTypes:{
		deleteNote:PT.func.isRequired
	}
	,contextTypes:{
		action:PT.func.isRequired,
		getter:PT.func.isRequired
	}
	,goto:function(){
		this.context.action("goto",{corpus:this.props.corpus,address:this.state.address});
	}
	,componentWillReceiveProps:function(nextProps){
		if (nextProps.title!==this.state.title) {
			this.setState({title:nextProps.title});
		}
	}
	,onChange:function(e){
		this.setState({address:e.target.value});
	}
	,onTitleKeyPress:function(e){
		if (e.key!=="Enter")return;
		const uid=this.context.getter("user");
		if (!uid) return;
		if (this.state.title=="") {
			this.props.deleteNote(this.props.noteid);
		} else {
			this.props.store.setTitle(user.uid,this.props.noteid,this.state.title);			
		}
	}
	,onTitleChange:function(e){
		const uid=this.context.getter("user");
		if (!uid) return;
		this.setState({title:e.target.value});
	}
	,renderControls:function(){
		if (this.props.noteid){
			return E("input",{style:styles.title,onChange:this.onTitleChange,
				onKeyPress:this.onTitleKeyPress,value:this.state.title
				,placeholder:"Enter to Delete this Note"})
		}
	}
	,render:function(){
		return	E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					this.renderControls()
				)
		)
	}
})

var styles={
	button:{fontSize:20,borderRadius:"10%"},
	selectedButton:{background:"blue",color:"white"},
	container:{position:"relative",zIndex:100,opacity:0.7},
	title:{fontSize:24,borderWidth:0,borderRadius:3,outline:0,background:"silver"},
	viewcontrols:{position:"absolute",right:20,top:5} //for scrollbar
}
module.exports=NoteMenu;