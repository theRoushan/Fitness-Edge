//Listening Events is to be handled here
$('ul.dashboard-links li a[href="#"]').click(function(event) {
    event.preventDefault();
});
$('ul.dashboard-links li').click(function(event) {
    event.preventDefault();
});

//Function to get Server Time and Data
function srvTime() {
    try {
        //FF, Opera, Safari, Chrome
        xmlHttp = new XMLHttpRequest();
    } catch (err1) {
        //IE
        try {
            xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (err2) {
            try {
                xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
            } catch (eerr3) {
                //AJAX not supported, use CPU time.
                alert("AJAX not supported");
            }
        }
    }
    xmlHttp.open('HEAD', window.location.href.toString(), false);
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send('');
    return xmlHttp.getResponseHeader("Date");
}

//var st = srvTime();
//var date = new Date(st);

function display_c() {
    var refresh = 1000; // Refresh rate in milli seconds
    mytime = setTimeout('display_ct()', refresh)
}

function display_ct() {
    var st = srvTime();
    var x = new Date(st);
    var d = x + "";
    var date = d.slice(0, 15);
    var trainTime = d.slice(15, 25);
    var tmp = parseInt(trainTime.slice(1, 3));
    var hr, pre;
    if (tmp >= 12) {
        hr = tmp - 12;
        pre = "PM";
    } else if (tmp == 0) {
        hr = 12;
        pre = "AM";
    } else {
        hr = tmp;
        pre = "AM";
    }

    var curr_time = hr + trainTime.slice(3, 9) + ' ' + pre;
    var day = date.slice(8, 10);
    var month = date.slice(4, 7);
    var year = date.slice(11, 15);
    var curr_date = day + ' ' + month + ', ' + year;
    //new Date()
    document.getElementById('time').innerHTML = curr_time;
    document.getElementById('date').innerHTML = curr_date;
    tt = display_c();
}

//Function to hide the nav sidebar
function hamburger() {
    var sidebar = document.getElementById("sidebar");
    var main = document.getElementById("main");
    sidebar.classList.toggle('hide-sidebar');
    main.classList.toggle('full-container');
}

//hides the panel designed for not logged users and unhide the panel for logged user
function showLoggedUserAccess() {
    var elements = document.getElementsByClassName('logged-user');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.style.display = "flex";
    }
    var notlogged = document.getElementsByClassName("not-logged-user");
    notlogged[0].style.display = "none";
    document.getElementById('displayName').innerText = Auth.currentUser.displayName;
}

//hides the panel designed for logged users and unhide the panel for not logged user
function hideLoggedUserAccess() {
    var elements = document.getElementsByClassName('logged-user');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.style.display = "none";
    }
    var notlogged = document.getElementsByClassName("not-logged-user");
    notlogged[0].style.display = "flex";
}

//this function is designed for logging in admin in the web app
function adminLogin() {
    var email = document.getElementById('login-email').value;
    var pass = document.getElementById('login-pass').value;
    const isAdmin = false;
    Auth.signInWithEmailAndPassword(email, pass).then(function(user) {
        console.log(user);
        user.getIdTokenResult().then(idTokenResult => {
            isAdmin = idTokenResult.claims.admin;
        });
        if (user && isAdmin) {
            document.getElementById('login-panel').style.display = "none";
            console.log("you are logged as an admin");
        } else {
            logout();
            alert("you are not admin");
        }
    })
}
//this function is to get the data of user which is going to be admin
const adminLoginBtn = document.getElementById('form-login-btn');
adminLoginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    adminLogin();
})

//Listens Click for VerifyAdmin Buttom
var verifyAdmin = document.querySelector('#verify-admin');
verifyAdmin.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('updateRole').classList.toggle('show');
    document.querySelector('#updateRole #purposeOfRole').innerText = "Verify Account Before Making Admin";
    var elements = document.getElementsByClassName('input member');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.style.display = "none";
    }
    document.getElementById('make-member').style.display = "none";
    document.getElementById('make-admin').style.display = "flex";
    const adminEmail = document.getElementById('make-email-admin').value;
    var docRef = db.collection('Users').where('email', '==', adminEmail);
    docRef.get().then(function(querySnapshot) {
        if (querySnapshot.docs.length) {
            querySnapshot.forEach(function(doc) {
                var data = doc.data();
                document.getElementById('updateRoleUserId').value = doc.id;
                document.getElementById('updateRoleUsername').value = data.username;
                document.getElementById('updateRoleUserEmail').value = data.email;
            })
        } else {
            document.getElementById('updateRole').classList.toggle('show');
            alert("Corresponding User Not Found");
            document.getElementById('make-email-admin').value = "";
        }
    });
});

//add admin cloud function
const makeAdminBtn = document.getElementById('make-admin');
makeAdminBtn.addEventListener('click', (event) => {
    event.preventDefault();
    console.log("Initializing Admin Access to New Email");
    const addAdminRole = functions.httpsCallable('addAdminRole');
    var adminEmail = document.getElementById('updateRoleUserEmail').value;
    var fullName = document.getElementById('updateRolefullName').value;
    addAdminRole({ email: adminEmail }).then(result => {
        var date = addTime();
        var id = document.getElementById('updateRoleUserId').value;
        db.collection('Users').doc(id).set({ adminFrom: date, fullName: fullName }, { merge: true }).then(function() {
            console.log("User Role Modified..");
        });
        console.log(result);
        alert(adminEmail + " is admin now.");
    })
    document.getElementById('make-email-admin').value = "";
    document.getElementById('updateRole').classList.toggle('show');
});

//Listen Click for Verify Member Button
var verifyMember = document.querySelector('#verify-member');
verifyMember.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('updateRole').classList.toggle('show');
    document.querySelector('#updateRole #purposeOfRole').innerText = "Verify Account Before Making Member";
    var elements = document.getElementsByClassName('input member');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.style.display = "flex";
    }
    document.getElementById('make-admin').style.display = "none";
    document.getElementById('make-member').style.display = "flex";

    const memberEmail = document.getElementById('make-email-member').value;
    var docRef = db.collection('Users').where('email', '==', memberEmail);
    docRef.get().then(function(querySnapshot) {
        if (querySnapshot.docs.length) {
            querySnapshot.forEach(function(doc) {
                var data = doc.data();
                var userDatabaseRef = db.collection('Members').doc(doc.id);
                userDatabaseRef.get().then(function(refDoc) {
                    if (refDoc.exists) {
                        document.getElementById('updateRole').classList.toggle('show');
                        alert("User is already a Member");
                    } else {
                        document.getElementById('updateRoleUserId').value = doc.id;
                        document.getElementById('updateRoleUsername').value = data.username;
                        document.getElementById('updateRoleUserEmail').value = data.email;
                    }
                })
            })
        } else {
            document.getElementById('updateRole').classList.toggle('show');
            alert("No User Found in Database with the given email");
            document.getElementById('make-email-member').value = "";
        }
    });
})

//add member cloud functions
const makeMember = document.getElementById('make-member');
makeMember.addEventListener('click', (event) => {
    event.preventDefault();
    console.log("Initializing Member Access to New Email");
    const memberEmail = document.getElementById('make-email-member').value;
    const addMembership = functions.httpsCallable('addMembership');
    var fullName = document.getElementById('updateRolefullName').value;
    addMembership({ email: memberEmail }).then(result => {
        console.log(result);
        alert(memberEmail + " is member now.");
        var docRef = db.collection('Users').where('email', '==', memberEmail);
        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                var data = doc.data();
                var plan = document.getElementById('updateRoleUserMembershipPlan').value;
                var planAmount = document.getElementById('updateRoleUserMembershipAmount').value;
                var date = addTime();
                lastDate = increaseDate(30);
                db.collection('Members').doc(doc.id).set({ email: memberEmail, fullName: fullName, memberFrom: date, membershipExpire: lastDate, plan: plan, planAmount: planAmount }).then(function() {
                    console.log("New Member data has been updated in database");
                });
            })
        });
    });
    document.getElementById('make-email-member').value = "";
    document.getElementById('updateRole').classList.toggle('show');
});


//Function to show Subscribers list at realtime from firestore
var subscribersTable = document.querySelector('#subscribers-table');
const subscribersList = (data) => {
    let html = '';
    let heading = `<tr class="table-heading">
    <th scope="col" colspan="1">S.No</th>
    <th scope="col" colspan="6">Email</th>
    <th scope="col" colspan="2">Date</th>
</tr>`;
    var sNo = 1;
    data.forEach(doc => {
        const subscribers = doc.data();
        const element = `<tr>
        <td colspan="1">${sNo++}</td>
        <td colspan="6">${subscribers.Email}</td>
        <td colspan="2">${subscribers.created}</td>
    </tr>`
        html += element;
    });
    subscribersTable.innerHTML = heading + html;
}

function getSubscribers() {
    console.log("fetching Subscribers List");
    db.collection('Subscribers').onSnapshot(snapshot => {
        subscribersList(snapshot.docs)
    });
}


//Function to show Queries list at realtime from firestore
var queriesTable = document.querySelector('#queries-table');
const queriesList = (query) => {
    let html = '';
    let qheading = `<tr class="table-heading">
    <th scope="col" colspan="1">S.No</th>
    <th scope="col" colspan="3">Date</th>
    <th scope="col" colspan="4">Name</th>
    <th scope="col" colspan="6">Email</th>
    <th scope="col" colspan="4">Mobile</th>
    <th scope="col" colspan="6">Subject</th>
    <th scope="col" colspan="6">Message</th>
</tr>`;
    var sNo = 1;
    query.forEach(queryDoc => {
        const queries = queryDoc.data();
        const element = `<tr>
        <td colspan="1">${sNo++}</td>
        <td colspan="3">${queries.created}</td>
        <td colspan="4">${queries.fullName}</td>
        <td colspan="6">${queries.email}</td>
        <td colspan="4">${queries.mobile}</td>
        <td colspan="6">${queries.subject}</td>
        <td colspan="6">${queries.message}</td>
    </tr>`
        html += element;
    });
    queriesTable.innerHTML = qheading + html;
}

function getQueries() {
    console.log("fetching Queries List");
    db.collection('Queries').onSnapshot(snapshot => {
        queriesList(snapshot.docs)
    });
}

//Another Table for the Members details
var memberTable = document.querySelector('#tbody-members-table');
var memberAttendanceTable = document.querySelector('#tbody-attendance-table');
const membersList = (query) => {
    let html = '';
    let ahtml = '';
    var sNo = 1;
    //for members list table
    query.forEach(queryDoc => {
        const members = queryDoc.data();
        const element = `<tr>
        <td>${sNo}</td>
        <td>${members.fullName}</td>
        <td>${members.email}</td>
        <td>${members.plan}</td>
        <td>${members.memberFrom}</td>
        <td>${members.membershipExpire}</td>
        <td>${members.planAmount}</td>
    </tr>`
            //for attendance table
        const attendanceElement = `<tr>
        <td colspan="2">${sNo++}</td>
        <td colspan="6">${queryDoc.id}</td>
        <td colspan="4">${members.fullName}</td>
        <td colspan="6">${members.membershipExpire}</td>
        <td colspan="5"><select name="attendance-mark">
            <option value="present" class="option" selected>Present</option>
            <option value="absent" class="option">Absent</option>
        </select></td>
    </tr>`
        html += element;
        //it will also update the attendance table member list
        ahtml += attendanceElement;
    });
    memberTable.innerHTML = html;
    memberAttendanceTable.innerHTML = ahtml;
}

function getMembers() {
    console.log("fetching Members List");
    db.collection('Members').onSnapshot(snapshot => {
        membersList(snapshot.docs)
    });
}

//Function to display total Users
function dashboardData() {
    db.collection('Users').get().then((snapshot) => {
        var totalUsers = document.getElementById('total-users-count');
        totalUsers.innerText = snapshot.docs.length;
        //updates the total user in the manage-user tab
        document.getElementById('total-users-count-2').innerText = snapshot.docs.length;
    });
    db.collection('Members').get().then((snapshot) => {
        var totalMembers = document.getElementById('total-members-count');
        var totalMembersAttendance = document.getElementById('total-members-count-attendance');
        //console.log(snapshot.docs.length);
        totalMembers.innerText = snapshot.docs.length;
        totalMembersAttendance.innerText = snapshot.docs.length;
    });
    //function to check the new users today
    var todayDate = addTime();
    var newUsers = db.collection('Users').where('created', '==', todayDate);
    newUsers.get().then(function(querySnapshot) {
        var totalNewUsers = document.getElementById('total-new-users-count');
        console.log("Total New Users : " + querySnapshot.docs.length);
        totalNewUsers.innerText = querySnapshot.docs.length;
        document.getElementById('total-new-users-count-2').innerText = querySnapshot.docs.length;
    });

    var expireDate = db.collection('Members').where('membershipExpire', '>', todayDate);
    expireDate.get().then(function(snapshot) {
        console.log("Expired Membership : " + snapshot.docs.length);
        document.getElementById('expired-membership-count').innerText = snapshot.docs.length;
    });


    //query for total present and absent memebers attendance from database
    document.getElementById('date-tag-attendance').innerText = "Attendance for '" + todayDate + "'";
    var attendance = db.collection('Attendance').doc(todayDate);
    attendance.get().then(function(doc) {
        if (doc.exists) {
            var data = doc.data();
            document.getElementById('date-tag-attendance').innerText = "Attendance has been Submitted!";
            document.getElementById('attendanceTable').style.display = "none";
            document.getElementById('total-present-attendance').innerText = data.Present;
            document.getElementById('total-absent-attendance').innerText = data.Absent;
            //db.collection('Attendance').doc(todayDate).set({ Present: "_", Absent: "_" });
        } else {
            document.getElementById('total-present-attendance').innerText = "_";
            document.getElementById('total-absent-attendance').innerText = "_";
        }
    });
    const submitAttendance = document.getElementById('submit-attendance-button');
    submitAttendance.addEventListener('click', (event) => {
        event.preventDefault();
        var present = $('#tbody-attendance-table option:selected[value = present]').length;
        var absent = $('#tbody-attendance-table option:selected[value = absent]').length;
        var Total = document.querySelectorAll('#tbody-attendance-table tr td:nth-child(2)');
        var ref = $('#tbody-attendance-table tr option:selected');
        console.log("Absent : " + absent + " Present : " + present + " Total = " + Total.length);

        var i;
        for (i = 0; i < Total.length; i++) {
            var memId = Total[i].innerHTML + "";
            var text = ref[i].value + "";
            console.log("memID = " + memId + " text = " + text);
            attendance.set({
                [memId]: text
            }, { merge: true }).then(function() {})
        }

        attendance.update({ Present: present, Absent: absent }).then(function() {
            alert("Attendance Punched Successfully.");
            document.getElementById('attendanceTable').style.display = "none";
        })
        console.log(todayDate);
        db.collection('Attendance').doc(todayDate).get().then(function(doc) {
            var data = doc.data();
            document.getElementById('total-present-attendance').innerText = data.Present;
            document.getElementById('total-absent-attendance').innerText = data.Absent;
        });
    });

}



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
$(".form .input>:input").prop('readonly', true);
Auth.onAuthStateChanged(function(User) {
    if (User) {
        User.getIdTokenResult().then(idTokenResult => {
            isAdmin = idTokenResult.claims.admin;
            if (isAdmin) {
                dashboardData();
                getQueries();
                getSubscribers();
                getMembers();
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
                mobile.value = parseInt(user.mobile);
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