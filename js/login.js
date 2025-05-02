const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const modalClose = document.getElementById('modalClose');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

loginBtn.addEventListener('click', () => {
    if (Auth.isLoggedIn()) {
        window.location.href = 'profile.html';
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