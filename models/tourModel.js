/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

// Not all the data is on the overview page, so not all the data is required
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true, // removes leading and trailing spaces
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 => 46.666 => 47 => 4.7
    },
    ratingsQuantity: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation (but not on update)
          return val < this.price; // 100 < 200: False will trigger validation error
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), // in Mongoose, it gets converted to a Date automatically
      select: false, // pernently hide this field from the response
    },
    startDates: [Date], // "2024-03-31,12:50" will be parsed to a Date object
    secretTour: {
      type: Boolean,
      default: false,
    },
    // An Embbeded object
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      // an array of object that has multiple embedded data;
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], // don't even need User to be implemented
    // references to the other model
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // startLocation is the real 2D sphere index on the Earth
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // use normal function if we want to use this pointing to the document
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', // Model Name
  foreignField: 'tour', // in the review model, review is connected to the tour
  localField: '_id', // reviews is accessed by _id in the current field
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() but not .insertMany()
// operators are called hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   // an array of all users id
//   // this.guides point to the model, guides field
//   // 每次save之前都看看guides里有没有用户id，有的话就用id查找到用户，并存到guides array里
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // results of this is an array of promises
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document..');
//   next();
// });

// // Execute after all the pre middleware functions have been executed
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: Runs before/after the query operation
// secret tour that public results should not be seen (VIP)
tourSchema.pre(/^find/, function (next) {
  // all strings that start with "find" will run the pre middleware functions
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  // filter out the secret tour, show all results where the secret tour is not equal to true
  // findById or findOne will not run the pre middleware functions
  // so we need to implement it as well
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    // this points to current query
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// // AGGREGATE MIDDLEWARE: Runs before/after the aggregate operation
// tourSchema.pre('aggregate', function (next) {
//   // this points to the current aggregation object)
//   // unshift: add at beggining of array || filter out the secret tour
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
