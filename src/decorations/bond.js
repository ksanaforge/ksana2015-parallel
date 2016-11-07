/*TODO
	this._bonds will keep growing even article is changed.
	to prevent another fetch from firebase when switching from a no match page to match page.	
	need to find a better way to delete un needed bonds.
*/
const action=require("../units/model").action;
const bondhandlecaption=" ●";
var handlertimer,deletetimer;

const handlerleave=function(e){
	const widget=e.target;
	clearTimeout(deletetimer);
	clearTimeout(handlertimer);
	if (widget.className!=="bondhandle")	{
		widget.className="bondhandle";
		widget.innerHTML=bondhandlecaption;
	}
	action("setActiveBond","");
}
const mousedown=function(e){
	const widget=e.target;
	if (widget.className=="deletehandle"){
		const corpus=widget.dataset.corpus,key=widget.dataset.key;
		//action("removeBond",widget.dataset.key);
		//console.log("delete binding",corpus,key);
		action("deleteBinding",{corpus,key});
		e.stopPropagation();
	}
}
const handlerenter=function(e){
	clearTimeout(handlertimer);
	const widget=e.target;
	const key=widget.dataset.key;
	handlertimer=setTimeout(function(){
		action("setActiveBond",key);
		if (widget.dataset.shadow)return;
		deletetimer=setTimeout(function(){
			widget.className="deletehandle";
			widget.innerHTML=" DELETE ";
		},1000);
	},50);
}
const createHandle=function(key,opts){
	var widget=document.createElement("span");
	widget.className="bondhandle";
	const angle=(opts.seq+1)*30;
	widget.style="color:hsl("+angle+",90%,50%)";
	widget.innerHTML=bondhandlecaption;
	widget.dataset.key=key;
	widget.dataset.corpus=this.props.corpus;
	if (opts.shadow) widget.dataset.shadow=opts.shadow;
	widget.onmouseenter=handlerenter;
	widget.onmouseleave=handlerleave;
	widget.onmousedown=mousedown;
	return widget;
}
const renderBond=function(start,end){
	const cm=this.refs.cm.getCodeMirror();
	const B=this._bonds;
	for (var key in B) {
		const address=B[key].address;
		var krange=this.props.cor.parseRange(address);
		if (krange.start>=start&&krange.end<=end){
			const r=this.toLogicalRange(address);
			if (!B[key].handle && r.start.line>-1){
				const widget=createHandle.call(this,key,B[key]);
				B[key].handle=cm.setBookmark(r.start,{widget,handleMouseEvents:true});
			}
		} else {
			if (B[key].mark) {
				B[key].mark.clear();
				B[key].mark=null;
			}
			if (B[key].handle) {
				B[key].handle.clear();
				B[key].handle=null;
			}
		}
	}
}
const hideActiveBond=function(B){
	for (var key in B) {
		if (B[key].mark) {
			B[key].mark.clear();
			B[key].mark=null;
		}
	}
}
const setActiveBond=function(key){
	const B=this._bonds;
	if (!B)return;
	const cm=this.refs.cm.getCodeMirror();
	if (!key || !B[key]) return hideActiveBond(B);

	if(!B[key].mark){
		const address=B[key].address;
		const r=this.toLogicalRange(address);
		if (r.start.line==-1) return;
		//use rainbow color, same color for same key
		const angle=(B[key].seq+1)*30;
		const css="background:hsl("+angle+",60%,50%)";
		B[key].mark=cm.markText(r.start,r.end,{
			css,className:"bond","data-key":key});
	}
}
//return starting and ending kpos from viewport
const getViewportAddress=function(from,to){
	const cm=this.refs.cm.getCodeMirror();
	const start=this.fromLogicalPos({line:from,ch:0});
	const end=this.fromLogicalPos({line:to,ch:0});
	return {start,end};
}
const addBond=function(opts){
	if (this.props.corpus!==opts.corpus)return;
	if (!this._bonds) this._bonds={};
	this._bonds[opts.key]={address:opts.address,seq:opts.seq,shadow:opts.shadow};
	clearTimeout(this.renderBondTimer);
	this.renderBondTimer=setTimeout(function(){
		const cm=this.refs.cm.getCodeMirror();
		const vp=cm.getViewport();
		const r=getViewportAddress.call(this,vp.from,vp.to);
		renderBond.call(this,r.start,r.end);
	}.bind(this),50);
}
const repaintBond=function(){
	const cm=this.refs.cm.getCodeMirror();
	const vp=cm.getViewport();
	onViewportChange.call(this,cm,vp.from,vp.to);
}
const onViewportChange=function(cm,from,to){
	const r=getViewportAddress.call(this,from,to);
	renderBond.call(this,r.start,r.end);
}
const hideBonds=function(){
	if (!this._bonds)return;
	const B=this._bonds;
	for (var key in B) {
		if (B[key].mark) {
			B[key].mark.clear();
			B[key].mark=null;
		}
		if (B[key].handle){
			B[key].handle.clear();
			B[key].handle=null;			
		}
	}
}

const removeBond=function(key){
	if (!this._bonds)return;
	const B=this._bonds;
	if (B[key]) {
		if (B[key].mark) B[key].mark.clear();
		if (B[key].handle) B[key].handle.clear();
		delete B[key];
	}
}

module.exports={addBond,removeBond,hideBonds,setActiveBond,onViewportChange,repaintBond};