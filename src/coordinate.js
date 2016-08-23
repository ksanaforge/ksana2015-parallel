var getRangePointer=function(file,rule,cm){
	var sels=cm.listSelections();
	if (!sels.length)return;
	var from=getPointer(file,rule,cm,sels[0].anchor);
	var to=getPointer(file,rule,cm,sels[0].head);

	var rp=rule.packRange(from,to);
	return rp;
}
var getPointer=function(file,rule,cm,cursor){
	var textpos=cm.indexFromPos(cursor)-cursor.line;
	var bol=!cursor.ch;
	var pointer=rule.cursor2pointer(textpos,file,bol);
	return pointer;
}

module.exports={getPointer,getRangePointer};