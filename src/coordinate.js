var textPosToRange=function(file,rule,cm){
	var sels=cm.listSelections();
	if (!sels.length)return;
	var from=textPosToPointer(file,rule,cm,sels[0].anchor);
	var to=textPosToPointer(file,rule,cm,sels[0].head);

	var rp=rule.packRange(from,to);
	return rp;
}
var textPosToPointer=function(file,rule,cm,cursor){
	var textpos=cm.indexFromPos(cursor)-cursor.line;
	var bol=!cursor.ch;
	var pointer=rule.cursor2pointer(textpos,file,bol);
	return pointer;
}
var indexOfSorted = function (array, obj) { 
  var low = 0,
  high = array.length-1;
  while (low < high) {
    var mid = (low + high) >> 1;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  return low;
};
var pointerToTextPos=function(file,rule,cm,pointer,linebreaks,includeRightPunc){
	var atline=indexOfSorted(linebreaks,pointer);

	var index=rule.pointer2cursor(pointer,file);

	if (includeRightPunc) while ((index<file.content.length) &&
		rule.isSkipChar(file.content.charCodeAt(index+1))) index++;
	
	var pos=cm.posFromIndex(index+atline);

	return pos;
}

var rangeToTextPos=function(file,rule,cm,range,linebreaks){
	var r=rule.unpackRange(range);
	var from=pointerToTextPos(file,rule,cm,r[0],linebreaks,true);
	var to=pointerToTextPos(file,rule,cm,r[1],linebreaks);
	return {from,to};
}
module.exports={textPosToPointer,textPosToRange,
	rangeToTextPos,pointerToTextPos};