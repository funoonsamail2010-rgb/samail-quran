// ==== part2-firebase.js — جزء 2 من 5 من الكود البرمجي لمنظومة مركز سمائل القرآني ====


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
                if (Array.isArray(data.activityLog)) activityLog = data.activityLog;  
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
                // إعادة بناء شريط التبويبات والتحقق من التبويب النشط فوراً عند وصول أي تحديث للصلاحيات   
                // من جهاز آخر — وإلا فقد تبقى تبويبات ظاهرة لمستخدم مسجّل دخوله بالفعل رغم سحب صلاحيته منها للتو  
                if (currentActiveUser) {  
                    renderNavigationBar();  
                    adjustActiveTab();  
                }  
                refreshAllViews();  
                saveToLocalStorage();  
            } finally {  
                isApplyingRemoteUpdate = false;  
            }  
        }  

        function buildFullStateObject() {  
            return {  
                systemTerms, rolePermissions, branches, programs, students,  
                financialTransactions, assets, complaints, achievements, exams, guardians, activityLog,  
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
            logActivity(`فعّل كل الصلاحيات دفعة واحدة لدور [${systemTerms[roleKey]}]`);  
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
            const permName = permissions.find(p=>p.id===permId).name;  
            logActivity(`${checked ? 'فعّل' : 'ألغى'} صلاحية [${permName}] لدور [${systemTerms[roleKey]}]`);  
            showNotification(`تم تحديث صلاحية [${permName}] لدور [${systemTerms[roleKey]}] بنجاح`, 'success');  
              
            renderNavigationBar();  
            adjustActiveTab();  
            refreshAllViews();  
            saveToLocalStorage();  
        }  
  
        function renderTermsEditor() {  
            const rolesGrid = document.getElementById('terms-editor-roles-grid');  
            const grid = document.getElementById('terms-editor-grid');  
            if (!rolesGrid || !grid) return;  

            rolesGrid.innerHTML = '';  
            grid.innerHTML = '';  

            const isRoleKey = (key) => /^role_\d$/.test(key);  

            const buildFieldHtml = (key, meta) => `  
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

            for (const key in systemTerms) {  
                const meta = termsMetadata[key];  
                if (!meta) continue;  

                if (isRoleKey(key)) {  
                    rolesGrid.innerHTML += buildFieldHtml(key, meta);  
                } else {  
                    grid.innerHTML += buildFieldHtml(key, meta);  
                }  
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
        // ===== عرض سجل التعديلات في جدول (آخر 300 إجراء، الأحدث أولاً) =====  
        function renderActivityLog() {  
            const tbody = document.getElementById('activity-log-tbody');  
            if (!tbody) return;  

            if (!Array.isArray(activityLog) || activityLog.length === 0) {  
                tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-gray-400"><i class="fa-solid fa-clock-rotate-left text-xl block mb-2 opacity-40"></i>لا توجد إجراءات مسجّلة بعد</td></tr>';  
                return;  
            }  

            let html = '';  
            activityLog.forEach(entry => {  
                html += `  
                    <tr class="hover:bg-gray-50">  
                        <td class="p-2">${entry.description}</td>  
                        <td class="p-2 text-gray-500">${entry.userRole}</td>  
                        <td class="p-2 font-bold">${entry.userName}</td>  
                        <td class="p-2 font-mono text-gray-400" dir="ltr">${entry.date}</td>  
                    </tr>  
                `;  
            });  
            tbody.innerHTML = html;  
        }  

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
