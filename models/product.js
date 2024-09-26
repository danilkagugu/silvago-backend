import { model, Schema } from "mongoose";
import slugify from "slugify";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  article: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  characteristics: [
    {
      country: {
        type: String,
        required: true,
      },
      productClass: {
        type: String,
        required: true,
      },
      appointment: {
        type: String,
        required: true,
      },
      skinType: {
        type: String,
        required: true,
      },
      series: {
        type: String,
        required: true,
      },
      productType: {
        type: String,
        required: true,
      },
      age: {
        type: String,
        required: true,
      },
    },
  ],
  filters: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "skinNeed" },
      filterName: { type: String },
      label: { type: String },
    },
  ],

  volumes: [
    {
      volume: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      slug: {
        type: String,
        unique: true,
      },
      barcode: { type: String, required: true },
      image: [{ type: String }],
    },
  ],

  salesCount: {
    type: Number,
    default: 0,
  },
});

productSchema.pre("save", function (next) {
  this.volumes.forEach((volume) => {
    if (!volume.slug) {
      const slugBase = slugify(this.name, { lower: true, strict: true });
      volume.slug = `${slugBase}-${volume.volume}ml`;
    }
  });
  next();
});

const Product = model("product", productSchema);

export default Product;
