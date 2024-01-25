function makeAdmin(userId) {
  const isAdminStatus = confirm('Do you want to toggle this user\'s admin status?');
  fetch(`/api/admin/change-admin-status/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ isAdminStatus: isAdminStatus })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Network response was not ok.');
    }
  })
  .then(data => {
    alert(data.message);
    window.location.reload();
  })
  .catch(error => {
    alert('Error updating user\'s admin status: ' + error.message);
  });
}

function changePassword(userId) {
  const newPassword = prompt('Please enter the new password:');
  if (!newPassword) {
    alert('Password change cancelled or no new password provided.');
    return;
  }

  fetch(`/api/admin/change-user-password/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ newPassword })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Network response was not ok.');
    }
  })
  .then(data => {
    alert(data.message);
  })
  .catch(error => {
    alert('Error changing password: ' + error.message);
  });
}

function verifyEmail(userId) {
  if (confirm('Are you sure you want to verify this user\'s email?')) {
    fetch(`/api/admin/verify-email/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok.');
      return response.text(); // Expecting an HTML response
    })
    .then(html => {
      // Since we expect HTML, we can insert it into a modal or an alert div.
      // For this example, we'll show a simple alert to keep it straightforward.
      alert('The user\'s email has been successfully verified.');
      window.location.reload(); // Reload the page to reflect changes in the user management interface
    })
    .catch(err => {
      console.error('Failed to verify user email', err);
      alert('Failed to verify user email.');
    });
  }
}

function deleteUser(userId) {
  const confirmation = confirm('Are you sure you want to delete this user?');
  if (confirmation) {
    fetch(`/api/admin/delete-user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify({ confirmDelete: true })
    })
    .then(response => response.json())
    .then(data => {
      if (data.deletedUserId) {
        alert(data.message);
        // Remove the deleted user's row from the HTML table
        const userRow = document.querySelector(`#user-${userId}`);
        if (userRow) {
          userRow.remove();
        }
      } else {
        throw new Error(data.message || 'Failed to delete the user.');
      }
    })
    .catch(error => {
      alert('Error deleting user: ' + error.message);
    });
  }
}
