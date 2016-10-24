/* convert a binding to markup */
/* similar to ../linkedby.js */
/*
const value=function(data){
	// db/article/source_target_range/data,user
	console.log("value",data);
}
*/

const added=function(key,data){
	var k=key.split("_");
	const source=parseInt(k[0],36);
	const target=parseInt(k[1],36);
	const cm=this.refs.cm;
	const r=this.props.cor.toLogicalRange(this.state.linebreaks,source,this.getRawLine);
	cm.markText(r.start,r.end,{className:"link"});
}
const removed=function(key,data){
	console.log("removed",key,data)
}
module.exports={added,removed};