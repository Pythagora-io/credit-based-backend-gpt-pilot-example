document.addEventListener('DOMContentLoaded', function() {
  const customPricingTiersForm = document.getElementById('customPricingTiersForm');

  customPricingTiersForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const userId = this.dataset.userId;
    const formData = new FormData(this);
    
    const data = {
      tierName: formData.get('tierName'),
      startFrom: parseInt(formData.get('startFrom'), 10),
      upTo: parseInt(formData.get('upTo'), 10),
      pricePerCredit: parseFloat(formData.get('pricePerCredit'))
    };

    fetch(`/api/admin/users/${userId}/pricing-tiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      alert('Custom pricing tier added/updated successfully');
    })
    .catch(error => {
      console.error('There was an error saving the custom pricing tier:', error);
      alert('Error updating custom pricing tier');
    });
  });
});