const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const modalClose = document.getElementById('modalClose');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Centralized page access control and redirection
function handlePageAccess() {
    const currentUser = Auth.getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Staff-only pages
    const staffOnlyPages = ['staff-dashboard.html'];
    // Pages requiring any user login
    const loginRequiredPages = ['profile.html', 'cart.html', 'checkout.html'];
    // Pages staff should be redirected from
    const nonStaffPages = ['profile.html', 'cart.html', 'checkout.html'];
    
    if (currentUser) {
        if (currentUser.isStaff) {
            // Staff is logged in
            if (!staffOnlyPages.includes(currentPage) && nonStaffPages.includes(currentPage)) {
                window.location.replace('staff-dashboard.html');
                return;
            }
        } else {
            // Regular user is logged in
            if (staffOnlyPages.includes(currentPage)) {
                window.location.replace('index.html');
                return;
            }
        }
    } else {
        // No user logged in
        if (staffOnlyPages.includes(currentPage) || loginRequiredPages.includes(currentPage)) {
            window.location.replace('index.html');
            return;
        }
    }
}

// Run access control as early as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handlePageAccess);
} else {
    handlePageAccess();
}

loginBtn.addEventListener('click', () => {
    if (Auth.isLoggedIn()) {
        const currentUser = Auth.getCurrentUser();
        if (currentUser.isStaff) {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'profile.html';
        }
    } else {
        loginModal.classList.add('show');
        activateTab('user-login');
    }
});

modalClose.addEventListener('click', () => {
    loginModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('show');
    }
});

function activateTab(tabId) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        activateTab(button.dataset.tab);
    });
});

// Staff login functionality
document.getElementById('staffLoginSubmitBtn').addEventListener('click', () => {
    const staffId = document.getElementById('staff-id').value;
    const password = document.getElementById('staff-password').value;
    
    const result = Auth.staffLogin(staffId, password);
    alert(result.message);
    
    if (result.success) {
        updateAccountButton();
        loginModal.classList.remove('show');
        window.location.href = 'staff-dashboard.html';
    }
});

function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);
    const idToken = response.credential;
    if (!idToken) {
        console.error('No idToken received');
        alert('Google Sign-In failed: No token received');
        return;
    }
    // Try login first
    let result = Auth.googleLogin(idToken);
    console.log('Login Result:', result);
    if (!result.success && result.message.includes("not registered")) {
        // If login fails due to user not existing, attempt registration
        result = Auth.googleRegister(idToken);
        console.log('Registration Result:', result);
    }
    alert(result.message);
    if (result.success) {
        updateAccountButton();
        document.getElementById('loginModal').classList.remove('show');
    }
}