import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ tenant_id: 1, order_id: 1 });
paymentSchema.index({ tenant_id: 1, status: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);