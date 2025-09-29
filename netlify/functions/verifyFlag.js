// netlify/functions/verifyFlag.js
const admin = require('firebase-admin');
const crypto = require('crypto');

// تهيئة Firebase Admin SDK
// يستخدم هذا الكود مفتاح الأمان السري الذي سنضيفه لاحقاً في إعدادات Netlify
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.error("Firebase Admin Initialization Error:", e);
    }
}

const db = admin.firestore();

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // userId: هو معرف المستخدم المُرسل من الواجهة الأمامية
        const { flag, challengeId, userId } = JSON.parse(event.body);

        // 1. تشفير الـ Flag المدخل من المستخدم (Input)
        // الفلاج يتم تنظيفه من المسافات البيضاء قبل التشفير
        const submittedHash = crypto.createHash('sha256').update(flag.trim()).digest('hex');

        // 2. قراءة الـ Hash الصحيح من Firestore (وصول سري وآمن)
        // هام: استخدم أسماء المجموعات والوثائق والحقول التي استخدمتها بالضبط
        const challengeRef = db.collection('Challenges').doc(challengeId); 
        const challengeDoc = await challengeRef.get();

        if (!challengeDoc.exists) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Challenge not found', correct: false }) };
        }

        // انتبه: Flag_hash و Points بالحروف الكبيرة والصغيرة التي استخدمتها في Firestore
        const correctHash = challengeDoc.data().Flag_hash; 
        const challengePoints = challengeDoc.data().Points; 

        // 3. المقارنة
        if (submittedHash === correctHash) {
            // 4. تحديث النقاط في جدول المستخدمين (فقط إذا كانت الإجابة صحيحة)
            const userRef = db.collection('Users').doc(userId); 
            
            // تحقق من عدم حل التحدي مسبقاً ( لمنع الغش )
            const solvedBy = challengeDoc.data().Solved_by || [];
            if (solvedBy.includes(userId)) {
                 return { statusCode: 200, body: JSON.stringify({ message: 'Challenge already solved!', correct: false }) };
            }
            
            // إضافة النقاط للمستخدم وتسجيل حل التحدي باستخدام معاملة (Transaction) لضمان الأمان
            await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                const currentScore = userDoc.data().Total_score || 0;
                
                t.update(userRef, { Total_score: currentScore + challengePoints });
                t.update(challengeRef, { Solved_by: admin.firestore.FieldValue.arrayUnion(userId) });
            });

            return { statusCode: 200, body: JSON.stringify({ message: 'Correct Flag! Score Updated.', correct: true, points: challengePoints }) };
        } else {
            return { statusCode: 200, body: JSON.stringify({ message: 'Incorrect Flag.', correct: false }) };
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Server error during verification.' }) };
    }
};