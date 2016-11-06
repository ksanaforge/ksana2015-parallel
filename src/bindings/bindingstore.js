const M=require("../units/model");
var selections={};

const tidyArticleName=function(aname){
	return aname.replace(/\./g,"");
}
const onBinding=function(corpus,article,targetcorpus,cb,context){
	console.log("onbinding");
	const value=cb.value, added=cb.added,removed=cb.removed,API=this.API;
	article=tidyArticleName(article);
	if (added) API.binding(corpus,article,targetcorpus).on('child_added',function(snapshot){
		added.call(context,snapshot.key,snapshot.val(),corpus,article,targetcorpus);
	});
	if (removed) API.binding(corpus,article,targetcorpus).on('child_removed',function(snapshot){
		removed.call(context,snapshot.key,snapshot.val(),corpus,article,targetcorpus);
	});
}
const offBinding=function(corpus,article,targetcorpus){
	article=tidyArticleName(article);
	this.API.binding(corpus,article,targetcorpus).off('value');
}
const deleteBinding=function(corpus,article,targetcorpus,key){
	article=tidyArticleName(article);
	this.API.binding(corpus,article,targetcorpus).child(key).remove();
}
const createBinding=function(cb){
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

	this.API.binding(sdb,sarticle,tdb).child(id1).set({date});
	cb&&cb();
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

const createStore=function(API){
	return {API,onBinding,offBinding,
		createBinding,deleteBinding,setSelection,getSelections};
}

module.exports=createStore;