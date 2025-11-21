const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    enum: ['Create Task', 'Update Task', 'Delete Task'],
    required: true,
  },
  taskId: {
    type: Number,
    required: true,
  },
  updatedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

AuditLogSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);

