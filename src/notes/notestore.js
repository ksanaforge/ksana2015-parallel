const M=require("../model");
//	const database=this.API.firebase.database();
const emptynote=require("./emptynote");
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
const unlistenUserNotes=function(uid){
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
	var uid=user.uid,title=(new Date()).toISOString();

	var id=this.API.notes().push().key;
	var text=emptynote(title);

	var notedata={uid,title,text};

	this.API.notes().child(id).set(notedata);
	this.API.usernotes(uid).child(id).set({title});

	cb&&cb({id, uid, text,title});
}
const packKpos=function(kpos){
	return kpos.map(function(k){return k.toString(16)});
}
const saveNote=function(noteid,text,kposs){
	for (var file in kposs){
		this.API.linkedBy(file).child(noteid).set(kposs[file]);
	}
	this.API.notes().child(noteid+"/text").set(text);
}
const setTitle=function(uid,noteid,title){
	this.API.usernotes(uid).child(noteid+'/'+'title').set(title);
	this.API.notes().child(noteid+'/'+'title').set(title);
}
const deleteNote=function(userid,noteid,kposs){
	this.API.notes().child(noteid).remove();
	this.API.usernotes(userid).child(noteid).remove();

	for (var file in kposs){
		this.API.linkedBy(file).child(noteid).remove();
	}
}
const onLinkedBy=function(filename,cb,context){
	this.API.linkedBy(filename).on('value',function(snapshot){
		cb&&cb.call(context,snapshot.val());
	})	
}
const offLinkedBy=function(filename){
	this.API.linkedBy(filename).off('value');
}
const createStore=function(API){
	return { newNote,openNote,saveNote,getUserNotes,getPublicNotes
		,onLinkedBy,offLinkedBy
		,listenUserNotes,unlistenUserNotes,API, setTitle,deleteNote}
}

module.exports=createStore;