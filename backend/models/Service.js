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
  description: {
    type: String,
  },
  image: String,
  imageMeta: Schema.Types.Mixed,
  subServices:[{type:Schema.Types.ObjectId,ref:'SubService'}]
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export default Service;
