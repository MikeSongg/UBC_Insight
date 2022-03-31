import {
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import chaiAsPromised from "chai-as-promised";
import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect,use} from "chai";
use(chaiAsPromised);

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
		coursesValid2: "./test/resources/archives/courses.zip",
		blankFolder: "./test/resources/archives/blankFolder.zip",
		blankJson: "./test/resources/archives/blankJson.zip",
		notZip: "./test/resources/archives/notZip.txt",
		rooms: "./test/resources/archives/rooms.zip",
		weirdZip: "./test/resources/archives/weirdZip.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();

		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("Should add two valid datasets", function () {
			const id1: string = "courses";
			const content1: string = datasetContents.get("courses") ?? "";
			const id2: string = "coursesValid2";
			const content2: string = datasetContents.get("coursesValid2") ?? "";
			const result = insightFacade.addDataset(id1,content1,InsightDatasetKind.Courses)
				.then(() => insightFacade.addDataset(id2,content2,InsightDatasetKind.Courses));
			return expect(result).eventually.to.deep.equal([id1,id2]);
		});

		it ("should reject adding invalid dataset  (id -> underscore) ",  function () {
			const id: string = "courses_";
			const content: string = datasetContents.get("courses") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);

		});
		it ("should reject adding invalid dataset  (blank folder) ",  function () {
			const id: string = "blankFolder";
			const content: string = datasetContents.get("blankFolder") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject adding invalid dataset  (blank json file inside folder) ",  function () {
			const id: string = "blankJson";
			const content: string = datasetContents.get("blankJson") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);

		});

		it ("should reject adding invalid dataset  (id -> all blank space) ",  function () {
			const id: string = " ";
			const content: string = datasetContents.get("courses") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject adding invalid dataset  (no id) ",  function () {
			const id: string = "";
			const content: string = datasetContents.get("courses") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject adding invalid dataset  (not zip file) ",  function () {
			const id: string = "notZip";
			const content: string = datasetContents.get("notZip") ?? "";
			const result = insightFacade.addDataset(id,content,InsightDatasetKind.Courses);
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject if dataset(courses) added before ",  function () {
			const id1: string = "courses";
			const content1: string = datasetContents.get("courses") ?? "";
			const result = insightFacade.addDataset(id1,content1,InsightDatasetKind.Courses)
				.then(() => insightFacade.addDataset(id1,content1,InsightDatasetKind.Courses));
			return expect(result).eventually.to.be.rejectedWith(InsightError);

		});

		it ("should remove a valid dataset(courses)",  function () {
			const id1: string = "courses";
			const content1: string = datasetContents.get("courses") ?? "";
			const result = insightFacade.addDataset(id1,content1,InsightDatasetKind.Courses)
				.then(() => insightFacade.removeDataset(id1));
			return expect(result).eventually.to.deep.equal("courses");
		});

		it ("should reject removing invalid dataset  (id -> underscore) ",  function () {
			const result = insightFacade.removeDataset("course_");
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});
		it ("should reject removing invalid dataset  (id -> all blank space) ",  function () {
			const result = insightFacade.removeDataset(" ");
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject removing invalid dataset  (no id) ",  function () {
			const result = insightFacade.removeDataset("");
			return expect(result).eventually.to.be.rejectedWith(InsightError);
		});

		it ("should reject if dataset(courses) not added before ",  function () {
			const result = insightFacade.removeDataset("courses");
			return expect(result).eventually.to.be.rejectedWith(NotFoundError);
		});
		it ("should list no dataset",  function () {
			const futureInsightDatasets = insightFacade.listDatasets();
			return expect(futureInsightDatasets).to.eventually.deep.equal([]);
		});

		it ("should list one dataset ",  function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((addedIds) => insightFacade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					}]);
				});
		});

		/** NOTE: Bug fixed: it added datasets with same ID twice**/
		it ("should list multiple ",  function () {
			const id1: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset(id1, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset(id1 + "Beep",content,InsightDatasetKind.Courses);
				})
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});

		it ("should be persistence",  function () {
			const id1: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset(id1, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset(id1 + "Beep",content,InsightDatasetKind.Courses);
				})
				.then(() => {
					let a = new InsightFacade();
					return a.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});

		// It should add a zip file where exists both courses/ and rooms/ folders
		it("Should fix the lifecycle problem (only reads from corresponding folder)", function () {
			const id: string = "weirdZip";
			const content: string = datasetContents.get("weirdZip") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		// It should add rooms dataset.
		it("Should add rooms dataset", function () {
			const id: string = "rooms";
			const content: string = datasetContents.get("rooms") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
				insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms)
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(actual, expected) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});
});
