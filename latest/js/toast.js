// Toast notification functionality
function showToast(message, duration = 5000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Function to show a confirmation dialog
function showConfirm(message) {
    return confirm(message);
} // Toast notification functionality
function showToast(message, duration = 5000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Function to show a confirmation dialog
function showConfirm(message) {
    return confirm(message);
} 