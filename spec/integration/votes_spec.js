const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("routes : votes", () => {
  beforeEach(done => {
    this.user;
    this.topic;
    this.post;
    this.vote;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "rock@climb.com",
        password: "123456"
      }).then(user => {
        this.user = user;

        Topic.create(
          {
            title: "Carver",
            description: "the moss oddessey",
            posts: [
              {
                title: "Trask!",
                body: "such a good climb",
                userId: this.user.id
              }
            ]
          },
          {
            include: {
              model: Post,
              as: "posts"
            }
          }
        )
          .then(topic => {
            this.topic = topic;
            this.post = topic.posts[0];
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("guest attempting to vote on a post", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            userId: 0
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("GET /topics/:topicId/posts/:postId/votes/upvote", () => {
      it("should not create a new vote", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {
              userId: this.user.id,
              postId: this.post.id
            }
          })
            .then(vote => {
              expect(vote).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
  });

  describe("signed in user voting on a post", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            role: "member",
            userId: this.user.id
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("GET /topics/:topicId/posts/:postId/votes/upvote", () => {
      it("should create an upvote", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {
              userId: this.user.id,
              postId: this.post.id
            }
          })
            .then(vote => {
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });

      it("should not create more than one upvote per user per post", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options, (err, res, body) => {
          Vote.all()
            .then(votes => {
              const voteCountBeforeChange = votes.length;
              expect(voteCountBeforeChange).toBe(1);
              request.get(options, (err, res, body) => {
                Vote.all().then(votes => {
                  expect(votes.length).toBe(voteCountBeforeChange);
                  done();
                });
              });
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:postId/votes/downvote", () => {
      it("should create an downvote", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {
              userId: this.user.id,
              postId: this.post.id
            }
          })
            .then(vote => {
              expect(vote).not.toBeNull();
              expect(vote.value).toBe(-1);
              expect(vote.userId).toBe(this.user.id);
              expect(vote.postId).toBe(this.post.id);
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });

      it("should not create more than one downvote per user per post", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`
        };
        request.get(options, (err, res, body) => {
          Vote.all()
            .then(votes => {
              const voteCountBeforeChange = votes.length;
              expect(voteCountBeforeChange).toBe(1);
              request.get(options, (err, res, body) => {
                Vote.all().then(votes => {
                  expect(votes.length).toBe(voteCountBeforeChange);
                  done();
                });
              });
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
  });
});
