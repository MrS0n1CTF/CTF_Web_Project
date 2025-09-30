// الاستيراد من ملف الإعدادات
import { auth, db } from './firebase-config.js'; 

// استيراد دوال المصادقة من حزمة firebase/auth
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "firebase/auth";

// استيراد دوال Firestore من حزمة firebase/firestore
import { doc, setDoc } from "firebase/firestore";

// دالة التسجيل
window.registerUser = async function() {
    // قم باستبدال الـ IDs بأي IDs تستخدمها في index.html
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input').value;

    try {
        // 1. إنشاء المستخدم في المصادقة (باستخدام auth المُصدّر)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. إنشاء مستند للمستخدم في Firestore (باستخدام db المُصدّر)
        await setDoc(doc(db, "Users", user.uid), {
            Name: name,
            Start_time: new Date(),
            Student_id: "غير محدد",
            Total_score: 0
        });

        alert("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
        // يمكن إضافة كود لتوجيه المستخدم أو تحديث الصفحة
    } catch (error) {
        console.error("خطأ في التسجيل:", error);
        alert("فشل التسجيل: " + error.message);
    }
};

// ... باقي دوال auth.js (signInUser, signOutUser, إلخ.)