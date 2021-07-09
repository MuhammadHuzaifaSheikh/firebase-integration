console.log("welcomee");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAwaih_asdp7O8-EQc2P1v4uCHZsN5CqYs",
    authDomain: "erfad-cffb6.firebaseapp.com",
    projectId: "erfad-cffb6",
    storageBucket: "erfad-cffb6.appspot.com",
    messagingSenderId: "205991254741",
    appId: "1:205991254741:web:0dfb39f60e28415ea6205c",
    measurementId: "G-DKSJ0C842B",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
let db = firebase.firestore();


let bookImageUploadUrl = ''


const username = document.getElementById("username-signup");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signInUsername = document.getElementById("signup-btn");
// TODO update these
const userNameSignIn = document.getElementById("username_signIn")
const passwordSignIn = document.getElementById("username_password")


function navigation(path) {
    if (localStorage.getItem('uid')) {
        window.location.replace(path)
    } else {
        window.location.replace('sign-in.html')
    }
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        console.log("logged in")
        // ...
    } else {
        // User is signed out
        // ...
        localStorage.removeItem('uid')
        console.log("logged out");
    }
});

function signOut() {
    localStorage.removeItem('uid');
    localStorage.removeItem('currentUser');
    window.location.replace("./index.html")

}

function signUp() {
    console.log(username.value);
    console.log(email.value);
    console.log(password.value);

    firebase
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value)
        .then((e) => {
            console.log("works");
            console.log(e.log);
            add('user', {email: email.value, username: username.value, uid: e.user.uid, rating: 0})
            username.value = ''
            email.value = ''
            password.value = ''

            swal('User Registered Successfully');
        })
        .catch((e) => {
            console.log({e});
            console.log(e);
            swal(e.message)
        });
}

// Call this function to sign in the user
function signIn(e) {
    console.log(userNameSignIn);
    firebase.auth().signInWithEmailAndPassword(userNameSignIn.value, passwordSignIn.value).then(e => {
        console.log(e);
        localStorage.setItem('uid', e.user.uid)
        userNameSignIn.value = ''
        passwordSignIn.value = ''
        window.location.replace("./profile page.html")
    }).catch((e) => swal(e.message))

}

function add(collectionName, data) {
    return new Promise(function (resolve, reject) {

        db.collection(collectionName).add(data)
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                resolve(docRef.id)
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                reject(error)
            });
    })

}

// profile
let profileUsername = document.getElementById('profile-username');
let profileEmail = document.getElementById('profile-email');

function getUserInfo() {
    document.querySelector('.profile>h1').innerHTML = 'Profile  Loading......'
    db.collection("user").where("uid", "==", localStorage.getItem('uid'))
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                document.querySelector('.profile>h1').innerHTML = 'Profile';
                profileUsername.value = doc.data().username;
                console.log(doc.id);
                currentUserId = doc.id;
                localStorage.setItem('currentUser', doc.id)
                db.collection("user").doc(doc.id).update({id: doc.id}).then(() => console.log('add id'))
                profileEmail.value = doc.data().email;
                document.querySelector('.rating-number').innerHTML = doc.data().rating;

            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

}


function editUser(e) {
    if (profileUsername.value === '') {
        swal('Username cannot be blank');
    } else {
        db.collection("user").doc(localStorage.getItem('currentUser')).update({username: profileUsername.value}).then(() => {
            swal('Username updated successfully');
            getUserInfo()
        })


    }
}

// add book
function addBook() {

    let bookTitle = document.querySelector('.book-title');
    let bookName = document.querySelector('.book-name');
    let bookVersion = document.querySelector('.book-version');
    let yearPublish = document.querySelector('.year-publish');
    let department = document.querySelector('.department');
    let status = document.querySelector('.status');
    let description = document.querySelector('.description');
    let price = document.querySelector('.price');
    if (!bookImageUploadUrl || !bookTitle.value || !bookName.value || !bookVersion.value || !yearPublish.value || !department.value || !status.value || !description.value || !price.value) {
        swal('Some fields are missing');
    } else if (localStorage.getItem('currentUser')) {
        let data = {
            bookTitle: bookTitle.value,
            bookName: bookName.value,
            bookVersion: bookVersion.value,
            yearPublish: yearPublish.value,
            department: department.value,
            status: status.value,
            description: description.value,
            price: price.value,
            bookId: bookName.value.replace(/\s+/g, '') + bookVersion.value + Math.floor(Math.random() * 1000),
            ownerId: localStorage.getItem('currentUser'),
            imageUrl: bookImageUploadUrl,

        }
        add('books', data);
        bookTitle.value = ''
        bookName.value = ''
        bookVersion.value = ''
        yearPublish.value = ''
        department.value = ''
        status.value = ''
        yearPublish.value = ''
        description.value = ''
        imageUrl = ''

        document.querySelector('.book-image').src = ''
        swal('Book has published successfully');


    } else window.location.replace("./sign-in.html")
    // else  window.location.replace("./sign-in.html")


}

const loadFile = function (event) {
    let img = document.querySelector('.book-image')
    if (event.target.files[0]) {
        let reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = function () {
            img.src = reader.result
            bookImageUploadUrl = reader.result;
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

};


// my books

function MyBooks() {
    var newdiv;
    let myBooksContainer = document.querySelector('.my-books-card');
    let loading = `
    <div class="text-center loading mb-5 mt-5">
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
    `
    myBooksContainer.innerHTML = loading
    db.collection("books").where("ownerId", "==", localStorage.getItem('currentUser'))
        .get()
        .then((querySnapshot) => {
            myBooksContainer.removeChild(myBooksContainer.querySelector('.loading'))
            querySnapshot.forEach((doc) => {
                newdiv = document.createElement('div');
                newdiv.innerHTML = `
             <div class="card mt-5" style="width: 18rem;">
  <img class="card-img-top" src='${doc.data().imageUrl}'  alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${doc.data().bookTitle}</h5>
    <h5 class="card-title">${doc.data().bookName}</h5>
    <p class="card-text">${doc.data().description}</p>
    <a href="#" class="btn btn-danger">Delete</a>
  </div>
</div>
             `
                myBooksContainer.appendChild(newdiv);
                console.log(doc.id, doc.data());
            })
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}


// books page "Physics,Math,Chemistry" etc


function booksLoad(department) {
    localStorage.removeItem('productDetailInfoId');
    localStorage.removeItem('productDetailInfoDepartment');
    var newdiv;
    let myBooksContainer = document.querySelector(`.${department}_card`);
    let loading = `
    <div class="text-center loading mb-5 mt-5">
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
    `
    myBooksContainer.innerHTML = loading

    db.collection("books").where("department", "==", department)
        .get()
        .then((querySnapshot) => {
            myBooksContainer.removeChild(myBooksContainer.querySelector('.loading'))

            querySnapshot.forEach((doc) => {
                console.log(doc.id, doc.data());
                productDetailId = doc.id
                newdiv = document.createElement('div');
                newdiv.innerHTML = `
             <div  class="card mt-5 card-hover" style="width: 18rem;">
                <img class="card-img-top" src='${doc.data().imageUrl}'  alt="Card image cap">
                <h3 >${doc.data().bookTitle}</h3>
             </div>
             `
                myBooksContainer.appendChild(newdiv);
                newdiv.onclick = function () {
                    return productDetailNavigation(doc.id, department);
                };

            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

//product detail


function productDetailNavigation(id, department) {
    localStorage.setItem('productDetailInfoId', id);
    localStorage.setItem('productDetailInfoDepartment', department);

    db.collection("books").doc(id).get().then((doc) => {

        if (doc.data().ownerId === localStorage.getItem('currentUser')) {
            navigation('Book%20info%20-%20admin.html');

        } else {
            navigation('Book%20info%20-%20student.html')
        }
    })
}

function productDetail() {

    document.querySelector('.book-info-path').innerHTML = `Homepage / ${localStorage.getItem('productDetailInfoDepartment')} `

    db.collection("books").doc(localStorage.getItem('productDetailInfoId'))
        .get().then((doc) => {

        if (doc.exists) {
            let data = doc.data()
            db.collection("user").doc(data.ownerId).get().then((sellerData) => {
                document.querySelector('.seller-name').innerHTML = sellerData.data().username;
                document.querySelector('.book-name').innerHTML = data.bookName;
                document.querySelector('.description').innerHTML = data.description;
                document.querySelector('.status').innerHTML = data.status;
                document.querySelector('.version').innerHTML = data.bookVersion;
                document.querySelector('.year-publish').innerHTML = new Date(data.yearPublish).getFullYear();
                document.querySelector('.price').innerHTML = data.price;
                document.querySelector('.book-image').src = data.imageUrl;
            })

            localStorage.setItem('bookId', data.bookId)


        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });


}

function reportBookOnLoad() {
    let bookId = document.querySelector('.book-id');
    bookId.value = localStorage.getItem('bookId');
    bookId.disabled=true

}
let reportButton= document.querySelector('.report-button');
let reason = document.querySelector('.reason');
let comments = document.querySelector('.comments');
function sendReport() {
    console.log('click');
    if (reason.value===''||comments.value==='') swal('Some fields are missing');
    else {

        let loading = `
    <div class="text-center loading">
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
    `
        reportButton.innerHTML=loading

        var docRef = db.collection("reports").where('bookId', '==', localStorage.getItem('bookId'))

        docRef.get().then((querySnapShot) => {
           if (querySnapShot.docs.length<1)addReport()
            else {
                querySnapShot.forEach((doc) => {
                    console.log('reporterId',doc.data().reporterId===localStorage.getItem('currentUser'));
                    console.log(doc.data());
                    if (doc.data().reporterId === localStorage.getItem('currentUser')) {
                            swal('Sorry, You have already reported this book')
                            reportButton.innerHTML='Report'
                            console.log('If chala');

                        }
                        else {
                            addReport()
                            console.log('else chala');
                        }


                })
            }
        }).catch((error) => swal("Error getting document:", error.message));

    }



}

function addReport() {



        let loading = `
    <div class="text-center loading mb-5 mt-5">
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
    `
        db.collection("books").where('bookId', '==', localStorage.getItem('bookId')).get().then((querySnapShot) => {
            querySnapShot.forEach(async (doc) => {
                let ownerId = doc.data().ownerId;
                if (ownerId === localStorage.getItem('currentUser')) {
                    swal('You are already owner of this book');
                } else {
                    try {
                        let res = await add('reports', {
                            reason: reason.value,
                            comments: comments.value,
                            bookId: localStorage.getItem('bookId'),
                            ownerId,
                            reporterId: localStorage.getItem('currentUser')
                        })
                        console.log(res);
                        swal('Report send successfully');
                        reportButton.innerHTML='Report'
                    } catch (e) {
                        console.log(e.message);
                    }
                }


            })
        })
}

function myReports() {
    var newdiv;
    let myReportsContainer = document.querySelector(`.my-reports-container`);
    let loading = `
    <div class="text-center loading mb-5 mt-5">
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
    `
    myReportsContainer.innerHTML = loading

    db.collection("books").where("department", "==", department)
        .get()
        .then((querySnapshot) => {
            myReportsContainer.removeChild(myReportsContainer.querySelector('.loading'))

            querySnapshot.forEach((doc) => {
                console.log(doc.id, doc.data());
                newdiv = document.createElement('div');
                newdiv.innerHTML = `
              <div class= "reportadminrectangles">
                    <p class = "reportadminh5" >Report #1:</p>
                    <p class="ptextrectangles">BookID:&nbsp;<span class="spantextinsiderectangles">101</span></p>
                    <p class="ptextrectangles">Reason:&nbsp;<span class="spantextinsiderectangles">Book in not good.</span></p>
                    <p class="ptextrectangles">Comments:&nbsp;<span class="spantextinsiderectangles">The book is in bad shape.</span></p>
                    <a href="#" class="btn btn-sm btn-danger pull-right">Delete</a>
                </div>
                <br>
             `
                myReportsContainer.appendChild(newdiv);


            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

