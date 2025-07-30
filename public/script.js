// ===== GLOBAL VARIABLES =====
let currentUser = null;
let currentPage = '';
let isAuthenticated = false;

// ===== UTILITY FUNCTIONS =====
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    currentPage = getCurrentPage();
    initializePage();
    
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Initialize page-specific functionality
    switch(currentPage) {
        case 'index.html':
            initializeHomePage();
            break;
        case 'donor.html':
            initializeDonorPage();
            break;
        case 'recipient.html':
            initializeRecipientPage();
            break;
        case 'admin.html':
            initializeAdminPage();
            break;
        case 'donordashboard.html':
            initializeDonorDashboard();
            break;
        case 'recipientdashboard.html':
            initializeRecipientDashboard();
            break;
        case 'admindashboard.html':
            initializeAdminDashboard();
            break;
    }
});

// ===== AUTHENTICATION =====
function setCurrentUser(user) {
    currentUser = user;
    isAuthenticated = true;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
}

function getCurrentUser() {
    if (!currentUser) {
        const storedUser = localStorage.getItem('currentUser');
        const storedAuth = localStorage.getItem('isAuthenticated');
        
        if (storedUser && storedAuth === 'true') {
            currentUser = JSON.parse(storedUser);
            isAuthenticated = true;
        }
    }
    return currentUser;
}

function logout() {
    currentUser = null;
    isAuthenticated = false;
    localStorage.clear();
    
    showToast('success', 'Logged Out', 'You have been successfully logged out.');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===== PAGE INITIALIZATION =====
function initializePage() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== HOME PAGE FUNCTIONS =====
function initializeHomePage() {
    loadOrganAvailability();
    initializeCounters();
    initializeContactForm();
    initializeSmoothScrolling();
}

function loadOrganAvailability() {
    const container = document.getElementById('organAvailability');
    if (!container) return;
    
    const organData = [
        { type: 'kidney', name: 'Kidney', available: 12, needed: 25, icon: 'fas fa-circle' },
        { type: 'liver', name: 'Liver', available: 8, needed: 15, icon: 'fas fa-square' },
        { type: 'heart', name: 'Heart', available: 3, needed: 12, icon: 'fas fa-heart' },
        { type: 'lungs', name: 'Lungs', available: 5, needed: 18, icon: 'fas fa-lungs' },
        { type: 'pancreas', name: 'Pancreas', available: 2, needed: 8, icon: 'fas fa-circle' },
        { type: 'cornea', name: 'Cornea', available: 15, needed: 30, icon: 'fas fa-eye' }
    ];
    
    container.innerHTML = organData.map(organ => `
        <div class="availability-card" data-organ="${organ.type}">
            <div class="card-header">
                <div class="card-icon ${organ.type}">
                    <i class="${organ.icon}"></i>
                </div>
                <h3 class="card-title">${organ.name}</h3>
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-number">${organ.available}</div>
                    <div class="stat-label">Available</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${organ.needed}</div>
                    <div class="stat-label">Needed</div>
                </div>
            </div>
        </div>
    `).join('');
    
    const cards = container.querySelectorAll('.availability-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeIn 0.6s ease-out forwards';
    });
}

function initializeCounters() {
    const counterElements = document.querySelectorAll('.stat-number[data-target]');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, stepTime);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counterElements.forEach(element => {
        observer.observe(element);
    });
}

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('success', 'Message Sent', 'Thank you for your message. We\'ll get back to you soon!');
        contactForm.reset();
    });
}

function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== AUTH PAGE FUNCTIONS =====
function initializeDonorPage() {
    initializeAuthForms('donor');
}

function initializeRecipientPage() {
    initializeAuthForms('recipient');
}

function initializeAdminPage() {
    const adminForm = document.getElementById('adminLoginForm');
    if (!adminForm) return;
    
    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAdminLogin();
    });
}

function initializeAuthForms(userType) {
    const loginForm = document.getElementById(`${userType}LoginForm`);
    const registerForm = document.getElementById(`${userType}RegisterForm`);
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(userType);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister(userType);
        });
    }
}

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ===== UPDATED API AUTHENTICATION HANDLERS =====
async function handleLogin(userType) {
    const form = document.getElementById(`${userType}LoginForm`);
    const formData = new FormData(form);
    
    try {
        console.log('Attempting login for:', userType);
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                userType: userType
            })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            setCurrentUser(user);
            showToast('success', 'Login Successful', `Welcome back, ${user.name}!`);
            setTimeout(() => {
                redirectToDashboard(userType);
            }, 1500);
        } else {
            console.error('Invalid response structure:', data);
            showToast('error', 'Login Failed', data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('error', 'Error', 'Network error. Please check your connection and try again.');
    }
}

async function handleRegister(userType) {
    const form = document.getElementById(`${userType}RegisterForm`);
    const formData = new FormData(form);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showToast('error', 'Password Mismatch', 'Passwords do not match. Please try again.');
        return;
    }
    
    try {
        console.log('Attempting registration for:', userType);
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: password,
                userType: userType,
                age: formData.get('age')
            })
        });
        
        const data = await response.json();
        console.log('Registration response:', data);
        
        if (data.success) {
            showToast('success', 'Registration Successful', 'Account created successfully! Please sign in.');
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            showToast('error', 'Registration Failed', data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('error', 'Error', 'Network error. Please check your connection and try again.');
    }
}

async function handleAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    const formData = new FormData(form);
    
    try {
        console.log('Attempting admin login');
        
        const response = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                securityCode: formData.get('securityCode')
            })
        });
        
        const data = await response.json();
        console.log('Admin login response:', data);
        
        if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            setCurrentUser(user);
            showToast('success', 'Admin Access Granted', 'Welcome to the admin panel.');
            setTimeout(() => {
                window.location.href = 'admindashboard.html';
            }, 1500);
        } else {
            showToast('error', 'Access Denied', data.message);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showToast('error', 'Error', 'Network error. Please check your connection and try again.');
    }
}

function redirectToDashboard(userType) {
    const dashboards = {
        'donor': 'donordashboard.html',
        'recipient': 'recipientdashboard.html',
        'admin': 'admindashboard.html'
    };
    
    if (dashboards[userType]) {
        window.location.href = dashboards[userType];
    }
}

// ===== DASHBOARD FUNCTIONS =====
function initializeDonorDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== 'donor') {
        showToast('warning', 'Access Required', 'Please login as a donor first.');
        setTimeout(() => {
            window.location.href = 'donor.html';
        }, 2000);
        return;
    }
    
    updateUserInfo();
    loadDonorData();
    initializeDonationModal();
    initializeFilters();
}

function initializeRecipientDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== 'recipient') {
        showToast('warning', 'Access Required', 'Please login as a recipient first.');
        setTimeout(() => {
            window.location.href = 'recipient.html';
        }, 2000);
        return;
    }
    
    updateUserInfo();
    loadRecipientData();
    initializeRequestModal();
    initializeFilters();
}

function initializeAdminDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showToast('warning', 'Access Required', 'Please login as admin first.');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
        return;
    }
    
    updateUserInfo();
    initializeAdminSections();
    loadAdminData();
    initializeRequestReviewModal();
}

function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(element => {
        element.textContent = user.name;
    });
    
    // Update profile info
    const profileElements = {
        profileName: user.name,
        profileEmail: user.email,
        profilePhone: user.phone,
        profileJoined: formatDate(user.registeredAt || user.createdAt)
    };
    
    Object.entries(profileElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// ===== API DATA LOADING =====
async function loadDonorData() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        // Load donor stats
        const statsResponse = await fetch(`/api/donor/stats?donorId=${user._id}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            document.getElementById('totalDonations').textContent = statsData.data.total;
            document.getElementById('matchedDonations').textContent = statsData.data.matched;
            document.getElementById('availableDonations').textContent = statsData.data.available;
            document.getElementById('usedDonations').textContent = statsData.data.used;
        }
        
        // Load donor donations
        const donationsResponse = await fetch(`/api/donor/donations?donorId=${user._id}`);
        const donationsData = await donationsResponse.json();
        
        if (donationsData.success) {
            displayDonations(donationsData.data);
        }
    } catch (error) {
        console.error('Load donor data error:', error);
        showToast('error', 'Error', 'Failed to load donor data.');
    }
}

async function loadRecipientData() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        // Load recipient stats
        const statsResponse = await fetch(`/api/recipient/stats?recipientId=${user._id}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            document.getElementById('totalRequests').textContent = statsData.data.total;
            document.getElementById('matchedRequests').textContent = statsData.data.matched;
            document.getElementById('pendingRequests').textContent = statsData.data.pending;
            document.getElementById('approvedRequests').textContent = statsData.data.approved;
        }
        
        // Load recipient requests
        const requestsResponse = await fetch(`/api/recipient/requests?recipientId=${user._id}`);
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
            displayRequests(requestsData.data);
        }
        
        // Load potential matches
        const matchesResponse = await fetch(`/api/recipient/matches?recipientId=${user._id}`);
        const matchesData = await matchesResponse.json();
        
        if (matchesData.success) {
            displayPotentialMatches(matchesData.data);
        }
    } catch (error) {
        console.error('Load recipient data error:', error);
        showToast('error', 'Error', 'Failed to load recipient data.');
    }
}

async function loadAdminData() {
    try {
        // Load admin overview
        const overviewResponse = await fetch('/api/admin/overview');
        const overviewData = await overviewResponse.json();
        
        if (overviewData.success) {
            const data = overviewData.data;
            document.getElementById('totalDonors').textContent = data.totalDonors.toLocaleString();
            document.getElementById('totalRecipients').textContent = data.totalRecipients.toLocaleString();
            document.getElementById('totalMatches').textContent = data.totalMatches.toLocaleString();
            document.getElementById('pendingActions').textContent = data.pendingActions;
            
            displayOrganBreakdown(data.organBreakdown);
            displayActivityFeed(data.recentActivity);
        }
        
        // Load pending requests
        const requestsResponse = await fetch('/api/admin/requests/pending');
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
            displayPendingRequestsTable(requestsData.data);
        }
    } catch (error) {
        console.error('Load admin data error:', error);
        showToast('error', 'Error', 'Failed to load admin data.');
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayDonations(donations) {
    const container = document.getElementById('donationsContainer');
    if (!container) return;
    
    if (donations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h3>No Donations Yet</h3>
                <p>Start saving lives by registering your first organ donation.</p>
                <button class="btn btn-primary" onclick="showDonationModal()">
                    <i class="fas fa-plus"></i>
                    Register Donation
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="donation-card ${donation.status}" data-donation-id="${donation._id}">
            <div class="card-header">
                <div class="organ-type">
                    <div class="organ-icon ${donation.organType}">
                        <i class="${getOrganIcon(donation.organType)}"></i>
                    </div>
                    ${capitalizeFirst(donation.organType)}
                </div>
                <span class="status-badge ${donation.status}">${donation.status}</span>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Blood Group</span>
                    <span class="detail-value">${donation.bloodGroup}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">City</span>
                    <span class="detail-value">${donation.city}</span>
                </div>
            </div>
            <div class="card-footer">
                <span>Registered: ${formatDate(donation.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function displayRequests(requests) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-medical"></i>
                <h3>No Requests Yet</h3>
                <p>Submit your first organ request to find potential donors.</p>
                <button class="btn btn-secondary" onclick="showRequestModal()">
                    <i class="fas fa-plus"></i>
                    Submit Request
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-card ${request.status}" data-request-id="${request._id}">
            <div class="card-header">
                <div class="organ-type">
                    <div class="organ-icon ${request.organType}">
                        <i class="${getOrganIcon(request.organType)}"></i>
                    </div>
                    ${capitalizeFirst(request.organType)}
                </div>
                <span class="status-badge ${request.status}">${request.status}</span>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Blood Group</span>
                    <span class="detail-value">${request.bloodGroup}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Urgency</span>
                    <span class="detail-value">${capitalizeFirst(request.urgency)}</span>
                </div>
            </div>
            <div class="card-footer">
                <span>Submitted: ${formatDate(request.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function displayPotentialMatches(matches) {
    const container = document.getElementById('matchesContainer');
    if (!container) return;
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Matches Found</h3>
                <p>We're actively searching for compatible donors. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matches.map(match => `
        <div class="match-card">
            <div class="match-header">
                <h4>Compatible Donor Found</h4>
                <span class="match-score">${match.compatibility}% Match</span>
            </div>
            <div class="match-details">
                <div class="match-person">
                    <h5>Donor Information</h5>
                    <div class="person-info">
                        <span><strong>Organ:</strong> ${capitalizeFirst(match.organType)}</span>
                        <span><strong>Blood Group:</strong> ${match.bloodGroup}</span>
                        <span><strong>Location:</strong> ${match.city}</span>
                    </div>
                </div>
            </div>
            <div class="match-actions">
                <button class="btn btn-secondary" onclick="contactAdmin('${match._id}')">
                    <i class="fas fa-phone"></i>
                    Contact Admin
                </button>
            </div>
        </div>
    `).join('');
}

function displayOrganBreakdown(breakdown) {
    const container = document.getElementById('organBreakdown');
    if (!container) return;
    
    container.innerHTML = breakdown.map(item => `
        <div class="organ-item">
            <span>${item.organType}</span>
            <span><strong>${item.count}</strong></span>
        </div>
    `).join('');
}

function displayActivityFeed(activities) {
    const container = document.getElementById('activityFeed');
    if (!container) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function displayPendingRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = requests.map(request => `
        <tr data-request-id="${request._id}">
            <td>${request.patientName}</td>
            <td>${capitalizeFirst(request.organType)}</td>
            <td>${request.bloodGroup}</td>
            <td>
                <span class="urgency-badge ${request.urgency}">
                    ${capitalizeFirst(request.urgency)}
                </span>
            </td>
            <td>
                <span class="status-badge ${request.status}">
                    ${capitalizeFirst(request.status)}
                </span>
            </td>
            <td>${formatDate(request.createdAt)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-primary" onclick="reviewRequest('${request._id}')">
                        <i class="fas fa-eye"></i>
                        Review
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== MODAL FUNCTIONS =====
function initializeDonationModal() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;
    
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleDonationSubmission();
    });
}

function initializeRequestModal() {
    const requestForm = document.getElementById('requestForm');
    if (!requestForm) return;
    
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRequestSubmission();
    });
}

async function handleDonationSubmission() {
    const form = document.getElementById('donationForm');
    const formData = new FormData(form);
    const user = getCurrentUser();
    
    try {
        const response = await fetch('/api/donor/donation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                donorId: user._id,
                organType: formData.get('organType'),
                bloodGroup: formData.get('bloodGroup'),
                city: formData.get('city'),
                medicalHistory: formData.get('medicalHistory')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Donation Registered', 'Your organ donation has been registered successfully!');
            closeDonationModal();
            form.reset();
            loadDonorData();
        } else {
            showToast('error', 'Registration Failed', data.message);
        }
    } catch (error) {
        console.error('Donation submission error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

async function handleRequestSubmission() {
    const form = document.getElementById('requestForm');
    const formData = new FormData(form);
    const user = getCurrentUser();
    
    try {
        const response = await fetch('/api/recipient/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipientId: user._id,
                organType: formData.get('organType'),
                bloodGroup: formData.get('bloodGroup'),
                urgency: formData.get('urgency'),
                reason: formData.get('reason'),
                hospital: formData.get('hospital')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Request Submitted', 'Your organ request has been submitted for review.');
            closeRequestModal();
            form.reset();
            loadRecipientData();
        } else {
            showToast('error', 'Submission Failed', data.message);
        }
    } catch (error) {
        console.error('Request submission error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

function showDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function showRequestModal() {
    const modal = document.getElementById('requestModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== ADMIN FUNCTIONS =====
function initializeAdminSections() {
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetSection = this.getAttribute('href').substring(1);
            const section = document.getElementById(targetSection);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}


async function reviewRequest(requestId) {
    try {
        const response = await fetch(`/api/admin/requests/${requestId}`);
        const data = await response.json();
        
        if (data.success) {
            showRequestReviewModal(data.data);
        } else {
            showToast('error', 'Error', 'Failed to load request details.');
        }
    } catch (error) {
        console.error('Review request error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

function showRequestReviewModal(request) {
    const modal = document.getElementById('reviewModal');
    const modalBody = document.getElementById('reviewModalBody');
    
    modalBody.innerHTML = `
        <div class="request-details">
            <h4>Patient Information</h4>
            <div class="info-grid">
                <div class="info-item">
                    <label>Name:</label>
                    <span>${request.patientName}</span>
                </div>
                <div class="info-item">
                    <label>Email:</label>
                    <span>${request.email}</span>
                </div>
                <div class="info-item">
                    <label>Phone:</label>
                    <span>${request.phone}</span>
                </div>
                <div class="info-item">
                    <label>Age:</label>
                    <span>${request.age}</span>
                </div>
            </div>
            
            <h4>Medical Information</h4>
            <div class="info-grid">
                <div class="info-item">
                    <label>Organ Needed:</label>
                    <span>${capitalizeFirst(request.organType)}</span>
                </div>
                <div class="info-item">
                    <label>Blood Group:</label>
                    <span>${request.bloodGroup}</span>
                </div>
                <div class="info-item">
                    <label>Urgency:</label>
                    <span>${capitalizeFirst(request.urgency)}</span>
                </div>
                <div class="info-item">
                    <label>Preferred Hospital:</label>
                    <span>${request.hospital || 'Not specified'}</span>
                </div>
            </div>
            
            <h4>Medical Reason</h4>
            <div class="reason-text">
                ${request.reason}
            </div>
        </div>
    `;
    
    modal.setAttribute('data-request-id', request._id);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRequestReviewModal() {
    const modal = document.getElementById('reviewModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function approveRequest() {
    const modal = document.getElementById('reviewModal');
    const requestId = modal.getAttribute('data-request-id');
    const user = getCurrentUser();
    
    try {
        const response = await fetch(`/api/admin/requests/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminId: user._id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Request Approved', 'The organ request has been approved.');
            closeRequestReviewModal();
            loadAdminData();
        } else {
            showToast('error', 'Approval Failed', data.message);
        }
    } catch (error) {
        console.error('Approve request error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

async function rejectRequest() {
    const modal = document.getElementById('reviewModal');
    const requestId = modal.getAttribute('data-request-id');
    const user = getCurrentUser();
    
    try {
        const response = await fetch(`/api/admin/requests/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminId: user._id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('warning', 'Request Rejected', 'The organ request has been rejected.');
            closeRequestReviewModal();
            loadAdminData();
        } else {
            showToast('error', 'Rejection Failed', data.message);
        }
    } catch (error) {
        console.error('Reject request error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

function initializeRequestReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeRequestReviewModal();
            }
        });
    }
}

async function refreshData() {
    showToast('info', 'Refreshing', 'Updating dashboard data...');
    
    const activeSection = document.querySelector('.admin-section.active');
    
    if (activeSection) {
        await loadAdminData();
    }
    
    showToast('success', 'Updated', 'Dashboard data has been refreshed.');
}

// ===== UTILITY FUNCTIONS =====
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            applyStatusFilter(this.value);
        });
    }
    
    const requestStatusFilter = document.getElementById('requestStatusFilter');
    if (requestStatusFilter) {
        requestStatusFilter.addEventListener('change', function() {
            applyRequestStatusFilter(this.value);
        });
    }
    
    const requestOrganFilter = document.getElementById('requestOrganFilter');
    if (requestOrganFilter) {
        requestOrganFilter.addEventListener('change', function() {
            applyRequestOrganFilter(this.value);
        });
    }
}

function applyStatusFilter(status) {
    const cards = document.querySelectorAll('.donation-card, .request-card');
    
    cards.forEach(card => {
        if (status === 'all' || card.classList.contains(status)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyRequestStatusFilter(status) {
    const rows = document.querySelectorAll('#requestsTableBody tr');
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        if (status === 'all' || statusBadge.classList.contains(status)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function applyRequestOrganFilter(organ) {
    const rows = document.querySelectorAll('#requestsTableBody tr');
    
    rows.forEach(row => {
        const organCell = row.cells[1].textContent.toLowerCase();
        if (organ === 'all' || organCell === organ) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function editProfile() {
    showToast('info', 'Coming Soon', 'Profile editing functionality will be available soon.');
}

function contactAdmin(matchId) {
    showToast('info', 'Contact Admin', 'Our admin team will contact you within 24 hours regarding this match.');
}

function getOrganIcon(organType) {
    const icons = {
        kidney: 'fas fa-circle',
        liver: 'fas fa-square',
        heart: 'fas fa-heart',
        lungs: 'fas fa-lungs',
        pancreas: 'fas fa-circle',
        cornea: 'fas fa-eye',
        bone: 'fas fa-bone',
        skin: 'fas fa-hand-paper'
    };
    return icons[organType] || 'fas fa-circle';
}

function getActivityIcon(type) {
    const icons = {
        donation: 'fas fa-heart',
        request: 'fas fa-file-medical',
        match: 'fas fa-handshake',
        approval: 'fas fa-check',
        rejection: 'fas fa-times'
    };
    return icons[type] || 'fas fa-info';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(type, title, message) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center;">
            <div>
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${title}</h4>
                <p style="margin: 0; font-size: 13px; opacity: 0.9;">${message}</p>
            </div>
            <button onclick="closeToast(this)" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; margin-left: 12px;">×</button>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        closeToast(toast.querySelector('button'));
    }, 5000);
}

function closeToast(button) {
    const toast = button.closest('.toast');
    toast.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// ===== EVENT LISTENERS =====
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
// Add debug logging to loadAdminMatches function
async function loadAdminMatches() {
    try {
        console.log('Loading admin matches...'); // Debug log
        const response = await fetch('/api/admin/matches');
        console.log('Response status:', response.status); // Debug log
        
        const data = await response.json();
        console.log('Matches data:', data); // Debug log
        
        if (data.success) {
            displayAdminMatches(data.data);
        } else {
            console.error('Failed to load matches:', data.message);
        }
    } catch (error) {
        console.error('Load admin matches error:', error);
        showToast('error', 'Error', 'Failed to load matches.');
    }
}

// Display matches in admin panel
function displayAdminMatches(matches) {
    const container = document.getElementById('matchesContainer');
    if (!container) return;
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Potential Matches</h3>
                <p>No compatible donor-recipient matches found at this time.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matches.map(match => `
        <div class="match-admin-card">
            <div class="match-header">
                <h4>${capitalizeFirst(match.organType)} Match</h4>
                <span class="compatibility-score">${match.compatibility}% Compatible</span>
                <span class="urgency-badge ${match.recipient.urgency}">${capitalizeFirst(match.recipient.urgency)}</span>
            </div>
            
            <div class="match-details">
                <div class="person-section">
                    <h5>👤 Recipient</h5>
                    <p><strong>Name:</strong> ${match.recipient.name}</p>
                    <p><strong>Age:</strong> ${match.recipient.age}</p>
                    <p><strong>Blood Group:</strong> ${match.recipient.bloodGroup}</p>
                    <p><strong>Hospital:</strong> ${match.recipient.hospital || 'Not specified'}</p>
                    <p><strong>Contact:</strong> ${match.recipient.email}</p>
                </div>
                
                <div class="person-section">
                    <h5>❤️ Donor</h5>
                    <p><strong>Name:</strong> ${match.donor.name}</p>
                    <p><strong>Blood Group:</strong> ${match.donor.bloodGroup}</p>
                    <p><strong>Location:</strong> ${match.donor.city}</p>
                    <p><strong>Contact:</strong> ${match.donor.email}</p>
                </div>
            </div>
            
            <div class="match-actions">
                <button class="btn btn-success" onclick="confirmMatch('${match.requestId}', '${match.donationId}')">
                    <i class="fas fa-check"></i>
                    Confirm Match
                </button>
                <button class="btn btn-info" onclick="viewMatchDetails('${match.requestId}', '${match.donationId}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Confirm a match
async function confirmMatch(requestId, donationId) {
    const user = getCurrentUser();
    
    if (!confirm('Are you sure you want to confirm this match? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/matches/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestId,
                donationId,
                adminId: user._id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Match Confirmed', 'The donor and recipient have been successfully matched!');
            loadAdminMatches(); // Reload matches
            loadAdminData(); // Reload overview stats
        } else {
            showToast('error', 'Match Failed', data.message);
        }
    } catch (error) {
        console.error('Confirm match error:', error);
        showToast('error', 'Error', 'Network error. Please try again.');
    }
}

// Update the loadAdminData function to include matches
async function loadAdminData() {
    try {
        // Load admin overview
        const overviewResponse = await fetch('/api/admin/overview');
        const overviewData = await overviewResponse.json();
        
        if (overviewData.success) {
            const data = overviewData.data;
            document.getElementById('totalDonors').textContent = data.totalDonors.toLocaleString();
            document.getElementById('totalRecipients').textContent = data.totalRecipients.toLocaleString();
            document.getElementById('totalMatches').textContent = data.totalMatches.toLocaleString();
            document.getElementById('pendingActions').textContent = data.pendingActions;
            
            displayOrganBreakdown(data.organBreakdown);
            displayActivityFeed(data.recentActivity);
        }
        
        // Load pending requests
        const requestsResponse = await fetch('/api/admin/requests/pending');
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
            displayPendingRequestsTable(requestsData.data);
        }
        
        // Load matches if on matches section
        const matchesSection = document.getElementById('matches');
        if (matchesSection && matchesSection.classList.contains('active')) {
            loadAdminMatches();
        }
    } catch (error) {
        console.error('Load admin data error:', error);
        showToast('error', 'Error', 'Failed to load admin data.');
    }
}


document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});
