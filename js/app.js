/**
 * Main application entry point for the HR Management System.
 */
(function () {
  'use strict';

  // Initialize Storage
  Storage.init();

  // Seed default departments if none exist
  if (DepartmentModule.count() === 0) {
    const defaultDepts = [
      { name: 'Engineering', description: 'Software development and engineering' },
      { name: 'Human Resources', description: 'HR and people operations' },
      { name: 'Marketing', description: 'Marketing and communications' },
      { name: 'Finance', description: 'Finance and accounting' },
      { name: 'Sales', description: 'Sales and business development' },
    ];
    defaultDepts.forEach(d => DepartmentModule.add(d));
  }

  // ==================== Navigation ====================
  const navItems = document.querySelectorAll('.nav-item');
  const pageSections = document.querySelectorAll('.page-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pageSections.forEach(s => s.classList.remove('active'));
      document.getElementById(page).classList.add('active');
      refreshPage(page);
    });
  });

  function refreshPage(page) {
    switch (page) {
      case 'dashboard': renderDashboard(); break;
      case 'employees': renderEmployees(); break;
      case 'departments': renderDepartments(); break;
      case 'attendance': renderAttendance(); break;
      case 'leaves': renderLeaves(); break;
    }
  }

  // ==================== Modal Helpers ====================
  window.openModal = function (id) {
    document.getElementById(id).classList.add('active');
  };

  window.closeModal = function (id) {
    document.getElementById(id).classList.remove('active');
  };

  function showErrors(containerId, errors) {
    const container = document.getElementById(containerId);
    if (!errors || errors.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `<div class="alert alert-error">${errors.join('<br>')}</div>`;
  }

  // ==================== Dashboard ====================
  function renderDashboard() {
    const overview = DashboardModule.getOverview();
    const salaryStats = DashboardModule.getSalaryStats();

    document.getElementById('dashboardStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue">&#x1f465;</div>
        <div class="stat-value">${overview.totalEmployees}</div>
        <div class="stat-label">Total Employees</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">&#x2714;</div>
        <div class="stat-value">${overview.activeEmployees}</div>
        <div class="stat-label">Active Employees</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal">&#x1f3e2;</div>
        <div class="stat-value">${overview.totalDepartments}</div>
        <div class="stat-label">Departments</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">&#x1f4c5;</div>
        <div class="stat-value">${overview.pendingLeaves}</div>
        <div class="stat-label">Pending Leave Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">&#x1f4b0;</div>
        <div class="stat-value">${Formatter.currency(salaryStats.average)}</div>
        <div class="stat-label">Avg Salary</div>
      </div>
    `;

    const recentHires = DashboardModule.getRecentHires(5);
    const tbody = document.getElementById('recentHiresBody');
    if (recentHires.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">No employees yet</td></tr>';
    } else {
      tbody.innerHTML = recentHires.map(emp => `
        <tr>
          <td>${Formatter.fullName(emp)}</td>
          <td>${emp.department}</td>
          <td>${emp.position}</td>
          <td>${DateUtils.formatDate(emp.hireDate)}</td>
        </tr>
      `).join('');
    }
  }

  // ==================== Employees ====================
  function renderEmployees(searchQuery) {
    const employees = searchQuery ? EmployeeModule.search(searchQuery) : EmployeeModule.getAll();
    const tbody = document.getElementById('employeeTableBody');
    const emptyState = document.getElementById('employeeEmpty');

    if (employees.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      tbody.innerHTML = employees.map(emp => `
        <tr>
          <td><strong>${Formatter.fullName(emp)}</strong></td>
          <td>${emp.email}</td>
          <td>${emp.department}</td>
          <td>${emp.position}</td>
          <td><span class="badge badge-${emp.status}">${Formatter.capitalize(emp.status)}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-outline btn-sm" onclick="editEmployee('${emp.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Update department dropdown
    const deptSelect = document.getElementById('department');
    const depts = DepartmentModule.getAll();
    deptSelect.innerHTML = '<option value="">Select Department</option>' +
      depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  }

  document.getElementById('employeeSearch').addEventListener('input', function () {
    renderEmployees(this.value);
  });

  document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    showErrors('employeeFormErrors', []);
    renderEmployees(); // refresh dept dropdown
    openModal('employeeModal');
  });

  window.editEmployee = function (id) {
    const emp = EmployeeModule.getById(id);
    if (!emp) return;
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = emp.id;
    document.getElementById('firstName').value = emp.firstName;
    document.getElementById('lastName').value = emp.lastName;
    document.getElementById('email').value = emp.email;
    document.getElementById('phone').value = emp.phone || '';
    document.getElementById('department').value = emp.department;
    document.getElementById('position').value = emp.position;
    document.getElementById('salary').value = emp.salary || '';
    document.getElementById('hireDate').value = emp.hireDate || '';
    showErrors('employeeFormErrors', []);
    renderEmployees(); // refresh dept dropdown
    document.getElementById('department').value = emp.department;
    openModal('employeeModal');
  };

  window.deleteEmployee = function (id) {
    if (confirm('Are you sure you want to delete this employee?')) {
      EmployeeModule.remove(id);
      renderEmployees();
    }
  };

  document.getElementById('saveEmployeeBtn').addEventListener('click', () => {
    const id = document.getElementById('employeeId').value;
    const data = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      department: document.getElementById('department').value,
      position: document.getElementById('position').value,
      salary: document.getElementById('salary').value,
      hireDate: document.getElementById('hireDate').value,
    };

    let result;
    if (id) {
      result = EmployeeModule.update(id, data);
    } else {
      result = EmployeeModule.add(data);
    }

    if (result.success) {
      closeModal('employeeModal');
      renderEmployees();
    } else {
      showErrors('employeeFormErrors', result.errors);
    }
  });

  // ==================== Departments ====================
  function renderDepartments() {
    const departments = DepartmentModule.getAll();
    const tbody = document.getElementById('departmentTableBody');
    const emptyState = document.getElementById('departmentEmpty');

    if (departments.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      tbody.innerHTML = departments.map(dept => {
        const empCount = EmployeeModule.getByDepartment(dept.name).length;
        return `
          <tr>
            <td><strong>${dept.name}</strong></td>
            <td>${dept.description || '-'}</td>
            <td>${dept.manager || '-'}</td>
            <td>${empCount}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-outline btn-sm" onclick="editDepartment('${dept.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDepartment('${dept.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  document.getElementById('addDepartmentBtn').addEventListener('click', () => {
    document.getElementById('departmentModalTitle').textContent = 'Add Department';
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentId').value = '';
    showErrors('departmentFormErrors', []);
    openModal('departmentModal');
  });

  window.editDepartment = function (id) {
    const dept = DepartmentModule.getById(id);
    if (!dept) return;
    document.getElementById('departmentModalTitle').textContent = 'Edit Department';
    document.getElementById('departmentId').value = dept.id;
    document.getElementById('deptName').value = dept.name;
    document.getElementById('deptDescription').value = dept.description || '';
    document.getElementById('deptManager').value = dept.manager || '';
    showErrors('departmentFormErrors', []);
    openModal('departmentModal');
  };

  window.deleteDepartment = function (id) {
    if (confirm('Are you sure you want to delete this department?')) {
      DepartmentModule.remove(id);
      renderDepartments();
    }
  };

  document.getElementById('saveDepartmentBtn').addEventListener('click', () => {
    const id = document.getElementById('departmentId').value;
    const data = {
      name: document.getElementById('deptName').value,
      description: document.getElementById('deptDescription').value,
      manager: document.getElementById('deptManager').value,
    };

    let result;
    if (id) {
      result = DepartmentModule.update(id, data);
    } else {
      result = DepartmentModule.add(data);
    }

    if (result.success) {
      closeModal('departmentModal');
      renderDepartments();
    } else {
      showErrors('departmentFormErrors', result.errors);
    }
  });

  // ==================== Attendance ====================
  function renderAttendance() {
    const dateFilter = document.getElementById('attendanceDateFilter').value || DateUtils.today();
    document.getElementById('attendanceDateFilter').value = dateFilter;

    const records = AttendanceModule.getByDate(dateFilter);
    const summary = AttendanceModule.getDailySummary(dateFilter);
    const tbody = document.getElementById('attendanceTableBody');
    const emptyState = document.getElementById('attendanceEmpty');

    document.getElementById('attendanceStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon green">&#x2714;</div>
        <div class="stat-value">${summary.present}</div>
        <div class="stat-label">Present</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">&#x2718;</div>
        <div class="stat-value">${summary.absent}</div>
        <div class="stat-label">Absent</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">&#x23f0;</div>
        <div class="stat-value">${summary.late}</div>
        <div class="stat-label">Late</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal">&#x1f3e0;</div>
        <div class="stat-value">${summary.remote}</div>
        <div class="stat-label">Remote</div>
      </div>
    `;

    // Populate employee dropdown
    const empSelect = document.getElementById('attEmployee');
    const employees = EmployeeModule.getAll();
    empSelect.innerHTML = '<option value="">Select Employee</option>' +
      employees.map(e => `<option value="${e.id}">${Formatter.fullName(e)}</option>`).join('');

    if (records.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      tbody.innerHTML = records.map(r => {
        const emp = EmployeeModule.getById(r.employeeId);
        const empName = emp ? Formatter.fullName(emp) : r.employeeId;
        return `
          <tr>
            <td>${empName}</td>
            <td>${DateUtils.formatDate(r.date)}</td>
            <td><span class="badge badge-${r.status}">${Formatter.capitalize(r.status)}</span></td>
            <td>${r.checkIn || '-'}</td>
            <td>${r.checkOut || '-'}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deleteAttendance('${r.id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  document.getElementById('attendanceDateFilter').addEventListener('change', renderAttendance);

  document.getElementById('recordAttendanceBtn').addEventListener('click', () => {
    document.getElementById('attendanceForm').reset();
    document.getElementById('attDate').value = DateUtils.today();
    showErrors('attendanceFormErrors', []);
    renderAttendance(); // refresh employee dropdown
    openModal('attendanceModal');
  });

  window.deleteAttendance = function (id) {
    if (confirm('Delete this attendance record?')) {
      AttendanceModule.remove(id);
      renderAttendance();
    }
  };

  document.getElementById('saveAttendanceBtn').addEventListener('click', () => {
    const data = {
      employeeId: document.getElementById('attEmployee').value,
      date: document.getElementById('attDate').value,
      status: document.getElementById('attStatus').value,
      checkIn: document.getElementById('checkIn').value,
      checkOut: document.getElementById('checkOut').value,
    };

    const result = AttendanceModule.record(data);
    if (result.success) {
      closeModal('attendanceModal');
      renderAttendance();
    } else {
      showErrors('attendanceFormErrors', result.errors);
    }
  });

  // ==================== Leave Management ====================
  let currentLeaveFilter = 'all';

  function renderLeaves() {
    let leaves;
    if (currentLeaveFilter === 'all') {
      leaves = LeaveModule.getAll();
    } else {
      leaves = LeaveModule.getByStatus(currentLeaveFilter);
    }

    const tbody = document.getElementById('leaveTableBody');
    const emptyState = document.getElementById('leaveEmpty');

    // Populate employee dropdown
    const empSelect = document.getElementById('leaveEmployee');
    const employees = EmployeeModule.getAll();
    empSelect.innerHTML = '<option value="">Select Employee</option>' +
      employees.map(e => `<option value="${e.id}">${Formatter.fullName(e)}</option>`).join('');

    if (leaves.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      tbody.innerHTML = leaves.map(l => {
        const emp = EmployeeModule.getById(l.employeeId);
        const empName = emp ? Formatter.fullName(emp) : l.employeeId;
        let actions = '';
        if (l.status === 'pending') {
          actions = `
            <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">Reject</button>
          `;
        } else if (l.status !== 'cancelled' && l.status !== 'rejected') {
          actions = `<button class="btn btn-outline btn-sm" onclick="cancelLeave('${l.id}')">Cancel</button>`;
        }
        return `
          <tr>
            <td>${empName}</td>
            <td>${Formatter.capitalize(l.type)}</td>
            <td>${DateUtils.formatDate(l.startDate)}</td>
            <td>${DateUtils.formatDate(l.endDate)}</td>
            <td>${l.days}</td>
            <td><span class="badge badge-${l.status}">${Formatter.capitalize(l.status)}</span></td>
            <td><div class="action-buttons">${actions}</div></td>
          </tr>
        `;
      }).join('');
    }
  }

  document.querySelectorAll('.leave-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.leave-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentLeaveFilter = this.dataset.status;
      renderLeaves();
    });
  });

  document.getElementById('requestLeaveBtn').addEventListener('click', () => {
    document.getElementById('leaveForm').reset();
    showErrors('leaveFormErrors', []);
    renderLeaves(); // refresh employee dropdown
    openModal('leaveModal');
  });

  window.approveLeave = function (id) {
    LeaveModule.approve(id);
    renderLeaves();
  };

  window.rejectLeave = function (id) {
    const reason = prompt('Rejection reason (optional):');
    LeaveModule.reject(id, reason || '');
    renderLeaves();
  };

  window.cancelLeave = function (id) {
    if (confirm('Cancel this leave request?')) {
      LeaveModule.cancel(id);
      renderLeaves();
    }
  };

  document.getElementById('saveLeaveBtn').addEventListener('click', () => {
    const data = {
      employeeId: document.getElementById('leaveEmployee').value,
      type: document.getElementById('leaveType').value,
      startDate: document.getElementById('leaveStart').value,
      endDate: document.getElementById('leaveEnd').value,
      reason: document.getElementById('leaveReason').value,
    };

    const result = LeaveModule.submit(data);
    if (result.success) {
      closeModal('leaveModal');
      renderLeaves();
    } else {
      showErrors('leaveFormErrors', result.errors);
    }
  });

  // ==================== Initial Render ====================
  renderDashboard();
})();
