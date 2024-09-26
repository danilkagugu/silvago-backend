import { model, Schema } from "mongoose";

const skinNeedSchema = new Schema({
  filterName: { type: String, required: true },
  label: { type: String },
});

const SkinNeed = model("skinNeed", skinNeedSchema);

export default SkinNeed;
