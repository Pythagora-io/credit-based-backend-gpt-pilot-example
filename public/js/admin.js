document.addEventListener('DOMContentLoaded', function() {
  const userTable = document.getElementById('userTable');

  function sendFetchRequest(url, method, data) {
    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify(data)
    });
  }

  userTable.addEventListener('click', function(event) {
    const target = event.target;
    const userId = target.dataset.userId;

    if (target.classList.contains('make-admin-btn')) {
      const isAdmin = target.dataset.isAdmin;
      const adminStatus = isAdmin === 'true' ? false : true;
      
      if (confirm(`Are you sure you want to make this user ${adminStatus ? 'an admin' : 'not an admin'}?`)) {
        sendFetchRequest(`/api/admin/change-admin-status/${userId}`, 'POST', { isAdminStatus: adminStatus })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
            window.location.reload();
          })
          .catch(error => alert('Error updating user\'s admin status: ' + error));
      }
    } else if (target.classList.contains('change-password-btn')) {
      const newPassword = prompt('Please enter the new password:');
      if (newPassword) {
        sendFetchRequest(`/api/admin/change-user-password/${userId}`, 'POST', { newPassword: newPassword })
          .then(response => response.json())
          .then(data => alert(data.message))
          .catch(error => alert('Error changing user\'s password: ' + error));
      }
    } else if (target.classList.contains('delete-user-btn')) {
      if (confirm('Are you sure you want to delete this user?')) {
        sendFetchRequest(`/api/admin/delete-user/${userId}`, 'POST', { confirmDelete: true })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
            target.closest('tr').remove();
          })
          .catch(error => alert('Error deleting user: ' + error));
      }
    }
  });
});
