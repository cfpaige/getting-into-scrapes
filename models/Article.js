const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  // count: {
  //   type: Number,
  //   required: true,
  //   default: 0,
  //   unique: false
  // },
  isSaved: {
    type: Boolean,
    default: false,
    required: false,
    unique: false
  },
  note: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "Note"
    }],
  }
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
