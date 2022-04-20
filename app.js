

import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL }
    from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js"

import { getFirestore, doc, getDoc, setDoc, collection, addDoc }
    from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js"
const db = getFirestore();

var files = [];
var reader = new FileReader();

var namebox = document.getElementById('namebox');
var extlab = document.getElementById('extlab');
var myimg = document.getElementById('myimg');
var proglab = document.getElementById('upprogress');
var SelBtn = document.getElementById('selbtn');
var UpBtn = document.getElementById('upbtn');
var DownBtn = document.getElementById('downbtn');

var input = document.createElement('input');
input.type = 'file';

input.onchange = e => {
    files = e.target.files;

    var extention = GetFileExt(files[0]);
    var name = GetFileName(files[0]);

    namebox.value = name;
    extlab.innerHTML = extention;

    reader.readAsDataURL(files[0]);
}

reader.onload = function () {
    myimg.src = reader.result;
}

//---select------//
SelBtn.onclick = function () {
    input.click();
}

function GetFileExt(file) {
    var temp = file.name.split('.');
    var ext = temp.slice((temp.length - 1), (temp.length));
    return '.' + ext[0];
}

function GetFileName(file) {
    var temp = file.name.split('.');
    var fname = temp.slice(0, -1).join('.');
    return fname;
}

//------------upload-------//

async function UploadProcess() {
    console.log('UploadProcess');
    var ImgToUpload = files[0];

    var ImgName = namebox.value + extlab.innerHTML;

    const metaData = {
        contentType: ImgToUpload.type
    }

    const storage = getStorage();

    const storageRef = sRef(storage, "Images/" + ImgName);

    const UploadTask = uploadBytesResumable(storageRef, ImgToUpload, metaData);

    UploadTask.on('state-changed', (snapshot) => {
        var progess = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        proglab.innerHTML = "Upload " + progess + "%";
    },
        (error) => {
            alert("error: image not Uploaded!");
        },
        () => {
            getDownloadURL(UploadTask.snapshot.ref).then((downloadURL) => {
                console.log('downloadURL');
                SaveURLtoFirestore(downloadURL);
            });
        }
    );
}

//-----------function for firestore------------------//

async function SaveURLtoFirestore(url) {
    var name = namebox.value;
    var ext = extlab.innerHTML;

    var ref = doc(db, "ImageLinks/" + name);

    await setDoc(ref, {
        ImageName: url,
        ImageURL: url
    })
}

async function GetImagefromFirestore() {
    var name = namebox.value;

    var ref = doc(db, "ImageLinks/" + name);

    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
        myimg.src = docSnap.data().ImageURL;
    }
}

UpBtn.onclick = UploadProcess;
DownBtn.onclick = GetImagefromFirestore;