var Firebase=function(path){
	var auth=null;
	var rootRef=null;
  const firebase=path.firebase;
	const login=function(cb) {
    var provider = new firebase.auth.GoogleAuthProvider();
    //provider.addScope('https://www.googleapis.com/auth/plus.login');

		firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          // [START_EXCLUDE]
          //document.getElementById('quickstart-oauthtoken').textContent = token;
          setTimeout(function(){
          	cb&&cb(user,token);
          },100);
          // [END_EXCLUDE]
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // [START_EXCLUDE]
          if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
          } else {
            console.error(error);
          }
          // [END_EXCLUDE]
        });

	};

	const logout=function(cb) {
		firebase.auth().signOut();
		cb&&cb();
	}
	var API={login,logout,firebase};
	Object.defineProperty(API,'editable',{
		get:function (){return auth}
	})
	Object.defineProperty(API,'auth',{
		get:function (){return auth||{uid:"anonymous"} }
	})
	return API;	
};

module.exports=Firebase;
