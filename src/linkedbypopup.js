var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var CodeMirror=require("ksana-codemirror").Component;

var LinkedByPopup=React.createClass({
	getInitialState:function(){
		return {};
	}
	,contextTypes:{
			action:PT.func
	}
	,propTypes:{
		x:PT.number.isRequired,
		y:PT.number.isRequired,
		links:PT.array.isRequired
	}
	,opennote:function(e){
		const id=e.target.dataset.noteid;
		const scrollTo=e.target.innerText;
		id&&this.context.action("opennote",{id,scrollTo});
	}
	,noteEnter:function(e){
		this.context.action("highlightAddress",e.target.innerText);
	}
	,noteLeave:function(e){
		this.context.action("highlightAddress",null);
	}
	,renderLink:function(item,key){
		return E("div",{key,onClick:this.opennote,
				onMouseEnter:this.noteEnter,
				onMouseLeave:this.noteLeave,
				style:styles.link,
			"data-noteid":item[1],},item[0]);
	}
	,render:function(){
		if (!this.props.links.length||this.props.x<0){
			return E("div",{});
		}
		var style=JSON.parse(JSON.stringify(styles.viewcontrols));
		style.left=this.props.x;
		style.top=this.props.y;
		style.background='rgba(255,255,128,0.5)';
		if (style.left+style.width>this.props.w) {
				style.left-=style.left+style.width-this.props.w+20;
		} 
		if (style.top+style.height>this.props.h) {
				style.top-=style.top+style.height-this.props.h+20;
		} 
		return	E("div",{style:styles.container},
				E("div",{style},this.props.links.map(this.renderLink))
		)
	}
})

var styles={
	button:{position:"absolute",right:0,
	fontSize:20,borderRadius:"50%",zIndex:103,opacity:0.5},
	container:{background:"blue",position:"relative",zIndex:101},
	viewcontrols:{position:"absolute"}, //for scrollbar
	link:{cursor:"pointer"}
}
module.exports=LinkedByPopup;