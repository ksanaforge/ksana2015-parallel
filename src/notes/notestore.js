const M=require("../model");
//	const database=this.API.firebase.database();

const notesFromSnapshot=function(snapshot){
	var obj=snapshot.val();
	var notes=[];
	for (var i in obj) {
		notes.push(obj[i]);
	}
	return notes;
}

const listenUserNotes=function(cb){
	const uid=M.getter("user").uid;
	const database=this.API.firebase.database();
	this.API.usernotes().child(uid).on('value',function(snapshot){
		const notes=notesFromSnapshot(snapshot);
		cb&&cb(notes);
	})
}
const unlistenUserNotes=function(){
	const uid=M.getter("user").uid;
	this.API.usernotes().child(uid).off();
}
const getUserNotes=function(cb){
	const uid=M.getter("user").uid;

	this.API.usernotes().child(uid).once('value').then(function(snapshot){
		const notes=notesFromSnapshot(snapshot);
		cb&&cb(notes);
	});
}
const getPublicNotes=function(store){
	console.log("getpublicnotes")
	return [];
}
const openNote=function(key,cb){
	var key=this.API.notes().child(key).once('value').then(function(snapshot){
		cb&&cb(snapshot.val());
	});
}
const newNote=function(){
	const user=M.getter("user");
	var content="empty"+(new Date()).toString();
	var uid=user.uid,title=(new Date()).toISOString();

	var key=this.API.notes().push().key;

	var notedata={key,uid:user.uid,title};
		
	this.API.notes().child(key).set({content});
	this.API.usernotes().child(uid).push(notedata);

	return {key, uid, content,title};
}
const saveNote=function(key,text){
	this.API.notes().child(key).set({content:text});
}
const createStore=function(API){
	return { newNote,openNote,saveNote,getUserNotes,getPublicNotes
		,listenUserNotes,unlistenUserNotes,API}
}
module.exports=createStore;