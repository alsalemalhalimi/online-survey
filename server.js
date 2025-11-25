const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ملف حفظ النتائج
const resultsFile = path.join(__dirname, 'data', 'survey-results.json');

// تأكد من وجود ملف النتائج
if (!fs.existsSync(path.dirname(resultsFile))) {
    fs.mkdirSync(path.dirname(resultsFile), { recursive: true });
}

if (!fs.existsSync(resultsFile)) {
    fs.writeFileSync(resultsFile, JSON.stringify({ students: [], professors: [] }, null, 2));
}

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// صفحة الاستبيان
app.get('/survey', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'survey.html'));
});

// صفحة النتائج
app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// API لحفظ نتائج الطلاب
app.post('/api/survey/student', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const surveyData = {
            ...req.body,
            timestamp: new Date().toLocaleString('ar-SA'),
            type: 'student'
        };
        
        data.students.push(surveyData);
        fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'تم حفظ استبيان الطالب بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في الحفظ' });
    }
});

// API لحفظ نتائج الدكاترة
app.post('/api/survey/professor', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const surveyData = {
            ...req.body,
            timestamp: new Date().toLocaleString('ar-SA'),
            type: 'professor'
        };
        
        data.professors.push(surveyData);
        fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'تم حفظ استبيان الهيئة التدريسية بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في الحفظ' });
    }
});

// API لقراءة النتائج
app.get('/api/results', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في قراءة النتائج' });
    }
});

// تشغيل السيرفر
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 سيرفر الاستبيان الإلكتروني يعمل على المنفذ: ' + PORT);
    console.log('🌐 الرابط: http://localhost:' + PORT);
});