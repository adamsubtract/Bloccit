const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {

//#1
  describe("GET /", () => {

//#2
    it("should return status code 200 and have 'Welcome to Bloccit' in the body of the response", () => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toContain("Welcome to Bloccit");
      });
    });

  });

  // describe("GET /marco", () => {
  //   it("should return a status code of 200", (done) => {
  //     request.get(base, (err, res, body) => {
  //       expect(body).toBe("polo");
  //       done();
  //     });
  //   })
  //
  // });

});
