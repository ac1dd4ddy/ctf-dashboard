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
    loadProgress();
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
      li.addEventListener("mouseenter", () => li.style.backgroundColor = "#ffcccc");
      li.addEventListener("mouseleave", () => li.style.backgroundColor = "#f7fafc");
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
async function loadProgress() {
  try {
    const progressRef = doc(db, "progress", "team");
    const snapshot = await getDoc(progressRef);
    const data = snapshot.exists() ? snapshot.data() : {
      "HackTheBox": "Completed",
      "picoCTF": "In Progress",
      "BDSec July 2025": "Planned"
    };
    
    progressList.innerHTML = "";
    
    Object.entries(data).forEach(([ctf, status]) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${ctf}: `;
      
      const select = document.createElement("select");
      ["Planned", "In Progress", "Completed"].forEach(optionValue => {
        const option = document.createElement("option");
        option.value = option.textContent = optionValue;
        if (optionValue === status) option.selected = true;
        select.appendChild(option);
      });
      
      select.addEventListener("change", async () => {
        try {
          await updateDoc(progressRef, { [ctf]: select.value });
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      });
      
      li.appendChild(label);
      li.appendChild(select);
      progressList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading progress:", error);
    progressList.innerHTML = "<li>Using default progress data</li>";
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
