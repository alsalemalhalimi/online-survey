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
    fs.writeFileSync(resultsFile, JSON.stringify({ 
        students: [], 
        professors: [],
        summary: {
            total_students: 0,
            total_professors: 0,
            systems_ranking: {
                attendance_system: 0,
                lecture_system: 0,
                exam_system: 0
            }
        }
    }, null, 2));
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
            type: 'student',
            id: Date.now() // معرف فريد
        };
        
        data.students.push(surveyData);
        
        // تحديث الإحصائيات
        updateSummary(data);
        
        fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'تم حفظ استبيان الطالب بنجاح' });
    } catch (error) {
        console.error('Error saving student survey:', error);
        res.status(500).json({ success: false, message: 'خطأ في حفظ البيانات' });
    }
});

// API لحفظ نتائج الهيئة التدريسية
app.post('/api/survey/professor', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const surveyData = {
            ...req.body,
            timestamp: new Date().toLocaleString('ar-SA'),
            type: 'professor',
            id: Date.now() // معرف فريد
        };
        
        data.professors.push(surveyData);
        
        // تحديث الإحصائيات
        updateSummary(data);
        
        fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'تم حفظ استبيان الهيئة التدريسية بنجاح' });
    } catch (error) {
        console.error('Error saving professor survey:', error);
        res.status(500).json({ success: false, message: 'خطأ في حفظ البيانات' });
    }
});

// دالة تحديث الإحصائيات
function updateSummary(data) {
    data.summary = {
        total_students: data.students.length,
        total_professors: data.professors.length,
        systems_ranking: {
            attendance_system: 0,
            lecture_system: 0,
            exam_system: 0
        }
    };

    // حساب تصنيف الأنظمة
    [...data.students, ...data.professors].forEach(response => {
        if (response.most_effective === 'نظام التحضير الآلي' || response.most_impactful === 'نظام التحضير الآلي') {
            data.summary.systems_ranking.attendance_system++;
        }
        if (response.most_effective === 'نظام إدارة المحاضرات' || response.most_impactful === 'نظام إدارة المحاضرات') {
            data.summary.systems_ranking.lecture_system++;
        }
        if (response.most_effective === 'نظام مراقبة الاختبارات' || response.most_impactful === 'نظام مراقبة الاختبارات') {
            data.summary.systems_ranking.exam_system++;
        }
    });
}

// API لقراءة النتائج
app.get('/api/results', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في قراءة النتائج' });
    }
});

// API للحصول على إحصائيات سريعة
app.get('/api/stats', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const stats = {
            totalParticipants: data.students.length + data.professors.length,
            students: data.students.length,
            professors: data.professors.length,
            systemsRanking: data.summary.systems_ranking,
            latestStudent: data.students[data.students.length - 1] || null,
            latestProfessor: data.professors[data.professors.length - 1] || null
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في قراءة الإحصائيات' });
    }
});

// تشغيل السيرفر
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 سيرفر دراسة أنظمة التعليم الإلكتروني يعمل على المنفذ: ' + PORT);
    console.log('🌐 الرابط: http://localhost:' + PORT);
    console.log('📊 دراسة أنظمة: التحضير الآلي، إدارة المحاضرات، مراقبة الاختبارات');
    console.log('👥 فريق التطوير: سالم الحالمي، بدرالدين عقبة، أحمد زيدان، عمران عازب، محمد المريسي، طارق الشامي');
});