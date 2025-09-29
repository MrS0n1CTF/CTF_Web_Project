// main.js
import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { auth } from './firebase-config.js';

//  يجب أن يتم تصدير الدوال لاستخدامها في auth.js 
export function initDashboard(user) {
    // 1. عرض اسم المستخدم من Firestore
    const userRef = doc(db, "Users", user.uid);
    getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
            // انتبه لحالة الحرف: Name
            document.getElementById('welcome-user').textContent = مرحباً بك يا ${docSnap.data().Name || user.email};
        }
    });
    
    // 2. تحديث لوحة النتائج وعرض التحديات
    displayChallenges();
    updateScoreboard();
}

// دالة عرض لوحة النتائج (Scoreboard)
export function updateScoreboard() {
    const scoreboardBody = document.querySelector('#scoreboard-table tbody');
    
    //  هام: اسم المجموعة هو Users بحرف U كبير 
    const q = query(collection(db, "Users"), orderBy("Total_score", "desc"));

    onSnapshot(q, (querySnapshot) => {
        scoreboardBody.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            // انتبه لحالة الحروف: Name و Total_score
            const row = <tr><td>${user.Name}</td><td>${user.Total_score}</td></tr>;
            scoreboardBody.innerHTML += row;
        });
    });
}

// دالة عرض التحديات
export function displayChallenges() {
    const challengesArea = document.getElementById('challenges-area');

    //  هام: اسم المجموعة هو Challenges بحرف C كبير 
    const q = query(collection(db, "Challenges"), orderBy("Points", "asc"));

    onSnapshot(q, (querySnapshot) => {
        challengesArea.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const challenge = doc.data();
            const challengeId = doc.id;
            
            // انتبه لحالة الحروف: Name، Points، Description
            const challengeHtml = 
                <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px;">
                    <h3>${challenge.Name} (${challenge.Points} نقطة)</h3>
                    <p>${challenge.Description}</p>
                    <input type="text" id="flag-input-${challengeId}" placeholder="أدخل الـ Flag">
                    <button onclick="submitFlag('${challengeId}')">إرسال الفلاج</button>
                    <p id="message-${challengeId}" style="font-weight: bold;"></p>
                </div>
            ;
            challengesArea.innerHTML += challengeHtml;
        });
    });
}

//  الدالة الأهم: submitFlag 
// هذه الدالة يجب أن تكون مُعرفة على مستوى النافذة (Window) ليتم استدعاؤها من HTML
window.submitFlag = async function(challengeId) {
    const flag = document.getElementById(flag-input-${challengeId}).value;
    const messageElement = document.getElementById(message-${challengeId});

    if (!auth.currentUser) {
        messageElement.textContent = "❌ يرجى تسجيل الدخول أولاً.";
        return;
    }
    const userId = auth.currentUser.uid;

    //  ملاحظة: هذا هو مكان استدعاء دالة Netlify الآمنة بعد النشر 
    try {
        messageElement.textContent = "جاري التحقق...";
        
        //  في بيئة التطوير المحلية، لن تعمل هذه الدالة حتى يتم نشرها على Netlify 
        const response = await fetch(/.netlify/functions/verifyFlag, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flag: flag, challengeId: challengeId, userId: userId }),
        });

        const data = await response.json();

        if (data.correct) {
            messageElement.textContent = ✅ إجابة صحيحة! تم إضافة ${data.points} نقطة.;
        } else {
            // يمكن أن تكون الرسالة خطأ في الـ Flag أو تم حله مسبقاً
            messageElement.textContent = ❌ ${data.message}; 
        }

    } catch (error) {
        // خطأ يظهر عند محاولة التشغيل محلياً بدون Netlify
        messageElement.textContent = ⚠️ لا يمكن التحقق محلياً. يرجى النشر على Netlify Function.;
    }
};