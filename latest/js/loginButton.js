class LoginButton {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.button = document.getElementById('loginBtn');
        if (!this.button) {
            console.warn('Login button not found');
            return;
        }
        this.init();
    }

    init() {
        // Create new button with proper structure
        const newBtn = document.createElement('button');
        newBtn.id = 'loginBtn';
        newBtn.className = 'account-btn';

        // Create profile icon span
        const profileIcon = document.createElement('span');
        profileIcon.className = 'profile-icon';
        profileIcon.textContent = '👤';

        // Create text span
        const textSpan = document.createElement('span');
        textSpan.className = 'login-text';

        // Add hover events - these should work on all pages
        newBtn.addEventListener('mouseenter', () => {
            profileIcon.textContent = '👥';
        });
        newBtn.addEventListener('mouseleave', () => {
            profileIcon.textContent = '👤';
        });

        // Check login state
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
            textSpan.textContent = currentUser.fullName;
            newBtn.onclick = () => {
                if (currentUser.isStaff) {
                    window.location.href = 'staff-dashboard.html';
                } else {
                    window.location.href = 'profile.html';
                }
            };
        } else {
            textSpan.textContent = 'Log In';
            newBtn.onclick = () => {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.classList.add('show');
                }
            };
        }

        // Assemble button
        newBtn.appendChild(profileIcon);
        newBtn.appendChild(textSpan);

        // Replace old button
        this.button.parentNode.replaceChild(newBtn, this.button);
        this.button = newBtn;

        // Update cart button visibility
        this.updateCartButton(currentUser);
        
        // Add emoji transitions to navigation links as well
        this.addNavEmojis();
    }
    
    addNavEmojis() {
        const navItems = document.querySelectorAll('#mainMenu li a');
        
        navItems.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent;
            
            // Create a container to hold both emoji and text
            const container = document.createElement('span');
            container.className = 'nav-link-container';
            
            // Create emoji span
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'nav-emoji';
            
            // Set default and hover emojis based on the link
            if (href.includes('index.html') || href === '/') {
                emojiSpan.textContent = '🏠';
                emojiSpan.setAttribute('data-hover', '🏡');
                emojiSpan.style.marginRight = '5px';
            } else if (href.includes('shop.html')) {
                emojiSpan.textContent = '🛒';
                emojiSpan.setAttribute('data-hover', '🛍️');
                emojiSpan.style.marginRight = '5px';
            } else if (href.includes('faq.html')) {
                emojiSpan.textContent = '💬';
                emojiSpan.setAttribute('data-hover', '🗣️');
                emojiSpan.style.marginRight = '5px';
            } else if (href.includes('aboutus.html')) {
                emojiSpan.textContent = '👨‍👩‍👧‍👦';
                emojiSpan.setAttribute('data-hover', '👪');
                emojiSpan.style.marginRight = '5px';
                emojiSpan.style.fontSize = '0.9em'; // Slightly smaller
            }
            
            // Create text span
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            
            // Add hover events
            link.addEventListener('mouseenter', () => {
                if (emojiSpan.getAttribute('data-hover')) {
                    emojiSpan.textContent = emojiSpan.getAttribute('data-hover');
                }
            });
            
            link.addEventListener('mouseleave', () => {
                const defaultEmoji = 
                    href.includes('index.html') || href === '/' ? '🏠' :
                    href.includes('shop.html') ? '🛒' :
                    href.includes('faq.html') ? '💬' :
                    href.includes('aboutus.html') ? '👨‍👩‍👧‍👦' : '';
                
                if (defaultEmoji) {
                    emojiSpan.textContent = defaultEmoji;
                }
            });
            
            // Clear the link content
            link.textContent = '';
            
            // Assemble and append
            container.appendChild(emojiSpan);
            container.appendChild(textSpan);
            link.appendChild(container);
        });
    }

    updateCartButton(currentUser) {
        const cartBtn = document.getElementById('cartBtn');
        if (!cartBtn) return;

        if (currentUser?.isStaff) {
            cartBtn.classList.add('hidden');
        } else {
            cartBtn.classList.remove('hidden');
            Auth.updateCartCount();
        }
    }
}

// Initialize on page load
new LoginButton(); 