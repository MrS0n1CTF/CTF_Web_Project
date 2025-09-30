// main.js
// 1. IMPORT FIREBASE INSTANCES (auth and db must be exported from ./firebase-config.js)
import { auth, db } from './firebase-config.js'; 

// 2. IMPORT REQUIRED FIREBASE SDK FUNCTIONS
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot 
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";


// =========================================================
// DASHBOARD FUNCTIONS
// =========================================================

// التصحيح: تمت إزالة كلمة export
function loadDashboard(user) {
    const userName = user.displayName || user.email;
    const welcomeElement = document.getElementById('welcome-user');
    
    if (welcomeElement) {
        // Uses correct template literal syntax (backticks)
        welcomeElement.textContent = `Welcome, ${userName}!`; 
    }
    
    displayChallenges();
    updateScoreboard();
}

// التصحيح: تمت إزالة كلمة export
function displayChallenges() {
    const challengesArea = document.getElementById('challenges-area');
    if (!challengesArea) return; 

    // Query Firestore for Challenges
    const challengesQuery = query(collection(db, "Challenges"), orderBy("Points", "asc"));

    onSnapshot(challengesQuery, (querySnapshot) => {
        let allChallengesHTML = ''; 
        
        querySnapshot.forEach((doc) => {
            const challenge = doc.data();
            const challengeId = doc.id;
            
            // **التصحيح النهائي:** التأكد من استخدام علامات التنصيص المائلة (` `) بشكل صحيح
            const challengeHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
                <h3>${challenge.Name} (${challenge.Points} points)</h3>
                <p>${challenge.Description}</p>
                <input type="text" id="flag-input-${challengeId}" placeholder="Enter Flag here">
                <button onclick="submitFlag('${challengeId}')">Submit Solution</button>
                <p id="message-${challengeId}" style="font-weight: bold;"></p>
            </div>`;
            
            allChallengesHTML += challengeHTML;
        });
        
        challengesArea.innerHTML = allChallengesHTML;
    });
}

// التصحيح: تمت إزالة كلمة export
function updateScoreboard() {
    const scoreboardArea = document.getElementById('scoreboard-area');
    if (!scoreboardArea) return; 

    const usersQuery = query(collection(db, "Users"), orderBy("Total_score", "desc"));
    
    onSnapshot(usersQuery, (querySnapshot) => {
        let html = '<table><tr><th>Rank</th><th>Name</th><th>Score</th></tr>';
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            html += `<tr><td>${rank}</td><td>${user.Name || user.email}</td><td>${user.Total_score || 0}</td></tr>`;
            rank++;
        });

        html += '</table>';
        scoreboardArea.innerHTML = html;
    });
}


// =========================================================
// AUTH STATE LISTENER - ENTRY POINT
// =========================================================

// This listener controls the visibility based on login status
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');

    if (user) {
        // Logged in: Hide Auth, Show Dashboard
        if (authSection) authSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        loadDashboard(user);
    } else {
        // Logged out: Show Auth, Hide Dashboard
        if (authSection) authSection.style.display = 'block';
        if (dashboardSection) dashboardSection.style.display = 'none';
    }
});
