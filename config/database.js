const mongoose = require('mongoose');

const connect = (onConnected) => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credits_backend_example')
    .then(() => {
      console.log('MongoDB Connected');
      if (onConnected) {
        onConnected();
      }
    })
    .catch(err => console.error(err));
}

module.exports = { connect };
