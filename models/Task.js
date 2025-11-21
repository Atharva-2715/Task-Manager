const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TaskSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    // Remove internal Mongo identifiers
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Task', TaskSchema);

