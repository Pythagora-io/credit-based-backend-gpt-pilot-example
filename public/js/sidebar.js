document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default navigation.
    const url = this.getAttribute('href');
    
    fetch(url).then(response => {
      if (!response.ok) throw new Error('Network response was not ok.');
      return response.text();
    }).then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.container-fluid').innerHTML;
      
      // Update the content of the current page without a reload.
      document.querySelector('.container-fluid').innerHTML = content;
      
      // Update the 'active' state on the sidebar.
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === url) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Update the URL in the address bar.
      window.history.pushState({}, '', url);
    }).catch(error => {
      console.error('Failed to fetch page content:', error);
    });
  });
});
