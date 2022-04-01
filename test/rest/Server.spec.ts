import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs";
import JSON = Mocha.reporters.JSON;

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	let SERVER_URL = "http://localhost:4321";

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
	});

	after(function () {
		// TODO: stop server here once!
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests

	it("DELETE test for courses dataset 404", function () {

		let ENDPOINT_URL = "/dataset/courses";
		try {
			return chai.request(SERVER_URL)
				.del(ENDPOINT_URL)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect.fail();

				})
				.catch(function (err) {
					// some logging here please!
					expect(err.status).to.be.equal(200);
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT test for courses dataset 200", function () {

		let ENDPOINT_URL = "/dataset/courses/courses";
		let ZIP_FILE_DATA = fs.readFileSync("./test/resources/archives/courses.zip");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT test for courses dataset 400", function () {

		let ENDPOINT_URL = "/dataset/courses/coursess";
		let ZIP_FILE_DATA = fs.readFileSync("./test/resources/archives/courses.zip");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send("")
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// expect(res.status).to.be.equal(200);
					expect.fail();
				})
				.catch(function (err) {
					// some logging here please!
					// expect.fail();
					expect(err.status).to.be.equal(400);
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("GET test for courses dataset 200", function () {

		let ENDPOINT_URL = "/dataset";
		let ZIP_FILE_DATA = fs.readFileSync("./test/resources/archives/courses.zip");
		try {
			return chai.request(SERVER_URL)
				.get(ENDPOINT_URL)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("DELETE test for courses dataset 200", function () {

		let ENDPOINT_URL = "/dataset/courses";
		let ZIP_FILE_DATA = fs.readFileSync("./test/resources/archives/courses.zip");
		try {
			return chai.request(SERVER_URL)
				.del(ENDPOINT_URL)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});


	it("DELETE test for courses dataset 400", function () {

		let ENDPOINT_URL = "/dataset/coursessss";
		let ZIP_FILE_DATA = fs.readFileSync("./test/resources/archives/courses.zip");
		try {
			return chai.request(SERVER_URL)
				.del(ENDPOINT_URL)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// expect(res.status).to.be.equal(200);
					expect.fail();
				})
				.catch(function (err) {
					// some logging here please!
					// expect.fail();
					expect(err.status).to.be.equal(400);
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("POST test for courses dataset 200", function () {

		let ENDPOINT_URL = "/query";
		let queryData = {
			WHERE: {
				AND: [
					{
						GT: {
							courses_avg: 90
						}
					},
					{
						LT: {
							courses_avg: 100
						}
					},
					{
						GT: {
							courses_pass: 20
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"AvgCourseScore",
					"courses_dept",
					"courses_id"
				],
				ORDER: {
					dir: "DOWN",
					keys: [
						"AvgCourseScore"
					]
				}
			},
			TRANSFORMATIONS: {
				GROUP: [
					"courses_dept",
					"courses_id"
				],
				APPLY: [
					{
						AvgCourseScore: {
							AVG: "courses_avg"
						}
					}
				]
			}
		};
		try {
			return chai.request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send(queryData)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("POST test for courses dataset 400", function () {

		let ENDPOINT_URL = "/query";
		let queryData = {
			WHERE: {
				AND: [
					{
						GT: {
							course_avg: 90
						}
					},
					{
						LT: {
							courses_avg: 100
						}
					},
					{
						GT: {
							courses_pass: 20
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"AvgCourseScore",
					"courses_dept",
					"courses_id"
				],
				ORDER: {
					dir: "DOWN",
					keys: [
						"AvgCourseScore"
					]
				}
			},
			TRANSFORMATIONS: {
				GROUP: [
					"courses_dept",
					"courses_id"
				],
				APPLY: [
					{
						AvgCourseScore: {
							AVG: "courses_avg"
						}
					}
				]
			}
		};
		try {
			return chai.request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send(queryData)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect.fail();
				})
				.catch(function (err) {
					expect(err.status).to.be.equal(200);
					// some logging here please!

				});
		} catch (err) {
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
