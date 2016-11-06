const action=require("../units/model").action;

const handlerleave=function(){
	action("setActiveBond",{key:""});
}
var handlertimer=0;
const handlerenter=function(e){
	clearTimeout(handlertimer);
	const key=e.target.dataset.key;
	handlertimer=setTimeout(function(){
		action("setActiveBond",{key})
	},50);
}
const renderBond=function(){
	const cm=this.refs.cm.getCodeMirror();
	const B=this._bonds;
	for (var key in B) {
		const address=B[key].address;
		const r=this.toLogicalRange(address);

		if (!B[key].handle){
			var widget=document.createElement("span");
			widget.className="bondhandle";
			widget.innerHTML="●";
			widget.dataset.key=key;
			widget.onmouseenter=handlerenter;
			widget.onmouseleave=handlerleave;
			B[key].handle=cm.setBookmark(r.start,{widget,handleMouseEvents:true});
		}
	}
}
const setActiveBond=function(opts){
	const key=opts.key;
	const B=this._bonds;
	const cm=this.refs.cm.getCodeMirror();
	if (!B[key]) {
		for (var k in B) {
			if (B[k].mark) {
				B[k].mark.clear();
				B[k].mark=null;
			}
		}
		return;
	}

	if(!B[key].mark){
		const address=B[key].address;
		const r=this.toLogicalRange(address);		
		B[key].mark=cm.markText(r.start,r.end,{className:"bond","data-key":key});			
	}
}
const addBond=function(opts){
	if (this.props.corpus!==opts.corpus)return;
	if (!this._bonds) this._bonds={};
	this._bonds[opts.key]={address:opts.address};
	clearTimeout(this.renderBondTimer);
	this.renderBondTimer=setTimeout(function(){
		renderBond.call(this);
	}.bind(this),50);
}

module.exports={addBond,setActiveBond};