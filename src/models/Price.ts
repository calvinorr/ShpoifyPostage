import mongoose from 'mongoose';

export interface IPriceEntry {
  service: string;
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  sizeCategory: 'small' | 'medium' | 'large';
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  price: number;
  currency: string;
  effectiveDate: Date;
  extractedAt: Date;
  sourceUrl?: string;
  sourceType: 'pdf' | 'web' | 'manual';
}

const PriceEntrySchema = new mongoose.Schema<IPriceEntry>({
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
  sizeCategory: {
    type: String,
    required: true,
    enum: ['small', 'medium', 'large']
  },
  maxDimensions: {
    length: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'GBP'
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  extractedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  sourceUrl: {
    type: String
  },
  sourceType: {
    type: String,
    required: true,
    enum: ['pdf', 'web', 'manual']
  }
}, {
  timestamps: true,
  indexes: [
    { service: 1, destination: 1, zone: 1, effectiveDate: -1 },
    { extractedAt: -1 },
    { effectiveDate: -1 }
  ]
});

export interface IPriceUpdate {
  updateId: string;
  extractedAt: Date;
  sourceUrl?: string;
  sourceType: 'pdf' | 'web' | 'manual';
  totalEntries: number;
  newEntries: number;
  changedEntries: number;
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

const PriceUpdateSchema = new mongoose.Schema<IPriceUpdate>({
  updateId: {
    type: String,
    required: true,
    unique: true
  },
  extractedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  sourceUrl: {
    type: String
  },
  sourceType: {
    type: String,
    required: true,
    enum: ['pdf', 'web', 'manual']
  },
  totalEntries: {
    type: Number,
    required: true,
    min: 0
  },
  newEntries: {
    type: Number,
    required: true,
    min: 0
  },
  changedEntries: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'partial']
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

export const PriceEntry = mongoose.models.PriceEntry || mongoose.model<IPriceEntry>('PriceEntry', PriceEntrySchema);
export const PriceUpdate = mongoose.models.PriceUpdate || mongoose.model<IPriceUpdate>('PriceUpdate', PriceUpdateSchema);