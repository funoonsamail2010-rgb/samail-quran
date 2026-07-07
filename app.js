        // رقم نسخة مخطط البيانات: أي تغيير جوهري في بنية البيانات (مثل إضافة اسم مستخدم/كلمة سر)  
        // يجب أن يرفع هذا الرقم، حتى يتم تلقائياً تجاهل أي بيانات قديمة غير متوافقة محفوظة بالمتصفح  
        // وتفادي أعطال تسجيل الدخول الناتجة عن بيانات كادر عمل قديمة الصيغة.  
        const DATA_SCHEMA_VERSION = "4";  
  
        // معالج أخطاء عام: أي خطأ برمجي غير متوقع بأي مكان بالتطبيق يظهر كإشعار بدل ما يفشل بصمت  
        window.onerror = function(message, source, lineno, colno, error) {  
            try {  
                const container = document.getElementById('toast-container');  
                if (container) {  
                    const toast = document.createElement('div');  
                    toast.className = 'px-4 py-3 rounded-xl shadow-lg text-xs font-bold bg-red-700 text-white border-l-4 border-red-950 flex items-center gap-2 pointer-events-auto';  
                    toast.innerHTML = `<i class="fa-solid fa-bug"></i> <span>خطأ برمجي: ${message} (سطر ${lineno})</span>`;  
                    container.appendChild(toast);  
                    setTimeout(() => toast.remove(), 8000);  
                }  
            } catch (e) { /* تجاهل أي فشل بمعالج الأخطاء نفسه */ }  
            console.error('Uncaught error:', message, 'at', source, lineno, colno, error);  
            return false;  
        };  
  
        // المتغير النشط للهوية البصرية الافتراضية  
        let activeTheme = 'quranGreen';  
        // لون النصوص العام المخصص من مالك المنظومة (null = اللون الافتراضي)  
        let customTextColor = null;  
        // ألوان الطابع المخصصة بحرية (أساسي وثانوي)، null = يُستخدم أحد الطوابع الجاهزة بدلاً منها  
        let customThemeColors = null;  
        // لون مسمى المركز بالترويسة العلوية تحديداً (null = أبيض افتراضي)  
        let headerTitleColor = null;  
        // لون خلفية شاشة تسجيل الدخول المخصص (null = اللون الافتراضي)  
        let loginScreenColor = null;  
        // لون نص عناوين النوافذ المنبثقة (null = أبيض افتراضي)  
        let modalHeaderTextColor = null;  
        // خطوط العناوين: null = الخط الافتراضي (أميري للرئيسية، القاهرة للفرعية)  
        let fontMainHeading = null;  
        let fontSubHeading = null;  
          
        let isLoggedIn = false;  
  
        // القاموس التشغيلي لمصطلحات ومسميات المنظومة (قابل للتعديل الفوري)  
        let systemTerms = {  
            center_title: "مركز سمائل القرآني",  
            header_subtitle: "نظام حوكمة الصلاحيات وإدارة الفروع والحسابات المتكاملة",  
            cloud_status_label: "حالة الاتصال بالسحابة:",  
            branch_scope_label: "نطاق الاطلاع والعمل:",  
            dashboard_tab: "لوحة الإحصاءات",  
            users_permissions_tab: "الصلاحيات والموظفين",  
            hr_employees_tab: "إدارة الموظفين",  
            structures_tab: "الحلقات والبرامج",  
            students_tab: "إدارة الطلاب",  
            educational_tab: "الرصد والتقييم التعليمي",  
            financial_tab: "الشق المالي والسندات",  
            warehouse_tab: "المستودع والأصول",  
            operations_tab: "الخدمات والتشغيل والملاحظات",  
            settings_tab: "التخصيص والإعدادات",  
            student_singular: "طالب",  
            student_plural: "الطلاب",  
            teacher_singular: "معلمة",  
            teacher_plural: "المعلمات",  
            receipt_voucher: "سند قبض (إيراد)",  
            expense_voucher: "سند صرف (مصروف)",  
            assets_inventory: "المستودع والأصول",  
            letters_admin: "المراسلات والخطابات",  
            branches_label: "الحلقات والفروع",  
              
            // عناوين وإحصاءات  
            total_students_label: "إجمالي الطلاب المقيدين",  
            total_income_label: "إجمالي الإيرادات المقبوضة",  
            total_expense_label: "إجمالي المصروفات المصادق عليها",  
            net_balance_label: "صافي الرصيد الحالي",  
            recent_students_label: "سجل الحلقات وقائمة الطلاب المضافين",  
              
            // مسميات مصفوفة الأدوار الـ 10 التفاعلية  
            role_0: "الإدارة العامة",  
            role_1: "مديرة المركز",  
            role_2: "مدير النظام",  
            role_3: "المشرفة التعليمية",  
            role_4: "مديرة الحلقة",  
            role_5: "المالية",  
            role_6: "المعلمة",  
            role_7: "أمين المستودع",  
            role_8: "الإعلام",  
            role_9: "مدقق التقارير"  
        };  
  
        // أسماء المصطلحات ووصفها للمستخدم بالواجهة العربية لسهولة التعديل  
        const termsMetadata = {  
            center_title: { label: "مسمى المركز الرئيسي", desc: "اسم المركز أو المنشأة بالكامل" },  
            header_subtitle: { label: "شعار الهيدر الفرعي", desc: "النص الصغير أسفل العنوان الرئيسي بالترويسة" },  
            cloud_status_label: { label: "مسمى حالة الاتصال", desc: "تسمية حالة السحابة بالترويسة" },  
            branch_scope_label: { label: "مسمى نطاق العمل", desc: "حقل تحديد النطاق ببطاقة الموظف" },  
            dashboard_tab: { label: "اسم تبويب لوحة التحكم", desc: "الزر الرئيسي لعرض المؤشرات الرقمية" },  
            users_permissions_tab: { label: "اسم تبويب الصلاحيات", desc: "تبويب حوكمة الموظفين والمصفوفة" },  
            hr_employees_tab: { label: "اسم تبويب إدارة الموظفين", desc: "التبويب العام لسجل كل الموظفين بغض النظر عن صلاحية الدخول" },  
            structures_tab: { label: "اسم تبويب الحلقات", desc: "تبويب إضافة وتعديل الحلقات والبرامج" },  
            students_tab: { label: "اسم تبويب الطلاب", desc: "التبويب الرئيسي لملفات الدارسين" },  
            educational_tab: { label: "اسم تبويب التقييم", desc: "تبويب رصد إنجازات الحفظ والاختبارات" },  
            financial_tab: { label: "اسم تبويب المالية", desc: "التبويب الحساس للحركات المالية والسندات" },  
            warehouse_tab: { label: "اسم تبويب المستودع", desc: "تبويب إدارة العهد والأصول السحابية" },  
            operations_tab: { label: "اسم تبويب الخدمات", desc: "تبويب النقل، البلاغات والملاحظات" },  
            settings_tab: { label: "اسم تبويب الإعدادات", desc: "تبويب هوية الألوان والشعار والقاموس" },  
            student_singular: { label: "مفرد (طالب)", desc: "اللفظ المستخدم للإشارة للدارس المفرد" },  
            student_plural: { label: "جمع (الطلاب)", desc: "اللفظ المستخدم لإجمالي مجموعة الدارسين" },  
            teacher_singular: { label: "مفرد (معلمة)", desc: "اللفظ المستخدم للإشارة لعضو التدريس المفرد" },  
            teacher_plural: { label: "جمع (المعلمات)", desc: "اللفظ المستخدم لمجموعة الكادر التعليمي" },  
            receipt_voucher: { label: "مسمى سند القبض", desc: "اللفظ المستخدم لإثبات الإيراد المستلم" },  
            expense_voucher: { label: "مسمى سند الصرف", desc: "اللفظ المستخدم لإثبات المبالغ المصروفة" },  
            assets_inventory: { label: "مسمى العهد والأصول", desc: "المصطلح المعبر عن ممتلكات المركز" },  
            letters_admin: { label: "مسمى المخاطبات", desc: "نظام المراسلات والتسلسل الإداري" },  
            branches_label: { label: "مسمى الفروع والحلقات", desc: "الاسم المطلق لمواقع وأماكن الحلقات" },  
            total_students_label: { label: "بطاقة إجمالي الطلاب", desc: "عنوان بطاقة إحصاء الطلاب باللوحة" },  
            total_income_label: { label: "بطاقة إجمالي الإيرادات", desc: "عنوان بطاقة الرصيد المستلم باللوحة" },  
            total_expense_label: { label: "بطاقة إجمالي المصروفات", desc: "عنوان بطاقة المبالغ المصروفة باللوحة" },  
            net_balance_label: { label: "بطاقة صافي الرصيد", desc: "عنوان بطاقة الفائض المالي للصندوق" },  
            recent_students_label: { label: "عنوان سجل الحلقات", desc: "مسمى جدول لوحة التحكم الرئيسي" },  
              
            // مسميات مصفوفة الأدوار الـ 10 التفاعلية للربط مع المدقق اللغوي  
            role_0: { label: "مسمى المنصب الأول (الإدارة العليا الكاملة الصلاحيات)", desc: "الدور التنظيمي المالك لكافة الصلاحيات بالمنظومة" },  
            role_1: { label: "مسمى المنصب الثاني", desc: "الدور التنظيمي المخصص للاطلاع واعتماد المراسلات والرد، ويستقبل المخاطبات من المشرف العام مباشرة" },  
            role_2: { label: "مسمى المنصب الثالث (دور تقني مقفل الصلاحيات)", desc: "دور مالك لكافة صلاحيات المنظومة، ومقفل بشكل دائم لا يمكن تعديل صلاحياته" },  
            role_3: { label: "مسمى المنصب الرابع", desc: "الدور التنظيمي للرصد والمتابعة التربوية، تستقبل المخاطبات من مديرة الحلقة" },  
            role_4: { label: "مسمى المنصب الخامس", desc: "الدور التنظيمي لشؤون الطلاب بالحلقات، تنقل المخاطبات بين مديرة المركز والمشرفة التعليمية" },  
            role_5: { label: "مسمى المنصب السادس", desc: "الدور التنظيمي المخصص للشق والاعتماد المالي" },  
            role_6: { label: "مسمى المنصب السابع", desc: "الدور التنظيمي لرصد الحفظ والاختبارات وتسميع الطلاب" },  
            role_7: { label: "مسمى المنصب الثامن", desc: "الدور التنظيمي لمتابعة حركة العهد والممتلكات" },  
            role_8: { label: "مسمى المنصب التاسع", desc: "الدور التنظيمي للتغطيات ونشر أخبار الحلقات" },  
            role_9: { label: "مسمى المنصب العاشر", desc: "الدور التنظيمي للمراجع والمطلع السحابي" }  
        };  
  
        // الرموز المرجعية للأدوار الـ 10 المقررة في المنظومة  
        const roles = [  
            "role_0", "role_1", "role_2", "role_3", "role_4", "role_5", "role_6", "role_7", "role_8", "role_9"  
        ];  
  
        // ترتيب التسلسل الإداري الافتراضي للمراسلات (من الأعلى سلطة إلى الأدنى)، قابل للتعديل من قبل مدير النظام  
        let hierarchyOrder = ["role_0", "role_1", "role_4", "role_3", "role_5", "role_6", "role_7", "role_8", "role_9", "role_2"];  

        // الصلاحيات الـ 28 المقررة مع أوصافها التفصيلية  
        const permissions = [  
            { id: 1, name: "عرض لوحة التحكم" },  
            { id: 2, name: "إدارة المستخدمين" },  
            { id: 3, name: "إدارة الأدوار والصلاحيات" },  
            { id: 4, name: "إدارة المراكز" },  
            { id: 5, name: "إدارة الحلقات" },  
            { id: 6, name: "إدارة البرامج" },  
            { id: 7, name: "إدارة الطلاب" },  
            { id: 8, name: "تسجيل الطلاب في البرامج" },  
            { id: 9, name: "إدارة الموظفين" },  
            { id: 10, name: "إدخال الإنجازات" },  
            { id: 11, name: "إدخال الاختبارات" },  
            { id: 12, name: "تقييم المعلمات" },  
            { id: 13, name: "إدارة الرسوم" },  
            { id: 14, name: "تسجيل الدفعات" },  
            { id: 15, name: "إدارة الإيرادات" },  
            { id: 16, name: "إدارة المصروفات" },  
            { id: 17, name: "إدارة التبرعات والداعمين" },  
            { id: 18, name: "إدارة المستودع" },  
            { id: 19, name: "حركة المستودع" },  
            { id: 20, name: "إدارة الأصول والعهد" },  
            { id: 21, name: "إدارة الصيانة" },  
            { id: 22, name: "إدارة الإعلام والتغطيات" },  
            { id: 23, name: "إدارة النقل" },  
            { id: 24, name: "إدارة البلاغات والملاحظات" },  
            { id: 25, name: "عرض التقارير" },  
            { id: 26, name: "تصدير التقارير" },  
            { id: 27, name: "إدارة الإشهارات والتنبيهات" },  
            { id: 28, name: "تعديل إعدادات النظام" },  
            { id: 29, name: "منح التخفيضات المالية للطلاب" }  
        ];  
  
        // مصفوفة الصلاحيات الافتراضية لكل دور (تعدل برمجياً بالكامل من الواجهة)  
        let rolePermissions = {};  
  
        roles.forEach(role => {  
            rolePermissions[role] = {};  
            permissions.forEach(perm => {  
                rolePermissions[role][perm.id] = false;   
            });  
        });  
  
        // 1. role_0 (الإدارة العامة): تمتلك كل شيء  
        permissions.forEach(perm => rolePermissions["role_0"][perm.id] = true);  
  
        // 2. role_1 (رئيس المركز): اطلاع، بلاغات، ومراسلات، والتقارير واعتماد فقط  
        rolePermissions["role_1"][1] = true;    
        rolePermissions["role_1"][24] = true;   
        rolePermissions["role_1"][25] = true;   
        rolePermissions["role_1"][27] = true;   
  
        // 3. role_2 (مدير النظام): دور مالك لكافة الصلاحيات، ومقفل بشكل دائم لا يمكن تعديله  
        permissions.forEach(perm => rolePermissions["role_2"][perm.id] = true);  
        const LOCKED_ROLES = ["role_2"];  
  
        // 4. role_3 (المشرف التربوي)  
        rolePermissions["role_3"][1] = true;  
        rolePermissions["role_3"][10] = true;  
        rolePermissions["role_3"][11] = true;  
        rolePermissions["role_3"][12] = true;  
        rolePermissions["role_3"][25] = true;  
  
        // 5. role_4 (المنسقة التعليمية)  
        rolePermissions["role_4"][1] = true;  
        rolePermissions["role_4"][7] = true;    
        rolePermissions["role_4"][8] = true;    
        rolePermissions["role_4"][10] = true;   
        rolePermissions["role_4"][11] = true;   
        rolePermissions["role_4"][14] = true;   
        rolePermissions["role_4"][24] = true;   
  
        // 6. role_5 (المالية)  
        rolePermissions["role_5"][1] = true;  
        rolePermissions["role_5"][13] = true;   
        rolePermissions["role_5"][14] = true;   
        rolePermissions["role_5"][15] = true;   
        rolePermissions["role_5"][16] = true;   
        rolePermissions["role_5"][17] = true;   
        rolePermissions["role_5"][25] = true;   
  
        // 7. role_6 (المعلمة)  
        rolePermissions["role_6"][10] = true;  
        rolePermissions["role_6"][11] = true;  
        rolePermissions["role_6"][24] = true;  
  
        // 8. role_7 (أمين المستودع)  
        rolePermissions["role_7"][1] = true;  
        rolePermissions["role_7"][18] = true;   
        rolePermissions["role_7"][19] = true;   
        rolePermissions["role_7"][20] = true;   
  
        // 9. role_8 (الإعلام)  
        rolePermissions["role_8"][1] = true;  
        rolePermissions["role_8"][22] = true;  
  
        // 10. role_9 (مدقق التقارير)  
        rolePermissions["role_9"][1] = true;  
        rolePermissions["role_9"][25] = true;  
        rolePermissions["role_9"][26] = true;  
  
        // الحلقات والفروع الفعالة بالمنظومة — تبدأ فارغة تماماً، يقوم مالك المنظومة بإضافتها بنفسه  
        let branches = [];  
  
        // البرامج القرآنية — تبدأ فارغة تماماً، تُضاف حسب حاجة كل حلقة  
        let programs = [];  
  
        // سجل الطلاب بالمركز — يبدأ فارغاً تماماً  
        let students = [];  
        // سجل أولياء الأمور: كل ولي أمر له سجل مستقل مرتبط بكل أبنائه المسجلين  
        let guardians = [];  
  
        // سجل الحركات المالية (إيرادات ومصروفات) — يبدأ فارغاً تماماً  
        let financialTransactions = [];  
  
        // سجل العهد والأصول والمستودعات — يبدأ فارغاً تماماً  
        let assets = [];  
  
        // سجل المراسلات والبلاغات — يبدأ فارغاً تماماً  
        let complaints = [];  
  
        // سجل الإنجازات والاختبارات — يبدأ فارغاً تماماً  
        let achievements = [];  
  
        let exams = [];  
  
        // كادر الموظفين — يبدأ بحساب الإدارة العامة فقط (لتتمكن من الدخول أول مرة وإنشاء بقية الحسابات   
        // وربط كل موظف بحلقته الخاصة وصلاحياته بنفسك، حسب ما يناسب مركزك فعلياً)  
        let employees = [  
            { id: 1, name: "الإدارة العامة للمنظومة", role: "role_0", jobTitle: "مدير عام النظام", branch: "كامل الفروع", email: "admin@samail.org", username: "admin", password: "admin123", phone: "", idCard: "", joinDate: "", qualification: "", revenue: 0, expense: 0, status: "نشط" }  
        ];  
  
        // متغير الاحتفاظ بالشعار المرفوع بصيغة base64  
        let systemLogo = null;  
        let googleSheetWebhookUrl = "";  
        // إعدادات ومتغيرات قاعدة البيانات الحية (Firebase) — الطريقة الموصى بها للمزامنة الفورية  
        // إعدادات Firebase الافتراضية المضمّنة في الملف نفسه: بهذا يتصل كل جهاز جديد تلقائياً فور فتح   
        // الموقع دون أي خطوة إعداد يدوية إطلاقاً. يمكن لمالك المنظومة استبدالها من الإعدادات لاحقاً إن رغب.  
        const DEFAULT_FIREBASE_CONFIG = {  
            apiKey: "AIzaSyAFtZ3eew2YW7Qgn552DAT37HbcROQzV3E",  
            authDomain: "samail-quran.firebaseapp.com",  
            databaseURL: "https://samail-quran-default-rtdb.firebaseio.com",  
            projectId: "samail-quran",  
            storageBucket: "samail-quran.firebasestorage.app",  
            messagingSenderId: "3543521141",  
            appId: "1:3543521141:web:1e1a8de7ed1d4419ea653c"  
        };  
        let firebaseConfig = DEFAULT_FIREBASE_CONFIG;  
        let firebaseDb = null;  
        let firebaseConnected = false;  
        let isApplyingRemoteUpdate = false;  
        // لا يُسمح بدفع أي بيانات لقاعدة البيانات الحية قبل استلام أول لقطة بيانات فعلية منها،   
        // حتى لا يُخاطر جهاز بدفع بيانات محلية قديمة (لم تتزامن بعد) وتصبح هي الغالبة بالخطأ  
        let hasReceivedFirstFirebaseSnapshot = false;  
        // إن حدث تعديل محلي فعلي قبل وصول أول لقطة من Firebase، يجب ألا تُمحى هذه التعديلات لاحقاً   
        // عند وصول تلك اللقطة — بل يجب أن تبقى الأولوية لأحدث تعديل حقيقي قام به المستخدم  
        let hasLocalChangesBeforeFirstSnapshot = false;  
        // زمن آخر تعديل محلي حقيقي (يُحفظ في المتصفح أيضاً)، يُستخدم لاكتشاف حالة وصول بيانات   
        // قديمة من Firebase بعد إعادة فتح الصفحة (مثلاً إن أُغلقت الصفحة بسرعة قبل اكتمال الدفع)  
        let lastLocalChangeTimestamp = 0;  
        let autoSyncFromSheetEnabled = false;  
  
        // الأنماط البصرية الجمالية المتكاملة للمنصة  
        const colorThemes = {  
            quranGreen: {  
                primary: '#0f5132',  
                primaryHover: '#0a3822',  
                primaryLight: '#e6f0eb',  
                accent: '#c5a880',  
                accentHover: '#b4966d',  
                accentLight: '#fdf8f0'  
            },  
            royalBlue: {  
                primary: '#1e3a8a',  
                primaryHover: '#172554',  
                primaryLight: '#eff6ff',  
                accent: '#d4af37',  
                accentHover: '#bca132',  
                accentLight: '#fefdf0'  
            },  
            burgundy: {  
                primary: '#7f1d1d',  
                primaryHover: '#450a0a',  
                primaryLight: '#fef2f2',  
                accent: '#c5a880',  
                accentHover: '#b4966d',  
                accentLight: '#faf5ee'  
            },  
            teal: {  
                primary: '#0f766e',  
                primaryHover: '#115e59',  
                primaryLight: '#f0fdfa',  
                accent: '#eab308',  
                accentHover: '#ca8a04',  
                accentLight: '#fefce8'  
            },  
            luxuryPurple: {  
                primary: '#581c87',  
                primaryHover: '#3b0764',  
                primaryLight: '#faf5ff',  
                accent: '#f59e0b',  
                accentHover: '#d97706',  
                accentLight: '#fffbeb'  
            }  
        };  
  
        // تعيين المستخدم النشط افتراضياً  
        let currentActiveUser = employees[0];   
        // حالة مؤقتة لتكليفات التدريس أثناء فتح نافذة إضافة/تعديل موظف (تُحفظ فعلياً فقط عند الحفظ)  
        let currentStaffAssignments = [];  
        let currentEditStaffAssignments = [];  
        let activeTab = 'dashboard';  
  
        // حفظ جميع بيانات وتخصيصات المنظومة في Local Storage لتعيش لسنوات  
        // حفظ كل عنصر بيانات على حدة بصندوق حماية مستقل خاص به، بحيث لو فشل حفظ عنصر واحد   
        // (مثل شعار كبير الحجم يتجاوز مساحة التخزين المتاحة بالمتصفح) فإن هذا لا يمنع إطلاقاً   
        // حفظ بقية البيانات الحرجة (الطلاب، الحلقات، السندات المالية، الموظفين... إلخ).  
        function safeSetItem(key, value) {  
            try {  
                localStorage.setItem(key, value);  
                return true;  
            } catch (e) {  
                console.error(`Local storage save failed for [${key}]: `, e);  
                return false;  
            }  
        }  

        function saveToLocalStorage(pushToFirebase) {  
            if (pushToFirebase === undefined) pushToFirebase = true;  
            if (pushToFirebase) {  
                // تسجيل زمن هذا التعديل الحقيقي محلياً، ليُستخدم لاحقاً لاكتشاف أي بيانات قديمة   
                // تصل من Firebase بعد إعادة فتح الصفحة  
                lastLocalChangeTimestamp = Date.now();  
                try { localStorage.setItem('samail_lastLocalChangeTimestamp', String(lastLocalChangeTimestamp)); } catch (e) { /* تجاهل */ }  
            }  
            // ملاحظة هامة: تُحفظ البيانات الحرجة (الطلاب، الحلقات، السندات المالية، الموظفين،   
            // الصلاحيات، المراسلات...) أولاً وبشكل مستقل تماماً عن حفظ الشعار (وهو أكبر عنصر بيانات   
            // وأكثرها عرضة لتجاوز مساحة التخزين)، حتى لا يؤدي فشل حفظ الشعار لفقدان أي تعديل آخر،   
            // بما في ذلك عمليات التصفير.  
            let allOk = true;  
            let failedKeys = [];  

            const criticalItems = [  
                ['samail_dataVersion', DATA_SCHEMA_VERSION],  
                ['samail_rolePermissions', JSON.stringify(rolePermissions)],  
                ['samail_branches', JSON.stringify(branches)],  
                ['samail_programs', JSON.stringify(programs)],  
                ['samail_students', JSON.stringify(students)],  
                ['samail_guardians', JSON.stringify(guardians)],  
                ['samail_financialTransactions', JSON.stringify(financialTransactions)],  
                ['samail_assets', JSON.stringify(assets)],  
                ['samail_complaints', JSON.stringify(complaints)],  
                ['samail_achievements', JSON.stringify(achievements)],  
                ['samail_exams', JSON.stringify(exams)],  
                ['samail_employees', JSON.stringify(employees)],  
                ['samail_hierarchyOrder', JSON.stringify(hierarchyOrder)],  
                ['samail_activeUserId', currentActiveUser ? String(currentActiveUser.id) : ""],  
                ['samail_activeTheme', activeTheme],  
                ['samail_customTextColor', customTextColor || ""],  
                ['samail_customThemeColors', customThemeColors ? JSON.stringify(customThemeColors) : ""],  
                ['samail_headerTitleColor', headerTitleColor || ""],  
                ['samail_loginScreenColor', loginScreenColor || ""],  
                ['samail_modalHeaderTextColor', modalHeaderTextColor || ""],  
                ['samail_fontMainHeading', fontMainHeading || ""],  
                ['samail_fontSubHeading', fontSubHeading || ""],  
                ['samail_isLoggedIn', isLoggedIn ? 'true' : 'false'],  
                ['samail_systemTerms', JSON.stringify(systemTerms)],  
                ['samail_googleSheetWebhookUrl', googleSheetWebhookUrl || ""],  
                ['samail_firebaseConfig', firebaseConfig ? JSON.stringify(firebaseConfig) : ""],  
                ['samail_autoSyncFromSheetEnabled', autoSyncFromSheetEnabled ? 'true' : 'false']  
            ];  

            criticalItems.forEach(([key, value]) => {  
                if (!safeSetItem(key, value)) { allOk = false; failedKeys.push(key); }  
            });  

            const customMeta = {};  
            for (const k in termsMetadata) { if (termsMetadata[k]) customMeta[k] = termsMetadata[k]; }  
            if (!safeSetItem('samail_customTermsMeta', JSON.stringify(customMeta))) { allOk = false; failedKeys.push('samail_customTermsMeta'); }  

            // الشعار يُحفظ أخيراً ومستقلاً تماماً؛ فشل حفظه (لضخامة حجمه مثلاً) لن يؤثر على أي بيانات أخرى أعلاه  
            if (!safeSetItem('samail_systemLogo', systemLogo || "")) {  
                allOk = false;  
                failedKeys.push('samail_systemLogo');  
                // محاولة أخيرة: حذف الشعار المخزن سابقاً حتى لا يبقى نصف محفوظ أو يمنع مساحة التخزين مستقبلاً  
                try { localStorage.removeItem('samail_systemLogo'); } catch (e) { /* تجاهل */ }  
            }  

            if (!allOk) {  
                const isLogoOnlyIssue = failedKeys.length === 1 && failedKeys[0] === 'samail_systemLogo';  
                if (isLogoOnlyIssue) {  
                    showNotification("تم حفظ كل التعديلات بنجاح، لكن تعذر حفظ شعار المركز لأن حجمه يتجاوز مساحة التخزين المتاحة بالمتصفح. يُنصح برفع شعار أصغر حجماً.", "warn");  
                } else {  
                    showNotification("تنبيه: حدث خلل أثناء حفظ بعض البيانات بشكل دائم بالمتصفح (قد تكون مساحة التخزين ممتلئة). يرجى تفريغ ذاكرة التخزين المؤقت للمتصفح أو تصغير حجم الشعار المرفوع.", "warn");  
                }  
            }  

            // دفع أي تعديل محلي فوراً لقاعدة البيانات الحية (Firebase) إن كانت متصلة، لتنتقل كل التعديلات   
            // تلقائياً لبقية الأجهزة دون أي خطوة يدوية إضافية  
            if (pushToFirebase && firebaseDb && !isApplyingRemoteUpdate) {  
                if (hasReceivedFirstFirebaseSnapshot) {  
                    pushFullStateToFirebase();  
                } else {  
                    // لم تصل بعد أول لقطة بيانات من Firebase؛ نُسجّل أن هناك تعديلاً محلياً حقيقياً حصل   
                    // في هذه الأثناء، حتى لا تُمحى هذه التعديلات لاحقاً عند وصول تلك اللقطة  
                    hasLocalChangesBeforeFirstSnapshot = true;  
                }  
            }  

            return allOk;  
        }  
  
        // استرجاع البيانات المحفوظة محلياً عند تحميل الصفحة  
        // قراءة آمنة لعنصر مخزّن كـ JSON: في حال كانت البيانات تالفة لأي سبب، تُتجاهل هذه القيمة   
        // فقط (وتبقى القيمة الافتراضية البرمجية كما هي) دون أن يتوقف تحميل بقية البيانات.  
        function safeLoadJSON(key) {  
            const raw = localStorage.getItem(key);  
            if (!raw) return undefined;  
            try {  
                return JSON.parse(raw);  
            } catch (e) {  
                console.error(`Corrupted stored data for [${key}], ignoring and keeping defaults: `, e);  
                return undefined;  
            }  
        }  

        function loadFromLocalStorage() {  
            try {  
                // إذا كانت نسخة مخطط البيانات المحفوظة مختلفة عن النسخة الحالية (أو غير موجودة)،  
                // فهذا يعني أن البيانات المحفوظة من إصدار سابق غير متوافق (مثال: كادر عمل بدون  
                // اسم مستخدم/كلمة سر) - لذا نقوم بمسحها بالكامل لتفادي عطل تسجيل الدخول ونبدأ بالبيانات الافتراضية الجديدة.  
                const storedVersion = localStorage.getItem('samail_dataVersion');  
                if (storedVersion !== DATA_SCHEMA_VERSION) {  
                    localStorage.clear();  
                    localStorage.setItem('samail_dataVersion', DATA_SCHEMA_VERSION);  
                    return;  
                }  
            } catch (e) {  
                console.error("Could not check data version, continuing with in-memory defaults: ", e);  
                return;  
            }  

            // من هنا فصاعداً، كل عنصر بيانات يُحمَّل بشكل مستقل تماماً: فشل عنصر واحد (بيانات تالفة)   
            // لن يمنع إطلاقاً استعادة بقية البيانات السليمة.  
            const termsLoaded = safeLoadJSON('samail_systemTerms');  
            if (termsLoaded) systemTerms = Object.assign({}, systemTerms, termsLoaded);  

            const customMeta = safeLoadJSON('samail_customTermsMeta');  
            if (customMeta) { try { Object.assign(termsMetadata, customMeta); } catch (e) { /* تجاهل */ } }  

            try {  
                const logo = localStorage.getItem('samail_systemLogo');  
                if (logo) systemLogo = logo;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const webhook = localStorage.getItem('samail_googleSheetWebhookUrl');  
                if (webhook) googleSheetWebhookUrl = webhook;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedFirebaseConfig = localStorage.getItem('samail_firebaseConfig');  
                if (storedFirebaseConfig) {  
                    firebaseConfig = JSON.parse(storedFirebaseConfig);  
                } else {  
                    // لا يوجد إعداد مخصص محفوظ على هذا الجهاز بعد — استخدم الإعداد الافتراضي المضمّن   
                    // بالملف، ليتصل هذا الجهاز تلقائياً دون أي خطوة يدوية  
                    firebaseConfig = DEFAULT_FIREBASE_CONFIG;  
                }  
            } catch (e) { /* تجاهل */ }  

            try {  
                const autoSyncFlag = localStorage.getItem('samail_autoSyncFromSheetEnabled');  
                if (autoSyncFlag) autoSyncFromSheetEnabled = autoSyncFlag === 'true';  
            } catch (e) { /* تجاهل */ }  

            const loadedRolePermissions = safeLoadJSON('samail_rolePermissions');  
            if (loadedRolePermissions) rolePermissions = loadedRolePermissions;  

            const loadedBranches = safeLoadJSON('samail_branches');  
            if (Array.isArray(loadedBranches)) branches = loadedBranches;  

            const loadedPrograms = safeLoadJSON('samail_programs');  
            if (Array.isArray(loadedPrograms)) programs = loadedPrograms;  

            const loadedStudents = safeLoadJSON('samail_students');  
            if (Array.isArray(loadedStudents)) students = loadedStudents;  

            const loadedGuardians = safeLoadJSON('samail_guardians');  
            if (Array.isArray(loadedGuardians)) guardians = loadedGuardians;  

            const loadedTransactions = safeLoadJSON('samail_financialTransactions');  
            if (Array.isArray(loadedTransactions)) financialTransactions = loadedTransactions;  

            const loadedAssets = safeLoadJSON('samail_assets');  
            if (Array.isArray(loadedAssets)) assets = loadedAssets;  

            const loadedComplaints = safeLoadJSON('samail_complaints');  
            if (Array.isArray(loadedComplaints)) complaints = loadedComplaints;  

            const loadedAchievements = safeLoadJSON('samail_achievements');  
            if (Array.isArray(loadedAchievements)) achievements = loadedAchievements;  

            const loadedExams = safeLoadJSON('samail_exams');  
            if (Array.isArray(loadedExams)) exams = loadedExams;  

            const loadedEmployees = safeLoadJSON('samail_employees');  
            if (Array.isArray(loadedEmployees) && loadedEmployees.length > 0) {  
                employees = loadedEmployees;  
                // حماية احتياطية: التأكد من اكتمال حقول كل موظف حتى لا يتعطل الدخول لاحقاً  
                employees.forEach((emp, idx) => {  
                    if (!emp.username) emp.username = emp.code || ('user' + (idx + 1));  
                    if (!emp.password) emp.password = '123456';  
                });  
            }  

            const loadedHierarchy = safeLoadJSON('samail_hierarchyOrder');  
            if (Array.isArray(loadedHierarchy) && loadedHierarchy.length === roles.length) {  
                hierarchyOrder = loadedHierarchy;  
            }  

            try {  
                const theme = localStorage.getItem('samail_activeTheme');  
                if (theme && (colorThemes[theme] || theme === 'custom')) activeTheme = theme;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedTextColor = localStorage.getItem('samail_customTextColor');  
                if (storedTextColor) customTextColor = storedTextColor;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedThemeColors = localStorage.getItem('samail_customThemeColors');  
                if (storedThemeColors) customThemeColors = JSON.parse(storedThemeColors);  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedHeaderColor = localStorage.getItem('samail_headerTitleColor');  
                if (storedHeaderColor) headerTitleColor = storedHeaderColor;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedLoginColor = localStorage.getItem('samail_loginScreenColor');  
                if (storedLoginColor) loginScreenColor = storedLoginColor;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedModalHeaderColor = localStorage.getItem('samail_modalHeaderTextColor');  
                if (storedModalHeaderColor) modalHeaderTextColor = storedModalHeaderColor;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedFontMain = localStorage.getItem('samail_fontMainHeading');  
                if (storedFontMain) fontMainHeading = storedFontMain;  
                const storedFontSub = localStorage.getItem('samail_fontSubHeading');  
                if (storedFontSub) fontSubHeading = storedFontSub;  
            } catch (e) { /* تجاهل */ }  

            try {  
                const storedTimestamp = localStorage.getItem('samail_lastLocalChangeTimestamp');  
                if (storedTimestamp) lastLocalChangeTimestamp = parseInt(storedTimestamp) || 0;  
            } catch (e) { /* تجاهل */ }  

            // تم إلغاء تذكّر تسجيل الدخول بين الجلسات بناءً على طلب صاحب النظام: كلمة السر   
            // ستُطلب دائماً عند كل فتح جديد للصفحة، ولن يتم الدخول التلقائي بعد الآن  
            // try {  
            //     const loggedInFlag = localStorage.getItem('samail_isLoggedIn');  
            //     if (loggedInFlag) isLoggedIn = loggedInFlag === 'true';  
            // } catch (e) { /* تجاهل */ }  

            try {  
                const activeId = localStorage.getItem('samail_activeUserId');  
                if (activeId) {  
                    const found = employees.find(e => e.id == activeId);  
                    if (found) currentActiveUser = found;  
                }  
            } catch (e) { /* تجاهل */ }  

            // شبكة أمان أخيرة: التأكد أن هناك دائماً مستخدماً نشطاً صالحاً، مهما حدث من أعطال بالأعلى  
            if (!currentActiveUser || !employees.includes(currentActiveUser)) {  
                currentActiveUser = employees[0] || currentActiveUser;  
            }  
        }  
  
        // تصفية وحذف كافة التعديلات واستعادة القيم الافتراضية  
        function resetToFactoryDefaults() {  
            const confirmed = window.confirm("تنبيه هام جداً: سيتم حذف كافة الحلقات والبرامج والطلاب والموظفين والمستخدمين والمعاملات المالية وكل التخصيصات المدخلة نهائياً، والعودة لنظام فارغ تماماً لا يحتوي إلا على حساب الإدارة العامة (admin) لتتمكن من البدء وبناء المنظومة من الصفر. هل أنت متأكد تماماً من المتابعة؟");  
            if (!confirmed) return;  

            // منع أي عملية حفظ تلقائي (عند الإغلاق أو إعادة التحميل) من إعادة كتابة البيانات القديمة   
            // فوق التصفير الذي قمنا به للتو  
            suppressAutoSave = true;  

            localStorage.clear();  

            // ===== الخطوة الحاسمة: يجب تصفير قاعدة البيانات الحية (Firebase) أيضاً، وليس فقط المتصفح   
            // — وإلا فإن الصفحة عند إعادة التحميل ستتصل بـ Firebase التي لا تزال تحمل البيانات القديمة   
            // كاملة، فتُعيدها فوراً وكأن التصفير لم يحدث إطلاقاً =====  
            const factoryDefaultState = {  
                systemTerms: systemTerms, rolePermissions: rolePermissions,  
                branches: [], programs: [], students: [], financialTransactions: [], assets: [],  
                complaints: [], achievements: [], exams: [], guardians: [],  
                employees: [{ id: 1, name: "الإدارة العامة للمنظومة", role: "role_0", username: "admin", password: "admin123", status: "نشط", email: "admin@samail.org" }],  
                hierarchyOrder: hierarchyOrder, activeTheme: 'quranGreen', customThemeColors: null,  
                customTextColor: null, headerTitleColor: null, loginScreenColor: null, systemLogo: null,  
                modalHeaderTextColor: null, fontMainHeading: null, fontSubHeading: null,  
                googleSheetWebhookUrl: null, autoSyncFromSheetEnabled: false, termsMetadata: termsMetadata,  
                lastModified: Date.now()  
            };  

            if (firebaseDb) {  
                firebaseDb.ref('samailData').set(factoryDefaultState).then(function () {  
                    showNotification("تم تصفير المنظومة بالكامل (محلياً وفي قاعدة البيانات الحية معاً)، سيتم إعادة تحميل الصفحة...", "success");  
                    setTimeout(() => { window.location.reload(); }, 1500);  
                }).catch(function (err) {  
                    console.error('Factory reset Firebase push failed:', err);  
                    showNotification("تم التصفير محلياً، لكن تعذر تصفير قاعدة البيانات الحية بسبب مشكلة اتصال. أعد المحاولة بعد التأكد من اتصالك بالإنترنت، وإلا فقد تعود البيانات القديمة من الأجهزة الأخرى.", "warn");  
                    setTimeout(() => { window.location.reload(); }, 2500);  
                });  
            } else {  
                showNotification("تم تصفير المنظومة محلياً بالكامل، سيتم إعادة تحميل الصفحة...", "success");  
                setTimeout(() => { window.location.reload(); }, 1500);  
            }  
        }  

        // ===== تصفير الحسابات المالية فقط (حذف السندات وتصفير الأرصدة دون التأثير على الطلاب أو الموظفين) =====  
        function resetFinancialAccounts() {  
            if (!hasPermission(16) && !hasPermission(15) && currentActiveUser && currentActiveUser.role !== 'role_0') {  
                showNotification("لا تملك الصلاحية الكافية لتصفير الحسابات المالية.", "warn");  
                return;  
            }  

            if (financialTransactions.length === 0) {  
                showNotification("لا توجد حركات مالية مسجلة حالياً لتصفيرها.", "warn");  
                return;  
            }  

            const confirmed = window.confirm("سيتم حذف كافة سندات القبض والصرف وتصفير الرصيد المالي بالكامل بشكل نهائي، مع الإبقاء على بيانات الطلاب والموظفين كما هي. هل تريد المتابعة؟");  
            if (!confirmed) return;  

            financialTransactions = [];  

            refreshAllViews();  
            const saved = saveToLocalStorage();  

            if (saved) {  
                showNotification("تم تصفير الحسابات المالية بنجاح، وتم حفظ التصفير بشكل دائم بالمتصفح.", "success");  
            } else {  
                showNotification("تم التصفير في الواجهة، لكن حدث خلل أثناء حفظه بشكل دائم بالمتصفح — راجع التنبيه أعلاه لمعرفة السبب.", "warn");  
            }  
        }  

        // ===== ربط السندات المالية مباشرة بـ Google Sheet عبر Google Apps Script Web App =====  
        function saveGoogleSheetWebhook() {  
            const input = document.getElementById('gsheet-webhook-input');  
            const url = input.value.trim();  

            if (url && !url.startsWith('https://script.google.com/')) {  
                showNotification("الرابط المدخل لا يبدو رابط تطبيق ويب صحيح من Google Apps Script.", "warn");  
                return;  
            }  

            googleSheetWebhookUrl = url;  
            saveToLocalStorage();  
            updateGoogleSheetStatusUI();  
            showNotification(url ? "تم حفظ ربط Google Sheet بنجاح، سيتم إرسال السندات المالية تلقائياً." : "تم مسح رابط الربط.", "success");  
        }  

        function disconnectGoogleSheet() {  
            googleSheetWebhookUrl = "";  
            autoSyncFromSheetEnabled = false;  
            stopAutoSyncInterval();  
            document.getElementById('gsheet-webhook-input').value = "";  
            saveToLocalStorage();  
            updateGoogleSheetStatusUI();  
            showNotification("تم إلغاء ربط Google Sheet بنجاح.", "success");  
        }  

        function updateGoogleSheetStatusUI() {  
            const statusEl = document.getElementById('gsheet-connection-status');  
            const inputEl = document.getElementById('gsheet-webhook-input');  
            if (!statusEl || !inputEl) return;  

            inputEl.value = googleSheetWebhookUrl || "";  
            if (googleSheetWebhookUrl) {  
                statusEl.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i> مرتبط حالياً بجدول Google Sheet — مزامنة حية بالاتجاهين مفعَّلة';  
                statusEl.className = "text-emerald-600 font-bold";  
            } else {  
                statusEl.innerText = "لم يتم ربط أي جدول Google Sheet حتى الآن";  
                statusEl.className = "text-gray-400";  
            }  

            const toggle = document.getElementById('gsheet-autosync-toggle');  
            if (toggle) toggle.checked = autoSyncFromSheetEnabled;  
        }  

        // ===== إدارة السحب التلقائي الدوري من Google Sheet =====  
        let autoSyncIntervalId = null;  

        function toggleAutoSyncFromSheet() {  
            const checkbox = document.getElementById('gsheet-autosync-toggle');  
            if (!checkbox) return;  

            if (checkbox.checked) {  
                if (!googleSheetWebhookUrl) {  
                    showNotification("يرجى ربط جدول Google Sheet أولاً قبل تفعيل السحب التلقائي.", "warn");  
                    checkbox.checked = false;  
                    autoSyncFromSheetEnabled = false;  
                    return;  
                }  
                autoSyncFromSheetEnabled = true;  
                startAutoSyncInterval();  
                showNotification("تم تفعيل السحب التلقائي الدوري من Google Sheet كل 30 ثانية.", "success");  
            } else {  
                autoSyncFromSheetEnabled = false;  
                stopAutoSyncInterval();  
                showNotification("تم إيقاف السحب التلقائي الدوري.", "success");  
            }  
            saveToLocalStorage();  
        }  

        function startAutoSyncInterval() {  
            stopAutoSyncInterval();  
            autoSyncIntervalId = setInterval(() => { pullFromGoogleSheet(true); }, 30000);  
        }  

        function stopAutoSyncInterval() {  
            if (autoSyncIntervalId) { clearInterval(autoSyncIntervalId); autoSyncIntervalId = null; }  
        }  

        function testGoogleSheetConnection() {  
            if (!googleSheetWebhookUrl) {  
                showNotification("يرجى إدخال رابط تطبيق الويب وحفظه أولاً قبل تجربة الاتصال.", "warn");  
                return;  
            }  
            syncFinancialTransactionsToGoogleSheet({  
                id: "TEST-CONNECTION", type: "receipt", branch: "اختبار الاتصال", category: "تجربة",  
                payer: "اختبار النظام", studentId: '', studentName: 'اختبار النظام', amount: 0,  
                description: "سطر تجريبي للتحقق من نجاح الربط مع Google Sheet", date: new Date().toLocaleString('ar-OM')  
            });  
            showNotification("تم إرسال طلب تجريبي إلى Google Sheet، تحقق من ظهور صف جديد بالجدول.", "success");  
        }  

        // ===== مزامنة عامة لأي نوع بيانات مع Google Sheet: كل نوع يُكتب في تبويب (Sheet) خاص به تلقائياً =====  
        // ===== خرائط الحقول بين أسماء النظام الداخلية وأسماء أعمدة Google Sheet =====  
        // تُستخدم هذه الخرائط عند الدفع (تحويل بيانات النظام لصف بالشيت) وعند السحب (تحويل صف من الشيت لبيانات النظام)  
        // بحيث يبقى الاتجاهان متطابقين تماماً دائماً.  
        const SHEET_FIELD_MAPS = {  
            students:     [['id','الرقم_التعريفي'], ['name','الاسم'], ['age','العمر'], ['branch','الحلقة'], ['program','البرنامج'], ['teacher','المعلمة'], ['finalFee','الرسوم_النهائية'], ['guardian','ولي_الأمر'], ['relation','صلة_القرابة'], ['phone','الهاتف']],  
            employees:    [['id','الرقم_التعريفي'], ['name','الاسم'], ['jobTitle','المسمى_الوظيفي'], ['roleName','الدور'], ['branch','الحلقة'], ['email','البريد'], ['username','اسم_المستخدم'], ['phone','الهاتف']],  
            branches:     [['name','الاسم'], ['date','التاريخ']],  
            programs:     [['name','الاسم'], ['fee','الرسوم'], ['date','التاريخ']],  
            financial:    [['id','id'], ['type','type'], ['branch','branch'], ['category','category'], ['payer','payer'], ['studentId','studentId'], ['studentName','studentName'], ['amount','amount'], ['description','description'], ['date','date']],  
            achievements: [['id','id'], ['student','student'], ['branch','branch'], ['program','program'], ['details','details'], ['date','date']],  
            exams:        [['id','id'], ['student','student'], ['exam','exam'], ['score','score'], ['date','date']],  
            assets:       [['id','id'], ['name','name'], ['qty','qty'], ['branch','branch']],  
            complaints:   [['id','الرقم'], ['sender','المرسل'], ['senderTitle','منصب_المرسل'], ['receiverTitle','المستقبلون'], ['priority','الدرجة'], ['subject','الموضوع'], ['content','المحتوى'], ['status','الحالة'], ['date','التاريخ']]  
        };  

        const SHEET_TAB_NAMES = {  
            financial: "السندات المالية", students: "الطلاب", employees: "الموظفين",  
            branches: "الحلقات والفروع", programs: "البرامج القرآنية", achievements: "إنجازات الحفظ",  
            exams: "الاختبارات", assets: "العهد والأصول", complaints: "المراسلات والبلاغات"  
        };  

        function buildSheetPayload(type, obj) {  
            const map = SHEET_FIELD_MAPS[type];  
            if (!map) return obj;  
            const payload = {};  
            map.forEach(([internalKey, sheetLabel]) => {  
                const v = obj[internalKey];  
                payload[sheetLabel] = (v === undefined || v === null) ? '' : v;  
            });  
            return payload;  
        }  

        function parseSheetRow(type, row) {  
            const map = SHEET_FIELD_MAPS[type];  
            if (!map) return row;  
            const obj = {};  
            map.forEach(([internalKey, sheetLabel]) => {  
                obj[internalKey] = row[sheetLabel];  
            });  
            return obj;  
        }  

        function roleKeyFromName(name) {  
            return roles.find(r => systemTerms[r] === name) || null;  
        }  

        // ===== دفع سجل واحد إلى Google Sheet (إضافة أو تحديث فوري) =====  
        function syncRecordToGoogleSheet(type, action, data) {  
            if (!googleSheetWebhookUrl) return;  

            const payloadData = buildSheetPayload(type, data);  

            try {  
                fetch(googleSheetWebhookUrl, {  
                    method: 'POST',  
                    mode: 'no-cors',  
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },  
                    body: JSON.stringify({ type, action, data: payloadData })  
                }).catch(err => {  
                    console.error('Google Sheet sync failed:', err);  
                });  
            } catch (e) {  
                console.error('Google Sheet sync failed:', e);  
            }  
        }  

        // يبقى الاسم القديم للتوافق: يزامن السندات المالية تحديداً  
        function syncFinancialTransactionsToGoogleSheet(voucher) {  
            syncRecordToGoogleSheet('financial', voucher.type === 'expense' ? 'صرف' : 'قبض', voucher);  
        }  

        // ===== سحب كل التحديثات من Google Sheet ودمجها بالنظام (مزامنة حية بالاتجاهين) =====  
        // ملاحظتان مهمتان للأمانة والدقة:  
        // 1) لا تُحذف أي بيانات محلياً بسبب حذف صف من الشيت (حماية من فقد بيانات بالخطأ)، فقط إضافة وتحديث.  
        // 2) لا تُنشأ حسابات موظفين جديدة تلقائياً من الشيت (حماية أمنية)، فقط تحديث بيانات الموظفين الموجودين فعلاً.  
        let isSyncingFromSheet = false;  

        async function pullFromGoogleSheet(silent) {  
            if (!googleSheetWebhookUrl) {  
                if (!silent) showNotification("يرجى ربط جدول Google Sheet أولاً قبل المزامنة.", "warn");  
                return;  
            }  
            if (isSyncingFromSheet) return;  
            isSyncingFromSheet = true;  

            try {  
                const res = await fetch(googleSheetWebhookUrl, { method: 'GET' });  
                if (!res.ok) throw new Error('HTTP ' + res.status);  
                const allSheets = await res.json();  

                let added = 0, updated = 0;  

                // === الطلاب ===  
                const studentsRows = allSheets[SHEET_TAB_NAMES.students];  
                if (Array.isArray(studentsRows)) {  
                    studentsRows.forEach(row => {  
                        const p = parseSheetRow('students', row);  
                        const idNum = parseInt(p.id);  
                        if (!p.id || isNaN(idNum)) return;  
                        let existing = students.find(s => s.id === idNum);  
                        if (existing) {  
                            existing.name = p.name || existing.name;  
                            existing.age = parseInt(p.age) || existing.age;  
                            existing.branch = p.branch || existing.branch;  
                            existing.program = p.program || existing.program;  
                            existing.teacher = p.teacher || existing.teacher;  
                            existing.finalFee = parseFloat(p.finalFee) || existing.finalFee;  
                            existing.guardian = p.guardian || existing.guardian;  
                            existing.relation = p.relation || existing.relation;  
                            existing.phone = p.phone || existing.phone;  
                            updated++;  
                        } else {  
                            students.push({  
                                id: idNum, name: p.name || 'بدون اسم', age: parseInt(p.age) || 0,  
                                branch: p.branch || '', program: p.program || '', teacher: p.teacher || '',  
                                discount: 0, finalFee: parseFloat(p.finalFee) || 0, paid: false,  
                                guardian: p.guardian || '', relation: p.relation || '', phone: p.phone || ''  
                            });  
                            added++;  
                        }  
                    });  
                }  

                // === السندات المالية ===  
                const finRows = allSheets[SHEET_TAB_NAMES.financial];  
                if (Array.isArray(finRows)) {  
                    finRows.forEach(row => {  
                        const p = parseSheetRow('financial', row);  
                        if (!p.id) return;  
                        let existing = financialTransactions.find(t => String(t.id) === String(p.id));  
                        if (existing) {  
                            existing.branch = p.branch || existing.branch;  
                            existing.category = p.category || existing.category;  
                            existing.amount = parseFloat(p.amount) || existing.amount;  
                            existing.description = p.description || existing.description;  
                            existing.payer = p.payer || existing.payer;  
                            updated++;  
                        } else {  
                            financialTransactions.push({  
                                id: String(p.id), type: p.type === 'expense' ? 'expense' : 'receipt',  
                                branch: p.branch || '', category: p.category || '',  
                                payer: p.payer || '', studentId: p.studentId ? parseInt(p.studentId) : null,  
                                studentName: p.studentName || '', amount: parseFloat(p.amount) || 0,  
                                description: p.description || '', date: p.date || nowStr()  
                            });  
                            added++;  
                        }  
                    });  
                    // إعادة احتساب حالة سداد كل الطلاب بعد استيراد أي سندات جديدة أو محدَّثة  
                    students.forEach(s => {  
                        const summary = getStudentPaymentSummary(s.id);  
                        if (summary) s.paid = summary.remaining <= 0;  
                    });  
                }  

                // === الحلقات والفروع (المفتاح الفريد هو الاسم) ===  
                const branchRows = allSheets[SHEET_TAB_NAMES.branches];  
                if (Array.isArray(branchRows)) {  
                    branchRows.forEach(row => {  
                        const p = parseSheetRow('branches', row);  
                        if (p.name && !branches.includes(p.name)) { branches.push(p.name); added++; }  
                    });  
                }  

                // === البرامج (المفتاح الفريد هو الاسم) ===  
                const progRows = allSheets[SHEET_TAB_NAMES.programs];  
                if (Array.isArray(progRows)) {  
                    progRows.forEach(row => {  
                        const p = parseSheetRow('programs', row);  
                        if (!p.name) return;  
                        let existing = programs.find(pr => pr.name === p.name);  
                        if (existing) {  
                            existing.fee = parseFloat(p.fee) || existing.fee;  
                            updated++;  
                        } else {  
                            programs.push({ name: p.name, fee: parseFloat(p.fee) || 0 });  
                            added++;  
                        }  
                    });  
                }  

                // === إنجازات الحفظ ===  
                const achRows = allSheets[SHEET_TAB_NAMES.achievements];  
                if (Array.isArray(achRows)) {  
                    achRows.forEach(row => {  
                        const p = parseSheetRow('achievements', row);  
                        if (!p.id) return;  
                        let existing = achievements.find(a => String(a.id) === String(p.id));  
                        if (existing) {  
                            existing.details = p.details || existing.details;  
                            updated++;  
                        } else {  
                            achievements.unshift({ id: parseInt(p.id) || nextId(achievements), student: p.student || '', branch: p.branch || '', program: p.program || '', details: p.details || '', date: p.date || nowStr() });  
                            added++;  
                        }  
                    });  
                }  

                // === الاختبارات ===  
                const examRows = allSheets[SHEET_TAB_NAMES.exams];  
                if (Array.isArray(examRows)) {  
                    examRows.forEach(row => {  
                        const p = parseSheetRow('exams', row);  
                        if (!p.id) return;  
                        let existing = exams.find(e => String(e.id) === String(p.id));  
                        if (existing) {  
                            existing.score = parseInt(p.score) || existing.score;  
                            updated++;  
                        } else {  
                            exams.unshift({ id: parseInt(p.id) || nextId(exams), student: p.student || '', exam: p.exam || '', score: parseInt(p.score) || 0, date: p.date || nowStr() });  
                            added++;  
                        }  
                    });  
                }  

                // === العهد والأصول ===  
                const assetRows = allSheets[SHEET_TAB_NAMES.assets];  
                if (Array.isArray(assetRows)) {  
                    assetRows.forEach(row => {  
                        const p = parseSheetRow('assets', row);  
                        if (!p.id) return;  
                        let existing = assets.find(a => String(a.id) === String(p.id));  
                        if (existing) {  
                            existing.qty = parseInt(p.qty) || existing.qty;  
                            updated++;  
                        } else {  
                            assets.unshift({ id: parseInt(p.id) || nextId(assets), name: p.name || '', qty: parseInt(p.qty) || 0, branch: p.branch || '' });  
                            added++;  
                        }  
                    });  
                }  

                // === المراسلات والبلاغات ===  
                const compRows = allSheets[SHEET_TAB_NAMES.complaints];  
                if (Array.isArray(compRows)) {  
                    compRows.forEach(row => {  
                        const p = parseSheetRow('complaints', row);  
                        if (!p.id) return;  
                        let existing = complaints.find(c => String(c.id) === String(p.id));  
                        if (existing) {  
                            existing.status = p.status || existing.status;  
                            updated++;  
                        } else {  
                            complaints.unshift({ id: parseInt(p.id) || nextId(complaints), sender: p.sender || '', senderRole: '', senderTitle: p.senderTitle || '', receiverNames: [], receiverTitle: p.receiverTitle || '', priority: p.priority || 'عادية', subject: p.subject || '', content: p.content || '', status: p.status || 'نشط', date: p.date || nowStr(), replies: [], currentLevelIndex: hierarchyOrder.length - 1 });  
                            added++;  
                        }  
                    });  
                }  

                // === الموظفون: تحديث بيانات موجودين فعلاً، وإنشاء حسابات جديدة غير موجودة محلياً (بدون كلمة سر أبداً، ===  
                // === لتنتقل الحسابات بين الأجهزة؛ يقوم صاحب الحساب الجديد بتعيين كلمة سره بنفسه عبر "نسيت كلمة السر") ===  
                const empRows = allSheets[SHEET_TAB_NAMES.employees];  
                if (Array.isArray(empRows)) {  
                    empRows.forEach(row => {  
                        const p = parseSheetRow('employees', row);  
                        const idNum = parseInt(p.id);  
                        if (!p.id || isNaN(idNum)) return;  
                        const existing = employees.find(e => e.id === idNum);  
                        if (existing) {  
                            existing.name = p.name || existing.name;  
                            existing.jobTitle = p.jobTitle || existing.jobTitle;  
                            existing.email = p.email || existing.email;  
                            existing.phone = p.phone || existing.phone;  
                            updated++;  
                        } else if (p.name && p.username) {  
                            const roleKey = roleKeyFromName(p.roleName) || 'role_6';  
                            employees.push({  
                                id: idNum, name: p.name, role: roleKey, jobTitle: p.jobTitle || '',  
                                branch: p.branch || '', email: p.email || '', username: p.username,  
                                password: '', phone: p.phone || '', idCard: '', joinDate: '',  
                                qualification: '', revenue: 0, expense: 0, status: 'نشط'  
                            });  
                            added++;  
                        }  
                    });  
                }  

                refreshAllViews();  
                saveToLocalStorage();  

                if (!silent) {  
                    showNotification(`تمت المزامنة من Google Sheet بنجاح: ${added} عنصر جديد، ${updated} عنصر محدَّث.`, "success");  
                }  
                const statusEl = document.getElementById('gsheet-last-sync');  
                if (statusEl) statusEl.innerText = `آخر مزامنة: ${nowStr()}`;  
            } catch (err) {  
                console.error('Pull from Google Sheet failed:', err);  
                if (!silent) showNotification("تعذر سحب التحديثات من Google Sheet. تحقق من الرابط، ومن أن نشر التطبيق مفعَّل بصلاحية Anyone.", "warn");  
            } finally {  
                isSyncingFromSheet = false;  
            }  
        }  

        // ===== قاعدة البيانات الحية (Firebase): مزامنة فورية تلقائية بين كل الأجهزة بدون أي خطوة يدوية =====  
        function initFirebaseIfConfigured() {  
            if (!firebaseConfig) return;  
            try {  
                if (typeof firebase === 'undefined') {  
                    console.error('Firebase SDK لم يُحمَّل بعد.');  
                    return;  
                }  
                if (!firebase.apps || firebase.apps.length === 0) {  
                    firebase.initializeApp(firebaseConfig);  
                }  
                firebaseDb = firebase.database();  

                // مصادقة مجهولة (Anonymous Auth): طبقة حماية إضافية تمنع أي طرف من قراءة أو كتابة   
                // البيانات مباشرة عبر رابط الشيت الخام دون المرور بتطبيقنا على الأقل، طالما كانت   
                // قواعد الأمان بقاعدة البيانات تشترط "auth != null"  
                if (firebase.auth) {  
                    firebase.auth().signInAnonymously().then(function () {  
                        attachFirebaseListener();  
                    }).catch(function (authErr) {  
                        console.error('Firebase anonymous auth failed:', authErr);  
                        updateFirebaseStatusUI(false, { code: 'auth-failed: ' + (authErr.code || authErr.message || authErr) });  
                        // في حال فشلت المصادقة (مثلاً لم تُفعَّل بعد من لوحة Firebase)، نحاول الاتصال   
                        // مباشرة كما كان سابقاً، حتى لا يتعطل النظام كلياً لمن لم يُفعّل هذه الطبقة بعد  
                        attachFirebaseListener();  
                    });  
                } else {  
                    attachFirebaseListener();  
                }  
            } catch (e) {  
                console.error('Firebase init failed:', e);  
                showNotification("تعذر الاتصال بقاعدة البيانات الحية. تحقق من صحة الإعدادات الملصقة.", "warn");  
                updateFirebaseStatusUI(false);  
            }  
        }  

        function attachFirebaseListener() {  
            if (!firebaseDb) return;  
            firebaseDb.ref('samailData').on('value', function (snapshot) {  
                const isFirstSnapshot = !hasReceivedFirstFirebaseSnapshot;  
                firebaseConnected = true;  
                hasReceivedFirstFirebaseSnapshot = true;  
                updateFirebaseStatusUI(true);  
                const data = snapshot.val();  

                if (!data) {  
                    // لا توجد بيانات على القاعدة بعد؛ هذا أول اتصال — نؤسس القاعدة ببياناتنا المحلية الحالية  
                    pushFullStateToFirebase();  
                    return;  
                }  
                if (isApplyingRemoteUpdate) return;  

                if (isFirstSnapshot && hasLocalChangesBeforeFirstSnapshot) {  
                    // حدث تعديل محلي حقيقي (مثل إضافة طالب) قبل وصول أول لقطة من Firebase — نعطي الأولوية   
                    // لهذا التعديل الأحدث بدل استبداله ببيانات Firebase الأقدم، وندفعه فوراً ليعتمد للجميع  
                    hasLocalChangesBeforeFirstSnapshot = false;  
                    pushFullStateToFirebase();  
                    return;  
                }  

                applyRemoteState(data);  
            }, function (error) {  
                console.error('Firebase listener error:', error);  
                firebaseConnected = false;  
                updateFirebaseStatusUI(false, error);  
            });  
        }  

        function applyRemoteState(data) {  
            // اكتشاف فجوة تزامن حقيقية: إن كانت البيانات الواردة من Firebase أقدم من آخر تعديل   
            // محلي نعرفه (محفوظ من جلسة سابقة)، فهذا يعني أن دفعنا السابق لم يكتمل قبل إغلاق   
            // الصفحة. في هذه الحالة، لا نستبدل تعديلنا الأحدث ببيانات أقدم، بل نعيد دفع نسختنا   
            // (المحمَّلة أصلاً من التخزين المحلي الصحيح) لتصحيح القاعدة الحية  
            if (data.lastModified && lastLocalChangeTimestamp && data.lastModified < lastLocalChangeTimestamp) {  
                pushFullStateToFirebase();  
                return;  
            }  
            if (data.lastModified) lastLocalChangeTimestamp = data.lastModified;  

            isApplyingRemoteUpdate = true;  
            try {  
                if (data.systemTerms) systemTerms = Object.assign({}, systemTerms, data.systemTerms);  
                if (data.rolePermissions) rolePermissions = data.rolePermissions;  
                if (Array.isArray(data.branches)) branches = data.branches;  
                if (Array.isArray(data.programs)) programs = data.programs;  
                if (Array.isArray(data.students)) students = data.students;  
                if (Array.isArray(data.guardians)) guardians = data.guardians;  
                if (Array.isArray(data.financialTransactions)) financialTransactions = data.financialTransactions;  
                if (Array.isArray(data.assets)) assets = data.assets;  
                if (Array.isArray(data.complaints)) complaints = data.complaints;  
                if (Array.isArray(data.achievements)) achievements = data.achievements;  
                if (Array.isArray(data.exams)) exams = data.exams;  
                if (Array.isArray(data.employees) && data.employees.length > 0) employees = data.employees;  
                if (Array.isArray(data.hierarchyOrder) && data.hierarchyOrder.length === roles.length) hierarchyOrder = data.hierarchyOrder;  
                if (data.activeTheme) activeTheme = data.activeTheme;  
                if (data.customThemeColors) customThemeColors = data.customThemeColors;  
                if (data.customTextColor) customTextColor = data.customTextColor;  
                if (data.headerTitleColor) headerTitleColor = data.headerTitleColor;  
                if (data.loginScreenColor) loginScreenColor = data.loginScreenColor;  
                if (data.systemLogo) systemLogo = data.systemLogo;  
                if (data.modalHeaderTextColor) modalHeaderTextColor = data.modalHeaderTextColor;  
                if (data.fontMainHeading) fontMainHeading = data.fontMainHeading;  
                if (data.fontSubHeading) fontSubHeading = data.fontSubHeading;  
                if (data.googleSheetWebhookUrl) googleSheetWebhookUrl = data.googleSheetWebhookUrl;  
                if (typeof data.autoSyncFromSheetEnabled === 'boolean') autoSyncFromSheetEnabled = data.autoSyncFromSheetEnabled;  
                if (data.termsMetadata) { try { Object.assign(termsMetadata, data.termsMetadata); } catch (e) { /* تجاهل */ } }  
                updateGoogleSheetStatusUI();  
                if (autoSyncFromSheetEnabled && googleSheetWebhookUrl) { startAutoSyncInterval(); } else { stopAutoSyncInterval(); }  

                // إعادة ربط المستخدم الحالي (إن كان مسجلاً دخوله) بأحدث نسخة من بياناته  
                if (currentActiveUser) {  
                    const refreshedUser = employees.find(e => e.id === currentActiveUser.id);  
                    if (refreshedUser) currentActiveUser = refreshedUser;  
                }  

                applyThemeStyles(activeTheme);  
                if (customTextColor) document.documentElement.style.setProperty('--ink', customTextColor);  
                if (headerTitleColor) document.documentElement.style.setProperty('--header-title-color', headerTitleColor);  
                if (loginScreenColor) document.documentElement.style.setProperty('--login-bg-color', loginScreenColor);  
                if (modalHeaderTextColor) document.documentElement.style.setProperty('--modal-header-text-color', modalHeaderTextColor);  
                if (fontMainHeading) document.documentElement.style.setProperty('--font-main-heading', `'${fontMainHeading}'`);  
                if (fontSubHeading) document.documentElement.style.setProperty('--font-sub-heading', `'${fontSubHeading}'`);  
                updateSystemLogoUI();  
                renderLoginHints();  
                refreshAllViews();  
                saveToLocalStorage();  
            } finally {  
                isApplyingRemoteUpdate = false;  
            }  
        }  

        function buildFullStateObject() {  
            return {  
                systemTerms, rolePermissions, branches, programs, students,  
                financialTransactions, assets, complaints, achievements, exams, guardians,  
                employees, hierarchyOrder, activeTheme, customThemeColors: customThemeColors || null,  
                customTextColor: customTextColor || null, headerTitleColor: headerTitleColor || null,  
                loginScreenColor: loginScreenColor || null, systemLogo: systemLogo || null,  
                modalHeaderTextColor: modalHeaderTextColor || null,  
                fontMainHeading: fontMainHeading || null, fontSubHeading: fontSubHeading || null,  
                googleSheetWebhookUrl: googleSheetWebhookUrl || null, autoSyncFromSheetEnabled: autoSyncFromSheetEnabled || false,  
                termsMetadata: termsMetadata,  
                lastModified: lastLocalChangeTimestamp || Date.now()  
            };  
        }  

        function pushFullStateToFirebase() {  
            if (!firebaseDb || isApplyingRemoteUpdate) return;  
            updateHeaderSaveIndicator('pending');  
            try {  
                firebaseDb.ref('samailData').set(buildFullStateObject()).then(function () {  
                    updateHeaderSaveIndicator('success');  
                }).catch(function (err) {  
                    console.error('Firebase push failed:', err);  
                    updateHeaderSaveIndicator('error');  
                    showNotification("تنبيه: تعذر حفظ آخر تعديل بقاعدة البيانات الحية (قد يكون بسبب انقطاع الإنترنت). تأكد من اتصالك وأعد المحاولة.", "warn");  
                });  
            } catch (e) {  
                console.error('Firebase push failed:', e);  
                updateHeaderSaveIndicator('error');  
                showNotification("تنبيه: تعذر حفظ آخر تعديل بقاعدة البيانات الحية.", "warn");  
            }  
        }  

        function updateHeaderSaveIndicator(state) {  
            const el = document.getElementById('header-last-save-indicator');  
            if (!el) return;  

            const now = new Date();  
            const timeStr = now.toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit', second: '2-digit' });  

            if (state === 'pending') {  
                el.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-amber-500"></i> <span class="text-amber-600">جارِ الحفظ الآن...</span>';  
            } else if (state === 'success') {  
                el.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> <span class="text-emerald-700">تم الحفظ بنجاح — ${timeStr}</span>`;  
            } else if (state === 'error') {  
                el.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-600"></i> <span class="text-rose-700">فشل آخر حفظ! أعد المحاولة</span>`;  
            }  
        }  

        function updateFirebaseStatusUI(connected, error) {  
            const el = document.getElementById('firebase-connection-status');  
            if (!el) return;  
            if (connected) {  
                el.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i> متصل بقاعدة البيانات الحية — كل الأجهزة تتحدث تلقائياً بدون أي خطوة إضافية';  
                el.className = "text-emerald-700 font-bold";  
            } else if (error) {  
                const errCode = error.code || error.message || String(error);  
                el.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-600"></i> فشل الاتصال — رسالة الخطأ الدقيقة: <span class="font-mono" dir="ltr">${errCode}</span>`;  
                el.className = "text-rose-600 font-bold";  
            } else {  
                el.innerText = firebaseConfig ? "جارِ محاولة الاتصال..." : "غير متصل بقاعدة بيانات حية حالياً";  
                el.className = "text-gray-400";  
            }  
        }  

        function saveFirebaseConfig() {  
            const raw = document.getElementById('firebase-config-input').value.trim();  
            if (!raw) {  
                showNotification("يرجى لصق إعدادات Firebase أولاً.", "warn");  
                return;  
            }  
            try {  
                let parsed;  
                try {  
                    parsed = JSON.parse(raw);  
                } catch (e1) {  
                    // محاولة تحويل صيغة كائن JS (بدون علامات اقتباس على المفاتيح) إلى JSON صالح  
                    const jsonLike = raw.replace(/'/g, '"').replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');  
                    parsed = JSON.parse(jsonLike);  
                }  
                if (!parsed || !parsed.databaseURL) {  
                    showNotification("الإعدادات الملصقة لا تحتوي على databaseURL — تأكد من نسخ الكائن كاملاً من Firebase.", "warn");  
                    return;  
                }  
                firebaseConfig = parsed;  
                saveToLocalStorage();  
                showNotification("تم حفظ إعدادات قاعدة البيانات الحية، جارِ الاتصال...", "success");  
                updateFirebaseStatusUI(false);  
                initFirebaseIfConfigured();  
            } catch (e) {  
                showNotification("تعذر قراءة الإعدادات الملصقة، تأكد من نسخها كاملة وصحيحة من Firebase.", "warn");  
            }  
        }  

        function disconnectFirebase() {  
            if (firebaseDb) {  
                try { firebaseDb.ref('samailData').off(); } catch (e) { /* تجاهل */ }  
            }  
            firebaseConfig = null;  
            firebaseDb = null;  
            firebaseConnected = false;  
            const input = document.getElementById('firebase-config-input');  
            if (input) input.value = '';  
            updateFirebaseStatusUI(false);  
            saveToLocalStorage();  
            showNotification("تم قطع الاتصال بقاعدة البيانات الحية. سيعمل النظام محلياً على هذا الجهاز فقط.", "success");  
        }  

        function copyGoogleScriptCode() {  
            const codeEl = document.getElementById('gsheet-script-code');  
            if (!codeEl) return;  
            const text = codeEl.innerText;  

            if (navigator.clipboard && navigator.clipboard.writeText) {  
                navigator.clipboard.writeText(text).then(() => {  
                    showNotification("تم نسخ كود الربط بنجاح، الصقه داخل محرر Apps Script.", "success");  
                }).catch(() => {  
                    showNotification("تعذر نسخ الكود تلقائياً، يرجى تحديده ونسخه يدوياً.", "warn");  
                });  
            } else {  
                showNotification("تعذر نسخ الكود تلقائياً، يرجى تحديده ونسخه يدوياً.", "warn");  
            }  
        }  
  
        // دالة التحقق من الصلاحيات الممنوحة لكل مستخدم أو دور  
        function hasPermission(permId) {  
            if (!currentActiveUser) return false;  
            const roleKey = currentActiveUser.role;  
            return rolePermissions[roleKey] && rolePermissions[roleKey][permId] === true;  
        }  
  
        // التحقق من صلاحية المستخدم لزيارة التبويب لحمايته من الحوادث العرضية  
        function hasTabPermission(tabId) {  
            if (tabId === 'dashboard') return hasPermission(1);  
            if (tabId === 'hr-employees') return hasPermission(9);  
            if (tabId === 'users-permissions') return hasPermission(2) || hasPermission(3);  
            if (tabId === 'structures') return hasPermission(4) || hasPermission(5) || hasPermission(6);  
            if (tabId === 'students') return hasPermission(7) || hasPermission(8);  
            if (tabId === 'educational') return hasPermission(10) || hasPermission(11) || hasPermission(12);  
            if (tabId === 'financial') return hasPermission(13) || hasPermission(14) || hasPermission(15) || hasPermission(16) || hasPermission(17);  
            if (tabId === 'warehouse') return hasPermission(18) || hasPermission(19) || hasPermission(20);  
            if (tabId === 'operations') return hasPermission(21) || hasPermission(22) || hasPermission(23) || hasPermission(24);  
            if (tabId === 'settings') return hasPermission(28);  
            return false;  
        }  
  
        // ربط تصفح التبويبات بالمتصفح لمنع الخروج أو التعليق عند استخدام أزرار الهواتف  
        window.onhashchange = function() {  
            const hash = window.location.hash.replace('#', '');  
            const validTabs = ['dashboard', 'hr-employees', 'users-permissions', 'structures', 'students', 'educational', 'financial', 'warehouse', 'operations', 'settings'];  
            if (hash && validTabs.includes(hash) && hasTabPermission(hash)) {  
                switchTab(hash, false);  
            }  
        };  
  
        // شبكة أمان: حفظ فوري ودائم لكل التعديلات والتصفيرات فور الخروج أو إغلاق النافذة أو تبديل الصفحة  
        // ملاحظة: يتم تجاوز الحفظ التلقائي هنا فقط أثناء تنفيذ "إعادة تعيين وتصفير كامل المنظومة"،   
        // لأن إعادة تحميل الصفحة (reload) تُطلق أحداث الإغلاق (beforeunload/pagehide) على الصفحة القديمة،   
        // وبدون هذا الاستثناء سيُعاد حفظ البيانات القديمة (قبل التصفير) في اللحظة الأخيرة فيُلغي التصفير فعلياً.  
        //  
        // تنبيه هام: كل عمليات الحفظ "السلبية" هنا (عند الإغلاق، أو الفاصل الدوري) تُحفظ محلياً فقط   
        // (pushToFirebase = false) ولا تُدفع لقاعدة البيانات الحية. السبب: لو بقي جهاز مفتوحاً بصفحة قديمة   
        // (بيانات ليست الأحدث)، فإن دفعها التلقائي الدوري لقاعدة البيانات المشتركة قد يُعيد كتابة بيانات   
        // أحدث أدخلها جهاز آخر، ويُفقد تعديلات فعلية بصمت. الدفع الحقيقي لقاعدة البيانات يتم فقط عند إجراء   
        // فعلي وصريح من المستخدم (إضافة، تعديل، حذف...)، وهذا مضمون بالفعل عبر كل دالة تعدّل البيانات.  
        let suppressAutoSave = false;  

        window.addEventListener('beforeunload', function() {  
            if (!suppressAutoSave) saveToLocalStorage(false);  
        });  
        window.addEventListener('pagehide', function() {  
            if (!suppressAutoSave) saveToLocalStorage(false);  
        });  
        document.addEventListener('visibilitychange', function() {  
            if (!suppressAutoSave && document.visibilityState === 'hidden') {  
                saveToLocalStorage(false);  
            }  
        });  

        // حفظ تلقائي دوري إضافي كشبكة أمان ثانية لضمان عدم فقد أي تعديل محلياً مهما حدث (بدون دفع لـ Firebase)  
        setInterval(function() {  
            if (!suppressAutoSave) saveToLocalStorage(false);  
        }, 20000);  

        // تنفيذ آمن لأي دالة تهيئة: أي خطأ داخل خطوة واحدة يُسجَّل ويُتجاوز، دون أن يوقف بقية   
        // خطوات بدء التشغيل أو يترك المستخدم أمام صفحة متجمدة بلا أي واجهة.  
        function safeInitStep(fn, label) {  
            try {  
                fn();  
            } catch (e) {  
                console.error(`Init step failed [${label}]: `, e);  
            }  
        }  

        window.onload = function() {  
            safeInitStep(loadFromLocalStorage, 'loadFromLocalStorage');  
            safeInitStep(() => applyThemeStyles(activeTheme), 'applyThemeStyles');  
            safeInitStep(() => {  
                if (customTextColor) {  
                    document.documentElement.style.setProperty('--ink', customTextColor);  
                    const input = document.getElementById('custom-text-color-input');  
                    if (input) input.value = customTextColor;  
                }  
                if (headerTitleColor) {  
                    document.documentElement.style.setProperty('--header-title-color', headerTitleColor);  
                    const hInput = document.getElementById('header-title-color-input');  
                    if (hInput) hInput.value = headerTitleColor;  
                }  
                if (customThemeColors) {  
                    const pInput = document.getElementById('custom-primary-color-input');  
                    const aInput = document.getElementById('custom-accent-color-input');  
                    if (pInput) pInput.value = customThemeColors.primary;  
                    if (aInput) aInput.value = customThemeColors.accent;  
                }  
                if (loginScreenColor) {  
                    document.documentElement.style.setProperty('--login-bg-color', loginScreenColor);  
                    const lInput = document.getElementById('login-bg-color-input');  
                    if (lInput) lInput.value = loginScreenColor;  
                }  
                if (modalHeaderTextColor) {  
                    document.documentElement.style.setProperty('--modal-header-text-color', modalHeaderTextColor);  
                    const mInput = document.getElementById('modal-header-text-color-input');  
                    if (mInput) mInput.value = modalHeaderTextColor;  
                }  
                if (fontMainHeading) {  
                    document.documentElement.style.setProperty('--font-main-heading', `'${fontMainHeading}'`);  
                    const mfSelect = document.getElementById('font-main-heading-select');  
                    if (mfSelect) mfSelect.value = fontMainHeading;  
                }  
                if (fontSubHeading) {  
                    document.documentElement.style.setProperty('--font-sub-heading', `'${fontSubHeading}'`);  
                    const sfSelect = document.getElementById('font-sub-heading-select');  
                    if (sfSelect) sfSelect.value = fontSubHeading;  
                }  
            }, 'applyCustomTextColorOnLoad');  
            safeInitStep(setDateTime, 'setDateTime');  
            safeInitStep(buildMatrixTable, 'buildMatrixTable');  
            safeInitStep(applySystemTerms, 'applySystemTerms');  
            safeInitStep(initLogoUploadListener, 'initLogoUploadListener');  
            safeInitStep(updateSystemLogoUI, 'updateSystemLogoUI');  
            safeInitStep(updateGoogleSheetStatusUI, 'updateGoogleSheetStatusUI');  
            safeInitStep(() => {  
                if (autoSyncFromSheetEnabled && googleSheetWebhookUrl) {  
                    startAutoSyncInterval();  
                }  
            }, 'startAutoSyncOnLoad');  
            safeInitStep(() => {  
                if (firebaseConfig) {  
                    const input = document.getElementById('firebase-config-input');  
                    if (input) input.value = JSON.stringify(firebaseConfig, null, 2);  
                    updateFirebaseStatusUI(false);  
                    initFirebaseIfConfigured();  
                }  
            }, 'initFirebaseOnLoad');  

            // مهما حدث من أخطاء بالخطوات أعلاه، يجب دائماً إظهار إما شاشة الدخول أو واجهة العمل،   
            // ولا يجب أبداً أن تبقى الصفحة فارغة أو متجمدة بلا أي تفاعل ممكن من المستخدم.  
            try {  
                const loginScreen = document.getElementById('login-container-screen');  
                if (isLoggedIn && currentActiveUser) {  
                    if (loginScreen) loginScreen.classList.add('hidden');  
                    switchUser(currentActiveUser.id);  

                    // تصفح التبويب المحفوظ بالعنوان إن وجد بعد الدخول التلقائي  
                    const hash = window.location.hash.replace('#', '');  
                    if (hash && hasTabPermission(hash)) {  
                        switchTab(hash, false);  
                    }  
                } else {  
                    isLoggedIn = false;  
                    if (loginScreen) loginScreen.classList.remove('hidden');  
                }  
            } catch (e) {  
                console.error('Init step failed [login/app screen restore]: ', e);  
                // شبكة أمان أخيرة: أظهر شاشة الدخول قسراً حتى لا تبقى الصفحة بلا أي واجهة ظاهرة  
                try {  
                    const loginScreen = document.getElementById('login-container-screen');  
                    if (loginScreen) loginScreen.classList.remove('hidden');  
                } catch (e2) { /* تجاهل */ }  
            }  

            safeInitStep(renderLoginHints, 'renderLoginHints');  
        };  
  
        // ملاحظة: أُزيلت ميزة "حسابات الدخول السريع" نهائياً لأسباب أمنية (كانت تعرض كلمات السر   
        // الفعلية على شاشة الدخول العامة). أبقيت هذه الدالة كـ"لا تفعل شيئاً" فقط حتى لا نحتاج   
        // لتعديل كل الأماكن التي تستدعيها في أنحاء النظام.  
        function renderLoginHints() {  
            return;  
        }  
  
        function handleSystemLogin() {  
            try {  
                const usernameField = document.getElementById('login-username');  
                const passwordField = document.getElementById('login-password');  
                const usernameInput = usernameField ? usernameField.value.trim() : '';  
                const passwordInput = passwordField ? passwordField.value : '';  
                  
                if (!usernameInput || !passwordInput) {  
                    showNotification("يرجى كتابة اسم المستخدم وكلمة السر", "warn");  
                    return;  
                }  
  
                // المطابقة مع الموظفين المسجلين بالنظام (اسم المستخدم غير حساس لحالة الأحرف)  
                const matchedEmp = employees.find(emp => (emp.username || '').toLowerCase() === usernameInput.toLowerCase());  
                  
                if (!matchedEmp) {  
                    showNotification("اسم المستخدم غير صحيح! يرجى التحقق من القائمة الإرشادية بالأسفل.", "warn");  
                    return;  
                }  
  
                if ((matchedEmp.password || '') !== passwordInput) {  
                    showNotification("كلمة السر غير صحيحة! يرجى المحاولة مجدداً.", "warn");  
                    return;  
                }  
  
                if (matchedEmp.status === 'معطل') {  
                    showNotification("عذراً، هذا الحساب مسحوب الصلاحية بقرار إداري مسبق!", "warn");  
                    return;  
                }  
  
                isLoggedIn = true;  
                currentActiveUser = matchedEmp;  
                saveToLocalStorage();  
  
                const loginScreen = document.getElementById('login-container-screen');  
                if (loginScreen) loginScreen.classList.add('hidden');  
  
                switchUser(matchedEmp.id);  
                showNotification(`مرحباً بك مجدداً، ${matchedEmp.name}`, "success");  
            } catch (err) {  
                console.error('handleSystemLogin error:', err);  
                showNotification("حدث خطأ غير متوقع أثناء تسجيل الدخول: " + err.message, "warn");  
            }  
        }  
  
        function handleSystemLogout() {  
            isLoggedIn = false;  
            saveToLocalStorage();  
  
            const loginScreen = document.getElementById('login-container-screen');  
            if (loginScreen) loginScreen.classList.remove('hidden');  
  
            const usernameField = document.getElementById('login-username');  
            const passwordField = document.getElementById('login-password');  
            if (usernameField) usernameField.value = '';  
            if (passwordField) passwordField.value = '';  
  
            showNotification("تم تسجيل الخروج بنجاح وتأمين بيانات الحلقات سحابياً", "success");  
        }  
  
        function initLogoUploadListener() {  
            const uploadInput = document.getElementById('logo-upload-input');  
            if (!uploadInput) return;  
  
            uploadInput.addEventListener('change', function(event) {  
                const file = event.target.files[0];  
                if (!file) return;  
  
                if (!file.type.startsWith('image/')) {  
                    showNotification("يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG)", "warn");  
                    return;  
                }  
  
                if (file.size > 700 * 1024) {  
                    showNotification("حجم الصورة كبير نسبياً (يُفضَّل أقل من 700 كيلوبايت) لضمان مزامنته بسرعة لكل الأجهزة. سيُرفع على أي حال، لكن قد يتأخر ظهوره للآخرين قليلاً.", "warn");  
                }  
  
                const reader = new FileReader();  
                reader.onload = function(e) {  
                    systemLogo = e.target.result;  
                    updateSystemLogoUI();  
                    showNotification("تم رفع وتحديث الشعار الجديد بنجاح!", "success");  
                    saveToLocalStorage();  
                };  
                reader.onerror = function() {  
                    showNotification("حدث خطأ أثناء معالجة ملف الصورة", "warn");  
                };  
                reader.readAsDataURL(file);  
            });  
        }  
  
        function setDateTime() {  
            const now = new Date();  
            const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');  
            const vDate = document.getElementById('v-date');  
            if (vDate) vDate.value = dateStr;  
        }  
  
        function updateSystemLogoUI() {  
            const logoContainer = document.getElementById('logo-container');  
            if (!logoContainer) return;  

            if (systemLogo) {  
                logoContainer.innerHTML = `<img src="${systemLogo}" alt="شعار المركز" class="w-full h-full object-contain rounded-xl bg-white/5">`;  
                logoContainer.className = "bg-white p-2 rounded-2xl border-2 border-custom-accent shadow-lg w-32 h-32 flex items-center justify-center transition-all duration-500 hover:scale-105 hover:rotate-3 flex-shrink-0";  
            } else {  
                logoContainer.innerHTML = `<i class="fa-solid fa-mosque text-6xl drop-shadow-[0_2px_5px_rgba(197,168,128,0.4)]"></i>`;  
                logoContainer.className = "bg-gradient-to-br from-white/15 to-white/5 p-2 rounded-2xl border-2 border-custom-accent/50 shadow-lg shadow-black/30 text-custom-accent w-32 h-32 flex items-center justify-center transition-all duration-500 hover:scale-105 hover:rotate-3 hover:border-custom-accent flex-shrink-0";  
            }  

            // مزامنة نفس الشعار مع شاشة تسجيل الدخول لهوية بصرية موحدة  
            const loginLogoHolder = document.getElementById('login-logo-holder');  
            if (loginLogoHolder) {  
                if (systemLogo) {  
                    loginLogoHolder.innerHTML = `<img src="${systemLogo}" alt="شعار المركز" class="w-full h-full object-contain rounded-2xl p-2">`;  
                    loginLogoHolder.className = "bg-white w-36 h-36 rounded-2xl border-2 border-custom-accent mx-auto flex items-center justify-center shadow-lg transition-transform duration-500 hover:rotate-6";  
                } else {  
                    loginLogoHolder.innerHTML = `<i class="fa-solid fa-mosque text-7xl"></i>`;  
                    loginLogoHolder.className = "bg-custom-primary text-white w-36 h-36 rounded-2xl border-2 border-custom-accent mx-auto flex items-center justify-center shadow-lg transition-transform duration-500 hover:rotate-6";  
                }  
            }  
        }  
  
        function resetLogo() {  
            systemLogo = null;  
            const uploadInput = document.getElementById('logo-upload-input');  
            if (uploadInput) uploadInput.value = '';  
            updateSystemLogoUI();  
            showNotification("تم استعادة الشعار الإسلامي الافتراضي للنظام", "success");  
            saveToLocalStorage();  
        }  
  
        function showNotification(message, type = 'success') {  
            const container = document.getElementById('toast-container');  
            const toast = document.createElement('div');  
            toast.className = `px-4 py-3 rounded-xl shadow-lg text-xs font-bold transition-all duration-300 transform translate-y-5 opacity-0 flex items-center gap-2 pointer-events-auto ${  
                type === 'success' ? 'bg-emerald-600 text-white border-l-4 border-emerald-950' : 'bg-amber-600 text-white border-l-4 border-amber-950'  
            }`;  
              
            const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';  
            toast.innerHTML = `${icon} <span>${message}</span>`;  
              
            container.appendChild(toast);  
              
            toast.offsetHeight;  
            toast.classList.remove('translate-y-5', 'opacity-0');  
            toast.classList.add('translate-y-0', 'opacity-100');  
              
            setTimeout(() => {  
                toast.classList.remove('translate-y-0', 'opacity-100');  
                toast.classList.add('translate-y-5', 'opacity-0');  
                setTimeout(() => { toast.remove(); }, 300);  
            }, 3000);  
        }  
  
        // ===== نظام الطباعة العام لكافة التقارير والقوائم والإحصائيات =====  
        function printSection(elementId, reportTitle) {  
            const el = document.getElementById(elementId);  
            if (!el) {  
                showNotification("تعذر العثور على المحتوى المطلوب طباعته.", "warn");  
                return;  
            }  

            const centerName = document.getElementById('center-title-display') ? document.getElementById('center-title-display').innerText : 'مركز سمائل القرآني';  
            const printedBy = currentActiveUser ? `${currentActiveUser.name} (${currentActiveUser.jobTitle || systemTerms[currentActiveUser.role] || ''})` : '';  
            const now = new Date();  
            const dateStr = now.toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });  
            const timeStr = now.toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' });  

            // قراءة الألوان والخطوط الفعلية التي يستخدمها صاحب المنظومة حالياً، بدل تثبيتها يدوياً،   
            // لتُطابق الطباعة هوية المركز البصرية الحقيقية تماماً كما تظهر داخل النظام  
            const rootStyles = getComputedStyle(document.documentElement);  
            const primaryColor = (rootStyles.getPropertyValue('--primary-color') || '#0f5132').trim() || '#0f5132';  
            const primaryLight = (rootStyles.getPropertyValue('--primary-light') || '#e6f0eb').trim() || '#e6f0eb';  
            const inkColor = (rootStyles.getPropertyValue('--ink') || '#1f2937').trim() || '#1f2937';  
            const mainFont = (rootStyles.getPropertyValue('--font-main-heading') || "'Amiri'").trim().replace(/'/g, '') || 'Amiri';  
            const subFont = (rootStyles.getPropertyValue('--font-sub-heading') || "'Cairo'").trim().replace(/'/g, '') || 'Cairo';  
            const logoHtml = systemLogo  
                ? `<img src="${systemLogo}" alt="شعار المركز" style="width:64px;height:64px;object-fit:contain;border-radius:12px;border:2px solid ${primaryColor};" />`  
                : '';  

            // استنساخ المحتوى المستهدف فقط وتنظيفه من عناصر التحكم (أزرار، حقول إدخال تفاعلية) لتظهر الطباعة نظيفة  
            const clone = el.cloneNode(true);  
            clone.querySelectorAll('button, .no-print, input[type="checkbox"] ~ button, select').forEach(node => {  
                if (node.tagName === 'BUTTON') node.remove();  
            });  

            const printWindow = window.open('', '_blank', 'width=1000,height=800');  
            if (!printWindow) {  
                showNotification("يرجى السماح بالنوافذ المنبثقة لتفعيل خاصية الطباعة.", "warn");  
                return;  
            }  

            printWindow.document.write(`  
                <!DOCTYPE html>  
                <html lang="ar" dir="rtl">  
                <head>  
                    <meta charset="UTF-8">  
                    <title>${reportTitle} - ${centerName}</title>  
                    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Amiri:wght@400;700&family=Tajawal:wght@400;700;800&family=Almarai:wght@400;700;800&family=Reem+Kufi:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Lalezar&family=El+Messiri:wght@400;700&family=Markazi+Text:wght@400;700&family=Changa:wght@400;700&display=swap" rel="stylesheet">  
                    <style>  
                        * { box-sizing: border-box; }  
                        body { font-family: '${subFont}', 'Cairo', sans-serif; padding: 30px; color: ${inkColor}; direction: rtl; }  
                        .print-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 14px; margin-bottom: 6px; }  
                        .print-header-titles { display: flex; align-items: center; gap: 12px; }  
                        .print-header h1 { font-family: '${mainFont}', 'Amiri', serif; font-size: 20px; color: ${primaryColor}; margin: 0 0 4px 0; }  
                        .print-header p { font-size: 12px; color: #6b7280; margin: 0; }  
                        .print-meta { text-align: left; font-size: 11px; color: #6b7280; }  
                        .print-title-bar { background: ${primaryLight}; color: ${primaryColor}; font-weight: 700; font-size: 15px; padding: 10px 14px; border-radius: 8px; margin: 16px 0; }  
                        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }  
                        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: right; color: ${inkColor}; }  
                        th { background: ${primaryColor}; color: #fff; font-weight: 700; }  
                        tr:nth-child(even) td { background: #f9fafb; }  
                        .print-footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }  
                        button, .no-print, input, select { display: none !important; }  
                        @media print {  
                            body { padding: 10px; }  
                            @page { margin: 14mm; }  
                        }  
                    </style>  
                </head>  
                <body>  
                    <div class="print-header">  
                        <div class="print-header-titles">  
                            ${logoHtml}  
                            <div>  
                                <h1>${centerName}</h1>  
                                <p>نظام حوكمة الصلاحيات وإدارة الفروع والحسابات المتكاملة</p>  
                            </div>  
                        </div>  
                        <div class="print-meta">  
                            <div>تاريخ الطباعة: ${dateStr}</div>  
                            <div>الوقت: ${timeStr}</div>  
                            ${printedBy ? `<div>بواسطة: ${printedBy}</div>` : ''}  
                        </div>  
                    </div>  
                    <div class="print-title-bar"><i>&#128196;</i> ${reportTitle}</div>  
                    ${clone.outerHTML}  
                    <div class="print-footer">  
                        <span>مستند مطبوع آلياً من منظومة إدارة ${centerName}</span>  
                        <span>صفحة 1</span>  
                    </div>  
                </body>  
                </html>  
            `);  
            printWindow.document.close();  
            printWindow.focus();  

            setTimeout(() => {  
                printWindow.print();  
            }, 400);  
        }  
  
        function buildMatrixTable() {  
            const tbody = document.getElementById('matrix-tbody');  
            const thead = document.getElementById('matrix-thead');  
            if (!tbody || !thead) return;  
  
            thead.innerHTML = `  
                <tr class="bg-custom-primary text-white font-bold divide-x divide-white/10 text-center">  
                    <th class="p-3 text-right sticky right-0 bg-custom-primary z-10 w-12">م</th>  
                    <th class="p-3 text-right sticky right-12 bg-custom-primary z-10 w-64 border-l border-white/20" data-term-id="tbl_permission_header">الصلاحية</th>  
                    ${roles.map(roleKey => `  
                        <th class="p-2">  
                            <div class="flex flex-col items-center gap-1">  
                                <span>${systemTerms[roleKey]}${LOCKED_ROLES.includes(roleKey) ? ' <i class="fa-solid fa-lock text-custom-accent" title="دور مقفل، صلاحياته كاملة وغير قابلة للتعديل"></i>' : ''}</span>  
                                ${!LOCKED_ROLES.includes(roleKey) ? `<button onclick="checkAllPermissionsForRole('${roleKey}')" class="text-[9px] bg-white/15 hover:bg-white/25 px-1.5 py-0.5 rounded font-normal transition" title="تحديد كل الصلاحيات لهذا الدور دفعة واحدة">تحديد الكل</button>` : ''}  
                            </div>  
                        </th>  
                    `).join('')}  
                </tr>  
            `;  
  
            tbody.innerHTML = '';  
            permissions.forEach((perm, index) => {  
                let rowHtml = `  
                    <tr class="hover:bg-gray-50/50 transition border-b border-gray-100 text-center divide-x divide-gray-100">  
                        <td class="p-3 text-right sticky right-0 bg-white shadow-sm font-bold text-gray-400 z-10 w-12">${index + 1}</td>  
                        <td class="p-3 text-right sticky right-12 bg-white shadow-sm font-bold text-custom-primary border-l border-gray-100 z-10 w-64">${perm.name}</td>  
                `;  
  
                roles.forEach(roleKey => {  
                    const isChecked = rolePermissions[roleKey][perm.id] ? "checked" : "";  
                    const isLocked = LOCKED_ROLES.includes(roleKey);  
                    rowHtml += `  
                        <td class="p-2">  
                            <input type="checkbox"   
                                   onchange="toggleMatrixPermission('${roleKey}', ${perm.id}, this.checked)"   
                                   class="w-4 h-4 text-custom-primary border-gray-300 rounded focus:ring-custom-primary ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}"   
                                   ${isChecked} ${isLocked ? 'disabled title="دور مقفل بشكل دائم، لا يمكن تعديل صلاحياته"' : ''}>  
                        </td>  
                    `;  
                });  
  
                rowHtml += `</tr>`;  
                tbody.innerHTML += rowHtml;  
            });  
        }  
  
        // تحديد كل الصلاحيات لدور معيّن دفعة واحدة (مفيد للاستعادة السريعة بعد أي تعديل غير مقصود)  
        function checkAllPermissionsForRole(roleKey) {  
            if (LOCKED_ROLES.includes(roleKey)) return;  

            const confirmed = window.confirm(`سيتم تفعيل كل الصلاحيات الـ${permissions.length} لدور [${systemTerms[roleKey]}] دفعة واحدة. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            permissions.forEach(perm => { rolePermissions[roleKey][perm.id] = true; });  
            buildMatrixTable();  
            showNotification(`تم تفعيل كل الصلاحيات لدور [${systemTerms[roleKey]}] بنجاح`, "success");  
            saveToLocalStorage();  
        }  

        function toggleMatrixPermission(roleKey, permId, checked) {  
            if (LOCKED_ROLES.includes(roleKey)) {  
                showNotification(`دور [${systemTerms[roleKey]}] مقفل بشكل دائم ويملك كافة الصلاحيات، ولا يمكن تعديله.`, 'warn');  
                buildMatrixTable();  
                return;  
            }  
  
            rolePermissions[roleKey][permId] = checked;  
            showNotification(`تم تحديث صلاحية [${permissions.find(p=>p.id===permId).name}] لدور [${systemTerms[roleKey]}] بنجاح`, 'success');  
              
            renderNavigationBar();  
            adjustActiveTab();  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function renderTermsEditor() {  
            const grid = document.getElementById('terms-editor-grid');  
            if (!grid) return;  
              
            grid.innerHTML = '';  
            for (const key in systemTerms) {  
                const meta = termsMetadata[key];  
                if (!meta) continue;  
                  
                grid.innerHTML += `  
                    <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1.5 text-right">  
                        <div class="flex items-center gap-1.5">  
                            <input type="text" id="term-label-${key}" value="${meta.label}" title="عنوان هذا الحقل — قابل للتعديل بحرية" onkeydown="if(event.key==='Enter'){event.preventDefault(); saveSingleTerm('${key}');}" class="w-full text-xs font-bold text-custom-primary border border-custom-primary/20 bg-custom-primary-light rounded p-1.5 focus:ring-1 focus:ring-custom-primary focus:outline-none">  
                            ${meta.custom ? `<button type="button" onclick="deleteCustomTerm('${key}')" class="text-rose-500 hover:text-rose-700 flex-shrink-0" title="حذف هذا المصطلح المخصص"><i class="fa-solid fa-trash text-[11px]"></i></button>` : ''}  
                        </div>  
                        <div class="flex items-center gap-1.5">  
                            <input type="text" id="term-input-${key}" value="${systemTerms[key]}" onkeydown="if(event.key==='Enter'){event.preventDefault(); saveSingleTerm('${key}');}" class="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-custom-primary focus:outline-none">  
                            <button type="button" onclick="saveSingleTerm('${key}')" title="حفظ العنوان والقيمة معاً فوراً دون التأثير على البقية" class="bg-custom-primary bg-custom-primary-hover text-white text-[11px] px-2.5 py-2 rounded-lg font-bold transition flex-shrink-0">  
                                <i class="fa-solid fa-check"></i>  
                            </button>  
                        </div>  
                        <span class="block text-[10px] text-gray-400 font-semibold leading-tight">${meta.desc}</span>  
                    </div>  
                `;  
            }  
        }  
  
        // ===== إضافة عنوان / مصطلح مخصص جديد يستطيع مدير النظام إضافته بحرية =====  
        function addCustomTerm() {  
            const labelInput = document.getElementById('new-custom-term-label');  
            const valueInput = document.getElementById('new-custom-term-value');  
            const label = labelInput.value.trim();  
            const value = valueInput.value.trim();  

            if (!label || !value) {  
                showNotification("يرجى إدخال اسم العنوان والقيمة المطلوبة قبل الإضافة.", "warn");  
                return;  
            }  

            const key = "custom_" + Date.now();  
            systemTerms[key] = value;  
            termsMetadata[key] = { label: label, desc: "مصطلح/عنوان مخصص أضافه مدير النظام", custom: true };  

            labelInput.value = '';  
            valueInput.value = '';  

            renderTermsEditor();  
            showNotification(`تم إضافة العنوان المخصص [${label}] بنجاح`, "success");  
            saveToLocalStorage();  
        }  

        function deleteCustomTerm(key) {  
            if (!termsMetadata[key] || !termsMetadata[key].custom) return;  
            const confirmed = window.confirm(`سيتم حذف العنوان المخصص [${termsMetadata[key].label}] نهائياً. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            delete systemTerms[key];  
            delete termsMetadata[key];  

            renderTermsEditor();  
            showNotification("تم حذف العنوان المخصص بنجاح", "success");  
            saveToLocalStorage();  
        }  

        // حفظ مسمى واحد فقط فوراً دون التأثير على بقية المسميات، للتعديل السريع حسب حاجة المركز  
        function saveSingleTerm(key) {  
            const input = document.getElementById(`term-input-${key}`);  
            const labelInput = document.getElementById(`term-label-${key}`);  
            if (!input) return;  

            const newValue = input.value.trim();  
            if (!newValue) {  
                showNotification("لا يمكن ترك المسمى فارغاً.", "warn");  
                return;  
            }  

            systemTerms[key] = newValue;  

            if (labelInput) {  
                const newLabel = labelInput.value.trim();  
                if (newLabel && termsMetadata[key]) {  
                    termsMetadata[key].label = newLabel;  
                }  
            }  

            applySystemTerms();  
            const label = (termsMetadata[key] && termsMetadata[key].label) || key;  
            showNotification(`تم حفظ [${label}] بنجاح`, "success");  
            saveToLocalStorage();  
        }  

        function saveSystemTerms() {  
            for (const key in systemTerms) {  
                const input = document.getElementById(`term-input-${key}`);  
                if (input) {  
                    systemTerms[key] = input.value.trim();  
                }  
            }  
              
            applySystemTerms();  
            showNotification("تم تحديث واعتماد قاموس المصطلحات والواجهات بنجاح!", "success");  
            saveToLocalStorage();  
        }  

        // ===== إدارة ترتيب التسلسل الإداري للمراسلات (متاحة لمدير النظام والإدارة العامة) =====  
        function renderHierarchyOrderEditor() {  
            const container = document.getElementById('hierarchy-order-list');  
            if (!container) return;  

            container.innerHTML = '';  
            hierarchyOrder.forEach((roleKey, idx) => {  
                container.innerHTML += `  
                    <div class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2.5">  
                        <span class="text-xs font-bold text-gray-700 flex items-center gap-1.5">  
                            <span class="bg-custom-primary-light text-custom-primary rounded-full w-5 h-5 inline-flex items-center justify-center text-[10px] font-bold">${idx + 1}</span>  
                            ${systemTerms[roleKey]}  
                        </span>  
                        <div class="flex gap-1">  
                            <button type="button" onclick="moveHierarchyRole(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 w-7 h-7 rounded text-xs" title="تحريك للأعلى">  
                                <i class="fa-solid fa-arrow-up"></i>  
                            </button>  
                            <button type="button" onclick="moveHierarchyRole(${idx}, 1)" ${idx === hierarchyOrder.length - 1 ? 'disabled' : ''} class="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 w-7 h-7 rounded text-xs" title="تحريك للأسفل">  
                                <i class="fa-solid fa-arrow-down"></i>  
                            </button>  
                        </div>  
                    </div>  
                `;  
            });  
        }  

        function moveHierarchyRole(idx, direction) {  
            const newIdx = idx + direction;  
            if (newIdx < 0 || newIdx >= hierarchyOrder.length) return;  

            const tmp = hierarchyOrder[idx];  
            hierarchyOrder[idx] = hierarchyOrder[newIdx];  
            hierarchyOrder[newIdx] = tmp;  

            renderHierarchyOrderEditor();  
            showNotification("تم تحديث ترتيب التسلسل الإداري للمراسلات بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function applySystemTerms() {  
            const centerTitleDisplay = document.getElementById('center-title-display');  
            if (centerTitleDisplay) centerTitleDisplay.innerText = systemTerms.center_title;  
  
            const loginTitleDisplay = document.getElementById('login-title-display');  
            if (loginTitleDisplay) loginTitleDisplay.innerText = systemTerms.center_title;  
              
            const footerCenterName = document.getElementById('footer-center-name');  
            if (footerCenterName) footerCenterName.innerText = systemTerms.center_title;  
              
            const centerTitleInput = document.getElementById('center-title-input');  
            if (centerTitleInput) centerTitleInput.value = systemTerms.center_title;  
  
            document.querySelectorAll('[data-term-id]').forEach(el => {  
                const termId = el.getAttribute('data-term-id');  
                if (systemTerms[termId]) {  
                    const icon = el.querySelector('i');  
                    if (icon) {  
                        const iconClone = icon.cloneNode(true);  
                        el.textContent = ' ';  
                        el.prepend(iconClone);  
                        el.appendChild(document.createTextNode(' ' + systemTerms[termId]));  
                    } else {  
                        el.innerText = systemTerms[termId];  
                    }  
                }  
            });  
  
            buildMatrixTable();  
            renderRoleSwitcher();  
            renderNavigationBar();  
            adjustActiveTab();  
            refreshAllViews();  
        }  
  
        function applyThemeStyles(themeName) {  
            if (themeName === 'custom' && customThemeColors) {  
                applyThemeVars(  
                    customThemeColors.primary, shadeColor(customThemeColors.primary, -15), shadeColor(customThemeColors.primary, 88),  
                    customThemeColors.accent, shadeColor(customThemeColors.accent, -10), shadeColor(customThemeColors.accent, 92)  
                );  
                return;  
            }  
            const theme = colorThemes[themeName];  
            if (!theme) return;  
            applyThemeVars(theme.primary, theme.primaryHover, theme.primaryLight, theme.accent, theme.accentHover, theme.accentLight);  
        }  

        function applyThemeVars(primary, primaryHover, primaryLight, accent, accentHover, accentLight) {  
            document.documentElement.style.setProperty('--primary-color', primary);  
            document.documentElement.style.setProperty('--primary-hover', primaryHover);  
            document.documentElement.style.setProperty('--primary-light', primaryLight);  
            document.documentElement.style.setProperty('--accent-color', accent);  
            document.documentElement.style.setProperty('--accent-hover', accentHover);  
            document.documentElement.style.setProperty('--accent-light', accentLight);  
        }  

        // ===== تفتيح/تغميق لون HEX برمجياً (نسبة موجبة = أفتح، سالبة = أغمق) لاشتقاق الألوان الفرعية تلقائياً =====  
        function shadeColor(hex, percent) {  
            const num = parseInt(hex.replace('#', ''), 16);  
            let r = (num >> 16) + Math.round(255 * percent / 100);  
            let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100);  
            let b = (num & 0x0000FF) + Math.round(255 * percent / 100);  
            r = Math.max(Math.min(255, r), 0);  
            g = Math.max(Math.min(255, g), 0);  
            b = Math.max(Math.min(255, b), 0);  
            return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);  
        }  

        // ===== تطبيق ألوان مخصصة بحرية تامة على الطابع اللوني، تماماً كتخصيص لون النصوص =====  
        function applyCustomThemeColors() {  
            const primary = document.getElementById('custom-primary-color-input').value;  
            const accent = document.getElementById('custom-accent-color-input').value;  

            customThemeColors = { primary, accent };  
            activeTheme = 'custom';  
            applyThemeStyles('custom');  

            showNotification("تم تطبيق الألوان المخصصة على كامل واجهات المنظومة بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetCustomThemeColors() {  
            customThemeColors = null;  
            changeTheme('quranGreen');  
            const primaryInput = document.getElementById('custom-primary-color-input');  
            const accentInput = document.getElementById('custom-accent-color-input');  
            if (primaryInput) primaryInput.value = '#0f5132';  
            if (accentInput) accentInput.value = '#c5a880';  
        }  
  
        function changeTheme(themeName) {  
            customThemeColors = null;  
            applyThemeStyles(themeName);  
            activeTheme = themeName;  
            showNotification("تم تحديث الهوية الطيفية واللونية للمنصة بالكامل!", "success");  
            saveToLocalStorage();  
        }  

        // ===== تخصيص لون النصوص العام لكامل المنظومة (يُطبَّق عبر متغير CSS الأساسي للنصوص) =====  
        function applyCustomTextColor() {  
            const val = document.getElementById('custom-text-color-input').value;  
            customTextColor = val;  
            document.documentElement.style.setProperty('--ink', val);  
            showNotification("تم تطبيق لون النصوص الجديد على كامل المنظومة بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetCustomTextColor() {  
            customTextColor = null;  
            document.documentElement.style.setProperty('--ink', '#16261f');  
            const input = document.getElementById('custom-text-color-input');  
            if (input) input.value = '#16261f';  
            showNotification("تم استعادة لون النصوص الافتراضي بنجاح", "success");  
            saveToLocalStorage();  
        }  

        // ===== تخصيص لون مسمى المركز بالترويسة العلوية تحديداً =====  
        function applyHeaderTitleColor() {  
            const val = document.getElementById('header-title-color-input').value;  
            headerTitleColor = val;  
            document.documentElement.style.setProperty('--header-title-color', val);  
            showNotification("تم تطبيق لون مسمى المركز بالترويسة بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetHeaderTitleColor() {  
            headerTitleColor = null;  
            document.documentElement.style.setProperty('--header-title-color', '#ffffff');  
            const input = document.getElementById('header-title-color-input');  
            if (input) input.value = '#ffffff';  
            showNotification("تم استعادة لون مسمى المركز الافتراضي (أبيض)", "success");  
            saveToLocalStorage();  
        }  

        // ===== تخصيص لون خلفية شاشة تسجيل الدخول =====  
        function applyLoginScreenColor() {  
            const val = document.getElementById('login-bg-color-input').value;  
            loginScreenColor = val;  
            document.documentElement.style.setProperty('--login-bg-color', val);  
            showNotification("تم تطبيق لون خلفية شاشة تسجيل الدخول بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetLoginScreenColor() {  
            loginScreenColor = null;  
            document.documentElement.style.setProperty('--login-bg-color', '#fcfbfa');  
            const input = document.getElementById('login-bg-color-input');  
            if (input) input.value = '#fcfbfa';  
            showNotification("تم استعادة لون خلفية شاشة الدخول الافتراضي", "success");  
            saveToLocalStorage();  
        }  
  
        // ===== تخصيص لون نص عناوين النوافذ المنبثقة (يبقى ثابتاً بغض النظر عن لون النصوص العام) =====  
        function applyModalHeaderTextColor() {  
            const val = document.getElementById('modal-header-text-color-input').value;  
            modalHeaderTextColor = val;  
            document.documentElement.style.setProperty('--modal-header-text-color', val);  
            showNotification("تم تطبيق لون نص عناوين النوافذ المنبثقة بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetModalHeaderTextColor() {  
            modalHeaderTextColor = null;  
            document.documentElement.style.setProperty('--modal-header-text-color', '#ffffff');  
            const input = document.getElementById('modal-header-text-color-input');  
            if (input) input.value = '#ffffff';  
            showNotification("تم استعادة لون نص عناوين النوافذ الافتراضي (أبيض)", "success");  
            saveToLocalStorage();  
        }  

        // ===== تخصيص خطوط العناوين الرئيسية والفرعية =====  
        function applyHeadingFonts() {  
            const mainFont = document.getElementById('font-main-heading-select').value;  
            const subFont = document.getElementById('font-sub-heading-select').value;  
            fontMainHeading = mainFont;  
            fontSubHeading = subFont;  
            document.documentElement.style.setProperty('--font-main-heading', `'${mainFont}'`);  
            document.documentElement.style.setProperty('--font-sub-heading', `'${subFont}'`);  
            showNotification("تم تطبيق خطوط العناوين الجديدة بنجاح", "success");  
            saveToLocalStorage();  
        }  

        function resetHeadingFonts() {  
            fontMainHeading = null;  
            fontSubHeading = null;  
            document.documentElement.style.removeProperty('--font-main-heading');  
            document.documentElement.style.removeProperty('--font-sub-heading');  
            const mSelect = document.getElementById('font-main-heading-select');  
            const sSelect = document.getElementById('font-sub-heading-select');  
            if (mSelect) mSelect.value = 'Amiri';  
            if (sSelect) sSelect.value = 'Cairo';  
            showNotification("تم استعادة خطوط العناوين الافتراضية", "success");  
            saveToLocalStorage();  
        }  

        function updateCenterTitle() {  
            const val = document.getElementById('center-title-input').value.trim();  
            if (!val) {  
                showNotification("يرجى إدخال اسم مركز صحيح", "warn");  
                return;  
            }  
            systemTerms.center_title = val;  
            applySystemTerms();  
            renderTermsEditor();   
            showNotification("تم تحديث وتوثيق اسم المنشأة بنجاح", "success");  
            saveToLocalStorage();  
        }  
  
        function renderRoleSwitcher() {  
            const container = document.getElementById('role-simulation-container');  
            if (!container) return;  
  
            const parentSection = container.closest('section');  
            if (!parentSection) return;  
  
            // حجب محاكي الأدوار بالكامل عن المنسقات والمعلمات والمشرفين لمنع تعديل الحسابات  
            if (currentActiveUser.role !== 'role_0' && currentActiveUser.role !== 'role_1') {  
                parentSection.classList.add('hidden');  
                return;  
            } else {  
                parentSection.classList.remove('hidden');  
            }  
  
            container.innerHTML = '';  
            employees.filter(emp => !!emp.username).forEach(emp => {  
                const isActive = currentActiveUser.id === emp.id;  
                const activeStyle = isActive   
                    ? "bg-custom-primary text-white border-custom-primary font-bold shadow-md scale-105"   
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";  
                  
                const opacity = emp.status === 'معطل' ? 'opacity-40 line-through' : '';  
  
                container.innerHTML += `  
                    <button onclick="switchUser(${emp.id})" class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${activeStyle} ${opacity}">  
                        <i class="fa-solid fa-circle-user"></i> ${emp.name} (${emp.jobTitle || systemTerms[emp.role]})  
                    </button>  
                `;  
            });  
        }  
  
        function switchUser(userId) {  
            const emp = employees.find(e => e.id === userId);  
            if (!emp) return;  
  
            if (emp.status === 'معطل') {  
                showNotification("عذراً، تم تعطيل وصول هذا الحساب بقرار إداري!", "warn");  
                return;  
            }  
  
            currentActiveUser = emp;  
            renderRoleSwitcher();  
  
            document.getElementById('profile-user-name').innerText = currentActiveUser.name;  
            document.getElementById('profile-user-role').innerText = currentActiveUser.jobTitle || systemTerms[currentActiveUser.role];  
            document.getElementById('profile-user-branch').innerText = currentActiveUser.branch;  
            document.getElementById('user-avatar-initial').innerText = currentActiveUser.name.charAt(0);  
  
            renderNavigationBar();  
            adjustActiveTab();  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function renderNavigationBar() {  
            const bar = document.getElementById('tabs-navigation-bar');  
            if (!bar) return;  
  
            let html = '';  
  
            if (hasPermission(1)) {  
                html += `  
                    <button onclick="switchTab('dashboard')" id="tab-dashboard" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-chart-pie"></i> ${systemTerms.dashboard_tab}  
                    </button>  
                `;  
            }  

            if (hasPermission(9)) {  
                html += `  
                    <button onclick="switchTab('hr-employees')" id="tab-hr-employees" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-address-card"></i> ${systemTerms.hr_employees_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(2) || hasPermission(3)) {  
                html += `  
                    <button onclick="switchTab('users-permissions')" id="tab-users-permissions" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-user-lock"></i> ${systemTerms.users_permissions_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(4) || hasPermission(5) || hasPermission(6)) {  
                html += `  
                    <button onclick="switchTab('structures')" id="tab-structures" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-building-user"></i> ${systemTerms.structures_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(7) || hasPermission(8)) {  
                html += `  
                    <button onclick="switchTab('students')" id="tab-students" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-user-graduate"></i> ${systemTerms.students_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(10) || hasPermission(11) || hasPermission(12)) {  
                html += `  
                    <button onclick="switchTab('educational')" id="tab-educational" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-book-open-reader"></i> ${systemTerms.educational_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(13) || hasPermission(14) || hasPermission(15) || hasPermission(16) || hasPermission(17)) {  
                html += `  
                    <button onclick="switchTab('financial')" id="tab-financial" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-money-bill-transfer"></i> ${systemTerms.financial_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(18) || hasPermission(19) || hasPermission(20)) {  
                html += `  
                    <button onclick="switchTab('warehouse')" id="tab-warehouse" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-warehouse"></i> ${systemTerms.warehouse_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(21) || hasPermission(22) || hasPermission(23) || hasPermission(24)) {  
                html += `  
                    <button onclick="switchTab('operations')" id="tab-operations" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-gears"></i> ${systemTerms.operations_tab}  
                    </button>  
                `;  
            }  
  
            if (hasPermission(28)) {  
                html += `  
                    <button onclick="switchTab('settings')" id="tab-settings" class="px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs">  
                        <i class="fa-solid fa-sliders"></i> ${systemTerms.settings_tab}  
                    </button>  
                `;  
            }  
  
            bar.innerHTML = html;  
        }  
  
        function adjustActiveTab() {  
            const availableTabs = [];  
            if (hasPermission(1)) availableTabs.push('dashboard');  
            if (hasPermission(9)) availableTabs.push('hr-employees');  
            if (hasPermission(2) || hasPermission(3)) availableTabs.push('users-permissions');  
            if (hasPermission(4) || hasPermission(5) || hasPermission(6)) availableTabs.push('structures');  
            if (hasPermission(7) || hasPermission(8)) availableTabs.push('students');  
            if (hasPermission(10) || hasPermission(11) || hasPermission(12)) availableTabs.push('educational');  
            if (hasPermission(13) || hasPermission(14) || hasPermission(15) || hasPermission(16) || hasPermission(17)) availableTabs.push('financial');  
            if (hasPermission(18) || hasPermission(19) || hasPermission(20)) availableTabs.push('warehouse');  
            if (hasPermission(21) || hasPermission(22) || hasPermission(23) || hasPermission(24)) availableTabs.push('operations');  
            if (hasPermission(28)) availableTabs.push('settings');  
  
            if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {  
                activeTab = availableTabs[0];  
            }  
            switchTab(activeTab, false);  
        }  
  
        function switchTab(tabId, updateHistory = true) {  
            activeTab = tabId;  
              
            document.querySelectorAll('#tabs-navigation-bar button').forEach(btn => {  
                btn.className = "px-4 py-3 border-b-2 border-transparent font-medium text-gray-600 hover:text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs";  
            });  
  
            const activeBtn = document.getElementById(`tab-${tabId}`);  
            if (activeBtn) {  
                activeBtn.className = "px-4 py-3 border-b-2 border-custom-primary font-bold text-custom-primary flex items-center gap-2 whitespace-nowrap text-xs";  
            }  
  
            const views = ['dashboard', 'hr-employees', 'users-permissions', 'structures', 'students', 'educational', 'financial', 'warehouse', 'operations', 'settings'];  
            views.forEach(v => {  
                const el = document.getElementById(`view-${v}`);  
                if (el) el.classList.add('hidden');  
            });  
  
            const target = document.getElementById(`view-${tabId}`);  
            if (target) target.classList.remove('hidden');  
  
            if (tabId === 'settings') {  
                renderTermsEditor();  
                renderHierarchyOrderEditor();  
            }  
  
            refreshAllViews();  
  
            // دفع التغيير لقائمة الملاحة لتمكين زر الرجوع بالمتصفحات والهواتف  
            if (updateHistory) {  
                window.location.hash = tabId;  
            }  
        }  
  
        function getFilteredData(dataArray) {  
            if (currentActiveUser.branch === "كامل الفروع" || currentActiveUser.role === "role_0" || currentActiveUser.role === "role_1") {  
                return dataArray;  
            }  
            return dataArray.filter(item => item.branch === currentActiveUser.branch);  
        }  

        // ===== توجيه المراسلات للشخص المعني فعلياً، لا بالحلقة فقط: تظهر المعاملة لمن أرسلها،   
        // أو لمن هي موجَّهة إليه بالاسم تحديداً، أو لمن يشغل المستوى الإداري الحالي للمعاملة، بالإضافة   
        // للإدارة العامة التي ترى كل شيء دائماً =====  
        function getVisibleComplaintsForCurrentUser() {  
            if (currentActiveUser.role === 'role_0') return complaints;  

            return complaints.filter(c => {  
                const isSender = c.sender === currentActiveUser.name;  
                const isNamedReceiver = Array.isArray(c.receiverNames) && c.receiverNames.includes(currentActiveUser.name);  
                const levelIdx = typeof c.currentLevelIndex === 'number' ? c.currentLevelIndex : hierarchyOrder.length - 1;  
                const isAtMyHierarchyLevel = hierarchyOrder[levelIdx] === currentActiveUser.role;  
                return isSender || isNamedReceiver || isAtMyHierarchyLevel;  
            });  
        }  

        // ===== حساب الاستقلالية المالية الكاملة لكل حلقة/فرع على حدة (كل حلقة جديدة تُحسب بمعزل تام) =====  
        // ===== عرض تفاصيل قابلة للطباعة لأي إحصائية بلوحة التحكم عند الضغط عليها =====  
        function buildDetailsTable(headers, rows) {  
            let html = '<table class="w-full text-xs text-right border-collapse min-w-[640px]"><thead><tr class="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">';  
            headers.forEach(h => { html += `<th class="p-2">${h}</th>`; });  
            html += '</tr></thead><tbody class="divide-y divide-gray-100 text-gray-700">';  

            if (rows.length === 0) {  
                html += `<tr><td colspan="${headers.length}" class="p-6 text-center text-gray-400">لا توجد بيانات لعرضها حالياً</td></tr>`;  
            } else {  
                rows.forEach(r => {  
                    html += '<tr class="hover:bg-gray-50">';  
                    r.forEach(c => { html += `<td class="p-2">${c}</td>`; });  
                    html += '</tr>';  
                });  
            }  
            html += '</tbody></table>';  
            return html;  
        }  

        function showStatDetails(kind) {  
            const titleEl = document.getElementById('stat-details-title');  
            const bodyEl = document.getElementById('stat-details-body');  
            if (!titleEl || !bodyEl) return;  

            const fTransactions = getFilteredData(financialTransactions);  
            const fStudents = getFilteredData(students);  

            let title = '';  
            let html = '';  

            if (kind === 'income') {  
                title = 'تفاصيل الإيرادات المسجلة';  
                const rows = fTransactions.filter(t => t.type === 'receipt').map(t => [t.id, t.branch, t.category, t.payer || '—', `${t.amount.toFixed(3)} ر.ع`, t.date]);  
                html = buildDetailsTable(['رقم السند', 'الحلقة', 'التصنيف', 'الدافع', 'المبلغ', 'التاريخ'], rows);  

            } else if (kind === 'expense') {  
                title = 'تفاصيل المصروفات المسجلة';  
                const rows = fTransactions.filter(t => t.type === 'expense').map(t => [t.id, t.branch, t.category, t.description || '—', `${t.amount.toFixed(3)} ر.ع`, t.date]);  
                html = buildDetailsTable(['رقم السند', 'الحلقة', 'التصنيف', 'البيان', 'المبلغ', 'التاريخ'], rows);  

            } else if (kind === 'balance') {  
                title = 'تفاصيل صافي الرصيد حسب كل حلقة';  
                const rows = branches.map(b => {  
                    const s = getBranchFinancialSummary(b);  
                    return [b, `${s.income.toFixed(3)} ر.ع`, `${s.expense.toFixed(3)} ر.ع`, `${s.balance.toFixed(3)} ر.ع`];  
                });  
                html = buildDetailsTable(['الحلقة', 'الإيرادات', 'المصروفات', 'الصافي'], rows);  

            } else if (kind === 'students') {  
                title = 'تفاصيل الطلاب المسجلين';  
                const rows = fStudents.map(s => [s.id, s.name, s.branch, s.program, s.teacher || '—', s.paid ? 'مسددة' : 'مستحقة']);  
                html = buildDetailsTable(['الرقم', 'الاسم', 'الحلقة', 'البرنامج', 'المعلمة', 'حالة السداد'], rows);  

            } else if (kind === 'staff') {  
                title = 'تفاصيل الموظفين والكادر';  
                const rows = employees.map(e => [e.name, e.jobTitle || systemTerms[e.role], systemTerms[e.role], e.branch, e.status]);  
                html = buildDetailsTable(['الاسم', 'المسمى الوظيفي', 'الدور', 'الحلقة', 'الحالة'], rows);  

            } else if (kind === 'branches') {  
                title = 'تفاصيل الحلقات والفروع';  
                const rows = branches.map(b => [b, students.filter(s => s.branch === b).length, employees.filter(e => e.branch === b).length]);  
                html = buildDetailsTable(['الحلقة', 'عدد الطلاب', 'عدد الموظفين'], rows);  

            } else if (kind === 'programs') {  
                title = 'تفاصيل البرامج القرآنية';  
                const rows = programs.map(p => [p.name, `${p.fee.toFixed(3)} ر.ع`, students.filter(s => s.program === p.name).length]);  
                html = buildDetailsTable(['البرنامج', 'الرسوم', 'عدد الطلاب المسجلين'], rows);  

            } else if (kind === 'achievements') {  
                title = 'تفاصيل إنجازات الحفظ المرصودة';  
                const rows = achievements.map(a => [a.student, a.branch, a.program, a.details, a.date]);  
                html = buildDetailsTable(['الطالب', 'الحلقة', 'البرنامج', 'التفاصيل', 'التاريخ'], rows);  

            } else if (kind === 'exams') {  
                title = 'تفاصيل الاختبارات المرصودة';  
                const rows = exams.map(e => [e.student, e.exam, `${e.score} / 100`, e.date]);  
                html = buildDetailsTable(['الطالب', 'الاختبار', 'الدرجة', 'التاريخ'], rows);  

            } else if (kind === 'assets') {  
                title = 'تفاصيل العهد والأصول المسجلة';  
                const rows = assets.map(a => [a.name, a.qty, a.branch]);  
                html = buildDetailsTable(['اسم العهدة', 'الكمية', 'الحلقة'], rows);  

            } else if (kind === 'complaintsActive') {  
                title = 'تفاصيل البلاغات والمراسلات النشطة';  
                const rows = complaints.filter(c => c.status === 'نشط').map(c => [c.subject, c.sender, c.receiverTitle || '—', c.date]);  
                html = buildDetailsTable(['الموضوع', 'المرسل', 'المستقبل', 'التاريخ'], rows);  

            } else if (kind === 'complaintsApproved') {  
                title = 'تفاصيل البلاغات المعتمدة رسمياً';  
                const rows = complaints.filter(c => c.status === 'معتمد رسمياً').map(c => [c.subject, c.sender, c.receiverTitle || '—', c.date]);  
                html = buildDetailsTable(['الموضوع', 'المرسل', 'المستقبل', 'التاريخ'], rows);  
            }  

            titleEl.innerText = title;  
            bodyEl.innerHTML = html;  
            toggleModal('stat-details-modal', true);  
        }  

        function printStatDetails() {  
            const titleEl = document.getElementById('stat-details-title');  
            printSection('stat-details-body', titleEl ? titleEl.innerText : 'تفاصيل الإحصائية');  
        }  

        function getBranchFinancialSummary(branchName) {  
            const branchTransactions = financialTransactions.filter(t => t.branch === branchName);  
            const income = branchTransactions.filter(t => t.type === 'receipt').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);  
            const expense = branchTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);  
            const studentsCount = students.filter(s => s.branch === branchName).length;  
            return { branch: branchName, income, expense, balance: income - expense, studentsCount };  
        }  

        function renderBranchFinancialIndependence() {  
            const tbody = document.getElementById('branch-financial-tbody');  
            if (!tbody) return;  

            tbody.innerHTML = '';  
            branches.forEach(b => {  
                const summary = getBranchFinancialSummary(b);  
                tbody.innerHTML += `  
                    <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                        <td class="p-3 font-bold text-gray-900">${b}</td>  
                        <td class="p-3 text-center">${summary.studentsCount} ${systemTerms.student_singular}</td>  
                        <td class="p-3 text-center font-bold text-emerald-700">${summary.income.toFixed(3)} ر.ع</td>  
                        <td class="p-3 text-center font-bold text-rose-700">${summary.expense.toFixed(3)} ر.ع</td>  
                        <td class="p-3 text-center font-bold ${summary.balance >= 0 ? 'text-custom-primary' : 'text-rose-700'}">${summary.balance.toFixed(3)} ر.ع</td>  
                    </tr>  
                `;  
            });  
            if (branches.length === 0) {  
                tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">لا توجد حلقات مسجلة بعد</td></tr>';  
            }  
        }  
  
        function refreshAllViews() {  
            populateSelectOptions();  
  
            const fStudents = getFilteredData(students);  
            const fTransactions = getFilteredData(financialTransactions);  
            const fAssets = getFilteredData(assets);  
            const fComplaints = getVisibleComplaintsForCurrentUser();  
            const fAchievements = getFilteredData(achievements);  
  
            const studentsCount = document.getElementById('stat-students-count');  
            if (studentsCount) studentsCount.innerText = `${fStudents.length} ${systemTerms.student_singular}`;  
  
            const statIncomeCard = document.getElementById('stat-total-income-card');  
            const statExpenseCard = document.getElementById('stat-total-expense-card');  
            const statBalanceCard = document.getElementById('stat-balance-card');  
              
            const canViewFinance = hasPermission(15) || hasPermission(16);  
            if (canViewFinance) {  
                if (statIncomeCard) statIncomeCard.classList.remove('hidden');  
                if (statExpenseCard) statExpenseCard.classList.remove('hidden');  
                if (statBalanceCard) statBalanceCard.classList.remove('hidden');  
  
                const income = fTransactions.filter(t => t.type === 'receipt').reduce((sum, t) => sum + t.amount, 0);  
                const expense = fTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);  
  
                document.getElementById('stat-total-income').innerText = `${income.toFixed(3)} ر.ع`;  
                document.getElementById('stat-total-expense').innerText = `${expense.toFixed(3)} ر.ع`;  
                document.getElementById('stat-balance').innerText = `${(income - expense).toFixed(3)} ر.ع`;  
  
                document.getElementById('stats-grid').className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";  
            } else {  
                if (statIncomeCard) statIncomeCard.classList.add('hidden');  
                if (statExpenseCard) statExpenseCard.classList.add('hidden');  
                if (statBalanceCard) statBalanceCard.classList.add('hidden');  
                  
                document.getElementById('stats-grid').className = "grid grid-cols-1 gap-4";  
            }  

            // ===== تعبئة وإظهار لوحة الإحصائيات الشاملة: كاملة للإدارة العامة ورئيس المركز،   
            // ===== وبنطاق حلقتها فقط (بدون بيانات مالية) لمديرة الحلقة =====  
            const adminStatsPanel = document.getElementById('admin-stats-panel');  
            if (adminStatsPanel) {  
                const isAdminOrSupervisor = currentActiveUser && (currentActiveUser.role === 'role_0' || currentActiveUser.role === 'role_1');  
                const isBranchDirector = currentActiveUser && currentActiveUser.role === 'role_4';  

                if (isAdminOrSupervisor || isBranchDirector) {  
                    adminStatsPanel.classList.remove('hidden');  

                    const setStat = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };  
                    const branchesCard = document.getElementById('stat-branches-count-card');  
                    const programsCard = document.getElementById('stat-programs-count-card');  
                    const financeIndependencePanel = document.getElementById('branch-financial-independence-panel');  

                    if (isAdminOrSupervisor) {  
                        // العرض الكامل الأصلي: أرقام على مستوى المنظومة بأكملها  
                        const totalAssetsQty = assets.reduce((sum, a) => sum + (parseInt(a.qty) || 0), 0);  
                        const activeComplaints = complaints.filter(c => c.status === 'نشط').length;  
                        const approvedComplaints = complaints.filter(c => c.status === 'معتمد رسمياً').length;  

                        if (branchesCard) branchesCard.classList.remove('hidden');  
                        if (programsCard) programsCard.classList.remove('hidden');  
                        if (financeIndependencePanel) financeIndependencePanel.classList.remove('hidden');  

                        setStat('stat-staff-count', `${employees.length} موظف`);  
                        setStat('stat-branches-count', `${branches.length} حلقة`);  
                        setStat('stat-programs-count', `${programs.length} برنامج`);  
                        setStat('stat-achievements-count', `${achievements.length} إنجاز`);  
                        setStat('stat-exams-count', `${exams.length} اختبار`);  
                        setStat('stat-assets-count', `${totalAssetsQty} عهدة`);  
                        setStat('stat-complaints-active-count', `${activeComplaints} بلاغ`);  
                        setStat('stat-complaints-approved-count', `${approvedComplaints} بلاغ`);  

                        renderBranchFinancialIndependence();  
                    } else {  
                        // مديرة الحلقة: نفس الإحصائيات لكن بنطاق حلقتها هي فقط، وبدون أي رقم مالي  
                        const myBranch = currentActiveUser.branch;  
                        const branchStudentNames = students.filter(s => s.branch === myBranch).map(s => s.name);  

                        const branchStaffCount = employees.filter(e => e.branch === myBranch).length;  
                        const branchAchievementsCount = achievements.filter(a => a.branch === myBranch).length;  
                        const branchExamsCount = exams.filter(e => branchStudentNames.includes(e.student)).length;  
                        const branchAssetsQty = assets.filter(a => a.branch === myBranch).reduce((sum, a) => sum + (parseInt(a.qty) || 0), 0);  
                        const myVisibleComplaints = getVisibleComplaintsForCurrentUser();  
                        const branchActiveComplaints = myVisibleComplaints.filter(c => c.status === 'نشط').length;  
                        const branchApprovedComplaints = myVisibleComplaints.filter(c => c.status === 'معتمد رسمياً').length;  

                        // إخفاء البطاقتين اللتين لا معنى لهما على مستوى حلقة واحدة، وإخفاء الجدول المالي بالكامل  
                        if (branchesCard) branchesCard.classList.add('hidden');  
                        if (programsCard) programsCard.classList.add('hidden');  
                        if (financeIndependencePanel) financeIndependencePanel.classList.add('hidden');  

                        setStat('stat-staff-count', `${branchStaffCount} موظف`);  
                        setStat('stat-achievements-count', `${branchAchievementsCount} إنجاز`);  
                        setStat('stat-exams-count', `${branchExamsCount} اختبار`);  
                        setStat('stat-assets-count', `${branchAssetsQty} عهدة`);  
                        setStat('stat-complaints-active-count', `${branchActiveComplaints} بلاغ`);  
                        setStat('stat-complaints-approved-count', `${branchApprovedComplaints} بلاغ`);  
                    }  
                } else {  
                    adminStatsPanel.classList.add('hidden');  
                }  
            }  

            // ===== إظهار زر تصفير الحسابات المالية فقط لمن يملك صلاحية إدارة المصروفات/الإيرادات أو الإدارة العامة =====  
            const resetFinBtn = document.getElementById('reset-financial-btn');  
            if (resetFinBtn) {  
                const canResetFinance = hasPermission(16) || hasPermission(15) || (currentActiveUser && currentActiveUser.role === 'role_0');  
                resetFinBtn.classList.toggle('hidden', !canResetFinance);  
            }  
  
            const dashStudentsTbody = document.getElementById('dashboard-students-tbody');  
            if (dashStudentsTbody) {  
                dashStudentsTbody.innerHTML = '';  
                fStudents.forEach(s => {  
                    dashStudentsTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3 font-semibold text-gray-800">${s.name}</td>  
                            <td class="p-3">${s.age} سنة</td>  
                            <td class="p-3"><span class="bg-custom-primary-light text-custom-primary text-[10px] font-bold px-2 py-0.5 rounded">${s.branch}</span></td>  
                            <td class="p-3 text-gray-500">${s.guardian}</td>  
                            <td class="p-3 font-mono text-gray-500">${s.phone}</td>  
                            <td class="p-3">  
                                <span class="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded block w-fit">${s.program}</span>  
                                <span class="text-[9px] text-gray-400 flex items-center gap-1 mt-1"><i class="fa-solid fa-chalkboard-user"></i> ${s.teacher || 'بدون معلمة محددة'}</span>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (fStudents.length === 0) {  
                    dashStudentsTbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-400"><i class="fa-solid fa-user-graduate text-2xl block mb-2 opacity-40"></i>لا يوجد طلاب مسجلون لهذه الحلقة بعد</td></tr>';  
                }  
            }  
  
            renderHrEmployeesTable();  
            renderGuardiansTable();  

            const staffTbody = document.getElementById('staff-management-tbody');  
            if (staffTbody) {  
                staffTbody.innerHTML = '';  
                employees.filter(emp => !!emp.username).forEach(emp => {  
                    const statusBadge = emp.status === 'نشط'   
                        ? '<span class="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">نشط</span>'   
                        : '<span class="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-semibold">صلاحية مسحوبة</span>';  
                      
                    const actionBtn = emp.status === 'نشط'  
                        ? `<button onclick="toggleStaffAccess(${emp.id}, 'معطل')" class="bg-rose-600 hover:bg-rose-700 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition" title="تعطيل الدخول مؤقتاً (مع الإبقاء على بيانات الحساب)">تعطيل مؤقت</button>`  
                        : `<button onclick="toggleStaffAccess(${emp.id}, 'نشط')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition" title="إعادة تفعيل الدخول">تفعيل</button>`;  
  
                    const editBtn = `<button onclick="openEditStaffModal(${emp.id})" class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition flex items-center gap-1"><i class="fa-solid fa-pen-to-square"></i> تعديل</button>`;  
                    const revokeBtn = `<button onclick="revokeSystemAccess(${emp.id})" class="bg-gray-600 hover:bg-gray-700 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition" title="سحب صلاحية الدخول نهائياً — يبقى الموظف في السجل العام بدون حساب دخول"><i class="fa-solid fa-user-slash"></i></button>`;  
                    const deleteBtn = `<button onclick="deleteEmployee(${emp.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1.5 rounded font-bold shadow transition" title="حذف الموظف نهائياً من كل السجلات"><i class="fa-solid fa-trash"></i></button>`;  
  
                    staffTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3 font-semibold text-gray-950">${emp.name}</td>  
                            <td class="p-3">  
                                <div class="flex flex-col">  
                                    <span class="font-bold text-gray-800 text-xs">${emp.jobTitle || systemTerms[emp.role]}</span>  
                                    <span class="text-[10px] text-gray-400 font-semibold">${systemTerms[emp.role]}</span>  
                                </div>  
                            </td>  
                            <td class="p-3"><span class="bg-custom-accent-light text-custom-accent text-xs font-bold px-2 py-1 rounded">${emp.branch}</span></td>  
                            <td class="p-3 font-mono text-xs text-gray-500">${emp.email}</td>  
                            <td class="p-3 font-mono text-xs text-gray-700 font-bold">${emp.username}</td>  
                            <td class="p-3 text-center">${statusBadge}</td>  
                            <td class="p-3 text-center">  
                                <div class="flex items-center justify-center gap-1.5">  
                                    ${actionBtn}  
                                    ${editBtn}  
                                    ${revokeBtn}  
                                    ${deleteBtn}  
                                </div>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (employees.filter(e => !!e.username).length === 0) {  
                    staffTbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-400"><i class="fa-solid fa-user-lock text-2xl block mb-2 opacity-40"></i>لا يوجد أي موظف بصلاحية دخول بعد — اضغط "منح صلاحية دخول لموظف" أعلاه</td></tr>';  
                }  
            }  
  
            const programsTbody = document.getElementById('programs-tbody');  
            if (programsTbody) {  
                programsTbody.innerHTML = '';  
                programs.forEach(p => {  
                    programsTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition text-center">  
                            <td class="p-3 text-right font-semibold text-gray-950">${p.name}</td>  
                            <td class="p-3 font-bold text-custom-primary">${p.fee.toFixed(3)} ر.ع</td>  
                            <td class="p-3"><span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">فعال</span></td>  
                            <td class="p-3 no-print">  
                                <button onclick="deleteProgram('${p.name.replace(/'/g, "\\'")}')" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition" title="حذف البرنامج">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (programs.length === 0) {  
                    programsTbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400"><i class="fa-solid fa-graduation-cap text-2xl block mb-2 opacity-40"></i>لا توجد برامج مسجلة بعد — استخدم النموذج أعلاه لإضافة أول برنامج</td></tr>';  
                }  
            }  

            const branchesTbody = document.getElementById('branches-tbody');  
            if (branchesTbody) {  
                branchesTbody.innerHTML = '';  
                branches.forEach(b => {  
                    const studentsCount = students.filter(s => s.branch === b).length;  
                    const employeesCount = employees.filter(e => e.branch === b).length;  
                    branchesTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3 font-bold text-gray-950">${b}</td>  
                            <td class="p-3 text-center">${studentsCount} ${systemTerms.student_singular}</td>  
                            <td class="p-3 text-center">${employeesCount} موظف</td>  
                            <td class="p-3 text-center no-print">  
                                <button onclick="deleteBranch('${b.replace(/'/g, "\\'")}')" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition" title="حذف الحلقة">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (branches.length === 0) {  
                    branchesTbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400"><i class="fa-solid fa-mosque text-2xl block mb-2 opacity-40"></i>لا توجد حلقات مسجلة بعد — استخدم النموذج أعلاه لإضافة أول حلقة</td></tr>';  
                }  
            }  
  
            const studentsMainTbody = document.getElementById('students-main-tbody');  
            if (studentsMainTbody) {  
                studentsMainTbody.innerHTML = '';  
                fStudents.forEach(s => {  
                    const paySummary = getStudentPaymentSummary(s.id);  

                    let payAction = '';  
                    if (!s.paid && (hasPermission(14) || hasPermission(13))) {  
                        payAction = `  
                            <button onclick="recordStudentPayment(${s.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-1 rounded font-bold shadow transition flex items-center gap-1 justify-center w-full mt-1.5">  
                                <i class="fa-solid fa-receipt"></i> استلام دفعة الطالب  
                            </button>  
                        `;  
                    }  
  
                    const statusBadge = s.paid   
                        ? '<span class="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1"><i class="fa-solid fa-check"></i> سُددت</span>'   
                        : `<div class="flex flex-col items-center">  
                            <span class="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1"><i class="fa-solid fa-clock"></i> مستحق الدفع</span>  
                            ${payAction}  
                           </div>`;  
  
                    studentsMainTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3">  
                                <div class="flex items-center justify-center gap-1.5">  
                                    <span class="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">${s.id}</span>  
                                    ${currentActiveUser && currentActiveUser.role === 'role_0' ? `<button onclick="editStudentId(${s.id})" title="تعديل الرقم التعريفي (الإدارة العامة فقط)" class="text-custom-primary hover:text-custom-accent"><i class="fa-solid fa-pen text-[11px]"></i></button>` : ''}  
                                </div>  
                            </td>  
                            <td class="p-3 font-bold text-gray-950">${s.name} <i class="fa-solid ${s.gender === 'أنثى' ? 'fa-venus text-pink-400' : 'fa-mars text-blue-400'} text-[10px]" title="${s.gender || 'ذكر'}"></i></td>  
                            <td class="p-3 text-xs text-gray-600">${s.age} سنة</td>  
                            <td class="p-3"><span class="bg-custom-primary-light text-custom-primary text-xs font-bold px-2.5 py-1 rounded">${s.branch}</span></td>  
                            <td class="p-3 text-xs leading-normal">  
                                <strong class="block text-gray-800">${s.program}</strong>  
                                <span class="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><i class="fa-solid fa-chalkboard-user text-gray-400"></i> ${s.teacher ? s.teacher : 'لم تُحدَّد معلمة بعد'}</span>  
                                <div class="grid grid-cols-3 gap-1 mt-1.5 text-center">  
                                    <div class="bg-gray-50 rounded p-1 border border-gray-100">  
                                        <span class="block text-[9px] text-gray-400">الرسوم</span>  
                                        <strong class="text-gray-700">${paySummary.finalFee.toFixed(3)}</strong>  
                                    </div>  
                                    <div class="bg-emerald-50 rounded p-1 border border-emerald-100">  
                                        <span class="block text-[9px] text-emerald-600">المدفوع</span>  
                                        <strong class="text-emerald-700">${paySummary.paidTotal.toFixed(3)}</strong>  
                                    </div>  
                                    <div class="bg-rose-50 rounded p-1 border border-rose-100">  
                                        <span class="block text-[9px] text-rose-600">المتبقي</span>  
                                        <strong class="${paySummary.remaining > 0 ? 'text-rose-700' : 'text-emerald-700'}">${paySummary.remaining.toFixed(3)}</strong>  
                                    </div>  
                                </div>  
                                <button onclick="openStudentStatement(${s.id})" class="text-custom-primary hover:text-custom-accent underline underline-offset-2 text-[10px] font-bold mt-1.5 flex items-center gap-1">  
                                    <i class="fa-solid fa-file-invoice"></i> عرض كشف الحساب التفصيلي  
                                </button>  
                            </td>  
                            <td class="p-3 text-xs leading-normal">  
                                <strong class="text-gray-800 block">${s.guardian} (${s.relation})</strong>  
                                <span class="text-gray-500 font-mono text-[11px] block mt-0.5"><i class="fa-solid fa-phone text-gray-400"></i> ${s.phone}</span>  
                            </td>  
                            <td class="p-3 text-center">  
                                <div class="flex flex-col items-center gap-1.5">  
                                    ${statusBadge}  
                                    <button onclick="deleteStudent(${s.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow transition flex items-center gap-1 justify-center">  
                                        <i class="fa-solid fa-trash"></i> حذف الملف  
                                    </button>  
                                </div>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (fStudents.length === 0) {  
                    studentsMainTbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-400"><i class="fa-solid fa-user-graduate text-2xl block mb-2 opacity-40"></i>لا يوجد طلاب مسجلون بعد — استخدم زر "إضافة طالب جديد" أعلاه لتسجيل أول طالب</td></tr>';  
                }  
            }  
  
            const finMainTbody = document.getElementById('financial-main-tbody');  
            if (finMainTbody) {  
                finMainTbody.innerHTML = '';  
                fTransactions.forEach(t => {  
                    const typeBadge = t.type === 'receipt'   
                        ? `<span class="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold"><i class="fa-solid fa-circle-plus"></i> ${systemTerms.receipt_voucher}</span>`  
                        : `<span class="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold"><i class="fa-solid fa-circle-minus"></i> ${systemTerms.expense_voucher}</span>`;  
                      
                    const amountStyle = t.type === 'receipt' ? 'text-emerald-700' : 'text-rose-700';  
  
                    finMainTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3 leading-normal">  
                                <strong class="font-mono text-gray-900 block">${t.id}</strong>  
                                <span class="text-[10px] text-gray-400 font-mono block mt-0.5">${t.date}</span>  
                            </td>  
                            <td class="p-3">${typeBadge}</td>  
                            <td class="p-3"><span class="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-bold">${t.branch}</span></td>  
                            <td class="p-3 text-xs font-bold text-gray-800">${t.category}</td>  
                            <td class="p-3 text-xs text-gray-700">${t.payer || '—'}</td>  
                            <td class="p-3 text-xs text-gray-700">${t.studentId ? `<span class="bg-custom-primary-light text-custom-primary font-bold px-2 py-0.5 rounded font-mono">#${t.studentId}</span> ${t.studentName || ''}` : '—'}</td>  
                            <td class="p-3 text-xs text-gray-600 max-w-sm leading-relaxed">${t.description}</td>  
                            <td class="p-3 text-left font-bold text-base ${amountStyle}">${t.amount.toFixed(3)} ر.ع</td>  
                            <td class="p-3 text-center no-print">  
                                <button onclick="deleteVoucher('${String(t.id).replace(/'/g, "\\'")}')" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition" title="حذف السند نهائياً">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (fTransactions.length === 0) {  
                    finMainTbody.innerHTML = '<tr><td colspan="9" class="p-8 text-center text-gray-400"><i class="fa-solid fa-file-invoice text-2xl block mb-2 opacity-40"></i>لا توجد حركات مالية مسجلة بعد — استخدم زر "سند قبض" أو "سند صرف" أعلاه لتسجيل أول عملية</td></tr>';  
                }  
            }  
  
            const assetsTbody = document.getElementById('assets-tbody');  
            if (assetsTbody) {  
                assetsTbody.innerHTML = '';  
                fAssets.forEach(a => {  
                    assetsTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                            <td class="p-3 font-semibold text-gray-800">${a.name}</td>  
                            <td class="p-3 text-center font-bold text-custom-primary">${a.qty} عهدة</td>  
                            <td class="p-3 text-xs font-bold text-gray-700">${a.branch}</td>  
                            <td class="p-3 text-xs text-gray-400">تقييد ومطابقة إلكترونية مع السحابة</td>  
                            <td class="p-3 text-center no-print">  
                                <button onclick="deleteAsset(${a.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition" title="حذف العهدة نهائياً">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
                if (fAssets.length === 0) {  
                    assetsTbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400"><i class="fa-solid fa-boxes-packing text-2xl block mb-2 opacity-40"></i>لا توجد عهد مقيدة بعد — استخدم النموذج بجانب هذا الجدول لتسجيل أول عهدة أو أصل</td></tr>';  
                }  
            }  
  
            const achievementsTbody = document.getElementById('achievements-tbody');  
            if (achievementsTbody) {  
                achievementsTbody.innerHTML = '';  
                fAchievements.forEach(ach => {  
                    achievementsTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b transition">  
                            <td class="p-2 font-bold text-gray-800 text-xs">${ach.student}</td>  
                            <td class="p-2"><span class="bg-gray-100 px-2 py-0.5 rounded text-[10px]">${ach.branch}</span></td>  
                            <td class="p-2 text-xs text-emerald-800 font-semibold max-w-xs">${ach.details}</td>  
                            <td class="p-2 text-center no-print">  
                                <button onclick="deleteAchievement(${ach.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow transition" title="حذف الإنجاز">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
            }  
  
            const examsTbody = document.getElementById('exams-tbody');  
            if (examsTbody) {  
                examsTbody.innerHTML = '';  
                const fExams = getFilteredData(exams);  
                fExams.forEach(ex => {  
                    examsTbody.innerHTML += `  
                        <tr class="hover:bg-gray-50 border-b transition">  
                            <td class="p-2 font-bold text-gray-800 text-xs">${ex.student}</td>  
                            <td class="p-2 text-xs text-gray-600">${ex.exam}</td>  
                            <td class="p-2 text-center text-xs font-bold text-blue-700">${ex.score} / 100</td>  
                            <td class="p-2 text-center no-print">  
                                <button onclick="deleteExam(${ex.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow transition" title="حذف الاختبار">  
                                    <i class="fa-solid fa-trash"></i>  
                                </button>  
                            </td>  
                        </tr>  
                    `;  
                });  
            }  
  
            const complaintsContainer = document.getElementById('complaints-list-container');  
            if (complaintsContainer) {  
                complaintsContainer.innerHTML = '';  
                fComplaints.forEach(c => {  
                    let approveBtn = '';  
                    let replyBtn = '';  
                    let escalateBtn = '';  
                    let referBtn = '';  
  
                    if (currentActiveUser.role === "role_1" && c.status !== "معتمد رسمياً") {  
                        approveBtn = `  
                            <button onclick="approveComplaint(${c.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition flex items-center gap-1">  
                                <i class="fa-solid fa-signature"></i> اعتماد الخطاب  
                            </button>  
                        `;  
                    }  
  
                    if (hasPermission(24)) {  
                        replyBtn = `  
                            <button onclick="openReplyModal(${c.id})" class="bg-custom-primary hover:opacity-90 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition flex items-center gap-1">  
                                <i class="fa-solid fa-reply"></i> الرد والتعقيب  
                            </button>  
                        `;  

                        const levelIdx = typeof c.currentLevelIndex === 'number' ? c.currentLevelIndex : hierarchyOrder.length - 1;  
                        const canEscalate = levelIdx > 0 && (currentActiveUser.role === 'role_0' || canCorrespondWith(currentActiveUser.role, hierarchyOrder[levelIdx - 1]));  
                        const canReferDown = levelIdx < hierarchyOrder.length - 1 && (currentActiveUser.role === 'role_0' || canCorrespondWith(currentActiveUser.role, hierarchyOrder[levelIdx + 1]));  

                        if (canEscalate) {  
                            escalateBtn = `  
                                <button onclick="escalateComplaint(${c.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition flex items-center gap-1">  
                                    <i class="fa-solid fa-arrow-up-from-bracket"></i> تصعيد للأعلى  
                                </button>  
                            `;  
                        }  
                        if (canReferDown) {  
                            referBtn = `  
                                <button onclick="referDownComplaint(${c.id})" class="bg-teal-600 hover:bg-teal-700 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition flex items-center gap-1">  
                                    <i class="fa-solid fa-arrow-down-from-bracket"></i> إحالة لأدنى  
                                </button>  
                            `;  
                        }  
                    }  
  
                    const statusColor = c.status === "معتمد رسمياً" ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200';  

                    const priorityValue = c.priority || 'عادية';  
                    const priorityColorMap = {  
                        'عاجلة جداً': 'bg-red-100 text-red-800 border-red-300',  
                        'عاجلة': 'bg-orange-100 text-orange-800 border-orange-200',  
                        'عادية': 'bg-gray-100 text-gray-600 border-gray-200'  
                    };  
                    const priorityBadge = `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityColorMap[priorityValue] || priorityColorMap['عادية']}"><i class="fa-solid fa-circle-exclamation"></i> ${priorityValue}</span>`;  

                    const levelIdxDisplay = typeof c.currentLevelIndex === 'number' ? c.currentLevelIndex : hierarchyOrder.length - 1;  
                    const currentLevelRoleName = systemTerms[hierarchyOrder[levelIdxDisplay]] || '';  
                    const levelBadge = `<span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-sitemap"></i> المستوى الإداري الحالي: ${currentLevelRoleName}</span>`;  
  
                    let repliesHtml = '';  
                    if (c.replies && c.replies.length > 0) {  
                        repliesHtml += `<div class="mt-2.5 pt-2 border-t border-dashed border-gray-200 space-y-1.5">  
                            <h6 class="text-[10px] font-bold text-gray-500">سجل التعقيبات والردود الإدارية:</h6>`;  
                        c.replies.forEach(rep => {  
                            repliesHtml += `  
                                <div class="bg-gray-50 p-2 rounded border border-gray-100 text-[10px] leading-normal font-semibold">  
                                    <div class="flex justify-between text-gray-400 text-[9px] mb-0.5">  
                                        <span>المرسل: ${rep.sender}</span>  
                                        <span>${rep.date}</span>  
                                    </div>  
                                    <p class="text-gray-700 font-bold">${rep.content}</p>  
                                </div>  
                            `;  
                        });  
                        repliesHtml += `</div>`;  
                    }  
  
                    complaintsContainer.innerHTML += `  
                        <div class="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm space-y-2 text-right">  
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">  
                                <div class="space-y-1">  
                                    <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${statusColor}">${c.status}</span>  
                                    ${priorityBadge}  
                                    ${levelBadge}  
                                    <h5 class="font-bold text-gray-900 text-xs mt-1">${c.subject}</h5>  
                                </div>  
                                <span class="text-[9px] text-gray-400 font-mono">${c.date}</span>  
                            </div>  
                            <p class="text-xs text-gray-700 leading-relaxed">${c.content}</p>  
                            <div class="flex justify-between text-[10px] text-gray-400 border-t border-gray-50 pt-1.5 font-bold">  
                                <span>من: ${c.senderTitle || c.sender}</span>  
                                <span>إلى: ${c.receiverTitle || '—'}</span>  
                            </div>  
                            <div class="flex justify-end text-[10px] text-gray-400 font-bold">  
                                <span>المرسل الفعلي (الحساب): ${c.sender}</span>  
                            </div>  
                            ${repliesHtml}  
                            <div class="flex gap-1.5 pt-1.5 flex-wrap">  
                                ${approveBtn}  
                                ${replyBtn}  
                                ${escalateBtn}  
                                ${referBtn}  
                                <button onclick="deleteComplaint(${c.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-1 rounded font-bold shadow transition flex items-center gap-1" title="حذف المعاملة نهائياً">  
                                    <i class="fa-solid fa-trash"></i> حذف  
                                </button>  
                            </div>  
                        </div>  
                    `;  
                });  
                if (fComplaints.length === 0) {  
                    complaintsContainer.innerHTML = '<div class="text-center p-8 text-gray-400 text-xs"><i class="fa-solid fa-envelope-open-text text-2xl block mb-2 opacity-40"></i>لا توجد مراسلات أو بلاغات بعد — استخدم النموذج أعلاه لإرسال أول معاملة</div>';  
                }  
            }  
        }  
  
        function populateSelectOptions() {  
            const selectsToPopulate = ['std-branch', 'staff-branch', 'edit-staff-branch', 'v-branch', 'asset-branch', 'student-filter-branch', 'staff-assign-branch', 'edit-staff-assign-branch', 'hr-branch', 'hr-edit-branch'];  
            selectsToPopulate.forEach(selectId => {  
                const select = document.getElementById(selectId);  
                if (!select) return;  
  
                const currentVal = select.value;  
                let html = '';  
  
                if (selectId === 'student-filter-branch') {  
                    html += '<option value="">جميع الحلقات</option>';  
                } else if (selectId === 'staff-branch' || selectId === 'edit-staff-branch') {  
                    html += '<option value="كامل الفروع">كامل الفروع</option>';  
                }  
  
                branches.forEach(b => {  
                    html += `<option value="${b}">${b}</option>`;  
                });  
  
                select.innerHTML = html;  
                if (currentVal) select.value = currentVal;  
            });  
  
            const programSelects = ['std-program', 'student-filter-program', 'ach-program', 'staff-assign-program', 'edit-staff-assign-program'];  
            programSelects.forEach(selectId => {  
                const select = document.getElementById(selectId);  
                if (!select) return;  
  
                const currentVal = select.value;  
                let html = '';  
  
                if (selectId === 'student-filter-program') {  
                    html += '<option value="">جميع البرامج</option>';  
                }  
  
                programs.forEach(p => {  
                    html += `<option value="${p.name}">${p.name} (الرسوم: ${p.fee} ر.ع)</option>`;  
                });  
  
                select.innerHTML = html;  
                if (currentVal) select.value = currentVal;  
            });  
  
            const studentSelects = ['ach-student', 'exam-student'];  
            studentSelects.forEach(selectId => {  
                const select = document.getElementById(selectId);  
                if (!select) return;  
  
                const currentVal = select.value;  
                let html = '';  
  
                const fStudents = getFilteredData(students);  
                fStudents.forEach(s => {  
                    html += `<option value="${s.name}">${s.name} (${s.branch})</option>`;  
                });  
  
                select.innerHTML = html;  
                if (currentVal) select.value = currentVal;  
            });  
  
            const senderSelect = document.getElementById('comp-sender-name');  
            if (senderSelect) {  
                const currentVal = senderSelect.value;  
                let html = '<option value="">— اختر —</option>';  

                employees.filter(e => !!e.username).forEach(e => {  
                    const title = e.jobTitle || systemTerms[e.role] || '';  
                    html += `<option value="${e.name}">${e.name}${title ? ' — ' + title : ''}</option>`;  
                });  

                senderSelect.innerHTML = html;  
                if (currentVal) senderSelect.value = currentVal;  
            }  

            const receiversChecklist = document.getElementById('comp-receivers-checklist');  
            if (receiversChecklist) {  
                // نحافظ على من كان مختاراً سابقاً قبل إعادة البناء (مثلاً بعد إضافة موظف جديد)  
                const previouslyChecked = Array.from(receiversChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);  

                let html = '';  
                employees.filter(e => !!e.username).forEach(e => {  
                    const title = e.jobTitle || systemTerms[e.role] || '';  
                    const isChecked = previouslyChecked.includes(e.name);  
                    html += `  
                        <label class="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 rounded p-0.5">  
                            <input type="checkbox" value="${e.name}" ${isChecked ? 'checked' : ''} class="w-3.5 h-3.5 text-custom-primary">  
                            <span>${e.name}${title ? ' — ' + title : ''}</span>  
                        </label>  
                    `;  
                });  

                receiversChecklist.innerHTML = html || '<span class="text-[11px] text-gray-400">لا يوجد مستخدمون بصلاحية دخول بعد</span>';  
            }  

            const staffRoleSelects = ['staff-role', 'edit-staff-role'];  
            staffRoleSelects.forEach(selectId => {  
                const select = document.getElementById(selectId);  
                if (!select) return;  
  
                const currentVal = select.value;  
                let html = '';  
                roles.forEach(roleKey => {  
                    html += `<option value="${roleKey}">${systemTerms[roleKey]}</option>`;  
                });  
                select.innerHTML = html;  
                if (currentVal) select.value = currentVal;  
            });  
        }  
  
        function toggleStaffAccess(empId, newStatus) {  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  
  
            if (emp.id === currentActiveUser.id && newStatus === 'معطل') {  
                showNotification("لا يمكنك تعطيل الحساب الحالي الذي تستخدمه!", "warn");  
                return;  
            }  
  
            emp.status = newStatus;  
            showNotification(`تم تحديث حالة الوصول للموظف: [${emp.name}] إلى [${newStatus === 'نشط' ? 'نشط' : 'معطل ومسحوب الصلاحية'}] بنجاح`, 'success');  
              
            renderRoleSwitcher();  
            refreshAllViews();  
            renderLoginHints();  
            saveToLocalStorage();  
        }  
  
        function deleteEmployee(empId) {  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  
  
            if (emp.id === currentActiveUser.id) {  
                showNotification("لا يمكنك حذف الحساب الحالي الذي تستخدمه للمحاكاة!", "warn");  
                return;  
            }  

            // حماية من إغلاق النظام بالكامل: لا يجوز حذف آخر حساب يملك صلاحيات الإدارة العامة الكاملة  
            if (emp.role === 'role_0') {  
                const remainingAdmins = employees.filter(e => e.role === 'role_0' && e.id !== empId).length;  
                if (remainingAdmins === 0) {  
                    showNotification("لا يمكن حذف هذا الحساب لأنه آخر حساب بصلاحيات الإدارة العامة الكاملة بالمنظومة. أنشئ حساب إدارة عامة آخر أولاً قبل حذف هذا.", "warn");  
                    return;  
                }  
            }  
  
            employees = employees.filter(e => e.id !== empId);  
            showNotification(`تم حذف سجل الموظف [${emp.name}] بالكامل من المنظومة`, "success");  
              
            renderRoleSwitcher();  
            refreshAllViews();  
            renderLoginHints();  
            saveToLocalStorage();  
        }  

        // ===== سحب صلاحية الدخول نهائياً: يبقى الموظف في السجل العام، لكن دون أي حساب دخول للنظام =====  
        function revokeSystemAccess(empId) {  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  

            if (emp.id === currentActiveUser.id) {  
                showNotification("لا يمكنك سحب صلاحيتك الخاصة عن حسابك الحالي الذي تستخدمه الآن!", "warn");  
                return;  
            }  

            if (emp.role === 'role_0') {  
                const remainingAdmins = employees.filter(e => e.role === 'role_0' && e.id !== empId).length;  
                if (remainingAdmins === 0) {  
                    showNotification("لا يمكن سحب هذه الصلاحية لأنها آخر حساب بصلاحيات الإدارة العامة الكاملة بالمنظومة.", "warn");  
                    return;  
                }  
            }  

            const confirmed = window.confirm(`سيتم سحب صلاحية الدخول عن [${emp.name}] نهائياً — سيبقى موجوداً بالسجل العام للموظفين لكن دون إمكانية تسجيل الدخول. يمكنك منحه الصلاحية مجدداً لاحقاً في أي وقت. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            emp.username = '';  
            emp.password = '';  
            emp.role = '';  
            emp.assignments = [];  

            showNotification(`تم سحب صلاحية الدخول عن [${emp.name}] بنجاح، وبقي في السجل العام`, "success");  
            renderRoleSwitcher();  
            refreshAllViews();  
            renderLoginHints();  
            saveToLocalStorage();  
        }  

        // دالة لفتح نافذة تعديل بيانات الموظف المخصص  
        function openEditStaffModal(empId) {  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  
  
            document.getElementById('edit-staff-id').value = emp.id;  
            document.getElementById('edit-staff-fullname').value = emp.name;  
            document.getElementById('edit-staff-job-title').value = emp.jobTitle || "";  
            document.getElementById('edit-staff-role').value = emp.role;  
              
            // تهيئة الفروع بناءً على الدور المختار لتفادي التناقض  
            onStaffRoleSelected('edit');  
            document.getElementById('edit-staff-branch').value = emp.branch;  
              
            document.getElementById('edit-staff-email').value = emp.email;  
            document.getElementById('edit-staff-username').value = emp.username;  
            document.getElementById('edit-staff-password').value = emp.password;  
            document.getElementById('edit-staff-phone').value = emp.phone || "";  
            document.getElementById('edit-staff-idcard').value = emp.idCard || "";  
            document.getElementById('edit-staff-joindate').value = emp.joinDate || "";  
            document.getElementById('edit-staff-qualification').value = emp.qualification || "";  
            document.getElementById('edit-staff-revenue').value = emp.revenue || 0;  
            document.getElementById('edit-staff-expense').value = emp.expense || 0;  

            // تحميل تكليفات التدريس الحالية للموظف (إن وجدت) في حالة التحرير المؤقتة  
            currentEditStaffAssignments = Array.isArray(emp.assignments) ? emp.assignments.map(a => ({ ...a })) : [];  
            renderTeacherAssignmentsList('edit');  
  
            toggleModal('edit-staff-modal', true);  
        }  
  
        // إظهار/إخفاء كلمة السر عند الضغط على أيقونة العين  
        function togglePasswordVisibility(fieldId, btn) {  
            const field = document.getElementById(fieldId);  
            if (!field) return;  
            const icon = btn.querySelector('i');  
            if (field.type === 'password') {  
                field.type = 'text';  
                if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }  
            } else {  
                field.type = 'password';  
                if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }  
            }  
        }  
  
        // ===== تغيير كلمة السر الخاصة بالمستخدم الحالي (من داخل حسابه فقط) =====  
        function changeMyPassword(event) {  
            event.preventDefault();  
  
            if (!currentActiveUser) return;  
  
            const currentPass = document.getElementById('current-my-password').value;  
            const newPass = document.getElementById('new-my-password').value;  
            const confirmPass = document.getElementById('confirm-my-password').value;  
  
            if ((currentActiveUser.password || '') !== currentPass) {  
                showNotification("كلمة السر الحالية غير صحيحة، يرجى المحاولة مجدداً.", "warn");  
                return;  
            }  
  
            if (newPass.length < 4) {  
                showNotification("يجب أن تتكون كلمة السر الجديدة من 4 خانات على الأقل.", "warn");  
                return;  
            }  
  
            if (newPass !== confirmPass) {  
                showNotification("كلمة السر الجديدة وتأكيدها غير متطابقين.", "warn");  
                return;  
            }  
  
            if (newPass === currentPass) {  
                showNotification("يرجى اختيار كلمة سر جديدة مختلفة عن الحالية.", "warn");  
                return;  
            }  
  
            currentActiveUser.password = newPass;  
  
            const empRef = employees.find(e => e.id === currentActiveUser.id);  
            if (empRef) empRef.password = newPass;  
  
            document.getElementById('change-my-password-form').reset();  
            toggleModal('change-my-password-modal', false);  
            showNotification("تم تغيير كلمة السر الخاصة بحسابك بنجاح.", "success");  
            saveToLocalStorage();  
        }  
  
        // ===== استرداد كلمة السر المنسية قبل تسجيل الدخول =====  
        let recoveryVerifiedUser = null;  
  
        // ===== مزامنة أولية قبل تسجيل الدخول: تحل مشكلة "الحساب الجديد لا يظهر على الجهاز الجديد" =====  
        function openPreLoginSyncModal() {  
            const input = document.getElementById('pre-login-webhook-input');  
            if (input) input.value = googleSheetWebhookUrl || '';  
            const status = document.getElementById('pre-login-sync-status');  
            if (status) status.innerText = '';  
            toggleModal('pre-login-sync-modal', true);  
        }  

        async function runPreLoginSync() {  
            const input = document.getElementById('pre-login-webhook-input');  
            const status = document.getElementById('pre-login-sync-status');  
            const url = input ? input.value.trim() : '';  

            if (!url) {  
                if (status) { status.innerText = 'يرجى لصق رابط تطبيق الويب أولاً.'; status.className = 'text-[11px] text-amber-600 font-bold'; }  
                return;  
            }  

            googleSheetWebhookUrl = url;  
            saveToLocalStorage();  

            if (status) { status.innerText = 'جارِ المزامنة، يرجى الانتظار...'; status.className = 'text-[11px] text-gray-500'; }  

            await pullFromGoogleSheet(true);  
            renderLoginHints();  

            if (status) {  
                status.innerText = 'تمت المزامنة. إن كان حسابك موجوداً بالفعل، أغلق هذه النافذة وسجّل الدخول الآن (استخدم "نسيت كلمة السر" إن كانت هذه أول مرة).';  
                status.className = 'text-[11px] text-emerald-600 font-bold';  
            }  
        }  

        function openForgotPasswordModal() {  
            recoveryVerifiedUser = null;  
            document.getElementById('forgot-password-form').reset();  
            document.getElementById('recovery-step-verify').classList.remove('hidden');  
            document.getElementById('recovery-step-reset').classList.add('hidden');  
            document.getElementById('recovery-submit-btn').innerText = 'التحقق من الهوية';  
            toggleModal('forgot-password-modal', true);  
        }  
  
        function closeForgotPasswordModal() {  
            recoveryVerifiedUser = null;  
            toggleModal('forgot-password-modal', false);  
        }  
  
        function handlePasswordRecovery(event) {  
            event.preventDefault();  
  
            // الخطوة الأولى: التحقق من اسم المستخدم والبريد الإلكتروني المسجّل  
            if (!recoveryVerifiedUser) {  
                const username = document.getElementById('recovery-username').value.trim();  
                const email = document.getElementById('recovery-email').value.trim().toLowerCase();  
  
                const matchedEmp = employees.find(emp =>  
                    (emp.username || '').toLowerCase() === username.toLowerCase() &&  
                    (emp.email || '').toLowerCase() === email  
                );  
  
                if (!matchedEmp) {  
                    showNotification("لا يوجد حساب مطابق لاسم المستخدم والبريد الإلكتروني المدخلين.", "warn");  
                    return;  
                }  
  
                recoveryVerifiedUser = matchedEmp;  
                document.getElementById('recovery-step-verify').classList.add('hidden');  
                document.getElementById('recovery-step-reset').classList.remove('hidden');  
                document.getElementById('recovery-submit-btn').innerText = 'حفظ كلمة السر الجديدة';  
                showNotification("تم التحقق من الهوية بنجاح، الرجاء تعيين كلمة السر الجديدة.", "success");  
                return;  
            }  
  
            // الخطوة الثانية: تعيين كلمة السر الجديدة  
            const newPass = document.getElementById('recovery-new-password').value;  
            const confirmPass = document.getElementById('recovery-confirm-password').value;  
  
            if (newPass.length < 4) {  
                showNotification("يجب أن تتكون كلمة السر الجديدة من 4 خانات على الأقل.", "warn");  
                return;  
            }  
  
            if (newPass !== confirmPass) {  
                showNotification("كلمة السر الجديدة وتأكيدها غير متطابقين.", "warn");  
                return;  
            }  
  
            recoveryVerifiedUser.password = newPass;  
  
            closeForgotPasswordModal();  
            showNotification("تم تعيين كلمة السر الجديدة بنجاح، يمكنك الآن تسجيل الدخول بها.", "success");  
            saveToLocalStorage();  
        }  
  
        function submitEditStaffForm(event) {  
            event.preventDefault();  
  
            const empId = parseInt(document.getElementById('edit-staff-id').value);  
            const fullname = document.getElementById('edit-staff-fullname').value.trim();  
            const jobTitle = document.getElementById('edit-staff-job-title').value.trim();  
            const role = document.getElementById('edit-staff-role').value;  
            const branch = document.getElementById('edit-staff-branch').value;  
            const email = document.getElementById('edit-staff-email').value.trim();  
            const username = document.getElementById('edit-staff-username').value.trim();  
            const password = document.getElementById('edit-staff-password').value;  
            const phone = document.getElementById('edit-staff-phone').value.trim();  
            const idCard = document.getElementById('edit-staff-idcard').value.trim();  
            const joinDate = document.getElementById('edit-staff-joindate').value;  
            const qualification = document.getElementById('edit-staff-qualification').value;  
            const revenue = parseFloat(document.getElementById('edit-staff-revenue').value) || 0;  
            const expense = parseFloat(document.getElementById('edit-staff-expense').value) || 0;  
  
            if (!username || !password) {  
                showNotification("يرجى إدخال اسم المستخدم وكلمة السر", "warn");  
                return;  
            }  
            if (!/^[A-Za-z0-9_.-]{3,}$/.test(username)) {  
                showNotification("اسم المستخدم يجب أن يتكون من أحرف/أرقام إنجليزية فقط بدون مسافات، وبطول 3 خانات على الأقل.", "warn");  
                return;  
            }  
            if (password.length < 4) {  
                showNotification("كلمة السر يجب أن تتكون من 4 خانات على الأقل.", "warn");  
                return;  
            }  
  
            // التحقق من تكرار البريد الإلكتروني أو اسم المستخدم لموظف آخر  
            const isDuplicate = employees.find(e => e.id !== empId && (e.email.toLowerCase() === email.toLowerCase() || e.username.toLowerCase() === username.toLowerCase()));  
            if (isDuplicate) {  
                showNotification("البريد الإلكتروني أو اسم المستخدم مستخدم لموظف آخر!", "warn");  
                return;  
            }  
  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  
  
            emp.name = fullname;  
            emp.jobTitle = jobTitle;  
            emp.role = role;  
            emp.branch = branch;  
            emp.email = email;  
            emp.username = username;  
            emp.password = password;  
            emp.phone = phone;  
            emp.idCard = idCard;  
            emp.joinDate = joinDate;  
            emp.qualification = qualification;  
            emp.revenue = revenue;  
            emp.expense = expense;  
            // تكليفات التدريس تُحفظ فقط لدور "المعلمة"؛ أي دور آخر تُصفَّر تكليفاته  
            emp.assignments = role === 'role_6' ? currentEditStaffAssignments.map(a => ({ ...a })) : [];  
  
            toggleModal('edit-staff-modal', false);  
            showNotification(`تم تحديث وحفظ بيانات الموظف [${fullname}] ومزامنتها بنجاح`, "success");  
              
            // في حال كان هذا الموظف هو المستخدم النشط حالياً، نقوم بتحديث واجهته فوراً  
            if (currentActiveUser.id === empId) {  
                switchUser(empId);  
                renderRoleSwitcher();  
                refreshAllViews();  
                renderLoginHints();  
                saveToLocalStorage();  
            } else {  
                renderRoleSwitcher();  
                refreshAllViews();  
                renderLoginHints();  
                saveToLocalStorage();  
            }  
        }  
  
        function onStaffRoleSelected(mode) {  
            const roleSelectId = mode === 'edit' ? 'edit-staff-role' : 'staff-role';  
            const branchSelectId = mode === 'edit' ? 'edit-staff-branch' : 'staff-branch';  
              
            const roleKey = document.getElementById(roleSelectId).value;  
            const branchSelect = document.getElementById(branchSelectId);  
  
            if (roleKey === 'role_0' || roleKey === 'role_1' || roleKey === 'role_2' || roleKey === 'role_5') {  
                branchSelect.innerHTML = '<option value="كامل الفروع">كامل الفروع</option>';  
            } else {  
                let html = '';  
                branches.forEach(b => {  
                    html += `<option value="${b}">${b}</option>`;  
                });  
                branchSelect.innerHTML = html;  
            }  

            // إظهار/إخفاء قسم تكليفات التدريس: يظهر فقط عند اختيار دور "المعلمة"  
            const assignmentsSectionId = mode === 'edit' ? 'edit-staff-assignments-section' : 'staff-assignments-section';  
            const assignmentsSection = document.getElementById(assignmentsSectionId);  
            if (assignmentsSection) {  
                assignmentsSection.classList.toggle('hidden', roleKey !== 'role_6');  
            }  
        }  

        // ===== إدارة تكليفات التدريس: تسمح للمعلمة الواحدة بتدريس أكثر من برنامج وفي أكثر من حلقة بنفس الوقت =====  
        function addTeacherAssignment(mode) {  
            const branchSelectId = mode === 'edit' ? 'edit-staff-assign-branch' : 'staff-assign-branch';  
            const programSelectId = mode === 'edit' ? 'edit-staff-assign-program' : 'staff-assign-program';  

            const branch = document.getElementById(branchSelectId).value;  
            const program = document.getElementById(programSelectId).value;  

            if (!branch || !program) {  
                showNotification("يرجى اختيار الحلقة والبرنامج قبل إضافة التكليف.", "warn");  
                return;  
            }  

            const list = mode === 'edit' ? currentEditStaffAssignments : currentStaffAssignments;  
            const alreadyExists = list.some(a => a.branch === branch && a.program === program);  
            if (alreadyExists) {  
                showNotification("هذا التكليف (نفس الحلقة ونفس البرنامج) مضاف بالفعل.", "warn");  
                return;  
            }  

            list.push({ branch, program });  
            renderTeacherAssignmentsList(mode);  
        }  

        function removeTeacherAssignment(mode, index) {  
            const list = mode === 'edit' ? currentEditStaffAssignments : currentStaffAssignments;  
            list.splice(index, 1);  
            renderTeacherAssignmentsList(mode);  
        }  

        function renderTeacherAssignmentsList(mode) {  
            const listId = mode === 'edit' ? 'edit-staff-assignments-list' : 'staff-assignments-list';  
            const container = document.getElementById(listId);  
            if (!container) return;  

            const list = mode === 'edit' ? currentEditStaffAssignments : currentStaffAssignments;  
            container.innerHTML = '';  

            if (list.length === 0) {  
                container.innerHTML = '<span class="text-[10px] text-gray-400">لا توجد تكليفات مضافة بعد</span>';  
                return;  
            }  

            list.forEach((a, idx) => {  
                container.innerHTML += `  
                    <span class="bg-white border border-custom-primary/20 text-custom-primary text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5">  
                        ${a.program} — ${a.branch}  
                        <button type="button" onclick="removeTeacherAssignment('${mode}', ${idx})" class="text-rose-500 hover:text-rose-700" title="إزالة هذا التكليف">  
                            <i class="fa-solid fa-xmark"></i>  
                        </button>  
                    </span>  
                `;  
            });  
        }  
  
        function addNewBranch(event) {  
            event.preventDefault();  
            const bName = document.getElementById('new-branch-name').value.trim();  
  
            if (branches.includes(bName)) {  
                showNotification("حلقة العمل مسجلة بالمنظومة بالفعل!", "warn");  
                return;  
            }  
  
            branches.push(bName);  
            document.getElementById('new-branch-name').value = '';  
            showNotification(`تم إشهار الحلقة واعتمادها بالمركز: [${bName}] بحسابات مالية مستقلة تماماً`, "success");  
              
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('branches', 'إضافة', { name: bName, date: nowStr() });  
        }  

        // ===== حذف حلقة: محمي من حذف حلقة بها بيانات مرتبطة حتى لا تُفقد أو تصبح يتيمة =====  
        function deleteBranch(branchName) {  
            const linkedStudents = students.filter(s => s.branch === branchName).length;  
            const linkedEmployees = employees.filter(e => e.branch === branchName).length;  
            const linkedAssets = assets.filter(a => a.branch === branchName).length;  

            if (linkedStudents > 0 || linkedEmployees > 0 || linkedAssets > 0) {  
                showNotification(`لا يمكن حذف حلقة [${branchName}] لارتباطها ببيانات قائمة (${linkedStudents} طالب، ${linkedEmployees} موظف، ${linkedAssets} عهدة). يرجى نقل أو حذف هذه البيانات أولاً.`, "warn");  
                return;  
            }  

            const confirmed = window.confirm(`سيتم حذف الحلقة [${branchName}] نهائياً من المنظومة. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            branches = branches.filter(b => b !== branchName);  
            showNotification(`تم حذف الحلقة [${branchName}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function addNewProgram(event) {  
            event.preventDefault();  
            const pName = document.getElementById('new-prog-name').value.trim();  
            const pFee = parseFloat(document.getElementById('new-prog-fee').value);  
  
            if (programs.find(p => p.name === pName)) {  
                showNotification("البرنامج القرآني مسجل بالمنظومة سابقاً!", "warn");  
                return;  
            }  
  
            programs.push({ name: pName, fee: pFee });  
            document.getElementById('new-prog-name').value = '';  
            document.getElementById('new-prog-fee').value = '';  
  
            showNotification(`تم إضافة وتوثيق البرنامج الدراسي: [${pName}]`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('programs', 'إضافة', { name: pName, fee: pFee, date: nowStr() });  
        }  

        // ===== حذف برنامج: محمي من حذف برنامج مسجّل به طلاب حالياً =====  
        function deleteProgram(programName) {  
            const linkedStudents = students.filter(s => s.program === programName).length;  
            if (linkedStudents > 0) {  
                showNotification(`لا يمكن حذف برنامج [${programName}] لوجود ${linkedStudents} طالب مسجل به حالياً. يرجى نقلهم لبرنامج آخر أولاً.`, "warn");  
                return;  
            }  

            const confirmed = window.confirm(`سيتم حذف البرنامج [${programName}] نهائياً من المنظومة. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            programs = programs.filter(p => p.name !== programName);  
            showNotification(`تم حذف البرنامج [${programName}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        // ===== لوحة التوقيع الإلكتروني لولي الأمر: رسم بالفأرة أو باللمس، مع إمكانية المسح =====  
        let signaturePadInitialized = false;  
        let isDrawingSignature = false;  
        let signatureHasContent = false;  

        function initSignaturePad() {  
            const canvas = document.getElementById('std-signature-pad');  
            if (!canvas || signaturePadInitialized) return;  
            signaturePadInitialized = true;  

            const resizeCanvas = () => {  
                const ratio = window.devicePixelRatio || 1;  
                const rect = canvas.getBoundingClientRect();  
                if (rect.width === 0) return;  
                canvas.width = rect.width * ratio;  
                canvas.height = 140 * ratio;  
                const ctx = canvas.getContext('2d');  
                ctx.scale(ratio, ratio);  
                ctx.strokeStyle = '#16261f';  
                ctx.lineWidth = 2;  
                ctx.lineCap = 'round';  
                ctx.lineJoin = 'round';  
            };  
            resizeCanvas();  
            window.addEventListener('resize', resizeCanvas);  

            const getPos = (e) => {  
                const rect = canvas.getBoundingClientRect();  
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;  
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;  
                return { x: clientX - rect.left, y: clientY - rect.top };  
            };  

            const startDraw = (e) => {  
                e.preventDefault();  
                isDrawingSignature = true;  
                signatureHasContent = true;  
                const ctx = canvas.getContext('2d');  
                const pos = getPos(e);  
                ctx.beginPath();  
                ctx.moveTo(pos.x, pos.y);  
            };  
            const draw = (e) => {  
                if (!isDrawingSignature) return;  
                e.preventDefault();  
                const ctx = canvas.getContext('2d');  
                const pos = getPos(e);  
                ctx.lineTo(pos.x, pos.y);  
                ctx.stroke();  
            };  
            const endDraw = () => { isDrawingSignature = false; };  

            canvas.addEventListener('mousedown', startDraw);  
            canvas.addEventListener('mousemove', draw);  
            canvas.addEventListener('mouseup', endDraw);  
            canvas.addEventListener('mouseleave', endDraw);  
            canvas.addEventListener('touchstart', startDraw, { passive: false });  
            canvas.addEventListener('touchmove', draw, { passive: false });  
            canvas.addEventListener('touchend', endDraw);  
        }  

        function clearSignaturePad() {  
            const canvas = document.getElementById('std-signature-pad');  
            if (!canvas) return;  
            const ctx = canvas.getContext('2d');  
            ctx.clearRect(0, 0, canvas.width, canvas.height);  
            signatureHasContent = false;  
        }  

        function getSignatureDataOrNull() {  
            if (!signatureHasContent) return null;  
            const canvas = document.getElementById('std-signature-pad');  
            if (!canvas) return null;  
            try {  
                return canvas.toDataURL('image/png');  
            } catch (e) {  
                return null;  
            }  
        }  

        // ===== ولي الأمر: تعبئة قائمة الاختيار وإظهار/إخفاء حقول الإدخال الجديدة تبعاً للاختيار =====  
        function populateGuardianSelectForStudent() {  
            const select = document.getElementById('std-guardian-select');  
            if (!select) return;  

            let html = '<option value="">— أضف ولي أمر جديد —</option>';  
            guardians.forEach(g => {  
                html += `<option value="${g.id}">${g.name} (${g.phone})</option>`;  
            });  
            select.innerHTML = html;  
            onGuardianSelectedForStudent();  
        }  

        function onGuardianSelectedForStudent() {  
            const select = document.getElementById('std-guardian-select');  
            const newFieldsWrap = document.getElementById('std-new-guardian-fields');  
            if (!select || !newFieldsWrap) return;  

            const isNewGuardian = !select.value;  
            newFieldsWrap.classList.toggle('hidden', !isNewGuardian);  

            const nameInput = document.getElementById('std-guardian');  
            const phoneInput = document.getElementById('std-phone');  
            if (nameInput) nameInput.required = isNewGuardian;  
            if (phoneInput) phoneInput.required = isNewGuardian;  
        }  


        function calculateFinalFee() {  
            const progName = document.getElementById('std-program').value;  
            const prog = programs.find(p => p.name === progName);  
            if (!prog) return;  
  
            const fee = prog.fee;  
            const discountAmount = parseFloat(document.getElementById('std-discount').value) || 0;  
            const final = Math.max(fee - discountAmount, 0);  
  
            document.getElementById('std-final-fee').value = `${final.toFixed(3)} ر.ع`;  
        }  
  
        // ===== تعديل الرقم التعريفي للطالب (صلاحية مقصورة على الإدارة العامة فقط) =====  
        function editStudentId(currentId) {  
            if (!currentActiveUser || currentActiveUser.role !== 'role_0') {  
                showNotification("لا يملك تعديل الرقم التعريفي للطالب سوى حساب الإدارة العامة.", "warn");  
                return;  
            }  

            const student = students.find(s => s.id === currentId);  
            if (!student) return;  

            const input = window.prompt(`أدخل الرقم التعريفي الجديد للطالب [${student.name}]:`, currentId);  
            if (input === null) return;  

            const newId = parseInt(input.trim());  
            if (isNaN(newId) || newId <= 0) {  
                showNotification("الرقم التعريفي المدخل غير صالح، يجب أن يكون رقماً صحيحاً موجباً.", "warn");  
                return;  
            }  

            if (newId === currentId) return;  

            if (students.some(s => s.id === newId)) {  
                showNotification(`الرقم التعريفي [${newId}] مستخدم بالفعل لطالب آخر، يرجى اختيار رقم مختلف.`, "warn");  
                return;  
            }  

            const confirmed = window.confirm(`سيتم تغيير الرقم التعريفي للطالب [${student.name}] من [${currentId}] إلى [${newId}]، وسيتم تحديث كافة السندات المالية المرتبطة بهذا الرقم تلقائياً. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            student.id = newId;  

            // تحديث كافة السندات المالية المرتبطة بالرقم التعريفي القديم لتبقى الروابط سليمة  
            financialTransactions.forEach(t => {  
                if (t.studentId === currentId) t.studentId = newId;  
            });  

            showNotification(`تم تعديل الرقم التعريفي للطالب [${student.name}] بنجاح إلى [${newId}]`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        function submitStudentForm(event) {  
            event.preventDefault();  

            const name = document.getElementById('std-fullname').value.trim();  
            const age = parseInt(document.getElementById('std-age').value);  
            const genderInput = document.querySelector('input[name="std-gender"]:checked');  
            const gender = genderInput ? genderInput.value : 'ذكر';  
            const branch = document.getElementById('std-branch').value;  
            const program = document.getElementById('std-program').value;  
            const discount = parseFloat(document.getElementById('std-discount').value) || 0;  
            const teacher = document.getElementById('std-teacher').value;  

            // ===== تحديد ولي الأمر: إما اختيار موجود بالسجل، أو إنشاء سجل جديد له =====  
            const selectedGuardianId = document.getElementById('std-guardian-select').value;  
            let guardianId, guardianName, relation, phone;  

            if (selectedGuardianId) {  
                const g = guardians.find(gd => gd.id === parseInt(selectedGuardianId));  
                if (!g) { showNotification("تعذر العثور على ولي الأمر المختار.", "warn"); return; }  
                guardianId = g.id;  
                guardianName = g.name;  
                relation = document.getElementById('std-relation').value;  
                phone = g.phone;  
            } else {  
                guardianName = document.getElementById('std-guardian').value.trim();  
                relation = document.getElementById('std-relation').value;  
                phone = document.getElementById('std-phone').value.trim();  
                const idCard = document.getElementById('std-guardian-idcard').value.trim();  
                const email = document.getElementById('std-guardian-email').value.trim();  

                if (!guardianName || !phone) {  
                    showNotification("يرجى إدخال اسم ولي الأمر ورقم هاتفه، أو اختيار ولي أمر موجود بالسجل.", "warn");  
                    return;  
                }  

                const newGuardianId = guardians.length > 0 ? Math.max(...guardians.map(g => g.id)) + 1 : 1;  
                const newGuardian = { id: newGuardianId, name: guardianName, phone, idCard, email };  
                guardians.push(newGuardian);  
                guardianId = newGuardianId;  
            }  

            const signatureData = getSignatureDataOrNull();  

            const prog = programs.find(p => p.name === program);  
            const fee = prog ? prog.fee : 0;  
            const finalFee = Math.max(fee - discount, 0);  

            const newStd = {  
                id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 201,  
                name, age, gender, branch, program, discount, finalFee, paid: false,  
                guardianId, guardian: guardianName, relation, phone, teacher,  
                signature: signatureData  
            };  

            students.push(newStd);  
            toggleModal('student-modal', false);  
            document.getElementById('student-form').reset();  
            clearSignaturePad();  

            showNotification(`تم قيد وتسجيل الطالب: [${name}] بنجاح في حلقة [${branch}] برقمه التعريفي #${newStd.id}`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('students', 'إضافة', newStd);  
        }  

        // ===== حذف ملف طالب: يحذف ملفه فقط، مع الإبقاء على السندات المالية التاريخية كسجل محاسبي =====  
        // ===== سجل أولياء الأمور: عرض، تعديل، حذف =====  
        function renderGuardiansTable() {  
            const tbody = document.getElementById('guardians-tbody');  
            if (!tbody) return;  

            tbody.innerHTML = '';  
            guardians.forEach(g => {  
                const childrenCount = students.filter(s => s.guardianId === g.id).length;  
                tbody.innerHTML += `  
                    <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                        <td class="p-3 font-semibold text-gray-950">${g.name}</td>  
                        <td class="p-3 font-mono text-xs text-gray-500" dir="ltr">${g.phone || '—'}</td>  
                        <td class="p-3 text-xs text-gray-500" dir="ltr">${g.email || '—'}</td>  
                        <td class="p-3 font-mono text-xs text-gray-500" dir="ltr">${g.idCard || '—'}</td>  
                        <td class="p-3 text-center"><span class="bg-custom-primary-light text-custom-primary text-xs font-bold px-2 py-1 rounded-full">${childrenCount}</span></td>  
                        <td class="p-3 text-center">  
                            <div class="flex items-center justify-center gap-1.5">  
                                <button onclick="openEditGuardianModal(${g.id})" class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition"><i class="fa-solid fa-pen-to-square"></i></button>  
                                <button onclick="deleteGuardian(${g.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1.5 rounded font-bold shadow transition" title="حذف ولي الأمر"><i class="fa-solid fa-trash"></i></button>  
                            </div>  
                        </td>  
                    </tr>  
                `;  
            });  

            if (guardians.length === 0) {  
                tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-400"><i class="fa-solid fa-user-shield text-2xl block mb-2 opacity-40"></i>لا يوجد أولياء أمور مسجلون بعد</td></tr>';  
            }  
        }  

        function openEditGuardianModal(id) {  
            const g = guardians.find(gd => gd.id === id);  
            if (!g) return;  

            document.getElementById('guardian-edit-id').value = g.id;  
            document.getElementById('guardian-edit-name').value = g.name;  
            document.getElementById('guardian-edit-phone').value = g.phone || '';  
            document.getElementById('guardian-edit-idcard').value = g.idCard || '';  
            document.getElementById('guardian-edit-email').value = g.email || '';  

            toggleModal('guardian-edit-modal', true);  
        }  

        function submitEditGuardianForm(event) {  
            event.preventDefault();  

            const id = parseInt(document.getElementById('guardian-edit-id').value);  
            const g = guardians.find(gd => gd.id === id);  
            if (!g) return;  

            g.name = document.getElementById('guardian-edit-name').value.trim();  
            g.phone = document.getElementById('guardian-edit-phone').value.trim();  
            g.idCard = document.getElementById('guardian-edit-idcard').value.trim();  
            g.email = document.getElementById('guardian-edit-email').value.trim();  

            // تحديث اسم ولي الأمر المعروض على ملفات أبنائه المرتبطين تلقائياً  
            students.forEach(s => { if (s.guardianId === id) { s.guardian = g.name; s.phone = g.phone; } });  

            toggleModal('guardian-edit-modal', false);  
            showNotification(`تم تحديث بيانات ولي الأمر [${g.name}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        function deleteGuardian(id) {  
            const g = guardians.find(gd => gd.id === id);  
            if (!g) return;  

            const linkedChildren = students.filter(s => s.guardianId === id);  
            if (linkedChildren.length > 0) {  
                showNotification(`لا يمكن حذف ولي الأمر [${g.name}] لارتباطه بـ ${linkedChildren.length} طالب مسجل. يجب حذف أو نقل ملفات أبنائه أولاً.`, "warn");  
                return;  
            }  

            const confirmed = window.confirm(`سيتم حذف ولي الأمر [${g.name}] نهائياً من السجل. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            guardians = guardians.filter(gd => gd.id !== id);  
            showNotification(`تم حذف ولي الأمر [${g.name}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        function deleteStudent(id) {  
            const s = students.find(std => std.id === id);  
            if (!s) return;  

            const confirmed = window.confirm(`سيتم حذف ملف الطالب [${s.name}] نهائياً من النظام. علماً بأن السندات المالية المرتبطة به تبقى في السجل المحاسبي التاريخي. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            students = students.filter(std => std.id !== id);  
            showNotification(`تم حذف ملف الطالب [${s.name}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        // ===== إدارة الموظفين العامة (سجل شامل مستقل تماماً عن صلاحيات دخول النظام) =====  
        function submitHrEmployeeForm(event) {  
            event.preventDefault();  

            const name = document.getElementById('hr-fullname').value.trim();  
            const jobTitle = document.getElementById('hr-job-title').value.trim();  
            const genderInput = document.querySelector('input[name="hr-gender"]:checked');  
            const gender = genderInput ? genderInput.value : 'ذكر';  
            const branch = document.getElementById('hr-branch').value;  
            const phone = document.getElementById('hr-phone').value.trim();  
            const email = document.getElementById('hr-email').value.trim();  
            const idCard = document.getElementById('hr-idcard').value.trim();  
            const joinDate = document.getElementById('hr-joindate').value;  
            const qualification = document.getElementById('hr-qualification').value;  

            const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;  

            const newEmp = {  
                id: newId, name, role: '', jobTitle, gender, branch, email, username: '', password: '',  
                phone, idCard, joinDate, qualification, revenue: 0, expense: 0, assignments: [], status: 'نشط'  
            };  

            employees.push(newEmp);  
            toggleModal('hr-employee-modal', false);  
            document.getElementById('hr-employee-form').reset();  

            showNotification(`تم تسجيل الموظف [${name}] بالسجل العام بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('employees', 'إضافة', { ...newEmp, roleName: '' });  
        }  

        function openEditHrEmployeeModal(empId) {  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  

            document.getElementById('hr-edit-id').value = emp.id;  
            document.getElementById('hr-edit-fullname').value = emp.name;  
            document.getElementById('hr-edit-job-title').value = emp.jobTitle || '';  
            document.getElementById('hr-edit-phone').value = emp.phone || '';  
            document.getElementById('hr-edit-email').value = emp.email || '';  
            document.getElementById('hr-edit-idcard').value = emp.idCard || '';  
            document.getElementById('hr-edit-joindate').value = emp.joinDate || '';  
            document.getElementById('hr-edit-qualification').value = emp.qualification || '';  

            const genderToCheck = emp.gender === 'أنثى' ? 'أنثى' : 'ذكر';  
            const genderRadio = document.querySelector(`input[name="hr-edit-gender"][value="${genderToCheck}"]`);  
            if (genderRadio) genderRadio.checked = true;  

            populateSelectOptions();  
            document.getElementById('hr-edit-branch').value = emp.branch;  

            toggleModal('hr-employee-edit-modal', true);  
        }  

        function submitHrEmployeeEditForm(event) {  
            event.preventDefault();  

            const empId = parseInt(document.getElementById('hr-edit-id').value);  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  

            emp.name = document.getElementById('hr-edit-fullname').value.trim();  
            emp.jobTitle = document.getElementById('hr-edit-job-title').value.trim();  
            emp.branch = document.getElementById('hr-edit-branch').value;  
            emp.phone = document.getElementById('hr-edit-phone').value.trim();  
            emp.email = document.getElementById('hr-edit-email').value.trim();  
            emp.idCard = document.getElementById('hr-edit-idcard').value.trim();  
            emp.joinDate = document.getElementById('hr-edit-joindate').value;  
            emp.qualification = document.getElementById('hr-edit-qualification').value;  
            const genderInputEdit = document.querySelector('input[name="hr-edit-gender"]:checked');  
            emp.gender = genderInputEdit ? genderInputEdit.value : (emp.gender || 'ذكر');  

            toggleModal('hr-employee-edit-modal', false);  
            showNotification(`تم تحديث بيانات الموظف [${emp.name}] بنجاح`, "success");  

            if (currentActiveUser.id === empId) {  
                switchUser(empId);  
                refreshAllViews();  
                renderLoginHints();  
                saveToLocalStorage();  
            } else {  
                refreshAllViews();  
                renderLoginHints();  
                saveToLocalStorage();  
            }  
        }  

        function renderHrEmployeesTable() {  
            const tbody = document.getElementById('hr-employees-tbody');  
            if (!tbody) return;  

            tbody.innerHTML = '';  
            employees.forEach(emp => {  
                const hasAccess = !!emp.username;  
                const accessBadge = hasAccess  
                    ? '<span class="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">له صلاحية دخول</span>'  
                    : '<span class="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold">بدون صلاحية دخول</span>';  

                tbody.innerHTML += `  
                    <tr class="hover:bg-gray-50 border-b border-gray-100 transition">  
                        <td class="p-3 font-semibold text-gray-950">${emp.name} <i class="fa-solid ${emp.gender === 'أنثى' ? 'fa-venus text-pink-400' : 'fa-mars text-blue-400'} text-[10px]" title="${emp.gender || 'ذكر'}"></i></td>  
                        <td class="p-3 text-xs text-gray-700">${emp.jobTitle || '—'}</td>  
                        <td class="p-3"><span class="bg-custom-accent-light text-custom-accent text-xs font-bold px-2 py-1 rounded">${emp.branch || '—'}</span></td>  
                        <td class="p-3 font-mono text-xs text-gray-500" dir="ltr">${emp.phone || '—'}</td>  
                        <td class="p-3 text-xs text-gray-600">${emp.qualification || '—'}</td>  
                        <td class="p-3 text-center">${accessBadge}</td>  
                        <td class="p-3 text-center">  
                            <div class="flex items-center justify-center gap-1.5">  
                                <button onclick="openEditHrEmployeeModal(${emp.id})" class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2.5 py-1.5 rounded font-bold shadow transition flex items-center gap-1"><i class="fa-solid fa-pen-to-square"></i> تعديل</button>  
                                <button onclick="deleteEmployee(${emp.id})" class="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1.5 rounded font-bold shadow transition" title="حذف الموظف نهائياً من كل السجلات"><i class="fa-solid fa-trash"></i></button>  
                            </div>  
                        </td>  
                    </tr>  
                `;  
            });  

            if (employees.length === 0) {  
                tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-400"><i class="fa-solid fa-address-card text-2xl block mb-2 opacity-40"></i>لا يوجد موظفون مسجلون بعد</td></tr>';  
            }  
        }  

        function submitStaffForm(event) {  
            event.preventDefault();  
  
            const empId = parseInt(document.getElementById('staff-select-employee').value);  
            const roleKey = document.getElementById('staff-role').value;  
            const branch = document.getElementById('staff-branch').value;  
            const email = document.getElementById('staff-email').value.trim();  
            const username = document.getElementById('staff-username').value.trim();  
            const password = document.getElementById('staff-password').value;  

            if (!empId) {  
                showNotification("يرجى اختيار الموظف الذي تريد منحه صلاحية الدخول.", "warn");  
                return;  
            }  

            const emp = employees.find(e => e.id === empId);  
            if (!emp) {  
                showNotification("تعذر العثور على الموظف المختار.", "warn");  
                return;  
            }  
  
            if (!/^[A-Za-z0-9_.-]{3,}$/.test(username)) {  
                showNotification("اسم المستخدم يجب أن يتكون من أحرف/أرقام إنجليزية فقط بدون مسافات، وبطول 3 خانات على الأقل.", "warn");  
                return;  
            }  
            if (password.length < 4) {  
                showNotification("كلمة السر يجب أن تتكون من 4 خانات على الأقل.", "warn");  
                return;  
            }  
  
            const isExist = employees.find(e => e.id !== empId && (e.email.toLowerCase() === email.toLowerCase() || (e.username && e.username.toLowerCase() === username.toLowerCase())));  
            if (isExist) {  
                showNotification("البريد الإلكتروني أو اسم المستخدم مستخدم لموظف آخر!", "warn");  
                return;  
            }  
  
            emp.role = roleKey;  
            emp.branch = branch;  
            emp.email = email;  
            emp.username = username;  
            emp.password = password;  
            emp.assignments = roleKey === 'role_6' ? currentStaffAssignments.map(a => ({ ...a })) : [];  
            emp.status = "نشط";  
  
            toggleModal('staff-modal', false);  
            document.getElementById('staff-form').reset();  
  
            showNotification(`تم منح صلاحية الدخول للموظف [${emp.name}] بنجاح`, "success");  
            renderRoleSwitcher();  
            refreshAllViews();  
            renderLoginHints();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('employees', 'منح صلاحية', { ...emp, roleName: systemTerms[roleKey] });  
        }  

        // ===== تعبئة قائمة الموظفين الذين لا يملكون صلاحية دخول بعد، ليتم اختيار أحدهم لمنحه الصلاحية =====  
        function populateEmployeesWithoutAccessSelect() {  
            const select = document.getElementById('staff-select-employee');  
            if (!select) return;  

            const candidates = employees.filter(e => !e.username);  
            let html = '<option value="">— اختر الموظف —</option>';  
            candidates.forEach(e => {  
                html += `<option value="${e.id}">${e.name}${e.jobTitle ? ' — ' + e.jobTitle : ''}</option>`;  
            });  
            select.innerHTML = html;  

            if (candidates.length === 0) {  
                showNotification("لا يوجد حالياً أي موظف بالسجل العام بلا صلاحية دخول. سجّل موظفاً جديداً أولاً من تبويب \"إدارة الموظفين\".", "warn");  
            }  
        }  

        // ===== عند اختيار موظف من القائمة، عبّئ حقل البريد الإلكتروني تلقائياً إن كان مسجلاً مسبقاً بالسجل العام =====  
        function onEmployeeSelectedForAccess() {  
            const empId = parseInt(document.getElementById('staff-select-employee').value);  
            const emp = employees.find(e => e.id === empId);  
            if (!emp) return;  

            const emailInput = document.getElementById('staff-email');  
            if (emailInput && emp.email) emailInput.value = emp.email;  

            const branchSelect = document.getElementById('staff-branch');  
            if (branchSelect && emp.branch && [...branchSelect.options].some(o => o.value === emp.branch)) {  
                branchSelect.value = emp.branch;  
            }  
        }  

        // ===== توليد رقم سند فريد غير مكرر (يُستخدم كاقتراح فقط، ويبقى للمستخدم حرية تعديله يدوياً) =====  
        function generateUniqueSerial(prefix) {  
            let n = financialTransactions.length + 101;  
            let serial = `${prefix}-${n}`;  
            while (financialTransactions.some(t => t.id === serial)) {  
                n++;  
                serial = `${prefix}-${n}`;  
            }  
            return serial;  
        }  
  
        function recordStudentPayment(studentId) {  
            const s = students.find(std => std.id === studentId);  
            if (!s) return;  
  
            const summary = getStudentPaymentSummary(studentId);  
            const amountDue = summary ? summary.remaining : s.finalFee;  
  
            if (amountDue <= 0) {  
                showNotification(`الطالب [${s.name}] لا يوجد عليه أي مبلغ متبقٍ مستحق للسداد.`, "warn");  
                s.paid = true;  
                refreshAllViews();  
                saveToLocalStorage();  
                return;  
            }  
  
            s.paid = true;  
  
            const nextSerial = generateUniqueSerial('SML-R');  
            const now = new Date();  
            const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');  
  
            const newReceipt = {  
                id: nextSerial,  
                type: "receipt",  
                branch: s.branch,  
                category: "رسوم دراسة",  
                amount: amountDue,  
                payer: s.guardian || '',  
                studentId: s.id,  
                studentName: s.name,  
                description: `سداد واستلام رسوم الطالب: [${s.name}] في حلقة [${s.branch}]`,  
                date: dateStr  
            };  
  
            financialTransactions.unshift(newReceipt);  
            showNotification(`تم تحصيل واستلام رسوم الطالب [${s.name}] بمبلغ [${amountDue.toFixed(3)} ر.ع] بنجاح، وتوليد سند قبض برقم [${nextSerial}]`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncFinancialTransactionsToGoogleSheet(newReceipt);  
        }  
  
  
        function openVoucherModal(type) {  
            const title = document.getElementById('voucher-title');  
            const header = document.getElementById('voucher-header');  
            const serial = document.getElementById('v-serial');  
            const catSelect = document.getElementById('v-category');  
            const catLabel = document.getElementById('v-cat-label');  
            const typeInput = document.getElementById('v-type');  
  
            setDateTime();  
            typeInput.value = type;  

            document.getElementById('v-student-id').value = '';  
            const lookupBox = document.getElementById('v-student-lookup-result');  
            lookupBox.classList.add('hidden');  
            lookupBox.innerHTML = '';  
  
            if (type === 'receipt') {  
                title.innerHTML = `<i class="fa-solid fa-file-invoice-dollar text-custom-accent"></i> تسجيل ${systemTerms.receipt_voucher} جديد`;  
                header.className = "bg-emerald-700 text-white px-6 py-4 flex justify-between items-center";  
                serial.value = generateUniqueSerial('SML-R');  
                catLabel.innerText = "تصنيف وبند الإيرادات";  
                catSelect.innerHTML = `  
                    <option value="رسوم تسجيل">رسوم تسجيل</option>  
                    <option value="رسوم دراسة">رسوم دراسة</option>  
                    <option value="تبرعات">تبرعات عامة</option>  
                    <option value="دعم من الصندوق الوقفي">دعم من الصندوق الوقفي</option>  
                    <option value="دعم من الجمعية">دعم من الجمعية</option>  
                    <option value="كتب">كتب</option>  
                    <option value="أخرى">أخرى</option>  
                `;  
            } else {  
                title.innerHTML = `<i class="fa-solid fa-file-invoice text-custom-accent"></i> تسجيل ${systemTerms.expense_voucher}`;  
                header.className = "bg-rose-700 text-white px-6 py-4 flex justify-between items-center";  
                serial.value = generateUniqueSerial('SML-E');  
                catLabel.innerText = "بند المصروفات المعتمد";  
                catSelect.innerHTML = `  
                    <option value="إيجار المبنى">إيجار المبنى</option>  
                    <option value="الكهرباء">الكهرباء</option>  
                    <option value="الماء">الماء</option>  
                    <option value="الانترنت">الانترنت</option>  
                    <option value="الهاتف">الهاتف</option>  
                    <option value="هدايا">هدايا</option>  
                    <option value="أجهزة الكترونية">أجهزة إلكترونية</option>  
                    <option value="قرطاسية">قرطاسية</option>  
                    <option value="صيانة وخدمات">صيانة وخدمات</option>  
                    <option value="نثريات">نثريات</option>  
                    <option value="رواتب">رواتب</option>  
                    <option value="نقل/شحن">نقل/شحن</option>  
                    <option value="كتب">كتب</option>  
                `;  
            }  
  
            onVoucherCategoryChange();  
            toggleModal('voucher-modal', true);  
        }  

        // ===== إظهار قائمة اختيار الطالب تلقائياً عند اختيار "رسوم تسجيل" أو "رسوم دراسة"، لربط اسم الطالب بالسند مباشرة =====  
        function onVoucherCategoryChange() {  
            const category = document.getElementById('v-category').value;  
            const wrap = document.getElementById('v-student-picker-wrap');  
            const picker = document.getElementById('v-student-picker');  
            if (!wrap || !picker) return;  

            const isStudentFeeCategory = (category === 'رسوم تسجيل' || category === 'رسوم دراسة');  
            wrap.classList.toggle('hidden', !isStudentFeeCategory);  

            if (isStudentFeeCategory) {  
                let html = '<option value="">— اختر الطالب من القائمة —</option>';  
                students.forEach(s => {  
                    html += `<option value="${s.id}">${s.name} (${s.branch}) — #${s.id}</option>`;  
                });  
                picker.innerHTML = html;  
                picker.value = '';  
            }  
        }  

        // ===== عند اختيار طالب من القائمة: تعبئة رقمه التعريفي واسم الدافع (ولي الأمر) تلقائياً =====  
        function onVoucherStudentPicked() {  
            const picker = document.getElementById('v-student-picker');  
            const studentId = parseInt(picker.value);  
            if (!studentId) return;  

            const student = students.find(s => s.id === studentId);  
            if (!student) return;  

            document.getElementById('v-student-id').value = studentId;  
            document.getElementById('v-payer').value = student.guardian || student.name;  

            lookupStudentForVoucher();  
        }  

  
        function submitVoucherForm(event) {  
            event.preventDefault();  
  
            const id = document.getElementById('v-serial').value.trim();  
            const type = document.getElementById('v-type').value;  
            const branch = document.getElementById('v-branch').value;  
            const category = document.getElementById('v-category').value;  
            const amount = parseFloat(document.getElementById('v-amount').value);  
            const invoice = document.getElementById('v-invoice').value;  
            const payer = document.getElementById('v-payer').value.trim();  
            const studentIdRaw = document.getElementById('v-student-id').value.trim();  
            const studentId = studentIdRaw ? parseInt(studentIdRaw) : null;  
            const linkedStudent = studentId ? students.find(s => s.id === studentId) : null;  
            const description = document.getElementById('v-description').value;  
            const date = document.getElementById('v-date').value;  

            if (!id) {  
                showNotification("يرجى إدخال رقم السند يدوياً قبل الاعتماد.", "warn");  
                return;  
            }  

            // منع تكرار رقم السند بشكل قاطع (غير حساس لحالة الأحرف والمسافات الزائدة)  
            const isDuplicateSerial = financialTransactions.some(t => t.id.trim().toLowerCase() === id.toLowerCase());  
            if (isDuplicateSerial) {  
                showNotification(`رقم السند [${id}] مستخدم بالفعل بسند سابق، يرجى اختيار رقم سند مختلف غير مكرر.`, "warn");  
                return;  
            }  
  
            const descStr = invoice ? `${description} (رقم الفاتورة: ${invoice})` : description;  
  
            const newVoucher = {  
                id, type, branch, category, amount, payer,  
                studentId: linkedStudent ? linkedStudent.id : null,  
                studentName: linkedStudent ? linkedStudent.name : '',  
                description: descStr, date  
            };  
            financialTransactions.unshift(newVoucher);  
  
            if (linkedStudent && type === 'receipt') {  
                const summary = getStudentPaymentSummary(linkedStudent.id);  
                if (summary.remaining <= 0) linkedStudent.paid = true;  
            }  
  
            toggleModal('voucher-modal', false);  
            document.getElementById('voucher-form').reset();  
            document.getElementById('v-student-lookup-result').classList.add('hidden');  
  
            showNotification(`تم بنجاح توثيق واعتماد السند المالي بالصندوق برقم: [${id}]`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncFinancialTransactionsToGoogleSheet(newVoucher);  
        }  

        // ===== حذف سند مالي فردي، مع إعادة احتساب حالة سداد الطالب المرتبط إن وجد =====  
        function deleteVoucher(id) {  
            const t = financialTransactions.find(tr => tr.id === id);  
            if (!t) return;  

            const confirmed = window.confirm(`سيتم حذف السند [${id}] نهائياً من السجل المالي. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            financialTransactions = financialTransactions.filter(tr => tr.id !== id);  

            if (t.studentId) {  
                const student = students.find(s => s.id === t.studentId);  
                if (student) {  
                    const summary = getStudentPaymentSummary(t.studentId);  
                    student.paid = summary ? summary.remaining <= 0 : false;  
                }  
            }  

            showNotification(`تم حذف السند [${id}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        // ===== حساب إجمالي مدفوعات الطالب والمتبقي عليه بناءً على السندات المالية المرتبطة برقمه التعريفي =====  
        function getStudentPaymentSummary(studentId) {  
            const student = students.find(s => s.id === studentId);  
            if (!student) return null;  
  
            const paidTotal = financialTransactions  
                .filter(t => t.type === 'receipt' && t.studentId === studentId)  
                .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);  
  
            const remaining = Math.max(student.finalFee - paidTotal, 0);  
            const overpaid = Math.max(paidTotal - student.finalFee, 0);  
  
            return { student, paidTotal, remaining, overpaid, finalFee: student.finalFee };  
        }  

        // ===== عرض كشف حساب تفصيلي لطالب معيّن: كل دفعاته المسجلة وإجمالي المدفوع والمتبقي عليه =====  
        function openStudentStatement(studentId) {  
            const summary = getStudentPaymentSummary(studentId);  
            if (!summary) {  
                showNotification("تعذر العثور على بيانات هذا الطالب.", "warn");  
                return;  
            }  

            const headerEl = document.getElementById('statement-student-header');  
            if (headerEl) {  
                headerEl.innerHTML = `  
                    <div class="bg-custom-primary-light border border-custom-primary/10 rounded-xl p-3">  
                        <strong class="text-custom-primary text-base block">${summary.student.name}</strong>  
                        <span class="text-xs text-gray-500">${summary.student.branch} — ${summary.student.program} — الرقم التعريفي: #${summary.student.id}</span>  
                    </div>  
                `;  
            }  

            const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };  
            setText('statement-total-fee', `${summary.finalFee.toFixed(3)} ر.ع`);  
            setText('statement-total-paid', `${summary.paidTotal.toFixed(3)} ر.ع`);  
            setText('statement-total-remaining', `${summary.remaining.toFixed(3)} ر.ع`);  

            const paymentsTbody = document.getElementById('statement-payments-tbody');  
            if (paymentsTbody) {  
                const studentPayments = financialTransactions  
                    .filter(t => t.type === 'receipt' && t.studentId === studentId)  
                    .sort((a, b) => (a.date < b.date ? 1 : -1));  

                paymentsTbody.innerHTML = '';  
                studentPayments.forEach(t => {  
                    paymentsTbody.innerHTML += `  
                        <tr>  
                            <td class="p-2 font-mono text-gray-700">${t.id}</td>  
                            <td class="p-2 text-[10px] text-gray-400 font-mono">${t.date}</td>  
                            <td class="p-2 text-left font-bold text-emerald-700">${t.amount.toFixed(3)} ر.ع</td>  
                        </tr>  
                    `;  
                });  

                if (studentPayments.length === 0) {  
                    paymentsTbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-400">لا توجد أي دفعة مسجلة لهذا الطالب حتى الآن</td></tr>';  
                }  
            }  

            toggleModal('student-statement-modal', true);  
        }  
  
        // ===== البحث الفوري عن الطالب أثناء تحرير السند المالي وعرض ملخص مدفوعاته =====  
        function lookupStudentForVoucher() {  
            const input = document.getElementById('v-student-id');  
            const box = document.getElementById('v-student-lookup-result');  
            const idVal = parseInt(input.value.trim());  
  
            if (!idVal) {  
                box.classList.add('hidden');  
                box.innerHTML = '';  
                return;  
            }  
  
            const summary = getStudentPaymentSummary(idVal);  
            box.classList.remove('hidden');  
  
            if (!summary) {  
                box.className = "bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-bold";  
                box.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> لا يوجد طالب مسجل بالرقم التعريفي [${idVal}]`;  
                return;  
            }  
  
            box.className = "bg-custom-primary-light border border-custom-primary/15 rounded-xl p-3 text-xs leading-relaxed";  
            box.innerHTML = `  
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 mb-1.5">  
                    <strong class="text-custom-primary text-sm">${summary.student.name}</strong>  
                    <span class="text-gray-500">${summary.student.branch} — ${summary.student.program}</span>  
                </div>  
                <div class="grid grid-cols-3 gap-2 text-center mt-2">  
                    <div class="bg-white rounded-lg p-2 border border-gray-100">  
                        <span class="block text-gray-400 text-[10px]">الرسوم المستحقة</span>  
                        <strong class="text-gray-800">${summary.finalFee.toFixed(3)} ر.ع</strong>  
                    </div>  
                    <div class="bg-white rounded-lg p-2 border border-gray-100">  
                        <span class="block text-gray-400 text-[10px]">إجمالي المدفوع</span>  
                        <strong class="text-emerald-600">${summary.paidTotal.toFixed(3)} ر.ع</strong>  
                    </div>  
                    <div class="bg-white rounded-lg p-2 border border-gray-100">  
                        <span class="block text-gray-400 text-[10px]">المتبقي عليه</span>  
                        <strong class="${summary.remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}">${summary.remaining.toFixed(3)} ر.ع</strong>  
                    </div>  
                </div>  
                ${summary.overpaid > 0 ? `<div class="text-amber-600 text-[11px] mt-1.5"><i class="fa-solid fa-circle-info"></i> يوجد دفع زائد بمقدار ${summary.overpaid.toFixed(3)} ر.ع</div>` : ''}  
            `;  
        }  
  
  
        // مولّد أرقام تعريفية فريدة لأي قائمة (يعتمد على أعلى رقم موجود لتفادي التكرار بعد الحذف)  
        function nextId(arr) {  
            if (!arr || arr.length === 0) return 1;  
            return Math.max(...arr.map(x => x.id || 0)) + 1;  
        }  

        function submitAchievement(event) {  
            event.preventDefault();  
            const student = document.getElementById('ach-student').value;  
            const program = document.getElementById('ach-program').value;  
            const details = document.getElementById('ach-details').value.trim();  
  
            const s = students.find(st => st.name === student);  
            const branch = s ? s.branch : "غير محدد";  
  
            const newAch = {  
                id: nextId(achievements),  
                student, branch, program, details,  
                date: new Date().toISOString().slice(0, 10)  
            };  
            achievements.unshift(newAch);  
  
            document.getElementById('ach-details').value = '';  
            showNotification(`تم رصد وتوثيق إنجاز الطالب [${student}] بنجاح في السجل`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('achievements', 'إضافة', newAch);  
        }  

        function deleteAchievement(id) {  
            const ach = achievements.find(a => a.id === id);  
            if (!ach) return;  
            const confirmed = window.confirm(`سيتم حذف إنجاز الطالب [${ach.student}] نهائياً من السجل. هل تريد المتابعة؟`);  
            if (!confirmed) return;  
            achievements = achievements.filter(a => a.id !== id);  
            showNotification("تم حذف الإنجاز بنجاح", "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function submitExam(event) {  
            event.preventDefault();  
            const student = document.getElementById('exam-student').value;  
            const exam = document.getElementById('exam-name').value.trim();  
            const score = parseInt(document.getElementById('exam-score').value);  
  
            const newExam = {  
                id: nextId(exams),  
                student, exam, score,  
                date: new Date().toISOString().slice(0, 10)  
            };  
            exams.unshift(newExam);  
  
            document.getElementById('exam-name').value = '';  
            document.getElementById('exam-score').value = '';  
  
            showNotification(`تم رصد وحفظ درجة اختبار الطالب [${student}] بنجاح`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('exams', 'إضافة', newExam);  
        }  

        function deleteExam(id) {  
            const ex = exams.find(e => e.id === id);  
            if (!ex) return;  
            const confirmed = window.confirm(`سيتم حذف اختبار [${ex.exam}] للطالب [${ex.student}] نهائياً من السجل. هل تريد المتابعة؟`);  
            if (!confirmed) return;  
            exams = exams.filter(e => e.id !== id);  
            showNotification("تم حذف الاختبار بنجاح", "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function submitAsset(event) {  
            event.preventDefault();  
            const name = document.getElementById('asset-name').value.trim();  
            const qty = parseInt(document.getElementById('asset-qty').value);  
            const branch = document.getElementById('asset-branch').value;  
  
            const newAsset = { id: nextId(assets), name, qty, branch };  
            assets.unshift(newAsset);  
              
            document.getElementById('asset-name').value = '';  
            document.getElementById('asset-qty').value = '';  
  
            showNotification(`تم تقييد وإثبات العهدة الجديدة لحلقة: [${branch}] بنجاح`, 'success');  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('assets', 'إضافة', newAsset);  
        }  

        function deleteAsset(id) {  
            const a = assets.find(x => x.id === id);  
            if (!a) return;  
            const confirmed = window.confirm(`سيتم حذف العهدة [${a.name}] نهائياً من السجل. هل تريد المتابعة؟`);  
            if (!confirmed) return;  
            assets = assets.filter(x => x.id !== id);  
            showNotification(`تم حذف العهدة [${a.name}] بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function submitComplaint(event) {  
            event.preventDefault();  
            const subject = document.getElementById('comp-subject').value.trim();  
            const content = document.getElementById('comp-content').value.trim();  
            const senderName = document.getElementById('comp-sender-name').value.trim();  
            const receiversChecklist = document.getElementById('comp-receivers-checklist');  
            const receiverNames = receiversChecklist  
                ? Array.from(receiversChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)  
                : [];  
            const priority = document.getElementById('comp-priority').value;  

            const findEmpTitle = (name) => {  
                const emp = employees.find(e => e.name === name);  
                return emp ? (emp.jobTitle || systemTerms[emp.role] || '') : '';  
            };  

            const now = new Date();  
            const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');  

            const senderLevelIdx = hierarchyOrder.indexOf(currentActiveUser.role);  

            const receiverTitlesDisplay = receiverNames.map(name => {  
                const t = findEmpTitle(name);  
                return `${name}${t ? ' — ' + t : ''}`;  
            }).join('، ');  

            const newComplaint = {  
                id: nextId(complaints),  
                sender: currentActiveUser.name,  
                senderRole: currentActiveUser.role,  
                senderTitle: senderName ? `${senderName}${findEmpTitle(senderName) ? ' — ' + findEmpTitle(senderName) : ''}` : (systemTerms[currentActiveUser.role] || ''),  
                receiverNames: receiverNames,  
                receiverTitle: receiverTitlesDisplay || '',  
                priority: priority || 'عادية',  
                subject, content, status: "نشط", date: dateStr, replies: [],  
                currentLevelIndex: senderLevelIdx >= 0 ? senderLevelIdx : hierarchyOrder.length - 1  
            };  
            complaints.unshift(newComplaint);  

            document.getElementById('comp-subject').value = '';  
            document.getElementById('comp-content').value = '';  
            document.getElementById('comp-sender-name').value = '';  
            if (receiversChecklist) {  
                receiversChecklist.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });  
            }  
            document.getElementById('comp-priority').value = 'عادية';  

            showNotification("تم إرسال وتوجيه المراسلة للجهات المحددة بنجاح", "success");  
            refreshAllViews();  
            saveToLocalStorage();  
            syncRecordToGoogleSheet('complaints', 'إضافة', newComplaint);  
        }  
  
        function approveComplaint(id) {  
            const c = complaints.find(comp => comp.id === id);  
            if (c) {  
                c.status = "معتمد رسمياً";  
                showNotification(`تم مصادقة واعتماد المعاملة الإدارية [${c.subject}] بنجاح`, 'success');  
                refreshAllViews();  
                saveToLocalStorage();  
            }  
        }  

        // ===== حذف مراسلة/بلاغ نهائياً من السجل =====  
        function deleteComplaint(id) {  
            const c = complaints.find(comp => comp.id === id);  
            if (!c) return;  

            const confirmed = window.confirm(`سيتم حذف المعاملة [${c.subject}] نهائياً من سجل المراسلات، بما في ذلك كل الردود والتعقيبات المرتبطة بها. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            complaints = complaints.filter(comp => comp.id !== id);  
            showNotification("تم حذف المعاملة بنجاح", "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        function nowStr() {  
            const now = new Date();  
            return now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');  
        }  

        // ===== تصعيد المعاملة لمستوى إداري أعلى وفق ترتيب التسلسل الإداري المحدد =====  
        // ===== التحقق من صلاحية مخاطبة منصب معيّن: هل يحق لهذا الدور تصعيد/إحالة مراسلة إلى ذلك المنصب؟ =====  
        // كل منصب يحق له مخاطبة (تصعيد/إحالة) المنصب الأعلى منه مباشرة والأدنى منه مباشرة فقط في   
        // التسلسل الإداري المحدد، تلقائياً ودون أي جدول تخصيص إضافي  
        function canCorrespondWith(fromRole, toRole) {  
            if (fromRole === toRole) return true;  
            const fromIdx = hierarchyOrder.indexOf(fromRole);  
            const toIdx = hierarchyOrder.indexOf(toRole);  
            if (fromIdx === -1 || toIdx === -1) return false;  
            return Math.abs(fromIdx - toIdx) === 1;  
        }  

        function escalateComplaint(id) {  
            const c = complaints.find(comp => comp.id === id);  
            if (!c) return;  

            const levelIdx = typeof c.currentLevelIndex === 'number' ? c.currentLevelIndex : hierarchyOrder.length - 1;  
            if (levelIdx <= 0) {  
                showNotification("المعاملة موجودة بالفعل عند أعلى مستوى إداري بالتسلسل.", "warn");  
                return;  
            }  

            const targetRole = hierarchyOrder[levelIdx - 1];  
            if (!canCorrespondWith(currentActiveUser.role, targetRole) && currentActiveUser.role !== 'role_0') {  
                showNotification(`لا تملك صلاحية مخاطبة منصب [${systemTerms[targetRole]}] مباشرة. راجع مدير النظام إن كنت تحتاج هذه الصلاحية.`, "warn");  
                return;  
            }  

            const fromRoleName = systemTerms[hierarchyOrder[levelIdx]];  
            c.currentLevelIndex = levelIdx - 1;  
            const toRoleName = systemTerms[hierarchyOrder[c.currentLevelIndex]];  

            if (!c.replies) c.replies = [];  
            c.replies.push({  
                sender: currentActiveUser.name,  
                content: `تم تصعيد المعاملة إدارياً من مستوى [${fromRoleName}] إلى مستوى أعلى [${toRoleName}]`,  
                date: nowStr()  
            });  

            showNotification(`تم تصعيد المعاملة إلى المستوى الإداري: [${toRoleName}]`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        // ===== إحالة المعاملة لمستوى إداري أدنى وفق ترتيب التسلسل الإداري المحدد =====  
        function referDownComplaint(id) {  
            const c = complaints.find(comp => comp.id === id);  
            if (!c) return;  

            const levelIdx = typeof c.currentLevelIndex === 'number' ? c.currentLevelIndex : hierarchyOrder.length - 1;  
            if (levelIdx >= hierarchyOrder.length - 1) {  
                showNotification("المعاملة موجودة بالفعل عند أدنى مستوى إداري بالتسلسل.", "warn");  
                return;  
            }  

            const targetRole = hierarchyOrder[levelIdx + 1];  
            if (!canCorrespondWith(currentActiveUser.role, targetRole) && currentActiveUser.role !== 'role_0') {  
                showNotification(`لا تملك صلاحية مخاطبة منصب [${systemTerms[targetRole]}] مباشرة. راجع مدير النظام إن كنت تحتاج هذه الصلاحية.`, "warn");  
                return;  
            }  

            const fromRoleName = systemTerms[hierarchyOrder[levelIdx]];  
            c.currentLevelIndex = levelIdx + 1;  
            const toRoleName = systemTerms[hierarchyOrder[c.currentLevelIndex]];  

            if (!c.replies) c.replies = [];  
            c.replies.push({  
                sender: currentActiveUser.name,  
                content: `تمت إحالة المعاملة إدارياً من مستوى [${fromRoleName}] إلى مستوى أدنى [${toRoleName}]`,  
                date: nowStr()  
            });  

            showNotification(`تمت إحالة المعاملة إلى المستوى الإداري: [${toRoleName}]`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        let currentTargetComplaintIdForReply = null;  
        function openReplyModal(id) {  
            currentTargetComplaintIdForReply = id;  
            const replyText = prompt("يرجى كتابة الرد الرسمي والتعقيب المعتمد:");  
            if (replyText && replyText.trim() !== "") {  
                const c = complaints.find(comp => comp.id === currentTargetComplaintIdForReply);  
                if (c) {  
                    if (!c.replies) c.replies = [];  
                    const now = new Date();  
                    const dateStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');  
  
                    c.replies.push({  
                        sender: `${currentActiveUser.name} (${currentActiveUser.jobTitle || systemTerms[currentActiveUser.role]})`,  
                        content: replyText.trim(),  
                        date: dateStr  
                    });  
                    showNotification("تم توثيق وإرسال الرد الرسمي على البلاغ بنجاح", "success");  
                    refreshAllViews();  
                    saveToLocalStorage();  
                }  
            }  
        }  
  
        function filterStudentsTable() {  
            const query = document.getElementById('student-search-input').value.toLowerCase();  
            const programFilter = document.getElementById('student-filter-program').value;  
            const branchFilter = document.getElementById('student-filter-branch').value;  
  
            const tbody = document.getElementById('students-main-tbody');  
            if (!tbody) return;  
            const rows = tbody.getElementsByTagName('tr');  
  
            for (let i = 0; i < rows.length; i++) {  
                const row = rows[i];  
                if (row.cells.length < 5) continue;  
  
                const name = row.cells[0].textContent.toLowerCase();  
                const branch = row.cells[2].textContent;  
                const program = row.cells[3].textContent;  
  
                let matchesSearch = name.includes(query);  
                let matchesProgram = programFilter === "" || program.includes(programFilter);  
                let matchesBranch = branchFilter === "" || branch.includes(branchFilter);  
  
                if (matchesSearch && matchesProgram && matchesBranch) {  
                    row.style.display = "";  
                } else {  
                    row.style.display = "none";  
                }  
            }  
        }  
  
        function toggleModal(modalId, show) {  
            const el = document.getElementById(modalId);  
            if (!el) return;  
            if (show) {  
                el.classList.remove('hidden');  
                if (modalId === 'student-modal') {  
                    calculateFinalFee();  
                    updateTeacherOptionsForStudent();  
                    populateGuardianSelectForStudent();  
                    clearSignaturePad();  
                    setTimeout(initSignaturePad, 50);  
                    const idPreview = document.getElementById('std-new-id-preview');  
                    if (idPreview) {  
                        const nextStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 201;  
                        idPreview.innerText = '#' + nextStudentId;  
                    }  

                    // إظهار خيار التخفيض فقط لمن يملك صلاحية "منح التخفيضات المالية للطلاب" تحديداً،   
                    // فلا يظهر لولي الأمر أو لأي موظف غير مخوَّل، ويبقى الاعتماد على تحديد التخفيض حكراً   
                    // على الشخص المخوّل فقط  
                    const discountPanel = document.getElementById('std-discount-panel');  
                    const canGrantDiscount = hasPermission(29);  
                    if (discountPanel) discountPanel.classList.toggle('hidden', !canGrantDiscount);  
                    if (!canGrantDiscount) {  
                        const discountInput = document.getElementById('std-discount');  
                        if (discountInput) { discountInput.value = 0; calculateFinalFee(); }  
                    }  
                }  
                if (modalId === 'staff-modal') {  
                    // إعادة تصفير حالة تكليفات التدريس عند فتح نافذة إضافة موظف جديد من الصفر  
                    currentStaffAssignments = [];  
                    renderTeacherAssignmentsList('add');  
                    populateEmployeesWithoutAccessSelect();  
                }  
            } else {  
                el.classList.add('hidden');  
            }  
        }  

        // ===== تحديث قائمة المعلمات المتاحات لتدريس الطالب بناءً على الحلقة والبرنامج المختارين تحديداً =====  
        function updateTeacherOptionsForStudent() {  
            const select = document.getElementById('std-teacher');  
            if (!select) return;  

            const branch = document.getElementById('std-branch') ? document.getElementById('std-branch').value : '';  
            const program = document.getElementById('std-program') ? document.getElementById('std-program').value : '';  

            const matchingTeachers = employees.filter(e =>  
                e.role === 'role_6' &&  
                Array.isArray(e.assignments) &&  
                e.assignments.some(a => a.branch === branch && a.program === program)  
            );  

            if (matchingTeachers.length === 0) {  
                select.innerHTML = '<option value="">— لا توجد معلمة مكلَّفة بهذا البرنامج بهذه الحلقة بعد —</option>';  
                return;  
            }  

            let html = '<option value="">— لم تُحدَّد بعد —</option>';  
            matchingTeachers.forEach(t => {  
                html += `<option value="${t.name}">${t.name}</option>`;  
            });  
            select.innerHTML = html;  
        }  
