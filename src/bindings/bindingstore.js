const M=require("../units/model");
var selections={}, viewports={};

const tidyArticleName=function(aname){
	return aname.replace(/\./g,"");
}
const onBinding=function(corpus,article,targetcorpus,cb,context){
	const value=cb.value, added=cb.added,removed=cb.removed,API=this.API;
	article=tidyArticleName(article);
	if (added) API.bind(corpus,article,targetcorpus).on('child_added',function(snapshot){
		added.call(context,snapshot.key,snapshot.val(),corpus,article,targetcorpus);
	});
	if (removed) API.bind(corpus,article,targetcorpus).on('child_removed',function(snapshot){
		removed.call(context,snapshot.key,snapshot.val(),corpus,article,targetcorpus);
	})
}
const offBinding=function(corpus,article,targetcorpus){
	article=tidyArticleName(article);
	this.API.bind(corpus,article,targetcorpus).off('value');
}
const createBinding=function(){
	//const user=M.getter("user").email;
	const date=(new Date()).toISOString();
	const db =Object.keys(selections);
	
	db.sort();//naive way to make nanchuan comes before pts

	const sdb=db[0],tdb=db[1];
	const sarticle=tidyArticleName(selections[db[0]][0]);
	const tarticle=tidyArticleName(selections[db[1]][0]);
	const srange=selections[db[0]][1];
	const trange=selections[db[1]][1];

	var id1= srange.toString(36)+"_"+trange.toString(36) ;
	//var id2= trange.toString(36)+"_"+srange.toString(36) ;

	this.API.bind(sdb,sarticle,tdb).child(id1).set({date});
}
const setSelection=function(corpus,article,range){
	if (!range) {
		delete selections[corpus];
	} else {
		selections[corpus]=[article,range];	
	}
}

const getSelections=function(){
	return selections;
}
const getViewport=function(corpus){
	return viewports[corpus];
}
const getViewports=function(){
	return viewports;
}
const setViewport=function(opts){
	const kfrom=opts.fromLogicalPos({line:opts.from,ch:0});
	const kto=opts.fromLogicalPos({line:opts.to,ch:0});
	viewports[opts.corpus]=[kfrom,kto];
//	console.log(viewports,opts.cor.stringify(kfrom),opts.cor.stringify(kto))
}
const inViewport=function(corpus,krange){

}
const createStore=function(API){
	return {onBinding,offBinding,API
		,setViewport,getViewports,getViewport
		,inViewport
		,createBinding,setSelection,getSelections};
}

module.exports=createStore;