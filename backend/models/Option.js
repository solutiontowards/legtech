import mongoose from "mongoose";
const Schema = mongoose.Schema;

const FieldSchema = new Schema(
  {
    label: String,
    name: String,
    type: {
      type: String,
      enum: ["text", "number", "date", "file", "textarea", "select"],
      default: "text",
    },
    placeholder: String,
    required: { type: Boolean, default: false },
    accept: String,
    isPdf: { type: Boolean, default: false },
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
    image: String,
    imageMeta: Schema.Types.Mixed,
    price: { type: Number, default: 0 },
    externalLink: { type: String, default: null },
    isExternal: { type: Boolean, default: false },
    formFields: [FieldSchema],
  },
  { timestamps: true }
);

const Option = mongoose.models.Option || mongoose.model("Option", OptionSchema);
export default Option;
