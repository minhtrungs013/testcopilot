import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      required: true,
      default: 'free',
      index: true,
    },
    start_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      required: true,
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ tenant_id: 1, status: 1, end_date: 1 });
subscriptionSchema.index({ tenant_id: 1, createdAt: -1 });

export default mongoose.model('Subscription', subscriptionSchema);