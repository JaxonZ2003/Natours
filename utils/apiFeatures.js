class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // query是我们费尽心思把req.query改成query的一个object，他会被用来返回document
    this.queryString = queryString; // queryString是req.query
  }

  filter() {
    const queryObj = { ...this.queryString }; // deep copy of req.query instead of reference it
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // \b finds the exact matching word

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // this is the entire APIFeatures object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // show everything except the __v field
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // convert page string to number and set default page to 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30, page 3
    // need to skip 10 results to get to page 2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
