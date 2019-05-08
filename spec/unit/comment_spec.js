const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("Comment", () => {
  beforeEach(done => {
    this.user;
    this.topic;
    this.post;
    this.commet;
    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "rock@climb.com",
        password: "123456"
      }).then(user => {
        this.user = user;

        Topic.create(
          {
            title: "Classic highballs",
            description: "tall problems, no fear?",
            posts: [
              {
                title: "Trask at Carver",
                body: "covered in moss",
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

            Comment.create({
              body: "Love the Columbia boulder!",
              userId: this.user.id,
              postId: this.post.id
            })
              .then(comment => {
                this.comment = comment;
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

  describe("#create()", () => {
    it("should create a comment object with a body, assigned post and user", done => {
      Comment.create({
        body: "sooo mossy!",
        postId: this.post.id,
        userId: this.user.id
      })
        .then(comment => {
          expect(comment.body).toBe("sooo mossy!");
          expect(comment.postId).toBe(this.post.id);
          expect(comment.userId).toBe(this.user.id);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should not create a comment with missing body, assigned post or user", done => {
      Comment.create({
        body: "This is sa comment with no user or post id"
      })
        .then(comment => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Comment.userId cannot be null");
          expect(err.message).toContain("Comment.postId cannot be null");
          done();
        });
    });
  });

  describe("#setUser()", () => {
    it("should associate a comment and a user together", done => {
      User.create({
        email: "gumby@climb.com",
        password: "123456"
      }).then(newUser => {
        expect(this.comment.userId).toBe(this.user.id);
        this.comment.setUser(newUser).then(comment => {
          expect(comment.userId).toBe(newUser.id);
          done();
        });
      });
    });
  });

  describe("#getUser()", () => {
    it("should return the associated user", done => {
      this.comment.getUser().then(associatedUser => {
        expect(associatedUser.email).toBe("rock@climb.com");
        done();
      });
    });
  });

  describe("#setPost()", () => {
    it("should associate a post and a comment together", done => {
      Post.create({
        title: "The Pheonix",
        body: "tall one near lost lake",
        topicId: this.topic.id,
        userId: this.user.id
      }).then(newPost => {
        expect(this.comment.postId).toBe(this.post.id);
        this.comment.setPost(newPost).then(comment => {
          expect(comment.postId).toBe(newPost.id);
          done();
        });
      });
    });
  });

  describe("#getPost()", () => {
    it("should return the associated post", done => {
      this.comment.getPost().then(associatedPost => {
        expect(associatedPost.title).toBe("Trask at Carver");
        done();
      });
    });
  });
});
