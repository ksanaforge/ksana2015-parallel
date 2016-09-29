const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const CMView=require("./cmview");
const CorpusView=React.createClass({
	componentDidMount:function(){
		//const r=this.props.cor.fileOf(2942591);
		//console.log(r)
		this.props.cor.getFile(6,(data)=>{
			console.log(data)
		})
	}
	,render:function(){
		if (!this.props.cor) return E("div",{},"loading");
		return E(CMView,this.props)
	}
})
module.exports=CorpusView;