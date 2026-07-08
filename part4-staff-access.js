// ==== part4-staff-access.js — جزء 4 من 5 من الكود البرمجي لمنظومة مركز سمائل القرآني ====

  
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
                    html += `<option value="${p.name}">${p.name}</option>`;  
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
            logActivity(`حذف سجل الموظف [${emp.name}] بالكامل من المنظومة`);  
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

            logActivity(`سحب صلاحية الدخول عن [${emp.name}]`);  
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
            // [إصلاح] نحوّل كل قيمة إلى نص أولاً عبر String(...) قبل استخدام toLowerCase، لأن بعض   
            // الموظفين قد يكون اسم المستخدم أو البريد لديهم مخزَّناً كرقم أو غير معرَّف (undefined)،   
            // وهذا كان يوقف الحفظ بالكامل بخطأ "toLowerCase is not a function" فور وجود حالة كهذه.  
            const isDuplicate = employees.find(e => e.id !== empId && (String(e.email || '').toLowerCase() === email.toLowerCase() || String(e.username || '').toLowerCase() === username.toLowerCase()));  
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
            logActivity(`حذف الحلقة [${branchName}]`);  
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
        // تحديث الرسوم الدراسية لبرنامج معيّن بشكل مستقل عن جدول أسماء البرامج نفسها  
        function updateProgramFee(programName) {  
            const program = programs.find(p => p.name === programName);  
            if (!program) return;  

            const input = document.getElementById(`fee-input-${programName}`);  
            if (!input) return;  

            const newFee = parseFloat(input.value);  
            if (isNaN(newFee) || newFee < 0) {  
                showNotification("الرجاء إدخال قيمة رسوم صحيحة.", "warn");  
                return;  
            }  

            const oldFee = program.fee;  
            program.fee = newFee;  

            logActivity(`عدّل الرسوم الدراسية لبرنامج [${programName}] من ${oldFee.toFixed(3)} ر.ع إلى ${newFee.toFixed(3)} ر.ع`);  
            showNotification(`تم تحديث رسوم برنامج [${programName}] إلى ${newFee.toFixed(3)} ر.ع بنجاح`, "success");  
            refreshAllViews();  
            saveToLocalStorage();  
        }  

        function deleteProgram(programName) {  
            const linkedStudents = students.filter(s => s.program === programName).length;  
            if (linkedStudents > 0) {  
                showNotification(`لا يمكن حذف برنامج [${programName}] لوجود ${linkedStudents} طالب مسجل به حالياً. يرجى نقلهم لبرنامج آخر أولاً.`, "warn");  
                return;  
            }  

            const confirmed = window.confirm(`سيتم حذف البرنامج [${programName}] نهائياً من المنظومة. هل تريد المتابعة؟`);  
            if (!confirmed) return;  

            programs = programs.filter(p => p.name !== programName);  
            logActivity(`حذف البرنامج [${programName}]`);  
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

            logActivity(`سجّل طالباً جديداً: [${name}] في حلقة [${branch}] (الرقم التعريفي #${newStd.id})`);  
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
