/* jsonp loading text dynamically */
var {action,store,getter,registerGetter}=require("./model");

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
	} else {
		var o={filename:loadingfilename,data};
	}
	
	action("loaded",o);
	loadingfilename="";
	loadingobj=null;
}
window.loadscriptcb=loadscriptcb;

var loadfile=function(obj){
	if (loadingfilename) return; //cannot load multiple file

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
		action("loaded",o);
	} else {
		loadingfilename=filename;
		loadingobj=obj;
		var script = document.createElement('script');
		script.src = 'data/'+filename+".js";
		document.getElementsByTagName('head')[0].appendChild(script);
	}
}
registerGetter("file",loadfile);
module.exports=loadfile;