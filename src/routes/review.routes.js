const { getReviewById, createReview, deleteReviewById, updateReviewById, myReviews } = require("../controllers/review.controller")

module.exports = function (app) {
    app.get('/me/review/:id', getReviewById);
    app.post('/me/review', createReview);
    app.delete('/me/review/:id', deleteReviewById);
    app.put('/me/review/:id', updateReviewById)
    app.get('/me/reviews', myReviews)

}