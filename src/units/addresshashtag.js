/* show address on hash tag */
const M=require("./model");
const AddressHashTag=function(){
	var addresses={},selfsetting=false;
	const setHashTag=function(opts){
		var pos=[];
		const rstr=opts.cor.stringify(opts.start,opts.end);
		addresses[opts.corpus]=rstr;
		for (var corpus in addresses) {
			pos.push(corpus+"@"+addresses[corpus]);
		}
		selfsetting=true;
		window.location.hash=pos.join(",");
		setTimeout(function(){
			selfsetting=false;
		},500);
	}

	const parseHash=function(){
		const pos=window.location.hash.substr(1).split(",");
		for (var i=0;i<pos.length;i++) {
			const r=pos[i].split("@");
			if (r[0]) addresses[r[0]]=r[1];
		}
	}
	
	const goHash=function(){
		if (selfsetting)return;
		parseHash();
		for (var corpus in addresses) {
			M.action("goto",{corpus,address:addresses[corpus]});
		}
	}

	M.listen("selection",setHashTag,this);
	window.addEventListener('hashchange', goHash , false);

	parseHash();
	this.getAddress=function(corpus) {
		return addresses[corpus];
	}
}

module.exports=new AddressHashTag();
