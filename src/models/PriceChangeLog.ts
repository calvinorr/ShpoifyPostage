import mongoose from 'mongoose';

export interface IPriceChangeLog {
  updateId: string;
  service: string;
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePercentage: number;
  effectiveDate: Date;
  detectedAt: Date;
  loggedAt: Date;
}

const PriceChangeLogSchema = new mongoose.Schema<IPriceChangeLog>({
  updateId: {
    type: String,
    required: true,
    index: true
  },
  service: {
    type: String,
    required: true,
    enum: ['standard', 'tracked', 'signed', 'tracked-signed']
  },
  destination: {
    type: String,
    required: true
  },
  zone: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  weightRangeKg: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  changeAmount: {
    type: Number,
    required: true
  },
  changePercentage: {
    type: Number,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  detectedAt: {
    type: Date,
    required: true
  },
  loggedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  indexes: [
    { detectedAt: -1 },
    { updateId: 1, detectedAt: -1 },
    { service: 1, destination: 1, zone: 1 },
    { changePercentage: -1 }, // For finding significant changes
    { effectiveDate: -1 }
  ]
});

export const PriceChangeLog = mongoose.models.PriceChangeLog || mongoose.model<IPriceChangeLog>('PriceChangeLog', PriceChangeLogSchema);