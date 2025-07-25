
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyD8G-YzVnERa6if7BgY1WXrR-j3CcF-Xos",

  authDomain: "ac1dd4ddy-ctf-dashboard.firebaseapp.com",

  projectId: "ac1dd4ddy-ctf-dashboard",

  storageBucket: "ac1dd4ddy-ctf-dashboard.firebasestorage.app",

  messagingSenderId: "889353172004",

  appId: "1:889353172004:web:440d2f318930d0587f14b1",

  measurementId: "G-W555LTLJMS"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

// Fetch upcoming CTFs
fetch("https://ctftime.org/api/v1/events/?limit=5")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("ctf-list");
    data.forEach(ctf => {
      const item = document.createElement("li");
      item.innerHTML = `<a href="${ctf.url}" target="_blank">${ctf.title}</a> - ${ctf.start.slice(0, 10)}`;
      list.appendChild(item);
    });
  });

// Load team progress
fetch("data/progress.json")
  .then(res => res.json())
  .then(progress => {
    document.getElementById("progress").textContent = JSON.stringify(progress, null, 2);
  });

// Simple in-browser TODO list
let todos = JSON.parse(localStorage.getItem("todos") || "[]");
const list = document.getElementById("todo-list");
function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo, i) => {
    const li = document.createElement("li");
    li.textContent = todo;
    li.onclick = () => {
      todos.splice(i, 1);
      localStorage.setItem("todos", JSON.stringify(todos));
      renderTodos();
    };
    list.appendChild(li);
  });
}
function addTodo() {
  const input = document.getElementById("todo-input");
  todos.push(input.value);
  localStorage.setItem("todos", JSON.stringify(todos));
  input.value = "";
  renderTodos();
}
renderTodos();
// Sign In
auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

// Sign Out
auth.signOut();

// Detect auth state
auth.onAuthStateChanged(user => {
  if (user) {
    document.body.innerHTML += `<p>Logged in as ${user.email}</p>`;
  } else {
    console.log("Not signed in");
  }
});
