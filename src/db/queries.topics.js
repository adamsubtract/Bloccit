const Topic = require("./models").Topic;
const Post = require("./models").Post;

module.exports = {

//#1
  getAllTopics(callback){
    return Topic.findAll()
    .then((topics) => {
      callback(null, topics);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addTopic(newTopic, callback){
      return Topic.create({
        title: newTopic.title,
        description: newTopic.description
      })
      .then((topic) => {
        callback(null, topic);
      })
      .catch((err) => {
        callback(err);
      })
  },
  getTopic(id, callback){

     return Topic.findByPk(id, {

      //#3
        include: [{
          model: Post,
          as: "posts"
        }]
      })

     .then((topic) => {
       callback(null, topic);
     })
     .catch((err) => {
       callback(err);
     })
  },
  deleteTopic(id, callback){
    return Topic.destroy({
      where: {id}
    })
    .then((topic) => {
      callback(null, topic);
    })
    .catch((err) => {
      callback(err);
    })
  },
  updateTopic(id, updatedTopic, callback){
    return Topic.findByPk(id)
    .then((topic) => {
      if(!topic){
        return callback("Topic not found");
      }

//#1
      topic.update(updatedTopic, {
        fields: Object.keys(updatedTopic)
      })
      .then(() => {
        callback(null, topic);
      })
      .catch((err) => {
        callback(err);
      });
    });
  }
}
