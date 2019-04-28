const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Post", () => {

  beforeEach((done) => {
//#1
    this.topic;
    this.post;
    this.id;
    sequelize.sync({force: true}).then((res) => {

//#2
      Topic.create({
        title: "Batman dies in Avengers Endgame",
        description: "His gadgets were not enough for Thanos"
      })
      .then((topic) => {
        this.topic = topic;
        this.id = topicId;
//#3
        Post.create({
          title: "Im sad",
          body: "I cried at the movie theater",
//#4
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

   });

   describe("#create()", () => {

        it("when calling Topic.create, that a topic is created and stored in database", (done) => {
            Topic.create({
                title: "Coding is hard",
                description: "My head hurts"
            })
            .then((topic) => {
                expect(topic.title).toBe("Coding is hard");
                expect(topic.description).toBe("My head hurts");
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it(("should not create a topic with missing title, or description"), (done)=> {
            Topic.create({

            })
            .then((topic) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Topic.title cannot be null");
                expect(err.message).toContain("Topic.description cannot be null");
                done();
            });

        });

   });

   describe("#getPosts()", () => {

    Post.create({
        title: "Batman faked death and moved to Wakanda",
        body: "Batman has been seen in Wakanda rasing family with Wonder Woman",
        topicId: this.id
    });
    console.log("getPost ====== " + this.topic.getPosts)

    this.topic.getPosts()
    
    .then((posts) => {
        
    })
    .catch((err) => {
        console.log(err);
        done();
    });

    });
});