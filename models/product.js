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
  image: {
    type: String,
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
  filters: {
    sunscreenType: {
      type: String,
      enum: ["Хімічні фільтри", "Фізичні фільтри", "Мікс фільтрів"],
      default: null,
    },
    forSensitiveSkin: {
      type: Boolean,
      default: false,
      label: "Для чутливої шкіри",
    }, // Українська назва фільтра
    acneTreatment: { type: Boolean, default: false, label: "Боротьба з акне" },
    antiAge: { type: Boolean, default: false, label: "Anti-age" },
    hydration: { type: Boolean, default: false, label: "Зволоження" },
    nourishment: { type: Boolean, default: false, label: "Живлення" },
    pigmentationTreatment: {
      type: Boolean,
      default: false,
      label: "Освітлення пігментації",
    },
    seboRegulation: { type: Boolean, default: false, label: "Себорегуляція" },
    couperoseTreatment: {
      type: Boolean,
      default: false,
      label: "Лікування куперозу",
    },
    regeneration: { type: Boolean, default: false, label: "Відновлення" },
    cleaning: { type: Boolean, default: false, label: "Очищення" },
    soothing: { type: Boolean, default: false, label: "Заспокоєння" },
    soothing: {
      type: Boolean,
      default: false,
      label: "Захист від ультрафіолету",
    },
  },
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
