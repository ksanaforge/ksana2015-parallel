var activelocale="en";
var stringtable={ "en":{} };

const _=function(id){
	return stringtable[activelocale][id]||id;
}
const setLocale=function(locale){
	activelocale=locale;
	if (!stringtable[locale]) stringtable[locale]={};
}
const setString=function(id,str){
	stringtable[activelocale][id]=str;
}
module.exports={_,setLocale,setString};