import mongoose from 'mongoose';

const productOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      maxlength: 1024,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'out_of_stock'],
      default: 'active',
      index: true,
    },
    options: {
      type: [productOptionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ tenant_id: 1, category_id: 1, status: 1 });
productSchema.index({ tenant_id: 1, name: 1 });

export default mongoose.model('Product', productSchema);
