const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("Flair", () => {

    beforeEach((done) => {
        this.topic;
        this.flair;
        sequelize.sync({force: true}).then((res) => {
            Topic.create({
                title: "Red rocks climbing",
                description: "Post pictures stories and more!"
            })
            .then((topic) => {
                this.topic = topic;
                Flair.create({
                    name: "Red rocks",
                    color: "red",
                    topicId: this.topic.id
                })
                .then((flair) => {
                    this.flair = flair;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("#create()", () => {
        it("should add a flair object to the assigned topic", (done) => {
            Flair.create({
                name: "Adventure",
                color: "green",
                topicId: this.topic.id
            })
            .then((flair) => {
                expect(flair.name).toBe("Adventure");
                expect(flair.color).toBe("green");
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a flair with missing name/color/topicId", (done) => {
            Flair.create({
                name: "something"
            })
            .then((flair) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Flair.color cannot be null");
                expect(err.message).toContain("Flair.topicId cannot be null");
                done();
            });
        });

    });

    describe("#setTopic()", () => {
        it("should associate a topic and a flair together", (done) => {
            Topic.create({
                title: "Cool cats",
                description: "Your faves!"
            })
            .then((newTopic) => {
                expect(this.flair.topicId).toBe(this.topic.id);
                this.flair.setTopic(newTopic)
                .then((flair) => {
                    expect(flair.topicId).toBe(newTopic.id);
                    done();
                });
            });
        });
    });

    describe("#getTopic()", () => {
        it("should return the associated topic", (done) => {
            this.flair.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe("Red rocks climbing");
                done();
            })
        })
    })

});