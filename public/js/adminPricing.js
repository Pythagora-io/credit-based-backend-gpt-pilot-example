document.getElementById('pricingTiersForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  const tiers = [];

  const totalTiers = formData.get('totalTiers');
  for(let i = 0; i < totalTiers; i++) {
    tiers.push({
      tierName: formData.get('tierName' + i),
      startFrom: parseInt(formData.get('startFrom' + i), 10),
      upTo: parseInt(formData.get('upTo' + i), 10),
      pricePerCredit: parseFloat(formData.get('pricePerCredit' + i))
    });
  }

  fetch('/api/admin/pricing-tiers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ tiers })
  })
  .then(response => {
    if (!response.ok) throw response;
    return response.json();
  })
  .then(() => {
    alert('Pricing tiers updated successfully');
    window.location.reload();
  })
  .catch(async (error) => {
    const errorMessage = await error.text();
    alert(`Error updating pricing tiers: ${errorMessage}`);
  });
});
