const React=require("react");
const E=React.createElement;
const PT=React.PropTypes;
const SearchTab=React.createClass({
	render:function(){
		return E("div",{},"Search tab"+Math.random());
	}
});
module.exports=SearchTab;