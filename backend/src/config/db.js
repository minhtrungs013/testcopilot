import mongoose from 'mongoose';

async function connectDatabase(mongoUri) {
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
}

export default connectDatabase;
