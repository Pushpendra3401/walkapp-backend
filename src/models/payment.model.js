const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned walker
  status: { type: String, enum: ['pending','accepted','rejected','cancelled','completed'], default: 'pending' },
  startLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] } // [lng, lat]
  },
  endLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] } // [lng, lat]
  },
  details: { type: String },
  fare: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
  chatChannel: { type: String } // socket room id or identifier
});

requestSchema.index({ startLocation: '2dsphere' });
requestSchema.index({ endLocation: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
