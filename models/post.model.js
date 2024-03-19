const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    uniqueId: { type: Number },
    location: {
      type: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    shortVideo: { type: String},
    featuredImage: { type: Buffer},
    tourLink: { type: String },
    description: { type: String },
  },
  { versionKey: false }
);

const itemModel = mongoose.model("Item", itemSchema);

module.exports = {
  itemModel,
};
