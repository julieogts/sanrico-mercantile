class Auth {
    static register(fullName, email, password) {
        const users = this.getUsers();
        if (users.find(user => user.email === email)) {
            return { success: false, message: 'Email already exists' };
        }
        
        const user = {
            id: Date.now(),
            fullName,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        this.setCurrentUser(user);
        return { success: true, message: 'Registration successful' };
    }

    static login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        this.setCurrentUser(user);
        return { success: true, message: 'Login successful' };
    }

    static logout() {
        console.log('Auth.logout called at:', new Date().toISOString());
        try {
            if (typeof localStorage !== 'undefined') {
                console.log('Current user before logout:', localStorage.getItem('currentUser'));
                localStorage.removeItem('currentUser');
                console.log('Current user after logout:', localStorage.getItem('currentUser'));
                updateAccountButton();
                return { success: true, message: 'Logout successful' };
            } else {
                console.warn('localStorage is not available');
                return { success: false, message: 'Logout failed: localStorage unavailable' };
            }
        } catch (error) {
            console.error('Error during logout:', error);
            return { success: false, message: 'Logout failed due to an error' };
        }
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    static updateUserDetails(userId, fullName, email) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        if (users.some(u => u.email === email && u.id !== userId)) {
            return { success: false, message: 'Email already in use' };
        }

        users[userIndex].fullName = fullName;
        users[userIndex].email = email;
        localStorage.setItem('users', JSON.stringify(users));

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return { success: true, message: 'Details updated successfully' };
    }

    static changePassword(userId, currentPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            return { success: false, message: 'New passwords do not match' };
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId && u.password === currentPassword);
        if (userIndex === -1) {
            return { success: false, message: 'Current password is incorrect' };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return { success: true, message: 'Password changed successfully' };
    }

    static getUserAddress(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        return user?.address || '';
    }

    static getUserPhone(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        return user?.phoneNumber || '';
    }

    static updateUserProfile(userId, updates) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.setCurrentUser(users[userIndex]);
            }
        }
    }

    static addToCart(product) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'Please log in to add items to cart' };
        }

        const productWithCategory = {
            ...product,
            category: product.category || 'unknown'
        };

        const cart = new Cart();
        const result = cart.addItem(productWithCategory);
        this.updateCartCount();
        return result;
    }

    static getCartCount() {
        const cart = new Cart();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    static updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartCount();
        }
    }

    static getUserOrders(userId) {
        try {
            const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            return userCarts[userId] || [];
        } catch (error) {
            console.error('Error parsing userCarts:', error);
            return [];
        }
    }

    static updateOrderPaymentDetails(userId, orderIndex, paymentUpdates) {
        try {
            const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            if (userCarts[userId] && userCarts[userId][orderIndex]) {
                userCarts[userId][orderIndex].payment = {
                    ...userCarts[userId][orderIndex].payment,
                    ...paymentUpdates
                };
                localStorage.setItem('userCarts', JSON.stringify(userCarts));
                return { success: true, message: 'Payment details updated successfully' };
            }
            return { success: false, message: 'Order not found' };
        } catch (error) {
            console.error('Error updating order payment details:', error);
            return { success: false, message: 'Failed to update payment details' };
        }
    }

    static checkout(paymentDetails = {}, shippingDetails = {}) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'Please login to checkout.' };
        }
    
        const myCart = new Cart();
        if (myCart.items.length === 0) {
            return { success: false, message: 'Your cart is empty.' };
        }
    
        const currentUser = this.getCurrentUser();
        const order = {
            items: myCart.items,
            notes: myCart.notes,
            date: new Date().toISOString(),
            payment: paymentDetails,
            shipping: shippingDetails,
            status: 'Pending' // Add status
        };
    
        try {
            let userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            if (!userCarts[currentUser.id]) {
                userCarts[currentUser.id] = [];
            }
            userCarts[currentUser.id].push(order);
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
            console.log('Order saved for user:', currentUser.id, 'Orders:', userCarts[currentUser.id]);
        } catch (error) {
            console.error('Error saving order to userCarts:', error);
            return { success: false, message: 'Checkout failed: Unable to save order.' };
        }
    
        if (shippingDetails.address || shippingDetails.phoneNumber) {
            this.updateUserProfile(currentUser.id, {
                address: shippingDetails.address,
                phoneNumber: shippingDetails.phoneNumber
            });
        }
    
        myCart.clearCart();
        return { success: true, message: 'Checkout successful! Order placed.' };
    }
}

class Cart {
    constructor() {
        const cartData = this.getCart();
        this.items = cartData.items || [];
        this.notes = cartData.notes || '';
        this.shipping = 150;
    }
    
    getCart() {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : {};
    }
    
    saveCart() {
        const cartData = {
            items: this.items,
            notes: this.notes
        };
        localStorage.setItem('cart', JSON.stringify(cartData));
        this.updateCartCount();
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity
            });
        }
        
        this.saveCart();
        return { success: true, message: 'Product added to cart!' };
    }
    
    updateItem(productId, quantity) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            if (quantity > 0) {
                this.items[itemIndex].quantity = quantity;
            } else {
                this.removeItem(productId);
                return;
            }
            
            this.saveCart();
            this.renderCart?.();
        }
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart?.();
    }
    
    clearCart() {
        this.items = [];
        this.notes = '';
        this.saveCart();
        this.renderCart?.();
    }
    
    calculateSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        return subtotal + this.shipping;
    }
    
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
}

function updateAccountButton() {
    console.log('updateAccountButton called');
    const accountBtn = document.getElementById('accountBtn');
    const cartBtn = document.getElementById('cartBtn');
    const currentUser = Auth.getCurrentUser();
    
    if (!accountBtn) {
        console.warn('Account button not found');
        return;
    }

    if (currentUser) {
        accountBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${currentUser.fullName}
        `;
        if (cartBtn) {
            cartBtn.classList.remove('hidden');
            Auth.updateCartCount();
        }
    } else {
        accountBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Account
        `;
        if (cartBtn) {
            cartBtn.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing account button');
    updateAccountButton();
});