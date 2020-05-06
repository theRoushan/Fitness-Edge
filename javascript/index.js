const firebaseConfig = {
    apiKey: "AIzaSyAJBdrB9l7aCBJ6tbqe19xhFaT_hr0rnh4",
    authDomain: "fitness-edge-212.firebaseapp.com",
    databaseURL: "https://fitness-edge-212.firebaseio.com",
    projectId: "fitness-edge-212",
    storageBucket: "fitness-edge-212.appspot.com",
    messagingSenderId: "412671339273",
    appId: "1:412671339273:web:d3ee36a1a0d39902ab01d8",
    measurementId: "G-GXVYHKVCE0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const Auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

const newRegistration = document.getElementById('registerNewUser-btn');
newRegistration.addEventListener('click', (event) => {
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-password').value;
    Auth.createUserWithEmailAndPassword(email, password).then(function() {
        console.log("User account Created : " + Auth.currentUser.email);
        Auth.currentUser.sendEmailVerification();
        var username = document.getElementById('signup-username').value;
        Auth.currentUser.updateProfile({ displayName: username });
        db.collection("Usernames").doc(Auth.currentUser.uid).set({ username: username }).then(function(docRef) {
            console.log("Document written ");
        });
        var created = addTime();
        db.collection("Users").doc(Auth.currentUser.uid).set({
            username: username,
            created: created,
            fullName: '',
            email: email,
            password: password,
            photoURL: '',
            mobile: '',
            dob: '',
            locality: '',
            address1: '',
            city: '',
            state: '',
            country: ''
        }, { merge: true });
        var form = document.getElementsByClassName('cd-signin-modal');
        form[0].classList.remove('cd-signin-modal--is-visible');
        document.getElementById('username-display').value = username;
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage)
    });
});

function login() {
    var userEmail = document.getElementById("signin-email").value;
    var userPass = document.getElementById("signin-password").value;
    Auth.signInWithEmailAndPassword(userEmail, userPass).then(function() {
        console.log(Auth.currentUser.email + " logged in successfully.");
        var form = document.getElementsByClassName('cd-signin-modal');
        form[0].classList.remove('cd-signin-modal--is-visible');
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/user-not-found") {
            alert("User is not registered with us.");
        } else if (errorCode == "auth/wrong-password") {
            alert("Wrong Email/Password entered. Try Again!!");
        }

    });

}

function logout() {
    Auth.signOut().then(function() {
        // Sign-out successful.
        console.log("logged out successfully.");
    }).catch(function(error) {
        // An error happened.
        console.log("Logout Error" + error.message);
    });
}
//this function get datestamp for the databasce created
function addTime() {
    var timestamp = firebase.firestore.Timestamp.now();
    var temp = timestamp.toDate() + "";
    var created = temp.slice(0, 15);
    return created;
}

function increaseDate(day) {
    var timestamp = firebase.firestore.Timestamp.now().toDate();
    timestamp.setDate(timestamp.getDate() + day);
    var temp = timestamp + "";
    var created = temp.slice(0, 15);
    return created;
}

//function to  fetch email of subscribers from the website.
const subscribe = document.getElementById('subscribe-btn');
subscribe.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById("subscriber-email").value;
    if (email) {
        var created = addTime();
        db.collection('Subscribers').add({ Email: email, created: created }).then(function(doc) {
            console.log(doc.id);
        }).catch(function(error) {
            console.log("Error : " + error.code)
        });
    }
})

//function to fetch Queries from the website
const submitQuery = document.getElementById('submit-query');
submitQuery.addEventListener('click', (event) => {
    event.preventDefault();
    const fullName = document.getElementById('fname').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    var created = addTime();
    db.collection('Queries').add({ fullName: fullName, email: email, mobile: mobile, subject: subject, message: message, created: created }).then(function(doc) {
        console.log("Document created at " + doc.id);
    }).catch(function(error) {
        console.log("Error : " + error.code)
    });
})