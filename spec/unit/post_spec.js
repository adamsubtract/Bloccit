const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("Post", () => {
  beforeEach(done => {
    this.topic;
    this.post;
    this.user;
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
            description: "tales from beyond the moss",
            posts: [
              {
                title: "trask the highball",
                body: "slippery when wet",
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
            Post.findOne({
              where: { id: topic.posts[0].id },
              include: [
                {
                  model: Vote,
                  as: "votes"
                }
              ]
            }).then(post => {
              this.post = post;
              done();
            });
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("#create()", () => {
    it("should create a post object with a title body, assigned topic and user", done => {
      Post.create({
        title: "Alternate chess rules when you forget all other games",
        body: "Checkers.",
        topicId: this.topic.id,
        userId: this.user.id
      })
        .then(post => {
          expect(post.title).toBe(
            "Alternate chess rules when you forget all other games"
          );
          expect(post.body).toBe("Checkers.");
          expect(post.topicId).toBe(this.topic.id);
          expect(post.userId).toBe(this.user.id);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should not create a post with missing title, body, assigned topic or user", done => {
      Post.create({
        title: "Some title",
        userId: this.user.id
      })
        .then(post => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Post.body cannot be null");
          expect(err.message).toContain("Post.topicId cannot be null");
          done();
        });
    });
  });

  describe("#setTopic()", () => {
    it("should associate a topic and a post together", done => {
      Topic.create({
        title: "When hyperdrive fails",
        description: "how to repair things",
        userId: this.user.id
      }).then(newTopic => {
        expect(this.post.topicId).toBe(this.topic.id);
        this.post.setTopic(newTopic).then(post => {
          expect(post.topicId).toBe(newTopic.id);
          done();
        });
      });
    });
  });

  describe("#getTopic()", () => {
    it("should return the associated topic", done => {
      this.post.getTopic().then(associatedTopic => {
        expect(associatedTopic.title).toBe("Carver");
        done();
      });
    });
  });

  describe("#setUser()", () => {
    it("should associate a post and a user together", done => {
      User.create({
        email: "new@user.com",
        password: "654321"
      }).then(newUser => {
        expect(this.post.userId).toBe(this.user.id);
        this.post.setUser(newUser).then(post => {
          expect(this.post.userId).toBe(newUser.id);
          done();
        });
      });
    });
  });

  describe("#getUser()", () => {
    it("should return the associated user", done => {
      this.post.getUser().then(associatedUser => {
        expect(associatedUser.email).toBe("rock@climb.com");
        done();
      });
    });
  });

  describe("#getPoints()", () => {
    it("should return the point total for the associated post", done => {
      expect(this.post.getPoints()).toBe(0);
      // console.log("Initial .getPoints value : ", this.post.getPoints());
      Vote.create({
        value: 1,
        userId: this.user.id,
        postId: this.post.id
      })
        .then(res => {
          Post.findOne({
            where: { id: this.post.id },
            include: [
              {
                model: Vote,
                as: "votes"
              }
            ]
          })
            .then(post => {
              // console.log(".then - After vote creation", post.votes[0].value);
              expect(post.getPoints()).toBe(1);
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });

  describe("#hasUpvoteFor()", () => {
    it("should return true if the user with matching userId has an upvote", done => {
      Post.findOne({
        where: { id: this.post.id },
        include: [
          {
            model: Vote,
            as: "votes"
          }
        ]
      }).then(post => {
        expect(post.hasUpvoteFor(this.user.id)).toBeFalsy();
        Vote.create({
          value: 1,
          userId: this.user.id,
          postId: this.post.id
        })
          .then(res => {
            Post.findOne({
              where: { id: this.post.id },
              include: [
                {
                  model: Vote,
                  as: "votes"
                }
              ]
            })
              .then(post => {
                expect(post.hasUpvoteFor(this.user.id)).toBeTruthy();
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("#hasDownvoteFor()", () => {
    it("should return true if the user with matching userId has a downvote", done => {
      Post.findOne({
        where: { id: this.post.id },
        include: [
          {
            model: Vote,
            as: "votes"
          }
        ]
      }).then(post => {
        expect(post.hasDownvoteFor(this.user.id)).toBeFalsy();
        Vote.create({
          value: -1,
          userId: this.user.id,
          postId: this.post.id
        })
          .then(res => {
            Post.findOne({
              where: { id: this.post.id },
              include: [
                {
                  model: Vote,
                  as: "votes"
                }
              ]
            })
              .then(post => {
                expect(post.hasDownvoteFor(this.user.id)).toBeTruthy();
                done();
              })
              .catch(err => {
                console.log(err);
                done();
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
