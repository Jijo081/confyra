// Configuration
const API_BASE = 'http://127.0.0.1:5000/api';

// Global State
let currentUser = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('confyra_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        switchPage('appPage');
        initDashboard();
    } else {
        switchPage('loginPage');
    }
});

// UI & Navigation Functions
function switchPage(pageId) {
    document.querySelectorAll('body > div[id$="Page"]').forEach(page => {
        if (page.id === 'toast') return;
        page.classList.remove('active');
        page.classList.add('hidden');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} active`;

    // Position toast based on type for visual difference
    if (type === 'error') {
        toast.style.backgroundColor = '#dc3545';
    } else if (type === 'success') {
        toast.style.backgroundColor = '#28a745';
    } else {
        toast.style.backgroundColor = '#17a2b8';
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.remove('active');
        toast.classList.add('hidden');
    }, 3000);
}

function showSection(sectionId, element) {
    // Update nav links
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    if (element) element.classList.add('active');

    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }

    const titleMap = {
        'dashboard': 'Dashboard',
        'meeting': 'Meeting Management',
        'report': 'Activity Reports',
        'settings': 'Settings & Profile',
        'help': 'Help & Support'
    };
    const titleEl = document.getElementById('topbarTitle');
    if (titleEl && titleMap[sectionId]) {
        titleEl.textContent = titleMap[sectionId];
    }

    // Refresh data based on section
    if (sectionId === 'dashboard') initDashboard();
    if (sectionId === 'meeting') loadMeetings();
    if (sectionId === 'report') loadReports();
    if (sectionId === 'settings') loadSettings();
}

function goToHome() {
    showSection('dashboard', document.querySelector('.nav-links li:first-child'));
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginId').value;
    const password = document.getElementById('loginPass').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data;
            localStorage.setItem('confyra_user', JSON.stringify(data));
            showToast('Login successful!', 'success');
            switchPage('appPage');

            // clear form
            event.target.reset();

            initDashboard();
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
        console.error(error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account created successfully! Please login.', 'success');
            switchPage('loginPage');
            event.target.reset();
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
        console.error(error);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('confyra_user');
    switchPage('loginPage');
    showToast('Logged out successfully', 'success');
}

// Dashboard & Content Functions
function initDashboard() {
    if (!currentUser) return;

    document.getElementById('navUserName').textContent = currentUser.name;
    document.getElementById('navUserRole').textContent = currentUser.role;

    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toDateString();
    }

    const dashboardContent = document.getElementById('dashboardContent');

    if (currentUser.role === 'author') {
        dashboardContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 class="section-title" style="margin: 0;"><i class="fa-solid fa-pen-nib text-purple"></i> Author Dashboard</h3>
                <button class="btn btn-primary" onclick="openModal('submitPaperModal')" style="box-shadow: 0 4px 15px rgba(162,0,255,0.4);">
                    <i class="fa-solid fa-plus"></i> Submit New Paper
                </button>
            </div>
            
            <div class="dash-grid mb-4" id="authorDashStats">
                <div class="dash-card" style="border-top: 3px solid var(--primary-purple);">
                    <i class="fa-solid fa-file-lines text-purple"></i>
                    <h4>Total Papers</h4>
                    <h2 id="statAuthorTotal" style="font-size: 28px; font-weight: 800;">-</h2>
                </div>
                <div class="dash-card" style="border-top: 3px solid #00ffaa;">
                    <i class="fa-solid fa-check-circle" style="color: #00ffaa;"></i>
                    <h4>Accepted</h4>
                    <h2 id="statAuthorAccepted" style="font-size: 28px; font-weight: 800; color: #00ffaa;">-</h2>
                </div>
                <div class="dash-card" style="border-top: 3px solid var(--warning);">
                    <i class="fa-solid fa-clock" style="color: var(--warning);"></i>
                    <h4>Pending</h4>
                    <h2 id="statAuthorPending" style="font-size: 28px; font-weight: 800; color: var(--warning);">-</h2>
                </div>
            </div>

            <h4 class="mb-3 mt-4" style="font-weight: 600; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">Your Recent Submissions</h4>
            <div id="papersList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>
            </div>
        `;
    } else if (currentUser.role === 'admin') {
        dashboardContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 class="section-title" style="margin: 0;"><i class="fa-solid fa-user-shield text-purple"></i> Admin Overview</h3>
                <button class="btn btn-outline" onclick="loadPapers()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
            </div>
            
            <div class="dash-grid mb-4" id="adminDashStats">
                <div class="dash-card" style="border-top: 3px solid var(--primary-purple);">
                    <i class="fa-solid fa-inbox text-purple"></i>
                    <h4>Total Submissions</h4>
                    <h2 id="statAdminTotal" style="font-size: 28px; font-weight: 800;">-</h2>
                </div>
                <div class="dash-card" style="border-top: 3px solid var(--warning);">
                    <i class="fa-solid fa-clipboard-check" style="color: var(--warning);"></i>
                    <h4>Needs Review</h4>
                    <h2 id="statAdminPending" style="font-size: 28px; font-weight: 800; color: var(--warning);">-</h2>
                </div>
            </div>

            <h4 class="mb-3 mt-4" style="font-weight: 600; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">Submission Pipeline</h4>
            <div id="papersList" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: center; color: var(--text-muted); padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>
            </div>
        `;
    }

    loadPapers();
}

async function loadPapers() {
    const listEl = document.getElementById('papersList');
    if (!listEl) return;

    try {
        const response = await fetch(`${API_BASE}/papers`, {
    headers: {
        'x-user-email': currentUser.email
    }
});
        const papers = await response.json();

        let myPapers = [];
        if (currentUser.role === 'author') {
            myPapers = papers.filter(p => p.authorEmail === currentUser.email);
            document.getElementById('statAuthorTotal').textContent = myPapers.length;
            document.getElementById('statAuthorAccepted').textContent = myPapers.filter(p => p.status === 'Accepted').length;
            document.getElementById('statAuthorPending').textContent = myPapers.filter(p => p.status === 'Pending').length;
        } else {
            myPapers = papers;
            document.getElementById('statAdminTotal').textContent = myPapers.length;
            document.getElementById('statAdminPending').textContent = myPapers.filter(p => p.status === 'Pending').length;
        }

        if (myPapers.length === 0) {
            listEl.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);"><i class="fa-solid fa-folder-open mb-3 text-muted" style="font-size: 40px; display:block;"></i><p class="text-muted" style="font-size: 16px;">No papers found.</p></div>';
            return;
        }

        // Sorting: put pending first, then newest based on id or date
        myPapers.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return b.id - a.id;
        });

        let html = '';
        myPapers.forEach(paper => {
            const isAccepted = paper.status === 'Accepted';
            const isRejected = paper.status === 'Rejected';
            const statusIcon = isAccepted ? 'fa-check-circle' : (isRejected ? 'fa-times-circle' : 'fa-clock');
            const statusColor = isAccepted ? '#00ffaa' : (isRejected ? 'var(--danger)' : 'var(--warning)');

            if (currentUser.role === 'author') {
                html += `
                    <div class="paper-card" style="background: rgba(0,0,0,0.3); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center;">
                                <span style="background: rgba(255,255,255,0.03); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                                    <i class="fa-solid ${statusIcon} mr-1"></i> ${paper.status}
                                </span>
                                <small class="text-muted" style="font-size: 12px;"><i class="fa-regular fa-calendar text-purple"></i> ${paper.date}</small>
                            </div>
                            <h4 style="margin-bottom: 12px; font-size: 20px; line-height: 1.4; color: #fff;">${paper.title}</h4>
                            <p style="color: var(--text-muted); font-size: 13px; line-height: 1.5; margin-bottom: 0;">${paper.abstract ? paper.abstract.substring(0, 80) + '...' : 'No description provided.'}</p>
                        </div>
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                            <button class="btn btn-outline btn-block" onclick='viewPaper(${JSON.stringify(paper).replace(/'/g, "&#39;")})' style="padding: 10px; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
                                <span>View Details</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="list-group-item admin-card" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid ${statusColor}; padding: 20px 25px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; gap: 20px; margin-bottom: 5px;">
                        <div style="flex-grow: 1;">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                                <h4 style="margin: 0; font-size: 18px; color: #fff;">${paper.title}</h4>
                                <span class="badge" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40; letter-spacing: 0.5px;">${paper.status}</span>
                            </div>
                            <p class="text-muted" style="margin: 0; font-size: 13px;"><i class="fa-solid fa-user-pen mr-1 text-purple"></i> ${paper.authorEmail} &nbsp; <span style="opacity:0.3">|</span> &nbsp; <i class="fa-regular fa-calendar mx-1 text-purple"></i> ${paper.date}</p>
                        </div>
                        <div>
                            <button class="btn btn-outline" onclick='viewPaper(${JSON.stringify(paper).replace(/'/g, "&#39;")})' style="border-radius: 20px; padding: 8px 20px;">Review</button>
                        </div>
                    </div>
                `;
            }
        });

        listEl.innerHTML = html;

        // Add dynamic hover styles
        if (currentUser.role === 'author') {
            document.querySelectorAll('.paper-card').forEach(card => {
                card.onmouseover = () => { card.style.transform = 'translateY(-5px)'; card.style.borderColor = 'rgba(162, 0, 255, 0.4)'; card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'; };
                card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.borderColor = 'rgba(255,255,255,0.05)'; card.style.boxShadow = 'none'; };
            });
        } else {
            document.querySelectorAll('.admin-card').forEach(card => {
                card.onmouseover = () => { card.style.transform = 'translateX(5px)'; card.style.background = 'rgba(255,255,255,0.03)'; };
                card.onmouseout = () => { card.style.transform = 'translateX(0)'; card.style.background = 'rgba(0,0,0,0.3)'; };
            });
        }
    } catch (error) {
        listEl.innerHTML = '<p class="text-danger">Failed to load papers.</p>';
        console.error(error);
    }
}

async function handlePaperSubmit(event) {
    event.preventDefault();
    if (!currentUser) return;

    const title = document.getElementById('paperTitle').value;
    const abstract = document.getElementById('paperAbstract').value;
    const fileInput = document.getElementById('paperFile');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    if (file) {
        formData.append('file', file);
    }

    try {
        const response = await fetch(`${API_BASE}/papers`, {
            method: 'POST',
            headers: {
                'x-user-email': currentUser.email
            },
            body: formData
        });

        if (response.ok) {
            showToast('Paper submitted successfully!', 'success');
            closeModal('submitPaperModal');
            event.target.reset();
            loadPapers(); // Refresh the list
        } else {
            const data = await response.json();
            showToast(data.error || 'Submission failed', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
        console.error(error);
    }
}

function viewPaper(paper) {
    document.getElementById('viewPaperTitle').textContent = paper.title;
    document.getElementById('viewPaperAuthor').textContent = paper.authorEmail;
    document.getElementById('viewPaperDate').textContent = paper.date;
    document.getElementById('viewPaperAbstract').textContent = paper.abstract || 'No abstract provided.';

    const downloadBtn = document.getElementById('viewPaperDownloadBtn');
    if (paper.filename) {
        downloadBtn.href = `${API_BASE}/uploads/${paper.filename}`;
        downloadBtn.style.display = 'inline-block';
    } else {
        downloadBtn.style.display = 'none';
    }

    const actionsDiv = document.getElementById('viewPaperActions');
    actionsDiv.innerHTML = '';

    if (currentUser.role === 'admin' && paper.status === 'Pending') {
        actionsDiv.innerHTML = `
            <button class="btn btn-success" onclick="reviewPaper(${paper.id}, 'Accepted')"><i class="fa-solid fa-check"></i> Accept</button>
            <button class="btn btn-danger" onclick="reviewPaper(${paper.id}, 'Rejected')"><i class="fa-solid fa-times"></i> Reject</button>
        `;
    }

    openModal('viewPaperModal');
}

async function reviewPaper(paperId, decision) {
    try {
        const response = await fetch(`${API_BASE}/papers/${paperId}/review`, {
            method: 'POST',
            headers: {
    'Content-Type': 'application/json',
    'x-user-email': currentUser.email
},
            body: JSON.stringify({ decision })
        });

        if (response.ok) {
            showToast(`Paper marked as ${decision}`, 'success');
            closeModal('viewPaperModal');
            loadPapers();
        } else {
            showToast('Failed to review paper', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
        console.error(error);
    }
}

function createInstantMeeting() {
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }

    if (currentUser.role !== 'admin') {
        showToast('Only administrators can create instant meetings', 'error');
        return;
    }

    const topic = `Instant Meeting by ${currentUser.name}`;
    const date = new Date().toLocaleString('sv-SE').replace(' ', 'T');

    fetch(`${API_BASE}/meetings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
        },
        body: JSON.stringify({
            topic: topic,
            date: date,
            type: 'Instant',
            meeting_link: ''
        })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create meeting');
        }

        return data;
    })
    .then(() => {
    showToast('Instant meeting created!', 'success');
    loadMeetings();
    setTimeout(() => {
        loadMeetings();
    }, 500);
})
    .catch(error => {
        showToast(error.message, 'error');
        console.error('Instant meeting error:', error);
    });
}

async function loadMeetings() {
    const listEl = document.getElementById('meetingList');

    if (!listEl || !currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/meetings`, {
            headers: {
                'x-user-email': currentUser.email
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load meetings');
        }

        const meetings = await response.json();

        if (meetings.length === 0) {
            listEl.innerHTML = `
                <li class="list-group-item">
                    No upcoming meetings.
                </li>
            `;
            return;
        }

        let html = '';

        meetings.forEach(meeting => {
            const date = new Date(meeting.date).toLocaleString();

            html += `
                <li class="list-group-item"
                    style="display:flex;
                           justify-content:space-between;
                           align-items:center;
                           padding:15px;
                           margin-bottom:10px;">

                    <div>
                        <strong>${meeting.topic}</strong>

                        <span class="badge">
                            ${meeting.type}
                        </span>

                        <p class="mb-0">
                            <small>
                                <i class="fa-regular fa-clock"></i>
                                ${date}
                            </small>
                        </p>
                    </div>

                    ${
                        meeting.meeting_link
                        ? `<a href="${meeting.meeting_link}"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="btn btn-sm btn-outline">
                              Join
                           </a>`
                        : `<span class="text-muted">
                              Link unavailable
                           </span>`
                    }

                </li>
            `;
        });

        listEl.innerHTML = html;

    } catch (error) {
        listEl.innerHTML = `
            <li class="list-group-item text-danger">
                Failed to load meetings.
            </li>
        `;

        console.error('Meeting loading error:', error);
    }
}

// Settings & Reports
function loadSettings() {
    if (!currentUser) return;
    document.getElementById('setUserId').textContent = currentUser.email;
    document.getElementById('setUserName').textContent = currentUser.name;
    document.getElementById('setUserRole').textContent = currentUser.role;
}

async function handleChangePassword(event) {
    event.preventDefault();
    if (!currentUser) return;

    const newPass = document.getElementById('newPass').value;

    try {
        const response = await fetch(`${API_BASE}/me/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser.email
            },
            body: JSON.stringify({ newPassword: newPass })
        });

        if (response.ok) {
            showToast('Password updated easily', 'success');
            event.target.reset();
        } else {
            showToast('Failed to update password', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
        console.error(error);
    }
}

async function loadReports() {
    const reportContent = document.getElementById('reportContent');
    // Fetch stats (can compute from papers and meetings)
    try {
        const [papersRes, meetingsRes] = await Promise.all([
    fetch(`${API_BASE}/papers`, {
        headers: {
            'x-user-email': currentUser.email
        }
    }),
    fetch(`${API_BASE}/meetings`, {
        headers: {
            'x-user-email': currentUser.email
        }
    })
]);
        const papers = await papersRes.json();
        const meetings = await meetingsRes.json();

        const myPapers = papers.filter(p => currentUser.role === 'admin' || p.authorEmail === currentUser.email);
        const accepted = myPapers.filter(p => p.status === 'Accepted').length;
        const rejected = myPapers.filter(p => p.status === 'Rejected').length;
        const pending = myPapers.filter(p => p.status === 'Pending').length;

        reportContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 class="text-purple">${myPapers.length}</h2>
                    <p>Total Papers</p>
                </div>
                <div style="background: rgba(40,167,69,0.1); border: 1px solid rgba(40,167,69,0.3); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 class="text-success">${accepted}</h2>
                    <p>Accepted</p>
                </div>
                <div style="background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.3); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 class="text-danger">${rejected}</h2>
                    <p>Rejected</p>
                </div>
                <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 class="text-warning">${pending}</h2>
                    <p>Pending</p>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 class="text-purple">${meetings.length}</h2>
                    <p>Total Meetings</p>
                </div>
            </div>
        `;
    } catch (e) {
        reportContent.innerHTML = '<p class="text-danger">Failed to load reports.</p>';
    }
}
function handleScheduleMeeting(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }

    if (currentUser.role !== 'admin') {
        showToast('Only administrators can schedule meetings', 'error');
        return;
    }

    const topic = document.getElementById('meetingTopic').value.trim();
    const date = document.getElementById('meetingDateTime').value;
    const meetingLink = document.getElementById('meetingLink').value.trim();

    if (!topic || !date || !meetingLink) {
        showToast('Please fill in all meeting details', 'error');
        return;
    }

    fetch(`${API_BASE}/meetings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
        },
        body: JSON.stringify({
            topic: topic,
            date: date,
            type: 'Scheduled',
            meeting_link: meetingLink
        })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to schedule meeting');
        }

        return data;
    })
    .then(() => {
        showToast('Meeting scheduled successfully!', 'success');

        closeModal('scheduleMeetingModal');

        document.getElementById('meetingTopic').value = '';
        document.getElementById('meetingDateTime').value = '';
        document.getElementById('meetingLink').value = '';

        loadMeetings();
    })
    .catch(error => {
        showToast(error.message, 'error');
        console.error('Schedule meeting error:', error);
    });
}
