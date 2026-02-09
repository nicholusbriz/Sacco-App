// Handle routing logic
export function handleRouting() {
  const path = window.location.pathname;

  switch (true) {
    case path === '/' || path === '/index.html':
      return 'home';
    case path.includes('/login'):
      return 'login';
    case path.includes('/register'):
      return 'register';
    case path.includes('/member-dashboard'):
      return 'member-dashboard';
    case path.includes('/dashboard'):
      return 'member-dashboard'; // Legacy support
    default:
      return 'home';
  }
}
