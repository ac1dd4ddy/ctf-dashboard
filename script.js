import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8G-YzVnERa6if7BgY1WXrR-j3CcF-Xos",
  authDomain: "ac1dd4ddy-ctf-dashboard.firebaseapp.com",
  projectId: "ac1dd4ddy-ctf-dashboard",
  storageBucket: "ac1dd4ddy-ctf-dashboard.firebasestorage.app",
  messagingSenderId: "889353172004",
  appId: "1:889353172004:web:440d2f318930d0587f14b1",
  measurementId: "G-W555LTLJMS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

// DOM Elements
const signOutBtn = document.getElementById("sign-out");
const notesList = document.getElementById("Notes-list");
const progressList = document.getElementById("progress-list");
const ctfList = document.getElementById("ctf-list");

// Authentication
onAuthStateChanged(auth, user => {
  if (user) {
    const emailDisplay = document.createElement("p");
    emailDisplay.textContent = `Logged in as ${user.email}`;
    document.body.insertBefore(emailDisplay, signOutBtn);
    signOutBtn.style.display = "inline-block";
    
    loadUserNotes(user.uid);
    loadUserProgress(user.uid);
  } else {
    signInWithPopup(auth, provider).catch(console.error);
  }
});

signOutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => location.reload())
    .catch(console.error);
});

// Notes functionality
function loadUserNotes(uid) {
  const notesRef = collection(db, "notes");
  const q = query(notesRef, where("uid", "==", uid));
  
  onSnapshot(q, snapshot => {
    notesList.innerHTML = "";
    snapshot.forEach(docSnapshot => {
      const li = document.createElement("li");
      li.textContent = docSnapshot.data().text;
      li.style.cursor = "pointer";
      li.title = "Click to delete";
      li.addEventListener("mouseenter", () => {
        li.style.backgroundColor = "#fee";
        li.style.color = "#e53e3e";
      });
      li.addEventListener("mouseleave", () => {
        li.style.backgroundColor = "#f7fafc";
        li.style.color = "#333";
      });
      li.addEventListener("click", async () => {
        if (confirm("Delete this note?")) {
          await deleteDoc(doc(db, "notes", docSnapshot.id));
        }
      });
      notesList.appendChild(li);
    });
  }, error => {
    console.error("Error loading notes:", error);
    notesList.innerHTML = "<li>Error loading notes. Check Firestore rules.</li>";
  });
}

window.addNotes = async function() {
  const input = document.getElementById("Notes-input");
  const user = auth.currentUser;
  
  if (input.value.trim() && user) {
    try {
      await addDoc(collection(db, "notes"), {
        text: input.value,
        createdAt: serverTimestamp(),
        uid: user.uid
      });
      input.value = "";
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Error adding note. Check Firestore rules.");
    }
  }
};

// Progress functionality
function loadUserProgress(uid) {
  const progressRef = collection(db, "progress");
  const q = query(progressRef, where("uid", "==", uid));
  
  onSnapshot(q, snapshot => {
    progressList.innerHTML = "";
    snapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${data.ctf}: `;
      label.style.cursor = "pointer";
      label.title = "Click to delete";
      label.addEventListener("mouseenter", () => {
        li.style.backgroundColor = "#fee";
        label.style.color = "#e53e3e";
      });
      label.addEventListener("mouseleave", () => {
        li.style.backgroundColor = "#f7fafc";
        label.style.color = "#333";
      });
      label.addEventListener("click", async () => {
        if (confirm(`Delete ${data.ctf}?`)) {
          await deleteDoc(doc(db, "progress", docSnapshot.id));
        }
      });
      
      const select = document.createElement("select");
      ["Planned", "In Progress", "Completed"].forEach(optionValue => {
        const option = document.createElement("option");
        option.value = option.textContent = optionValue;
        if (optionValue === data.status) option.selected = true;
        select.appendChild(option);
      });
      
      select.addEventListener("change", async () => {
        await updateDoc(doc(db, "progress", docSnapshot.id), { status: select.value });
      });
      
      li.appendChild(label);
      li.appendChild(select);
      progressList.appendChild(li);
    });
    
    // Add plus button
    const addLi = document.createElement("li");
    addLi.innerHTML = `<div style="text-align: center; font-size: 2rem; color: rgba(118, 75, 162, 0.4); cursor: pointer;">+</div>`;
    addLi.style.border = "2px dashed rgba(118, 75, 162, 0.4)";
    addLi.style.backgroundColor = "rgba(118, 75, 162, 0.1)";
    addLi.style.justifyContent = "center";
    addLi.addEventListener("click", () => {
      const ctfName = prompt("Enter CTF name:");
      if (ctfName) addProgress(uid, ctfName);
    });
    progressList.appendChild(addLi);
  }, error => {
    console.error("Error loading progress:", error);
    progressList.innerHTML = "<li>Error loading progress. Check Firestore rules.</li>";
  });
}

async function addProgress(uid, ctfName) {
  try {
    await addDoc(collection(db, "progress"), {
      ctf: ctfName,
      status: "Planned",
      uid: uid,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding progress:", error);
    alert("Error adding CTF. Check Firestore rules.");
  }
}

// CTF API functionality
function loadUpcomingCTFs() {
  const corsProxy = "https://corsproxy.io/?url=";
  fetch(`${corsProxy}https://ctftime.org/api/v1/events/?limit=5`)
    .then(res => res.json())
    .then(data => {
      data.forEach(ctf => {
        const startDate = new Date(ctf.start);
        const cdtTime = startDate.toLocaleString("en-US", {
          timeZone: "America/Chicago",
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short"
        });
        
        const duration = ctf.duration.days + (ctf.duration.hours > 0 ? ` days ${ctf.duration.hours}h` : " days");
        
        const truncatedDesc = ctf.description ? 
          (ctf.description.length > 150 ? ctf.description.substring(0, 150) + "..." : ctf.description) : 
          "No description available";
        
        const item = document.createElement("li");
        item.style.cursor = "pointer";
        item.innerHTML = `
          <div>
            <strong>${ctf.title}</strong><br>
            <small>${cdtTime} • ${duration}</small><br>
            <em>${truncatedDesc}</em>
          </div>
        `;
        item.addEventListener("click", () => window.open(ctf.url, "_blank"));
        ctfList.appendChild(item);
      });
    })
    .catch(console.error);
}

// Initialize
loadUpcomingCTFs();
