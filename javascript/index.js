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


function getUserProfileInformation() {
    //function to retrieve  user data
    //first disable all the user input fields and enable them on listing click on edit button
    var username = document.querySelector('#username');
    var fullName = document.querySelector('#fullName');
    var email = document.querySelector('#email');
    var photoURL = document.querySelector('#photoURL');
    var mobile = document.querySelector('#mobile');
    var dob = document.querySelector('#dob');
    var locality = document.querySelector('#locality');
    var address1 = document.querySelector('#address1');
    var city = document.querySelector('#city');
    var state = document.querySelector('#state');
    var country = document.querySelector('#country');
    var displayName = document.querySelector('#user-display-name');
    var userRole = document.querySelector('#user-role');
    var userImage = document.querySelector('#user-avatar-profile-image');
    var memPlan = document.getElementById('membershipPlan');
    var amountPaid = document.getElementById('amountPaid');
    var memPurchased = document.getElementById('membershipPurchased');
    var memExpire = document.getElementById('membershipExpire');
    $(".form .input>:input").prop('readonly', true);
    Auth.onAuthStateChanged(function(User) {
        if (User) {
            User.getIdTokenResult().then(idTokenResult => {
                isMember = idTokenResult.claims.membership;
                if (isMember) {
                    document.getElementById('member-card').style.visibility = "visible";
                    var currUserId = Auth.currentUser.uid;
                    var docRef = db.collection('Members').doc(currUserId);
                    docRef.get().then(function(doc) {
                        var data = doc.data();
                        console.log(data);
                        memPlan.innerText += data.plan;
                        amountPaid.innerText += data.planAmount;
                        memPurchased.innerText += data.memberFrom;
                        memExpire.innerText += data.membershipExpire;
                    });
                }
            });
            var userDatabaseRef = db.collection('Users').doc(User.uid);
            userDatabaseRef.get().then(function(doc) {
                if (doc.exists) {
                    console.log("Document opened with id : " + doc.id);
                    var user = doc.data();
                    username.value = user.username;
                    fullName.value = user.fullName;
                    email.value = user.email;
                    photoURL.value = user.photoURL;
                    mobile.value = user.mobile;
                    dob.value = user.dob;
                    locality.value = user.locality;
                    address1.value = user.address1;
                    city.value = user.city;
                    state.value = user.state;
                    country.value = user.country;
                    userRole.innerText = user.role;
                    userImage.src = user.photoURL;
                    displayName.innerText = user.fullName;
                } else {
                    console.log("User Information Doesnt Exists.")
                }
            });
            const editUser = document.getElementById('edit-user-information');
            editUser.addEventListener('click', (event) => {
                event.preventDefault();
                $(".form .input>:input").prop('readonly', false);
                $(".form-content .form-username-area>:input").prop('readonly', true);
            })
            const saveUser = document.getElementById('save-user-information');
            saveUser.addEventListener('click', (event) => {
                event.preventDefault();
                userDatabaseRef.set({
                    fullName: fullName.value,
                    email: email.value,
                    photoURL: photoURL.value,
                    mobile: mobile.value,
                    dob: dob.value,
                    locality: locality.value,
                    address1: address1.value,
                    role: "Welcome to Fitness-Edge",
                    city: city.value,
                    state: state.value,
                    country: country.value
                }, { merge: true }).then(function() {
                    $(".form .input>:input").prop('readonly', true);
                    console.log("User data saved Successfully.");
                });
            });
        } else console.log("Login to Load Dashboard Components");
    });
}