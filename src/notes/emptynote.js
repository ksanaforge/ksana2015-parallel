const emptynote=function(title){
	var str="\n　　　大正藏筆記系統\n\n選經文，Ctrl+C 複製，Ctrl+V貼上嵌用\n"
	+"嵌用以楷體表示，並且不能修改，只能刪除\n"
	+"\n嵌用的列子：「@2p177b1814-1902;」選取嵌用會跳到來源。\n"
	+"\n經文有虛底線表示被嵌用，將游標移在其上，跳出嵌用清單，點一下可以開啟該筆記\n";

	if (title) {
			str+="\n這是一份新文件，\n預設的標題是「"+title+"」\n點右上方灰色輸入區修改標題，按Enter鍵確定。\n"
			+"刪除標題，並按Enter 會刪除這份文件，請慎用因為刪除後無法還原。";
	} else {
			str+="\n！！！注意！！！這是一個暫時文件，可以修改，但不會被儲存到雲端。";
	}
	return str;
}
module.exports=emptynote;