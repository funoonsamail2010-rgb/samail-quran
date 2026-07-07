// ==== part3-appearance-terms.js — جزء 3 من 5 من الكود البرمجي لمنظومة مركز سمائل القرآني ====


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
  
        // ملاحظة: أُزيلت ميزة "محاكي تبديل الأدوار" نهائياً لأسباب أمنية (كانت تسمح بانتحال   
        // هوية أي موظف آخر فوراً دون كلمة سر). أبقيت هذه الدالة كـ"لا تفعل شيئاً" فقط حتى لا   
        // نحتاج لتعديل كل الأماكن التي تستدعيها في أنحاء النظام.  
        function renderRoleSwitcher() {  
            return;  
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
                renderActivityLog();  
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
