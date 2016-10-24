const kPosToLineCh=function(kposs){
	var r,out=[];
	for (var i=0;i<kposs.length;i++){
			r=this.props.cor.toLogicalRange(this.state.linebreaks,kposs[i][0],this.getRawLine);
			out.push([r.start,r.end,kposs[i][1]]);
	}
	return out;
}
const highlighLinkedBy=function(linkedby){
		const cm=this.refs.cm;
		for (var i=0;i<linkedby.length;i++){
			const r=linkedby[i];
			cm.markText(r[0],r[1],{className:"linkedBy",noteid:r[2]});
		}
}
	//stupid way to find out differences of old and new data
const	diffLinkedBy=function(olddata,newdata){
	var out={},key;
	for (key in newdata) {
		if (!olddata ||!olddata[key] || newdata[key].join()!==olddata[key].join()) {
			out[key]=true;
		}
	}
	if (olddata) for (key in olddata) {
		if (!newdata ||!newdata[key] || newdata[key].join()!==olddata[key].join()) {
			out[key]=true;
		}
	}
	return out;
}
const removeLinkedBy=function(differences){
	const marks=this.refs.cm.getAllMarks();
	for (var i=0;i<marks.length;i++){
		if (differences[marks[i].noteid]) {
			marks[i].clear();
		}
	}
}
const linkedBy=function(data){
	//  article/note id/range
		//object key noteid, array of krange
	const differences=diffLinkedBy(this.data,data);
	removeLinkedBy.call(this,differences);
	var kpos=[],i;
	for (var noteid in data){
		for (var i=0;i<data[noteid].length;i++){
			if (differences[noteid]>-1) {
				kpos.push([data[noteid][i],noteid]);	
			}
		}
	}
	const linkedby=kPosToLineCh.call(this,kpos);
	this.setState({links:[]}); //links to be shown in link popup
	highlighLinkedBy.call(this,linkedby);
	this.data=data;
}
module.exports=linkedBy;