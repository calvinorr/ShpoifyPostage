import mongoose from 'mongoose';

const PricingSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    enum: ['standard', 'tracked', 'signed', 'tracked-signed', 'special-delivery']
  },
  destination: {
    type: String,
    required: true
  },
  zone: {
    type: Number,
    required: true
  },
  weightBand: {
    type: String,
    required: true
  },
  maxWeight: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  maxDimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  region: {
    type: String,
    enum: ['UK', 'Europe', 'World'],
    required: true
  },
  sourceDocument: {
    type: String,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
PricingSchema.index({ service: 1, destination: 1, weightBand: 1 });
PricingSchema.index({ effectiveDate: -1 });
PricingSchema.index({ lastUpdated: -1 });

export default mongoose.models.Pricing || mongoose.model('Pricing', PricingSchema);