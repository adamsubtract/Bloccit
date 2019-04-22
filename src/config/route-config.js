module.exports = {
  init(app){
    const staticRoutes = require("../routes/static");
    const topicRoutes = require("../routes/topics");

    app.use(topicRoutes);
    app.use(staticRoutes)
  }
}
