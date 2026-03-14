import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    table_number: {
      type: Number,
      required: true,
      min: 1,
    },
    qr_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    status: {
      type: String,
      default: 'available',
      trim: true,
      maxlength: 30,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index({ tenant_id: 1, table_number: 1 }, { unique: true });
tableSchema.index({ tenant_id: 1, qr_code: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
