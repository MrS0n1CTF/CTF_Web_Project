// auth.js
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initDashboard } from './main.js'; // تم إضافة الاستيراد هنا

// ---------------- الدوال الأساسية ----------------

// دالة التسجيل (Registration)
window.registerUser = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;
    const messageElement = document.getElementById('auth-message');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // هام: المفاتيح تم تصحيحها لـ Name, Student_id, Total_score (انتبه للحروف الكبيرة)
        await setDoc(doc(db, "Users", user.uid), {
            Name: name, 
            Student_id: studentId,
            Email: email,
            Total_score: 0,
            Start_time: null, 
        });

        messageElement.textContent = "✅ تم التسجيل بنجاح! يمكنك الآن الدخول.";
    } catch (error) {
        messageElement.textContent = ❌ خطأ في التسجيل: ${error.message};
    }
}


// دالة تسجيل الدخول (Login)
window.loginUser = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('auth-message');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        messageElement.textContent = "✅ تم تسجيل الدخول بنجاح.";
    } catch (error) {
        messageElement.textContent = ❌ خطأ في الدخول: ${error.message};
    }
}

// دالة تسجيل الخروج (Logout)
window.logoutUser = function() {
    signOut(auth); 
}


// ---------------- مراقبة حالة المستخدم ----------------

onAuthStateChanged(auth, (user) => {
    const loginContainer = document.getElementById('login-container');
    const ctfDashboard = document.getElementById('ctf-dashboard');
    
    if (user) {
        loginContainer.style.display = 'none';
        ctfDashboard.style.display = 'block';
        initDashboard(user); // استدعاء الدالة من main.js
    } else {
        loginContainer.style.display = 'block';
        ctfDashboard.style.display = 'none';
    }
});