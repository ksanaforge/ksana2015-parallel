const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;

const CounterPartNav=React.createClass({
	propTypes:{
		counterParts:PT.array.isRequired,
		onSelect:PT.func.isRequired,
		address:PT.number.isRequired,
		side:PT.number.isRequired
	}
	,renderItem:function(item,key){
		return E("span",
			{key,
			"data-corpus":item.corpus,
			"data-address":this.props.address,
			"data-side":this.props.side}
			," ",item.label," ");
	}
	,onMouseEnter:function(e){
		clearTimeout(this.entertimer);
		const corpus=e.target.dataset.corpus;
		const address=parseInt(e.target.dataset.address,10);
		const side=parseInt(e.target.dataset.side,10);
		this.entertimer=setTimeout(function(){
			this.props.onSelect(corpus,address,side);
		}.bind(this),300);
	}
	,render:function(){
		return E("div",{onMouseEnter:this.onMouseEnter},this.props.counterParts.map(this.renderItem));
	}
});
module.exports=CounterPartNav;