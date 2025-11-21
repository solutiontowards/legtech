import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  // Replaced description with a list of required documents
  requiredDocuments: { type: [String], default: [] },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: String,
  imageMeta: Schema.Types.Mixed,
  subServices:[{type:Schema.Types.ObjectId,ref:'SubService'}]
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export default Service;
