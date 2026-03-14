import mongoose from 'mongoose';

const selectedOptionSchema = new mongoose.Schema(
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

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    selected_options: {
      type: [selectedOptionSchema],
      default: [],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    table_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
      index: true,
    },
    order_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'served', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Order must contain at least one item.',
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ tenant_id: 1, order_code: 1 }, { unique: true });
orderSchema.index({ tenant_id: 1, status: 1, createdAt: -1 });
orderSchema.index({ tenant_id: 1, table_id: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
