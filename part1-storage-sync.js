// ==== part1-storage-sync.js — جزء 1 من 5 من الكود البرمجي لمنظومة مركز سمائل القرآني ====

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
            role_0: "المشرف العام",  
            role_1: "مديرة المركز",  
            role_2: "مدير النظام",  
            role_3: "المشرفة التعليمية",  
            role_4: "مديرة الحلقة",  
            role_5: "المحاسب",  
            role_6: "المعلمة",  
            role_7: "منسق/منسقة حلقة",  
            role_8: "المنسق الإداري",  
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
            role_0: { label: "مسمى المنصب الأول (الإدارة العليا الكاملة الصلاحيات)", desc: "الإشراف العام على المركز، ويملك كافة الصلاحيات بالمنظومة" },  
            role_1: { label: "مسمى المنصب الثاني", desc: "الإدارة العامة على المركز وجميع حلقاته" },  
            role_2: { label: "مسمى المنصب الثالث (دور تقني مقفل الصلاحيات)", desc: "دور مالك لكافة صلاحيات المنظومة، ومقفل بشكل دائم لا يمكن تعديل صلاحياته" },  
            role_3: { label: "مسمى المنصب الرابع", desc: "الإشراف على المعلمات والبرامج التعليمية" },  
            role_4: { label: "مسمى المنصب الخامس", desc: "الإدارة العامة على الحلقة وطلابها" },  
            role_5: { label: "مسمى المنصب السادس", desc: "إدارة الشؤون المالية للمركز" },  
            role_6: { label: "مسمى المنصب السابع", desc: "الدور التنظيمي لرصد الحفظ والاختبارات وتسميع الطلاب" },  
            role_7: { label: "مسمى المنصب الثامن", desc: "التنسيق الإداري والمالي داخل الحلقة" },  
            role_8: { label: "مسمى المنصب التاسع", desc: "التنسيق الإداري والمالي على مستوى المركز" },  
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
