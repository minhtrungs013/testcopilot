import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ['super_admin', 'tenant_owner', 'staff', 'kitchen'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { tenant_id: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { tenant_id: { $type: 'objectId' } },
  }
);
userSchema.index(
  { email: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'super_admin' },
  }
);

export default mongoose.model('User', userSchema);