document.addEventListener('DOMContentLoaded', function() {
  const adminEditSection = document.querySelector('.col-md-9');

  adminEditSection.addEventListener('click', function(event) {
    if (event.target.classList.contains('refund-invoice-btn')) {
      event.preventDefault();

      event.target.disabled = true;

      const invoiceId = event.target.dataset.invoiceId;
      if (confirm('Are you sure you want to refund this invoice?')) {
        fetch(`/api/admin/refund-invoice/${invoiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          location.reload();
        })
        .catch(err => {
          console.error('Failed to refund invoice', err);
          alert('Failed to refund invoice');
          event.target.disabled = false;
        });
      } else {
        event.target.disabled = false;
      }
    }
  });

document.getElementById('createCustomInvoiceForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const userId = this.dataset.userId;
  const amount = document.getElementById('amount').value;
  const credits = document.getElementById('credits').value;

  const data = JSON.stringify({ amount, credits });

  fetch(`/api/admin/create-invoice/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: data
  })
    .then(response => response.json())
    .then(data => {
      alert('Invoice created successfully');
    })
    .catch(error => {
      console.error('There was an error creating the invoice:', error);
      alert('Error creating invoice');
    });
});

  //... other event handling code (if any) ...
});
