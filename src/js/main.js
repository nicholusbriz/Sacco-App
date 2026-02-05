console.log('Atbriz Community SACCO is running!');

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const memberId = document.getElementById('memberId').value;
  const password = document.getElementById('password').value;
  
  if (memberId && password) {
    console.log('Login attempt:', { memberId, password: '***' });
    alert(`Login attempt for Member ID: ${memberId}\n(Implement your authentication logic here)`);
  } else {
    alert('Please fill in all fields');
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
