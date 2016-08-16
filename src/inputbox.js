var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var InputBox=React.createClass({
	getInitialState:function(){
		return {tofind:"",order:1,focusing:false}
	}
	,propTypes:{
		onInputChanged:PT.func.isRequired
	}
  ,onChange:function(e){
    var tofind=e.target.value;
    this.setState({tofind});
    clearTimeout(this.timer1);
    this.timer1=setTimeout(function(){
    	this.props.onInputChanged(this.state.tofind,this.state.order);
    }.bind(this),300);
  }
  ,onChangeOrder:function(e){
  	var order=parseInt(e.target.value);
  	clearTimeout(this.timer2);
  	this.refs.input.focus();
  	this.setState({order});
  	this.props.onInputChanged(this.state.tofind,order);
  }
  ,sortOption:function(){
  	if (this.state.tofind.trim() && this.state.focusing) {
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
  ,onFocus:function(){
  	this.setState({focusing:true});
  }
  ,onBlur:function(){
  	clearTimeout(this.timer2);
  	this.timer2=setTimeout(function(){
  		this.setState({focusing:false});
  	}.bind(this),500);
  }
	,render:function(){
		return E("div",{style:styles.inputBox},
        E("input",{placeholder:"Search",style:styles.input,
        	ref:"input",
        	onFocus:this.onFocus,
        	onBlur:this.onBlur,
          value:this.state.tofind,onChange:this.onChange})
        ,this.sortOption()
     );
  }
});
module.exports=InputBox;
var styles={
  inputBox:{position:"fixed",zIndex:200, left:15,top:10,opacity:0.6},
  input:{fontSize:"120%", width:210,borderRadius:5,background:"silver",outline:"none",border:"0px"}
}