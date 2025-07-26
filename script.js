import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
    document.getElementById("user-display").textContent = `Logged in as ${user.email}`;
    signOutBtn.style.display = "inline-block";
    
    loadUserNotes(user.uid);
    loadUserProgress(user.uid);
    loadLayout();
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

// Collaborative notes
let currentTeam = null;
let collabUnsubscribe = null;

window.createTeam = async function() {
  const teamName = document.getElementById("team-name").value.trim();
  const password = document.getElementById("team-password").value;
  
  if (!teamName || !password) {
    alert("Please enter team name and password");
    return;
  }
  
  try {
    await setDoc(doc(db, "teams", teamName), {
      password: password,
      content: "",
      createdAt: serverTimestamp()
    });
    joinTeamSession(teamName);
  } catch (error) {
    alert("Team already exists or error creating team");
  }
};

window.joinTeam = async function() {
  const teamName = document.getElementById("team-name").value.trim();
  const password = document.getElementById("team-password").value;
  
  if (!teamName || !password) {
    alert("Please enter team name and password");
    return;
  }
  
  try {
    const teamDoc = await getDoc(doc(db, "teams", teamName));
    if (teamDoc.exists() && teamDoc.data().password === password) {
      joinTeamSession(teamName);
    } else {
      alert("Invalid team name or password");
    }
  } catch (error) {
    alert("Error joining team");
  }
};

function joinTeamSession(teamName) {
  currentTeam = teamName;
  document.getElementById("collab-auth").style.display = "none";
  document.getElementById("collab-editor").style.display = "block";
  document.getElementById("team-title").textContent = `Team: ${teamName}`;
  
  const teamRef = doc(db, "teams", teamName);
  collabUnsubscribe = onSnapshot(teamRef, docSnapshot => {
    if (docSnapshot.exists()) {
      const textarea = document.getElementById("collab-textarea");
      const cursorPos = textarea.selectionStart;
      textarea.value = docSnapshot.data().content || "";
      textarea.setSelectionRange(cursorPos, cursorPos);
    }
  });
  
  document.getElementById("collab-textarea").addEventListener("input", debounce(updateTeamContent, 500));
  loadSnapshots();
}

async function loadSnapshots() {
  const snapshotsRef = collection(db, "snapshots");
  const q = query(snapshotsRef, where("teamName", "==", currentTeam));
  const snapshot = await getDocs(q);
  
  const select = document.getElementById("snapshot-select");
  select.innerHTML = '<option value="">Select snapshot to load...</option>';
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${data.name} (${data.createdAt?.toDate().toLocaleString() || 'Unknown date'})`;
    select.appendChild(option);
  });
}

window.loadSnapshot = async function() {
  const snapshotId = document.getElementById("snapshot-select").value;
  if (!snapshotId) {
    alert("Please select a snapshot to load");
    return;
  }
  
  try {
    const snapshotDoc = await getDoc(doc(db, "snapshots", snapshotId));
    if (snapshotDoc.exists()) {
      const content = snapshotDoc.data().content;
      document.getElementById("collab-textarea").value = content;
      await updateDoc(doc(db, "teams", currentTeam), { content: content });
      alert("Snapshot loaded successfully!");
    }
  } catch (error) {
    alert("Error loading snapshot");
  }
};

function updateTeamContent() {
  if (currentTeam) {
    const content = document.getElementById("collab-textarea").value;
    updateDoc(doc(db, "teams", currentTeam), { content: content });
  }
}

window.saveSnapshot = async function() {
  const snapshotName = document.getElementById("snapshot-name").value.trim();
  const content = document.getElementById("collab-textarea").value;
  
  if (!snapshotName) {
    alert("Please enter a snapshot name");
    return;
  }
  
  try {
    await addDoc(collection(db, "snapshots"), {
      teamName: currentTeam,
      name: snapshotName,
      content: content,
      createdAt: serverTimestamp()
    });
    document.getElementById("snapshot-name").value = "";
    loadSnapshots();
    alert("Snapshot saved successfully!");
  } catch (error) {
    alert("Error saving snapshot");
  }
};

window.leaveTeam = function() {
  if (collabUnsubscribe) collabUnsubscribe();
  currentTeam = null;
  document.getElementById("collab-auth").style.display = "block";
  document.getElementById("collab-editor").style.display = "none";
  document.getElementById("team-name").value = "";
  document.getElementById("team-password").value = "";
  document.getElementById("collab-textarea").value = "";
  document.getElementById("snapshot-name").value = "";
  document.getElementById("snapshot-select").innerHTML = '<option value="">Select snapshot to load...</option>';
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("theme-toggle").textContent = "☀️";
}

// Layout management
let draggedElement = null;
let layouts = {};

const GRID_SIZE = 20;

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function initializeLayout() {
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    const moduleId = section.dataset.module;
    let width = '400px';
    let height = '300px';
    
    if (moduleId === 'collab') {
      width = '500px';
      height = '400px';
    } else if (moduleId === 'ctf') {
      width = '450px';
      height = '350px';
    }
    
    section.style.left = `${snapToGrid((index % 2) * 420 + 20)}px`;
    section.style.top = `${snapToGrid(Math.floor(index / 2) * 320 + 20)}px`;
    section.style.width = width;
    section.style.height = height;
    
    section.addEventListener('mousedown', startDrag);
    
    const resizeHandle = section.querySelector('.resize-handle');
    resizeHandle.addEventListener('mousedown', startResize);
  });
}

function startDrag(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  
  e.preventDefault();
  draggedElement = e.currentTarget;
  const rect = draggedElement.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  
  function drag(e) {
    if (draggedElement) {
      const newLeft = snapToGrid(e.clientX - offsetX);
      const newTop = snapToGrid(e.clientY - offsetY);
      
      draggedElement.style.left = `${Math.max(0, newLeft)}px`;
      draggedElement.style.top = `${Math.max(0, newTop)}px`;
    }
  }
  
  function stopDrag() {
    if (draggedElement) {
      saveLayout();
      draggedElement = null;
    }
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  }
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
}

function startResize(e) {
  e.stopPropagation();
  const section = e.target.parentElement;
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = parseInt(section.style.width);
  const startHeight = parseInt(section.style.height);
  
  function resize(e) {
    const newWidth = snapToGrid(startWidth + (e.clientX - startX));
    const newHeight = snapToGrid(startHeight + (e.clientY - startY));
    
    const minWidth = parseInt(getComputedStyle(section).minWidth);
    const minHeight = parseInt(getComputedStyle(section).minHeight);
    
    section.style.width = `${Math.max(minWidth, newWidth)}px`;
    section.style.height = `${Math.max(minHeight, newHeight)}px`;
  }
  
  function stopResize() {
    saveLayout();
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }
  
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
}

async function saveLayout() {
  const user = auth.currentUser;
  if (!user) return;
  
  const sections = document.querySelectorAll('section');
  const layout = {};
  
  sections.forEach(section => {
    const moduleId = section.dataset.module;
    layout[moduleId] = {
      left: section.style.left,
      top: section.style.top,
      width: section.style.width,
      height: section.style.height
    };
  });
  
  try {
    await setDoc(doc(db, "layouts", user.uid), { layout });
  } catch (error) {
    console.error("Error saving layout:", error);
  }
}

async function loadLayout() {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const layoutDoc = await getDoc(doc(db, "layouts", user.uid));
    if (layoutDoc.exists()) {
      const savedLayout = layoutDoc.data().layout;
      
      Object.entries(savedLayout).forEach(([moduleId, position]) => {
        const section = document.querySelector(`[data-module="${moduleId}"]`);
        if (section) {
          section.style.left = position.left;
          section.style.top = position.top;
          section.style.width = position.width;
          section.style.height = position.height;
        }
      });
    }
  } catch (error) {
    console.error("Error loading layout:", error);
  }
}

// Initialize
loadUpcomingCTFs();
initializeLayout();

// Hide drag hint after 5 seconds
setTimeout(() => {
  const hint = document.getElementById("drag-hint");
  if (hint) {
    hint.style.opacity = "0";
    hint.style.transition = "opacity 0.5s ease";
    setTimeout(() => hint.remove(), 500);
  }
}, 5000);

// Hide user display and popup note after 20 seconds
setTimeout(() => {
  const userDisplay = document.getElementById("user-display");
  const popupNote = document.querySelector('p[style*="opacity: 0.8"]');
  
  if (userDisplay) {
    userDisplay.style.opacity = "0";
    userDisplay.style.transition = "opacity 0.5s ease";
    setTimeout(() => userDisplay.remove(), 500);
  }
  
  if (popupNote) {
    popupNote.style.opacity = "0";
    popupNote.style.transition = "opacity 0.5s ease";
    setTimeout(() => popupNote.remove(), 500);
  }
}, 20000);
