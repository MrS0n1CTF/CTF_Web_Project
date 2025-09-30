// auth.js

import { auth, db } from './firebase-config.js'; 

// 2. استيراد دوال مصادقة Firebase (يجب أن تكون المسارات هكذا)
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // تأكد أن هذا السطر مكتوب هكذا

// 3. IMPORT FIRESTORE FUNCTIONS
//import { doc, setDoc } from "firebase/firestore";
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// =========================================================
// FUNCTION: Register New User
// =========================================================

// التصحيح الحاسم: ربط الدالة بكائن window لتكون متاحة للـ HTML (onclick)
window.registerUser = async function() {
    // يجب أن تتطابق هذه الـ IDs مع index.html (كما هو موضح في اللقطة abf5e3b7)
    console.log("REGISTER BUTTON CLICKED: Starting user creation...");
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const studentId = document.getElementById('studentId').value;

    try {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create user document in Firestore
        await setDoc(doc(db, "Users", user.uid), {
            Name: name,
            Student_id: studentId,
            Total_score: 0,
            Start_time: new Date()
        });

        alert("Account created successfully!");
        // لا نحتاج لـ Redirect، لأن main.js سيقوم بالتحميل التلقائي عبر onAuthStateChanged
    } catch (error) {
        console.error("Registration Error:", error);
        alert("Registration failed: " + error.message);
    }
};

// =========================================================
// FUNCTION: Sign In User
// =========================================================

// التصحيح الحاسم: ربط الدالة بكائن window لتكون متاحة للـ HTML (onclick)
window.loginUser = async function() {
    // يجب أن تتطابق هذه الـ IDs مع index.html
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in successfully!");
        // main.js will handle the dashboard display
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
    }
};

// =========================================================
// FUNCTION: Sign Out User (Must be called by the button in index.html)
// =========================================================
window.logoutUser = async function() {
    try {
        await signOut(auth);
        alert("Signed out successfully.");
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// =========================================================
// FUNCTION: Submit Flag (Must be called by challenge buttons in main.js)
// =========================================================
window.submitFlag = async function(challengeId) {
    // This function needs further implementation, but we define it globally here
    alert(`Submitting flag for Challenge ID: ${challengeId} - Function is working.`);
}

// في نهاية ملف auth.js

document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('toggle-mode-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const isRegisterMode = link.textContent.includes('تسجيل الدخول');

        // تبديل عرض الحقول والأزرار
        document.getElementById('name').style.display = isRegisterMode ? 'none' : 'block';
        document.getElementById('studentId').style.display = isRegisterMode ? 'none' : 'block';
        document.querySelector('label[for="name"]').style.display = isRegisterMode ? 'none' : 'block';
        document.querySelector('label[for="studentId"]').style.display = isRegisterMode ? 'none' : 'block';
        
        document.querySelector('button[onclick="registerUser()"]').style.display = isRegisterMode ? 'none' : 'block';
        document.querySelector('button[onclick="loginUser()"]').style.display = isRegisterMode ? 'block' : 'none';

        // تبديل نص الرابط
        link.textContent = isRegisterMode ? "لا تمتلك حساب؟ إنشاء حساب جديد" : "هل لديك حساب بالفعل؟ تسجيل الدخول";
    });
});
