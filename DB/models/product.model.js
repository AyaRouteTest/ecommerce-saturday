import mongoose, { Schema, model, Types } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    description: String,
    images: [
      //subimages
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 }, //  %
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true },
    cloudFolder: { type: String, unique: true },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual
productSchema.virtual("finalPrice").get(function () {
  // this >>>> document ???? >>>> product document
  // if (this.discount) return this.price - (this.price * this.discount) / 100;
  // return this.price;
  if (this.price)
    return Number.parseFloat(
      this.price - (this.price * this.discount || 0) / 100
    ).toFixed(2);
});

// query helper
productSchema.query.paginate = function (page) {
  //////////////////// paginate /////////////////////////
  // page ?
  page = page < 1 || !page || isNaN(page) ? 1 : page;
  const limit = 2;
  const skip = (page - 1) * limit; // (1-1) * 2 = 0, (2-1)*2 = 2, (3-1)*2 = 4
  return this.skip(skip).limit(limit);
  // this >>>> query
  // must return another query
};

productSchema.query.customSelect = function (fields) {
  if (!fields) return this;
  // model keys [price, name, description, .........]
  const modelKeys = Object.keys(Product.schema.paths);
  console.log("modelKeys: ", modelKeys);
  console.log("fields: ", fields);
  const queryKeys = fields.split(" ");
  console.log("queryKeys: ", queryKeys);
  const filterKeys = queryKeys.filter((key) => modelKeys.includes(key));
  console.log("filterKeys: ", filterKeys);
  // this >> query, function return query
  return this.select(filterKeys);
};

// methods
productSchema.methods.inStock = function (requiredQuantity) {
  // this >>> document >>> product document
  return this.availableItems >= requiredQuantity ? true : false;
};

export const Product =
  mongoose.models.Product || model("Product", productSchema);
