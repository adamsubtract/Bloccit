module.exports = {
  init(app){
    const staticRoutes = require("../routes/static");
    const postRoutes = require("../routes/posts");
    const topicRoutes = require("../routes/topics");

    app.use(topicRoutes);
    app.use(postRoutes);
    app.use(staticRoutes)
  }
}
