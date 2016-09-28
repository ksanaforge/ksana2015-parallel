const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;

const CorpusView=React.createClass({

	render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		const bits=this.props.cor.meta.bits;
		return E("div",{},bits.join(","))
	}
})
module.exports=CorpusView;