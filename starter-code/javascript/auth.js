// ----------------- 1. Helper Functions -----------------
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const $id = (id) => document.getElementById(id);

const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];
const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

// ----------------- 2. Password Toggle -----------------
document.addEventListener('DOMContentLoaded', () => {
    $$('.toggle-password').forEach(toggle => {
        // Works for both <img> and <svg> based on your HTML
        toggle.addEventListener('click', () => {
            const wrapper = toggle.closest('.password-wrapper') || toggle.parentElement;
            const input = wrapper.querySelector('input');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            // Handle image icons
            if (toggle.tagName === 'IMG') {
                toggle.src = isPassword ? '../assets/images/eye open.svg' : '../assets/images/eye hidden.svg';
            } 
            // Handle SVG icons if using <use>
            const useTag = toggle.querySelector('use');
            if (useTag) {
                useTag.setAttribute('href', isPassword ? '#icon-show-password' : '#icon-eye-hidden');
            }
        });
    });

    // ----------------- 3. Unified Form Logic -----------------
    const allForms = $$('.form');

    allForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const pageClass = document.body.className;
            const users = getUsers();

            // --- A. LOGIN ---
            if (pageClass.includes('login-page')) {
                const email = $id('email').value.trim();
                const password = $id('password-new')?.value || $id('password')?.value;
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    window.location.href = '../../index.html';
                } else {
                    alert('Invalid email or password');
                }

            // --- B. SIGNUP ---
            } else if (pageClass.includes('signup-page')) {
                const email = $id('email').value.trim();
                const password = $id('password-new').value;
                const confirm = $id('password-confirm').value;

                if (password !== confirm) return alert('Passwords do not match');
                if (password.length < 8) return alert('Password too short');
                if (users.some(u => u.email === email)) return alert('User already exists');

                users.push({ email, password });
                saveUsers(users);
                alert('Account created!');
                window.location.href = 'login.html'; 

            // --- C. FORGOT PASSWORD ---
            } else if (pageClass.includes('forget-page')) {
                const email = $id('email').value.trim();
                if (users.some(u => u.email === email)) {
                    // Store which user is resetting so the next page knows
                    localStorage.setItem('resetEmail', email); 
                    alert(`A reset link has been simulated for ${email}`);
                    window.location.href = './reset-password.html';
                } else {
                    alert('Email not found');
                }

            // --- D. RESET PASSWORD ---
            } else if (pageClass.includes('reset-password-page')) {
                const newPass = $id('password-new').value;
                const confirmPass = $id('password-confirm').value;
                const resetEmail = localStorage.getItem('resetEmail');

                if (newPass.length < 8) return alert("At least 8 characters required");
                if (newPass !== confirmPass) return alert("Passwords do not match");

                // Update the user's password in the main users array
                const allUsers = getUsers();
                const userIndex = allUsers.findIndex(u => u.email === resetEmail);
                
                if (userIndex !== -1) {
                    allUsers[userIndex].password = newPass;
                    saveUsers(allUsers);
                    localStorage.removeItem('resetEmail'); // cleanup
                    alert("Password updated! Redirecting to login...");
                    window.location.href = "login.html";
                }
            }
        });
    });
});