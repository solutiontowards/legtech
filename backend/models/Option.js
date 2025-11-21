import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChoiceSchema = new Schema({
  label: { type: String },
  value: { type: String }
}, { _id: false });

const FieldSchema = new Schema(
  {
    label: String,
    name: String,
    type: {
      type: String,
      enum: ["text","email", "number", "date", "file", "textarea", "select","radio","checkbox"],
      default: "text",
    },
    placeholder: String,
    required: { type: Boolean, default: false },
    accept: String,
    isPdf: { type: Boolean, default: false },
    options: [ChoiceSchema],
  },
  { _id: true }
);

const OptionSchema = new Schema(
  {
    subServiceId: {
      type: Schema.Types.ObjectId,
      ref: "SubService",
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    image: String,
    imageMeta: Schema.Types.Mixed,
    customerPrice: { type: Number, default: 0 },
    retailerPrice: { type: Number, default: 0 },
    externalLink: { type: String, default: null },
    isExternal: { type: Boolean, default: false },
    formFields: [FieldSchema],
  },
  { timestamps: true }
);

const Option = mongoose.models.Option || mongoose.model("Option", OptionSchema);
export default Option;
