const onPtrClick=function(e){
	console.log(e.target.dataset.target);
}
var entertimer;
const onPtrEnter=function(e){
	const target=e.target;
	clearTimeout(entertimer);
	entertimer=setTimeout(function(){
		const text=target.cor.getText(parseInt(target.dataset.target,10),function(data){
			target.innerHTML=data;
		});
		target.innerHTML=text;//if text is ready, call back will be ignored
	},50);
}
const onPtrLeave=function(e){
	e.target.innerHTML=e.target.dataset.text;
}
const createPtr=function(cm,cor,linech,text,target){
	const dom=document.createElement("span");
	dom.className="ptr";
	dom.innerHTML=text;
	dom.dataset.text=text;
	dom.dataset.target=target;
	dom.onclick=onPtrClick;
	dom.cor=cor;
	dom.onmouseenter=onPtrEnter;
	dom.onmouseleave=onPtrLeave;
	cm.setBookmark(linech,{widget:dom,handleMouseEvents:true});
}
const note=function(cor,article,cm,toLogicalPos){
	cor.getArticleField(["ptr","def"],article,function(data){
		const ptr_pv=data[0], def_pv=data[1];
		if (!ptr_pv || !def_pv)return;
		ptr_pv.pos.forEach(function(pos,idx){
			//marktext
			const linech=toLogicalPos(pos);
			createPtr(cm,cor,linech,idx+1,ptr_pv.value[idx]);
		});
		def_pv.pos.forEach(function(pos,idx){
			//marktext
		});
	});

}
module.exports=note;