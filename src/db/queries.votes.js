// #1
const Comment = require("./models").Comment;
const Post = require("./models").Post;
const User = require("./models").User;
const Vote = require("./models").Vote;

module.exports = {
  createVote(req, val, callback) {
    // #2
    return Vote.findOne({
      where: {
        postId: req.params.postId,
        userId: req.user.id
      }
    }).then(vote => {
      // #3
      if (vote) {
        vote.value = val;
        vote
          .save()
          .then(vote => {
            callback(null, vote);
          })
          .catch(err => {
            callback(err);
          });
      } else {
        // #4
        Vote.create({
          value: val,
          postId: req.params.postId,
          userId: req.user.id
        })
          .then(vote => {
            callback(null, vote);
          })
          .catch(err => {
            callback(err);
          });
      }
    });
  },
  hasUpvoteFor(userId, callback) {
    return Vote.findById(userId).then(vote => {
      if (vote.value === 1) {
        return callback(true);
      } else {
        return callback(false);
      }
    });
  },

  hasDownvoteFor(userId, callback) {
    return Vote.findById(userId).then(vote => {
      if (vote.value === -1) {
        return callback(true);
      } else {
        return callback(false);
      }
    });
  }
};
