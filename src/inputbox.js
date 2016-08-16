var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var InputBox=React.createClass({
	getInitialState:function(){
		return {tofind:"",order:1}
	}
	,propTypes:{
		onInputChanged:PT.func.isRequired
	}
  ,onChange:function(e){
    var tofind=e.target.value;
    this.setState({tofind});
    clearTimeout(this.timer);
    this.timer=setTimeout(function(){
    	this.props.onInputChanged(this.state.tofind,this.state.order);
    }.bind(this),300);
  }
  ,onChangeOrder:function(e){
  	var order=parseInt(e.target.value);
  	this.setState({order});
  	this.props.onInputChanged(this.state.tofind,order);
  }
  ,sortOption:function(){
  	if (this.state.tofind.trim()) {
  		return [
  		  E("br",{key:1})
        ,E("label",{key:2},E("input",{onChange:this.onChangeOrder,
        	name:"order",type:"radio",value:1,defaultChecked:true}),"Natural")
        ,E("label",{key:3},E("input",{onChange:this.onChangeOrder,
        	name:"order",type:"radio",value:2}),"Depth")
        ,E("label",{key:4},E("input",{onChange:this.onChangeOrder,
        	name:"order",type:"radio",value:3}),"Length")
      ]
  	}
  }
	,render:function(){
		return E("div",{style:styles.inputBox},
        E("input",{placeholder:"Search",style:styles.input,
          value:this.state.tofind,onChange:this.onChange})
        ,this.sortOption()
     );
  }
});
module.exports=InputBox;
var styles={
  inputBox:{position:"fixed",zIndex:200, left:15,top:10,opacity:0.7},
  input:{fontSize:"120%", width:210,borderRadius:5,background:"silver",outline:"none",border:"0px"}
}