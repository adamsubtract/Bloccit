const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {
  beforeEach(done => {
    this.topic;
    this.originalUser;
    this.originalPost;
    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "og@climber.com",
        password: "123456"
      }).then(user => {
        this.originalUser = user;
        Topic.create(
          {
            title: "Classic highballs",
            description: "All the classic problems you can think of!",
            posts: [
              {
                title: "Trask the highball",
                body: "slippery when wet",
                userId: this.originalUser.id
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
            this.originalPost = topic.posts[0];
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("guest preforming CRUD actions for Post", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            role: 0
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should redirect to topics/:topicId view", done => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Trask the highball");
          done();
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render a view with an edit post form", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}/edit`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).not.toContain("Edit post");
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Night of the living dead",
            body: "What a classic!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({ where: { title: "Night of the living dead" } })
            .then(post => {
              expect(post).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated ID", done => {
        Post.findAll().then(posts => {
          const postCountBeforeDelete = posts.length;
          expect(postCountBeforeDelete).toBe(1);
          request.post(
            `${base}/${this.topic.id}/posts/${this.originalPost.id}/destroy`,
            (err, res, body) => {
              Post.all().then(posts => {
                expect(posts.length).toBe(postCountBeforeDelete);
                done();
              });
            }
          );
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should not update the post with the given values", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.originalPost.id}/update`,
          form: {
            title: "Spiderman!",
            body: "not sure which one..."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: { id: this.originalPost.id }
          }).then(post => {
            expect(post.title).toBe("Trask the highball");
            done();
          });
        });
      });
    });
  });

  describe("member user performing CRUD actions for Post", () => {
    beforeEach(done => {
      this.user;
      this.userPost;
      User.create(
        {
          email: "rock@climb.com",
          password: "123456",
          role: "member",
          posts: [
            {
              title: "The Pheonix",
              body: "huge one near lost lake",
              topicId: this.topic.id
            }
          ]
        },
        {
          include: {
            model: Post,
            as: "posts"
          }
        }
      ).then(user => {
        this.user = user;
        this.userPost = user.posts[0];
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              role: user.role,
              userId: user.id,
              email: user.email
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", done => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("if owner, should render a view with an edit post form", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.userPost.id}/edit`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Edit post");
            expect(body).toContain("huge one near lost lake");
            done();
          }
        );
      });

      it("if not owner, should not render a view with an edit post form", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}/edit`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).not.toContain("Edit post");
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should create a new post and redirect", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Hesitator",
            body: "What a classic!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({ where: { title: "Hesitator" } })
            .then(post => {
              expect(post).not.toBeNull();
              expect(post.title).toBe("Hesitator");
              expect(post.body).toBe("What a classic!");
              expect(post.topicId).not.toBeNull();
              expect(post.userId).toBe(this.user.id);
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });

      it("should not create a new post that fails validations", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({ where: { title: "a" } })
            .then(post => {
              expect(post).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("if owner, should delete the post with the associated ID", done => {
        Post.findAll().then(posts => {
          const postCountBeforeDelete = posts.length;
          expect(postCountBeforeDelete).toBe(2);
          request.post(
            `${base}/${this.topic.id}/posts/${this.userPost.id}/destroy`,
            (err, res, body) => {
              Post.all().then(posts => {
                expect(err).toBeNull();
                expect(posts.length).toBe(postCountBeforeDelete - 1);
                done();
              });
            }
          );
        });
      });

      it("if not owner, should not delete the post with the associated ID", done => {
        Post.findAll().then(posts => {
          const postCountBeforeDelete = posts.length;
          expect(postCountBeforeDelete).toBe(2);
          request.post(
            `${base}/${this.topic.id}/posts/${this.originalPost.id}/destroy`,
            (err, res, body) => {
              Post.all().then(posts => {
                expect(posts.length).toBe(postCountBeforeDelete);
                done();
              });
            }
          );
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}/${this.topic.id}/posts/${this.userPost.id}/update`,
            form: {
              title: "Spiderman!",
              body: "Enter the spiderverse"
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });

      it("if owner, should update the post with the given values", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.userPost.id}/update`,
          form: {
            title: "Sky scrapers",
            body: "reflective towers"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: { id: this.userPost.id }
          }).then(post => {
            expect(post.title).toBe("Sky scrapers");
            done();
          });
        });
      });

      it("if not owner, should not update the post with the given values", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.originalPost.id}/update`,
          form: {
            title: "Sky scrapers",
            body: "reflective towers"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: { id: this.originalPost.id }
          }).then(post => {
            expect(post.title).toBe("Trask the highball");
            done();
          });
        });
      });
    });
  });

  describe("admin user preforming CRUD actions for Post", () => {
    beforeEach(done => {
      User.create({
        email: "admin@email.com",
        password: "123456",
        role: "admin"
      }).then(user => {
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              role: user.role,
              userId: user.id,
              email: user.email
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", done => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should render a view with an edit post form", done => {
        request.get(
          `${base}/${this.topic.id}/posts/${this.originalPost.id}/edit`,
          (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Edit post");
            expect(body).toContain("slippery when wet");
            done();
          }
        );
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should create a new post and redirect", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Hesitator",
            body: "What a classic!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({ where: { title: "Hesitator" } })
            .then(post => {
              expect(post).not.toBeNull();
              expect(post.title).toBe("Hesitator");
              expect(post.body).toBe("What a classic!");
              expect(post.topicId).not.toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });

      it("should not create a new post that fails validations", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({ where: { title: "a" } })
            .then(post => {
              expect(post).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should delete the post with the associated ID", done => {
        Post.findAll().then(posts => {
          expect(posts[0].id).toBe(1);
          request.post(
            `${base}/${this.topic.id}/posts/${this.originalPost.id}/destroy`,
            (err, res, body) => {
              Post.findById(1).then(post => {
                expect(err).toBeNull();
                expect(post).toBeNull();
                done();
              });
            }
          );
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}/${this.topic.id}/posts/${
              this.originalPost.id
            }/update`,
            form: {
              title: "Sky scrapers",
              body: "reflective towers"
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });

      it("should update the post with the given values", done => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.originalPost.id}/update`,
          form: {
            title: "Sky scrapers",
            body: "reflective towers"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Post.findOne({
            where: { id: this.originalPost.id }
          }).then(post => {
            expect(post.title).toBe("Sky scrapers");
            done();
          });
        });
      });
    });
  });
});
