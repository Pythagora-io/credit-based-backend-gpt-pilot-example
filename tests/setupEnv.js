const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const setupTestEnvironment = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

const teardownTestEnvironment = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

module.exports = { setupTestEnvironment, teardownTestEnvironment };
