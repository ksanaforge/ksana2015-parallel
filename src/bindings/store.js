const M=require("../model");
const onLink=function(corpusname,articlename,cb,context){
	this.API.link(corpusname,articlename).on('value',function(snapshot){
		cb&&cb.call(context,snapshot.val());
	})	
}
const offLink=function(corpusname,articlename){
	this.API.link(corpusname,articlename).off('value');
}

const createStore=function(API){
	return {onLink,offLink,API};
}

module.exports=createStore;