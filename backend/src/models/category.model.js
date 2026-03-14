import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    sort_order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ tenant_id: 1, name: 1 }, { unique: true });
categorySchema.index({ tenant_id: 1, sort_order: 1 });

export default mongoose.model('Category', categorySchema);
