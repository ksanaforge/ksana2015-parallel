/* jsonp loading text dynamically */
var {action,store,getter,registerGetter}=require("./model");

var loadqueue=[];
var running=false;

var fireEvent=function(){
	if (loadqueue.length===0) {
		running=false;
		return;
	}
	running=true;
	var task=loadqueue.pop();
	var func=task[0], opts=task[1], cb=task[2], context=task[3];
	func.call(context,opts);
}

var queueTask=function(func,opts,cb,context) {
	loadqueue.unshift([func,opts,cb,context]);
	if (!running) fireEvent();
}
var loadfile=function(obj){
	queueTask(_loadfile,obj);
}
var datafiles={};
var loadingfilename="";
var loadingobj=null;
var loadscriptcb=function(data){
	if (!loadingfilename) {
		throw "not loading any file"
		return;
	}
	datafiles[loadingfilename]=data;

	if (loadingobj) {
		var o=JSON.parse(JSON.stringify(loadingobj));
		o.data=data;
		for (var key in loadingobj){
			if (typeof loadingobj[key]=="function") o[key]=loadingobj[key];
		}
	} else {
		var o={filename:loadingfilename,data};
	}
	
	if (o.cb) {
		o.cb(o);
	} else {
		action("loaded",o);	
	}
	
	loadingfilename="";
	loadingobj=null;
	setTimeout(fireEvent,0);
}
window.loadscriptcb=loadscriptcb;

var _loadfile=function(obj){
	if (loadingfilename) return;

	if (typeof obj=="string") {
		filename=obj;
		obj=null;
	} else {
		filename=obj.filename;
	}
	if (!filename) {
		throw "Missing filename"
	}
	if (datafiles[filename]) {
		o=JSON.parse(JSON.stringify(obj));
		o.data=datafiles[filename];
		if (obj.cb){
			obj.cb(o);
		} else {
			action("loaded",o);	
		} 
		setTimeout(fireEvent,0);
	} else {
		loadingfilename=filename;
		loadingobj=obj;
		var script = document.createElement('script');
		script.src = 'data/'+filename+".js";
		document.getElementsByTagName('head')[0].appendChild(script);
	}
}
var fileSync=function(filename){
	return datafiles[filename];
}
registerGetter("file",loadfile);
registerGetter("fileSync",fileSync);//make sure already loaded
module.exports=loadfile;