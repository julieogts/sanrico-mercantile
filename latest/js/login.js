// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Only set up event listeners if elements exist
    if (loginBtn && loginModal && modalClose) {
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
    }

    // Tab functionality
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const activeContent = document.querySelector('.tab-content.active');
                if (activeContent) {
                    const currentTabId = activeContent.id;
                    const newTabId = button.dataset.tab;
                    
                    if (currentTabId !== newTabId) {
                        activateTab(newTabId);
                    }
                }
            });
        });
    }

    // Staff login functionality
    const staffLoginBtn = document.getElementById('staffLoginSubmitBtn');
    if (staffLoginBtn) {
        staffLoginBtn.addEventListener('click', () => {
            const staffId = document.getElementById('staff-id')?.value;
            const password = document.getElementById('staff-password')?.value;
            
            if (!staffId || !password) {
                showToast('Please enter both staff ID and password');
                return;
            }
            
            const result = Auth.staffLogin(staffId, password);
            showToast(result.message);
            
            if (result.success) {
                updateAccountButton();
                loginModal.classList.remove('show');
                window.location.href = 'staff-dashboard.html';
            }
        });
    }

    // Initialize the indicator position and height
    const activeButton = document.querySelector('.tab-btn.active');
    if (activeButton) {
        const buttonWidth = activeButton.offsetWidth;
        const buttonOffsetLeft = activeButton.offsetLeft;
        const tabButtonsContainer = document.querySelector('.tab-buttons');
        const modalContent = document.querySelector('.modal-content');
        const activeContent = document.querySelector('.tab-content.active');
        
        if (tabButtonsContainer && modalContent && activeContent) {
            const contentHeight = activeContent.offsetHeight;
            const extraPadding = 40;
            const totalHeight = contentHeight + 160 + extraPadding;
            modalContent.style.height = `${totalHeight}px`;
            
            tabButtonsContainer.style.setProperty('--tab-width', `${buttonWidth}px`);
            tabButtonsContainer.style.setProperty('--tab-offset', `${buttonOffsetLeft}px`);
        }
    }
});

// Helper Functions
function activateTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const tabButtonsContainer = document.querySelector('.tab-buttons');
    const modalContent = document.querySelector('.modal-content');
    const activeContent = document.getElementById(tabId);

    if (!activeButton || !tabButtonsContainer || !modalContent || !activeContent) {
        console.error('Required elements not found for tab activation');
        return;
    }

    // Remove active class from all tabs and buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and button
    activeButton.classList.add('active');
    activeContent.classList.add('active');

    // Update the indicator position
    const buttonWidth = activeButton.offsetWidth;
    const buttonOffsetLeft = activeButton.offsetLeft;
    
    tabButtonsContainer.style.setProperty('--tab-width', `${buttonWidth}px`);
    tabButtonsContainer.style.setProperty('--tab-offset', `${buttonOffsetLeft}px`);

    // Update modal height smoothly with extra padding
    requestAnimationFrame(() => {
        const contentHeight = activeContent.offsetHeight;
        const extraPadding = 40;
        const totalHeight = contentHeight + 160 + extraPadding;
        modalContent.style.height = `${totalHeight}px`;
    });
}

// Google Sign-In handler
function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);
    const idToken = response.credential;
    if (!idToken) {
        console.error('No idToken received');
        showToast('Google Sign-In failed: No token received');
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
    showToast(result.message);
    if (result.success) {
        updateAccountButton();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('show');
        }
        // Refresh the page to update all components
        window.location.reload();
    }
}

function updateAccountButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    // Remove any existing click listeners
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
    
    if (Auth.isLoggedIn()) {
        const currentUser = Auth.getCurrentUser();
        newBtn.addEventListener('click', () => {
            if (currentUser.isStaff) {
                window.location.href = 'staff-dashboard.html';
            } else {
                window.location.href = 'profile.html';
            }
        });
        newBtn.textContent = currentUser.isStaff ? 'Staff Dashboard' : 'My Account';
    } else {
        newBtn.textContent = 'Log In';
        newBtn.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('show');
            }
        });
    }

    // Update cart button visibility
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        if (Auth.isLoggedIn() && !Auth.getCurrentUser().isStaff) {
            cartBtn.classList.remove('hidden');
            Auth.updateCartCount();
        } else {
            cartBtn.classList.add('hidden');
        }
    }
}