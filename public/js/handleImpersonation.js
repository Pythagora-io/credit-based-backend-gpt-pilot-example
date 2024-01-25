document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const impersonatedUserId = urlParams.get('uid');

  if (impersonatedUserId) {
    // Update all sidebar links to contain the impersonated user's ID as a query parameter
    document.querySelectorAll('.nav-link').forEach(link => {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('uid', impersonatedUserId);
      link.href = url.href;
    });
  }
});
