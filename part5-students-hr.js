// ==== part5-students-hr.js — جزء 5 من 5 من الكود البرمجي لمنظومة مركز سمائل القرآني ====


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
            logActivity(`حذف ملف الطالب [${s.name}] (الرقم التعريفي #${id})`);  
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
                phone, idCard, joinDate, qualification, assignments: [], status: 'نشط'  
            };  

            employees.push(newEmp);  
            toggleModal('hr-employee-modal', false);  
            document.getElementById('hr-employee-form').reset();  

            logActivity(`سجّل موظفاً جديداً بالسجل العام: [${name}]`);  
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
            logActivity(`عدّل بيانات الموظف [${emp.name}]`);  
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
  
            // [إصلاح] تحويل كل قيمة إلى نص عبر String(...) قبل toLowerCase، حماية من نفس مشكلة   
            // توقف الحفظ لو كان أحد الموظفين لديه بريد/اسم مستخدم مخزَّناً كرقم أو غير معرَّف  
            const isExist = employees.find(e => e.id !== empId && (String(e.email || '').toLowerCase() === email.toLowerCase() || String(e.username || '').toLowerCase() === username.toLowerCase()));  
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
