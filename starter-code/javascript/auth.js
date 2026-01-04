// ----------------- Helper Functions -----------------
const $ = (selector) => document.querySelector(selector);      // single element
const $$ = (selector) => document.querySelectorAll(selector); // all matching elements
const $id = (id) => document.getElementById(id);              // getElementById shortcut

function showError(input, message) {
  const errorSpan = input.nextElementSibling; // assumes <p> is next
  if (errorSpan) {
    errorSpan.innerHTML = `<img src="../assets/images/red-info.svg" alt="Info icon" class="info-icon"> ${message}`;
    input.classList.add('error');
  }
}



function clearError(input) {
  const errorSpan = input.nextElementSibling;
  if (errorSpan) {
    errorSpan.textContent = ''; // remove message
    input.classList.remove('error');
  }
}

// ----------------- Password Toggle -----------------
const toggle = $('.toggle-password');
if (toggle) {
  const password = toggle.previousElementSibling; // assumes input is before img
  toggle.addEventListener('click', () => {
    if (password.type === 'password') {
      password.type = 'text';
      toggle.src = '../assets/images/eye open.svg';
    } else {
      password.type = 'password';
      toggle.src = '../assets/images/eye hidden.svg';
    }
  });
}

// ----------------- Email Validation -----------------
const emailInput = $id('email');
if (emailInput) {
  emailInput.addEventListener('input', () => clearError(emailInput));

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showError(emailInput, 'Please enter a valid email address.');
      return false;
    }
    clearError(emailInput);
    return true;
  }
}

// ----------------- Form Submission -----------------
$$('.form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pageClass = document.body.className;
    let payload = {};

    // Login Page
    if (pageClass === '') {
      const email = $id('email').value.trim();
      const password = $id('password').value;
      if (!email || !password) return alert('All fields required');
      payload = { email, password };
      console.log('Login payload:', payload);

    // Signup Page
    } else if (pageClass === 'signup-page') {
      const email = $id('email').value.trim();
      const password = $id('password-new').value;
      const confirm = $id('password-confirm').value;

      if (!email || !password || !confirm) return alert('All fields required');
      if (password.length < 8) return alert('Password must be at least 8 characters');
      if (password !== confirm) return alert('Passwords do not match');

      payload = { email, password };
      console.log('Signup payload:', payload);

    // Reset Password Page
    } else if (pageClass === 'reset-password-page') {
      const password = $id('password-new').value;
      const confirm = $id('password-confirm').value;

      if (!password || !confirm) return alert('All fields required');
      if (password.length < 8) return alert('Password too short');
      if (password !== confirm) return alert('Passwords do not match');

      payload = { password };
      console.log('Reset payload:', payload);

    // Forgot Password Page
    } else if (pageClass === 'forget-page') {
      const email = $id('email').value.trim();
      if (!email) return alert('Email required');
      payload = { email };
      console.log('Forgot Password payload:', payload);
    }

    // Example API call
    // try {
    //   const response = await fetch('/api/endpoint', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload)
    //   });
    //   const data = await response.json();
    //   console.log(data);
    // } catch(err) {
    //   console.error(err);
    // }
  });
});
