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

// Global team state
let currentTeam = null;
let teamUnsubscribes = [];

// Authentication
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("user-display").textContent = `Logged in as ${user.email}`;
    signOutBtn.style.display = "inline-block";
    
    loadUserNotes(user.uid);
    loadUserTickets(user.email);
    loadUpcomingCTFs();
    document.getElementById("team-login").style.display = "block";
    resetTeamProgress();
    loadUserTeamState(user.uid);
    
    // Initialize layout after a short delay to ensure DOM is ready
    setTimeout(() => {
      loadLayout();
    }, 500);
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
        const isDark = document.body.classList.contains("dark");
        li.style.backgroundColor = isDark ? "#1f2430" : "#f7fafc";
        li.style.color = isDark ? "#bfbdb6" : "#333";
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

// Team progress functionality
function initTeamProgress(teamName) {
  const progressRef = collection(db, "team_progress");
  const q = query(progressRef, where("teamName", "==", teamName));
  
  const unsubscribe = onSnapshot(q, snapshot => {
    const progressList = document.getElementById("progress-list");
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
          await deleteDoc(doc(db, "team_progress", docSnapshot.id));
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
        await updateDoc(doc(db, "team_progress", docSnapshot.id), { status: select.value });
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
      if (ctfName) addTeamProgress(teamName, ctfName);
    });
    progressList.appendChild(addLi);
  }, error => {
    console.error("Error loading team progress:", error);
    progressList.innerHTML = "<li>Error loading team progress. Check Firestore rules.</li>";
  });
  
  teamUnsubscribes.push(unsubscribe);
}

function resetTeamProgress() {
  const progressList = document.getElementById("progress-list");
  progressList.innerHTML = "<li style='text-align: center; color: #666; font-style: italic;'>Please join a team from top right corner</li>";
}

async function addTeamProgress(teamName, ctfName) {
  try {
    await addDoc(collection(db, "team_progress"), {
      ctf: ctfName,
      status: "Planned",
      teamName: teamName,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.email
    });
  } catch (error) {
    console.error("Error adding team progress:", error);
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

// UUID-based team system
window.createGlobalTeam = async function() {
  const teamName = document.getElementById("global-team-name").value.trim();
  
  if (!teamName || teamName.length < 3) {
    alert("Team name must be at least 3 characters");
    return;
  }
  
  try {
    const teamId = crypto.randomUUID();
    
    await setDoc(doc(db, "teams", teamId), {
      name: teamName,
      content: "",
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    });
    
    await setDoc(doc(db, "team_challenges", teamId), {
      challenges: [],
      members: [auth.currentUser.email],
      createdAt: serverTimestamp()
    });
    
    alert(`Team created! Share this ID: ${teamId}`);
    document.getElementById("global-team-name").value = teamId;
    joinGlobalTeam();
  } catch (error) {
    console.error("Error creating team:", error);
    alert("Error creating team");
  }
};

window.joinGlobalTeam = async function() {
  const teamId = document.getElementById("global-team-name").value.trim();
  
  if (!teamId) {
    alert("Please enter team ID");
    return;
  }
  
  try {
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (teamDoc.exists()) {
      currentTeam = teamId;
      updateTeamUI(true, teamDoc.data().name);
      initializeAllTeamModules(teamId);
      await saveUserTeamState(auth.currentUser.uid, teamId);
    } else {
      alert("Invalid team ID");
    }
  } catch (error) {
    console.error("Error joining team:", error);
    alert("Error joining team");
  }
};

window.leaveGlobalTeam = async function() {
  if (currentTeam) {
    teamUnsubscribes.forEach(unsubscribe => unsubscribe());
    teamUnsubscribes = [];
    currentTeam = null;
    updateTeamUI(false);
    resetAllTeamModules();
    await saveUserTeamState(auth.currentUser.uid, null);
  }
};

window.copyTeamId = function() {
  if (currentTeam) {
    navigator.clipboard.writeText(currentTeam).then(() => {
      alert('Team ID copied to clipboard!');
    }).catch(() => {
      prompt('Copy this Team ID:', currentTeam);
    });
  }
};

function updateTeamUI(isLoggedIn, teamName = null) {
  const loginDiv = document.getElementById("team-login");
  const statusDiv = document.getElementById("team-status");
  const statusText = document.getElementById("team-status-text");
  
  if (isLoggedIn) {
    loginDiv.style.display = "none";
    statusDiv.style.display = "block";
    statusText.innerHTML = `<strong>${teamName || 'Team'}</strong><br><small style="font-family: monospace; color: #666;">${currentTeam}</small>`;
    document.getElementById("global-team-name").value = "";
  } else {
    loginDiv.style.display = "block";
    statusDiv.style.display = "none";
  }
}

function initializeAllTeamModules(teamName) {
  initCollaborativeNotes(teamName);
  initTeamChallenges(teamName);
  initTeamProgress(teamName);
}

function resetAllTeamModules() {
  document.getElementById("collab-auth").style.display = "block";
  document.getElementById("collab-editor").style.display = "none";
  document.getElementById("challenges-auth").style.display = "block";
  document.getElementById("challenges-manager").style.display = "none";
  resetTeamProgress();
}

// Collaborative notes
function initCollaborativeNotes(teamName) {
  document.getElementById("collab-auth").style.display = "none";
  document.getElementById("collab-editor").style.display = "block";
  document.getElementById("team-title").textContent = `Team: ${teamName}`;
  
  const unsubscribe = onSnapshot(doc(db, "teams", teamName), docSnapshot => {
    if (docSnapshot.exists()) {
      document.getElementById("collab-textarea").value = docSnapshot.data().content || "";
    }
  });
  teamUnsubscribes.push(unsubscribe);
  
  loadSnapshots(teamName);
  
  const textarea = document.getElementById("collab-textarea");
  let timeout;
  textarea.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      if (currentTeam === teamName) {
        await updateDoc(doc(db, "teams", teamName), { content: textarea.value });
      }
    }, 500);
  });
}

// Team challenges
function initTeamChallenges(teamName) {
  document.getElementById("challenges-auth").style.display = "none";
  document.getElementById("challenges-manager").style.display = "block";
  document.getElementById("challenges-team-title").textContent = `Team: ${teamName}`;
  
  const unsubscribe = onSnapshot(doc(db, "team_challenges", teamName), async docSnapshot => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      updateMembersList(data.members || []);
      updateChallengesList(data.challenges || []);
    } else {
      // Create the document if it doesn't exist
      await setDoc(doc(db, "team_challenges", teamName), {
        challenges: [],
        members: [auth.currentUser.email],
        createdAt: serverTimestamp()
      });
    }
  });
  teamUnsubscribes.push(unsubscribe);
}

// Snapshot functionality
window.saveSnapshot = async function() {
  if (!currentTeam) return;
  
  const name = document.getElementById("snapshot-name").value.trim();
  const content = document.getElementById("collab-textarea").value;
  
  if (!name) {
    alert("Please enter a snapshot name");
    return;
  }
  
  if (!/^[a-zA-Z0-9_\s-]+$/.test(name)) {
    alert("Snapshot name can only contain letters, numbers, spaces, hyphens, and underscores");
    return;
  }
  
  try {
    await addDoc(collection(db, "snapshots"), {
      teamName: currentTeam,
      name: name,
      content: content,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.email
    });
    document.getElementById("snapshot-name").value = "";
    loadSnapshots(currentTeam);
  } catch (error) {
    console.error("Error saving snapshot:", error);
    alert("Error saving snapshot");
  }
};

window.loadSnapshot = async function() {
  if (!currentTeam) return;
  
  const select = document.getElementById("snapshot-select");
  const snapshotId = select.value;
  
  if (!snapshotId) {
    alert("Please select a snapshot to load");
    return;
  }
  
  try {
    const snapshotDoc = await getDoc(doc(db, "snapshots", snapshotId));
    if (snapshotDoc.exists() && snapshotDoc.data().teamName === currentTeam) {
      document.getElementById("collab-textarea").value = snapshotDoc.data().content;
      await updateDoc(doc(db, "teams", currentTeam), { content: snapshotDoc.data().content });
    }
  } catch (error) {
    console.error("Error loading snapshot:", error);
    alert("Error loading snapshot");
  }
};

function loadSnapshots(teamName) {
  const q = query(collection(db, "snapshots"), where("teamName", "==", teamName));
  const unsubscribe = onSnapshot(q, snapshot => {
    const select = document.getElementById("snapshot-select");
    select.innerHTML = '<option value="">Select snapshot to load...</option>';
    
    snapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const option = document.createElement("option");
      option.value = docSnapshot.id;
      option.textContent = `${data.name} (${data.createdBy})`;
      select.appendChild(option);
    });
  });
  teamUnsubscribes.push(unsubscribe);
}

// Challenge management
window.addChallenge = async function() {
  if (!currentTeam) return;
  
  const challengeName = document.getElementById("challenge-name").value.trim();
  const assignTo = document.getElementById("assign-to").value;
  
  if (!challengeName) {
    alert("Please enter a challenge name");
    return;
  }
  

  
  try {
    const teamChallengesRef = doc(db, "team_challenges", currentTeam);
    const teamDoc = await getDoc(teamChallengesRef);
    
    if (teamDoc.exists()) {
      const challenges = teamDoc.data().challenges || [];
      challenges.push({
        id: Date.now().toString(),
        name: challengeName,
        assignedTo: assignTo || "Unassigned",
        status: "Open",
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.email
      });
      
      await updateDoc(teamChallengesRef, { challenges });
      document.getElementById("challenge-name").value = "";
      document.getElementById("assign-to").value = "";
    }
  } catch (error) {
    console.error("Error adding challenge:", error);
    alert("Error adding challenge");
  }
};

function updateMembersList(members) {
  const select = document.getElementById("assign-to");
  select.innerHTML = '<option value="">Assign to...</option>';
  
  members.forEach(member => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    select.appendChild(option);
  });
  
  if (!members.includes(auth.currentUser.email)) {
    addMemberToTeam(currentTeam, auth.currentUser.email);
  }
}

function updateChallengesList(challenges) {
  const list = document.getElementById("challenges-list");
  list.innerHTML = "";
  
  challenges.forEach(challenge => {
    const div = document.createElement("div");
    div.className = "challenge-item";
    
    const name = document.createElement("strong");
    name.textContent = challenge.name;
    
    const br1 = document.createElement("br");
    
    const assignInfo = document.createElement("small");
    assignInfo.textContent = `Assigned to: ${challenge.assignedTo} | Status: ${challenge.status}`;
    
    const br2 = document.createElement("br");
    
    const createdInfo = document.createElement("small");
    createdInfo.textContent = `Created by: ${challenge.createdBy}`;
    
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = `Mark as ${challenge.status === 'Open' ? 'Completed' : 'Open'}`;
    toggleBtn.style.cssText = "margin-top: 5px; padding: 4px 8px; font-size: 12px;";
    toggleBtn.onclick = () => toggleChallengeStatus(challenge.id);
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.cssText = "margin-top: 5px; margin-left: 5px; padding: 4px 8px; font-size: 12px; background: #ff4757;";
    deleteBtn.onclick = () => deleteChallenge(challenge.id);
    
    div.appendChild(name);
    div.appendChild(br1);
    div.appendChild(assignInfo);
    div.appendChild(br2);
    div.appendChild(createdInfo);
    div.appendChild(toggleBtn);
    div.appendChild(deleteBtn);
    
    list.appendChild(div);
  });
}

window.toggleChallengeStatus = async function(challengeId) {
  if (!currentTeam) return;
  
  try {
    const teamChallengesRef = doc(db, "team_challenges", currentTeam);
    const teamDoc = await getDoc(teamChallengesRef);
    
    if (teamDoc.exists()) {
      const challenges = teamDoc.data().challenges || [];
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (challenge) {
        challenge.status = challenge.status === 'Open' ? 'Completed' : 'Open';
        await updateDoc(teamChallengesRef, { challenges });
      }
    }
  } catch (error) {
    console.error("Error updating challenge:", error);
    alert("Error updating challenge");
  }
};

window.deleteChallenge = async function(challengeId) {
  if (!currentTeam) return;
  
  if (!confirm("Delete this challenge?")) return;
  
  try {
    const teamChallengesRef = doc(db, "team_challenges", currentTeam);
    const teamDoc = await getDoc(teamChallengesRef);
    
    if (teamDoc.exists()) {
      const challenges = teamDoc.data().challenges || [];
      const filteredChallenges = challenges.filter(c => c.id !== challengeId);
      await updateDoc(teamChallengesRef, { challenges: filteredChallenges });
    }
  } catch (error) {
    console.error("Error deleting challenge:", error);
    alert("Error deleting challenge");
  }
};

async function addMemberToTeam(teamName, email) {
  try {
    const teamChallengesRef = doc(db, "team_challenges", teamName);
    const teamDoc = await getDoc(teamChallengesRef);
    
    if (teamDoc.exists()) {
      const members = teamDoc.data().members || [];
      if (!members.includes(email)) {
        members.push(email);
        await updateDoc(teamChallengesRef, { members });
      }
    } else {
      // Create document if it doesn't exist
      await setDoc(teamChallengesRef, {
        challenges: [],
        members: [email],
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error adding member:", error);
  }
}

// Ticket system functionality
function loadUserTickets(email) {
  const ticketsRef = collection(db, "tickets");
  
  onSnapshot(ticketsRef, snapshot => {
    const ticketsList = document.getElementById("tickets-list");
    ticketsList.innerHTML = "";
    
    snapshot.forEach(docSnapshot => {
      const ticket = docSnapshot.data();
      const ticketId = docSnapshot.id;
      
      // Show tickets created by user or assigned to user
      if (ticket.createdByEmail === email || ticket.assignedTo === email) {
        const type = ticket.createdByEmail === email ? 'created' : 'assigned';
        
        const div = document.createElement("div");
        div.className = "ticket-item";
        
        const header = document.createElement("div");
        header.className = "ticket-header";
        
        const headerLeft = document.createElement("div");
        const subject = document.createElement("strong");
        subject.textContent = ticket.subject;
        const small = document.createElement("small");
        small.style.cssText = "display: block; color: #666;";
        small.textContent = type === 'created' ? `To: ${ticket.assignedTo}` : `From: ${ticket.createdByEmail}`;
        headerLeft.appendChild(subject);
        headerLeft.appendChild(small);
        
        const status = document.createElement("span");
        status.className = `ticket-status ${ticket.status === 'open' ? 'status-open' : 'status-resolved'}`;
        status.textContent = ticket.status.toUpperCase();
        
        header.appendChild(headerLeft);
        header.appendChild(status);
        
        const desc = document.createElement("p");
        desc.style.cssText = "margin: 10px 0; color: #666;";
        desc.textContent = ticket.description;
        
        const messages = document.createElement("div");
        messages.className = "ticket-messages";
        messages.id = `messages-${ticketId}`;
        
        div.appendChild(header);
        div.appendChild(desc);
        div.appendChild(messages);
        
        if (ticket.status === 'open') {
          const reply = document.createElement("div");
          reply.className = "ticket-reply";
          const input = document.createElement("input");
          input.id = `comment-${ticketId}`;
          input.placeholder = "Add a comment...";
          input.style.cssText = "flex: 1; margin-right: 10px;";
          const commentBtn = document.createElement("button");
          commentBtn.textContent = "Comment";
          commentBtn.style.cssText = "padding: 8px 12px;";
          commentBtn.onclick = () => addComment(ticketId);
          const resolveBtn = document.createElement("button");
          resolveBtn.textContent = "Resolve";
          resolveBtn.style.cssText = "background: #38a169; padding: 8px 12px;";
          resolveBtn.onclick = () => resolveTicket(ticketId);
          reply.appendChild(input);
          reply.appendChild(commentBtn);
          reply.appendChild(resolveBtn);
          div.appendChild(reply);
        } else {
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.style.cssText = "background: #e53e3e; margin-top: 10px;";
          deleteBtn.onclick = () => deleteTicket(ticketId);
          div.appendChild(deleteBtn);
        }
        ticketsList.appendChild(div);
        
        // Load comments for this ticket
        loadTicketComments(ticketId);
      }
    });
  });
}

function loadTicketComments(ticketId) {
  const ticketRef = doc(db, "tickets", ticketId);
  onSnapshot(ticketRef, docSnapshot => {
    if (docSnapshot.exists()) {
      const ticket = docSnapshot.data();
      const messagesContainer = document.getElementById(`messages-${ticketId}`);
      if (messagesContainer && ticket.comments) {
        messagesContainer.innerHTML = "";
        ticket.comments.forEach(comment => {
          const commentDiv = document.createElement("div");
          commentDiv.className = "message";
          
          const author = document.createElement("div");
          author.className = "message-author";
          author.textContent = comment.author;
          
          const text = document.createElement("div");
          text.textContent = comment.text;
          
          const timestamp = document.createElement("small");
          timestamp.style.color = "#666";
          timestamp.textContent = comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleString() : 'Just now';
          
          commentDiv.appendChild(author);
          commentDiv.appendChild(text);
          commentDiv.appendChild(timestamp);
          messagesContainer.appendChild(commentDiv);
        });
      }
    }
  });
}

window.addComment = async function(ticketId) {
  const commentInput = document.getElementById(`comment-${ticketId}`);
  const commentText = commentInput.value.trim();
  const user = auth.currentUser;
  
  if (!commentText || !user) return;
  
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (ticketDoc.exists()) {
      const ticket = ticketDoc.data();
      
      // Only allow creator or assignee to comment
      if (ticket.createdByEmail !== user.email && ticket.assignedTo !== user.email) {
        alert("You can only comment on tickets you created or are assigned to");
        return;
      }
      
      const comments = ticket.comments || [];
      
      comments.push({
        author: user.email,
        text: commentText,
        timestamp: new Date()
      });
      
      await updateDoc(ticketRef, { comments });
      commentInput.value = "";
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Error adding comment");
  }
};

window.createTicket = async function() {
  const email = document.getElementById("ticket-email").value.trim();
  const subject = document.getElementById("ticket-subject").value.trim();
  const description = document.getElementById("ticket-description").value.trim();
  const user = auth.currentUser;
  
  if (!email || !subject || !description || !user) {
    alert("Please fill all fields and ensure you are logged in");
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }
  
  try {
    await addDoc(collection(db, "tickets"), {
      createdBy: user.uid,
      createdByEmail: user.email,
      assignedTo: email,
      subject: subject,
      description: description,
      status: "open",
      createdAt: serverTimestamp(),
      comments: []
    });
    
    document.getElementById("ticket-email").value = "";
    document.getElementById("ticket-subject").value = "";
    document.getElementById("ticket-description").value = "";
    
    alert("Ticket created successfully!");
  } catch (error) {
    console.error("Error creating ticket:", error);
    alert("Error creating ticket");
  }
};

window.resolveTicket = async function(ticketId) {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (ticketDoc.exists()) {
      const ticket = ticketDoc.data();
      
      // Only assignee can resolve tickets
      if (ticket.assignedTo !== user.email) {
        alert("Only the assigned user can resolve this ticket");
        return;
      }
      
      await updateDoc(ticketRef, {
        status: "resolved",
        resolvedAt: serverTimestamp(),
        resolvedBy: user.email
      });
    }
  } catch (error) {
    console.error("Error resolving ticket:", error);
    alert("Error resolving ticket");
  }
};

window.deleteTicket = async function(ticketId) {
  const user = auth.currentUser;
  if (!user) return;
  
  if (!confirm("Are you sure you want to delete this ticket?")) return;
  
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (ticketDoc.exists()) {
      const ticket = ticketDoc.data();
      
      // Only creator can delete tickets
      if (ticket.createdByEmail !== user.email) {
        alert("Only the ticket creator can delete this ticket");
        return;
      }
      
      await deleteDoc(ticketRef);
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);
    alert("Error deleting ticket");
  }
};

async function saveUserTeamState(uid, teamName) {
  try {
    await setDoc(doc(db, "userTeamStates", uid), {
      currentTeam: teamName,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving team state:", error);
  }
}

async function loadUserTeamState(uid) {
  try {
    const stateDoc = await getDoc(doc(db, "userTeamStates", uid));
    if (stateDoc.exists() && stateDoc.data().currentTeam) {
      const teamId = stateDoc.data().currentTeam;
      
      // Verify team still exists and user has access
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (teamDoc.exists()) {
        currentTeam = teamId;
        updateTeamUI(true, teamDoc.data().name);
        initializeAllTeamModules(teamId);
      } else {
        // Team no longer exists, clear state
        await saveUserTeamState(uid, null);
      }
    }
  } catch (error) {
    console.error("Error loading team state:", error);
  }
}

// Layout management
let draggedElement = null;
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
    } else if (moduleId === 'tickets') {
      width = '500px';
      height = '450px';
    } else if (moduleId === 'knowledge') {
      width = '350px';
      height = '200px';
    } else if (moduleId === 'decoder') {
      width = '400px';
      height = '350px';
    } else if (moduleId === 'vigenere') {
      width = '400px';
      height = '380px';
    } else if (moduleId === 'challenges') {
      width = '450px';
      height = '400px';
    }
    
    // Only set position if not already set
    if (!section.style.left || !section.style.top) {
      section.style.left = `${snapToGrid((index % 2) * 420 + 20)}px`;
      section.style.top = `${snapToGrid(Math.floor(index / 2) * 320 + 20)}px`;
    }
    
    // Always set size
    section.style.width = width;
    section.style.height = height;
    
    // Remove existing listeners to prevent duplicates
    section.removeEventListener('mousedown', startDrag);
    section.addEventListener('mousedown', startDrag);
    
    const resizeHandle = section.querySelector('.resize-handle');
    if (resizeHandle) {
      resizeHandle.removeEventListener('mousedown', startResize);
      resizeHandle.addEventListener('mousedown', startResize);
    }
  });
}

function startDrag(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  
  e.preventDefault();
  draggedElement = e.currentTarget;
  const offsetX = e.clientX - parseInt(draggedElement.style.left || 0);
  const offsetY = e.clientY - parseInt(draggedElement.style.top || 0);
  
  function drag(e) {
    if (draggedElement) {
      const newLeft = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;
      
      draggedElement.style.left = `${newLeft}px`;
      draggedElement.style.top = `${newTop}px`;
    }
  }
  
  function stopDrag() {
    if (draggedElement) {
      const currentLeft = parseInt(draggedElement.style.left);
      const currentTop = parseInt(draggedElement.style.top);
      draggedElement.style.left = `${snapToGrid(currentLeft)}px`;
      draggedElement.style.top = `${snapToGrid(currentTop)}px`;
      
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
    
    const minWidth = parseInt(getComputedStyle(section).minWidth) || 300;
    const minHeight = parseInt(getComputedStyle(section).minHeight) || 200;
    
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
    await setDoc(doc(db, "layouts", user.uid), { 
      layout,
      minimizedModules
    });
  } catch (error) {
    console.error("Error saving layout:", error);
  }
}

async function loadLayout() {
  const user = auth.currentUser;
  if (!user) {
    initializeLayout();
    return;
  }
  
  try {
    const layoutDoc = await getDoc(doc(db, "layouts", user.uid));
    if (layoutDoc.exists()) {
      const data = layoutDoc.data();
      const savedLayout = data.layout;
      const savedMinimized = data.minimizedModules || [];
      
      Object.entries(savedLayout).forEach(([moduleId, position]) => {
        const section = document.querySelector(`[data-module="${moduleId}"]`);
        if (section) {
          section.style.left = position.left;
          section.style.top = position.top;
          section.style.width = position.width;
          section.style.height = position.height;
        }
      });
      
      // Restore minimized states
      minimizedModules = savedMinimized;
      savedMinimized.forEach(moduleId => {
        const sectionId = `${moduleId}-section`;
        const module = document.getElementById(sectionId);
        if (module) {
          const moduleTitle = module.querySelector('h2').textContent.replace(' −', '');
          module.style.display = 'none';
          
          const panel = document.createElement('div');
          panel.className = 'minimized-panel';
          panel.id = `minimized-${sectionId}`;
          panel.innerHTML = `
            <span>${moduleTitle}</span>
            <button onclick="restoreModule('${sectionId}')" style="background: #ff8f40; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer;">+</button>
          `;
          
          const existingPanels = document.querySelectorAll('.minimized-panel').length;
          panel.style.top = `${100 + (existingPanels * 50)}px`;
          document.body.appendChild(panel);
        }
      });
      
      // Ensure event listeners are attached even with saved layout
      attachDragListeners();
    } else {
      initializeLayout();
    }
  } catch (error) {
    console.error("Error loading layout:", error);
    initializeLayout();
  }
}

function attachDragListeners() {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.removeEventListener('mousedown', startDrag);
    section.addEventListener('mousedown', startDrag);
    
    const resizeHandle = section.querySelector('.resize-handle');
    if (resizeHandle) {
      resizeHandle.removeEventListener('mousedown', startResize);
      resizeHandle.addEventListener('mousedown', startResize);
    }
  });
}

// Minimize functionality
let minimizedModules = [];

window.minimizeModule = function(moduleId) {
  const module = document.getElementById(moduleId);
  const moduleTitle = module.querySelector('h2').textContent.replace(' −', '');
  
  module.style.display = 'none';
  
  const panel = document.createElement('div');
  panel.className = 'minimized-panel';
  panel.id = `minimized-${moduleId}`;
  panel.innerHTML = `
    <span>${moduleTitle}</span>
    <button onclick="restoreModule('${moduleId}')" style="background: #ff8f40; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer;">+</button>
  `;
  
  const existingPanels = document.querySelectorAll('.minimized-panel').length;
  panel.style.top = `${100 + (existingPanels * 50)}px`;
  
  document.body.appendChild(panel);
  const moduleDataId = module.dataset.module;
  minimizedModules.push(moduleDataId);
  saveLayout();
};

window.restoreModule = function(moduleId) {
  const module = document.getElementById(moduleId);
  const panel = document.getElementById(`minimized-${moduleId}`);
  
  module.style.display = 'flex';
  panel.remove();
  
  const remainingPanels = document.querySelectorAll('.minimized-panel');
  remainingPanels.forEach((panel, index) => {
    panel.style.top = `${100 + (index * 50)}px`;
  });
  
  const moduleDataId = module.dataset.module;
  minimizedModules = minimizedModules.filter(id => id !== moduleDataId);
  saveLayout();
};

// Decoder functionality
window.decodeText = function() {
  const input = document.getElementById('decoder-input').value;
  const type = document.getElementById('decoder-type').value;
  const output = document.getElementById('decoder-output');
  
  try {
    let result = '';
    
    switch(type) {
      case 'hex':
        result = input.replace(/[^0-9A-Fa-f]/g, '').replace(/(..)/g, (hex) => 
          String.fromCharCode(parseInt(hex, 16))
        );
        break;
      case 'base64':
        result = atob(input.replace(/[^A-Za-z0-9+/=]/g, ''));
        break;
      case 'base32':
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        const cleanInput = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
        for (let i = 0; i < cleanInput.length; i++) {
          const val = alphabet.indexOf(cleanInput[i]);
          if (val >= 0) bits += val.toString(2).padStart(5, '0');
        }
        for (let i = 0; i + 8 <= bits.length; i += 8) {
          result += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
        }
        break;
      case 'rot13':
        result = input.replace(/[A-Za-z]/g, (char) => {
          const start = char <= 'Z' ? 65 : 97;
          return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
        });
        break;
      case 'url':
        result = decodeURIComponent(input);
        break;
    }
    
    output.value = result;
  } catch (error) {
    output.value = 'Error: Invalid input for selected encoding';
  }
};

// Vigenere cipher functionality
window.solveVigenere = function() {
  const input = document.getElementById('vigenere-input').value;
  const key = document.getElementById('vigenere-key').value.trim();
  const output = document.getElementById('vigenere-output');
  
  if (!input.trim()) {
    output.value = 'Please enter encrypted text';
    return;
  }
  
  function vigenereDecrypt(text, key) {
    let result = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[A-Za-z]/)) {
        const isUpper = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = key[keyIndex % key.length].toUpperCase().charCodeAt(0) - 65;
        const decrypted = (charCode - keyChar + 26) % 26;
        result += String.fromCharCode(decrypted + 65);
        if (!isUpper) result = result.slice(0, -1) + result.slice(-1).toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }
  
  if (key) {
    output.value = vigenereDecrypt(input, key);
  } else {
    const commonKeys = ['KEY', 'SECRET', 'PASSWORD', 'CIPHER', 'CODE', 'FLAG', 'CTF'];
    let bestResult = '';
    let bestKey = '';
    
    for (const testKey of commonKeys) {
      const decrypted = vigenereDecrypt(input, testKey);
      if (decrypted.includes('FLAG') || decrypted.includes('CTF')) {
        bestResult = decrypted;
        bestKey = testKey;
        break;
      }
    }
    
    output.value = bestResult ? `Key: ${bestKey}\n\n${bestResult}` : 'Could not find valid key. Try providing the key manually.';
  }
};

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.textContent = '☀️';
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
  
  // Initialize layout for any sections that don't have positioning yet
  setTimeout(() => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      if (!section.style.left || !section.style.top) {
        initializeLayout();
      }
    });
  }, 1000);
  
  // Fade out user info elements after 15 seconds
  setTimeout(() => {
    const userDisplay = document.getElementById('user-display');
    const popupNote = document.querySelector('p[style*="opacity: 0.8"]');
    const dragHint = document.getElementById('drag-hint');
    
    [userDisplay, popupNote, dragHint].forEach(element => {
      if (element) {
        element.style.transition = 'opacity 2s ease';
        setTimeout(() => {
          element.style.opacity = '0';
          setTimeout(() => element.remove(), 2000);
        }, 50);
      }
    });
  }, 15000);
});