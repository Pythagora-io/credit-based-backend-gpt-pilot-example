document.getElementById('customCredits').addEventListener('input', event => {
  const credits = parseInt(event.target.value, 10) || 0;
  fetchAndUpdatePrice(credits);
});

function fetchAndUpdatePrice(credits) {
  fetch(`/api/credits/credit-price/${credits}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response.json();
  })
  .then(data => {
    document.getElementById('totalPrice').textContent = (data.price / 100).toFixed(2);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error fetching the credit price. Please try again.');
  });
}

document.querySelectorAll('.purchase-credits-btn').forEach(btn => {
  btn.addEventListener('click', event => {
    const credits = parseInt(event.target.dataset.credits, 10);
    fetchAndUpdatePrice(credits);
    document.getElementById('customCredits').value = credits.toString();
  });
});

document.getElementById('payWithStripe').addEventListener('click', () => {
  const credits = parseInt(document.getElementById('customCredits').value, 10);
  if (!credits || credits <= 0) {
    alert('Please enter a valid number of credits to purchase.');
    return;
  }
  fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ credits })
  })
  .then(response => response.json())
  .then(data => {
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Could not initiate Stripe checkout session.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error processing the purchase. Please try again.');
  });
});

document.getElementById('payWithPaypal').addEventListener('click', function() {
  const credits = parseInt(document.getElementById('customCredits').value, 10);
  if (!credits || credits <= 0) {
    alert('Please enter a valid number of credits to purchase.');
    return;
  }
  fetch('/api/billing/create-paypal-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ creditsToPurchase: credits })
  })
  .then(response => response.json())
  .then(data => {
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Could not initiate PayPal payment.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error processing the PayPal payment. Please try again.');
  });
});
