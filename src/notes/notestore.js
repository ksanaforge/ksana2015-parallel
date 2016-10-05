const M=require("../model");
//	const database=this.API.firebase.database();
const EMPTYNOTE="An empty Note"
const notesFromSnapshot=function(snapshot){
	var obj=snapshot.val();
	var notes=[];
	for (var key in obj) {
		const o=Object.assign({},obj[key],{key})
		notes.push(o);
	}
	return notes;
}

const listenUserNotes=function(cb){
	const uid=M.getter("user").uid;
	const database=this.API.firebase.database();
	this.API.usernotes(uid).on('value',function(snapshot){
		const notes=notesFromSnapshot(snapshot);
		cb&&cb(notes);
	})
}
const unlistenUserNotes=function(){
	const uid=M.getter("user").uid;
	this.API.usernotes(uid).off();
}
const getUserNotes=function(cb){
	const uid=M.getter("user").uid;

	this.API.usernotes(uid).once('value').then(function(snapshot){
		const notes=notesFromSnapshot(snapshot);
		cb&&cb(notes);
	});
}
const getPublicNotes=function(store){
	console.log("getpublicnotes")
	return [];
}
const openNote=function(key,cb){
	this.API.notes().child(key).once('value').then(function(snapshot){
		cb&&cb(snapshot.val());
	});
}
const newNote=function(cb){
	const user=M.getter("user");
	var content=EMPTYNOTE;
	var uid=user.uid,title=(new Date()).toISOString();

	var id=this.API.notes().push().key;

	var notedata={uid:user.uid,title};
		
	this.API.notes().child(id).set({content});
	this.API.usernotes(uid).child(id).set(notedata);

	cb&&cb({id, uid, content,title});
}
const saveNote=function(noteid,text){
	this.API.notes().child(noteid).set({content:text});
}
const setTitle=function(uid,noteid,title){
	this.API.usernotes(uid).child(noteid+'/'+'title').set(title);
}
const deleteNote=function(uid,noteid){
	this.API.notes().child(noteid).remove();
	this.API.usernotes(uid).child(noteid).remove();
}
const createStore=function(API){
	return { newNote,openNote,saveNote,getUserNotes,getPublicNotes
		,listenUserNotes,unlistenUserNotes,API, setTitle,deleteNote}
}

module.exports=createStore;