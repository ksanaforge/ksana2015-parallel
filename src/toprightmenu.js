var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var TopRightMenu=React.createClass({
	setDoc:function(name){
		this.props.onSetDoc(this.props.side,name);
	}
	,createButton:function(item,key){
		var style=styles.button;
		if (item.name==this.props.selected) {
			style=JSON.parse(JSON.stringify(styles.button));
			style=Object.assign(style,styles.selectedButton);
		}
		return E("button",{key,style,onClick:this.setDoc.bind(this,item.name)},item.label);
	},
	render:function(){
		return	E("div",{style:styles.container},
				E("div",{style:styles.viewcontrols},
					this.props.buttons.map(this.createButton)
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
module.exports=TopRightMenu;