const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const isValidObjectId = (id) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

const toObjectId = (value) => {
  try {
    return new ObjectId(value);
  } catch (error) {
    console.error('Error converting value to ObjectId:', error);
    return null;
  }
};

module.exports = { isValidObjectId, toObjectId };
