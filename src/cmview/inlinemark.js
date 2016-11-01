	,onNoteClick:function(e){
		console.log(e)

	}
	,createMark:function(cm){
		const from=cm.getCursor();
		const dom=document.createElement("span");
		dom.className="innernote";
		dom.innerHTML="中文可以嗎？abc"
		dom.onclick=this.onNoteClick;
		cm.setBookmark(from,{widget:dom,handleMouseEvents:true});
	}
	,toggleMark:function(cm){
		const from=cm.getCursor();
		const arr=cm.findMarksAt(from);
		if (arr.length) {
			arr.forEach(function(m){ m.clear()});
		} else {
			this.createMark(cm);
		}
	}
module.exports={createMark};