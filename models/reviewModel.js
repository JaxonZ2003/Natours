const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating / createdAt / ref to tour / ref to user

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      required: [true, 'a review must have a rating'],
      max: [5, 'a review rating can at most be 5'],
      min: [1, 'a review rating can at least be 1'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  // this points to the current Model; aggregate is always points to the Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', // group tours together by field tour
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  // [ { _id: 6628476b735f9cd54102c374, nRating: 2, avgRating: 5 } ]
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // when no reviews are available
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // do the calculation after document has been saved
  // Post middleware doesn't get access to the next()
  // this points to current review
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // create a property from the query object
  next();
});

// passing pre middleware property to the post middleware
reviewSchema.post(/^findOneAnd/, async function (next) {
  // this.r = await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRating(this.r.tour); // needs to be called on the model
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// POST /tour/idfortour/reviews : post a review under the current tour
// GET /tour/idfortour/reviews : get all reviews of the tour
// GET /tour/idfortour/reviews/idforeview : get one review of the tour
