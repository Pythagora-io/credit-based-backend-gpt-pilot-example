document.addEventListener('DOMContentLoaded', function() {
  const autoReplenishForm = document.getElementById('autoReplenishForm');

  autoReplenishForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(autoReplenishForm);
    const data = {};
    formData.forEach((value, key) => {
      if (key === 'isEnabled') {
        data[key] = value === 'on'; // Convert string to boolean before sending
      } else {
        // Ensure that threshold and creditsToPurchase are numbers
        data[key] = key === 'threshold' || key === 'creditsToPurchase' ? Number(value) : value;
      }
    });

    fetch('/api/billing/update-auto-replenish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify(data)
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
      alert('Error updating auto-replenish settings: ' + error.message);
    });
  });
});
