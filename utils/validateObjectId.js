const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const validateObjectId = (id) => {
  if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
    return true;
  }
  return false;
};

module.exports = validateObjectId; // Ensure the function is exported
