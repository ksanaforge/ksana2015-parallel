const M=require("../model");
const onLink=function(corpusname,articlename,cb,context){
	const value=cb.value, added=cb.added,removed=cb.removed,API=this.API;


	if (added) API.link(corpusname,articlename).on('child_added',function(snapshot){
		added.call(context,snapshot.key,snapshot.val());
	})

	if (removed) API.link(corpusname,articlename).on('child_removed',function(snapshot){
		removed.call(context,snapshot.key,snapshot.val());
	})	

}
const offLink=function(corpusname,articlename){
	this.API.link(corpusname,articlename).off('value');
}
//getter for current selections
var selections={};
const makelink=function(){
	const user=M.getter("user").email;
	const date=(new Date()).toISOString();
	const db =Object.keys(selections);
	const sdb=db[0],tdb=db[1];
	const sarticle=selections[db[0]][0];
	const tarticle=selections[db[1]][0];
	const srange=selections[db[0]][1];
	const trange=selections[db[1]][1];

	var id1= srange.toString(36)+"_"+trange.toString(36) ;
	var id2= trange.toString(36)+"_"+srange.toString(36) ;

	this.API.link(sdb,sarticle).child(id1).set({user,date});
	this.API.link(tdb,tarticle).child(id2).set({user,date});
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
	return {onLink,offLink,API,makelink,setSelection,getSelections};
}

module.exports=createStore;