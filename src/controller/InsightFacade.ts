import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult, NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import JSZip from "jszip";
import {ClassRoomObject, CourseObject, createTestDataset, TestDataset,} from "../helper/dataset";
import {DataStore} from "../helper/dataStore";
import * as fs from "fs-extra";
import {QueryCheck} from "../helper/QueryCheck";
import {QueryCompute} from "../helper/QueryCompute";
import * as ObjectParseHelper from "../helper/ObjectParsing";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */


export default class InsightFacade implements IInsightFacade {

	private insightDatasets: TestDataset[];
	private persistenceDir = "./data/";
	private dataStoreHelperObject: DataStore = new DataStore(this.persistenceDir);

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = this.PersistenceRead();
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

		// Check the ID before adding it
		let checkResult: boolean|InsightError = this.IDIsValid(id);
		if(checkResult !== true) {
			return Promise.reject(checkResult);
		}

		// Load zip file.
		let jszip = new JSZip();
		jszip = await jszip.loadAsync(content, {base64: true}).catch(
			(e) => Promise.reject(new InsightError(e + id))
		);

		let parsedObj: CourseObject[] | ClassRoomObject[] = [];
		// Parse objects and create new testDataset Object.
		if(kind === InsightDatasetKind.Courses) {
			let tempObj: CourseObject[] = await ObjectParseHelper.CourseObjectParseHelper(jszip).catch((e) => {
				return Promise.reject(new InsightError(e));
			});
			parsedObj = tempObj;
			const numRows = parsedObj.length;
			let testDataset: TestDataset = createTestDataset(id, content, kind, numRows, parsedObj);
			this.insightDatasets.push(testDataset);

		} else if(kind === InsightDatasetKind.Rooms) {
			let tempObj: ClassRoomObject[] = await ObjectParseHelper.ClassRoomObjectParseHelper(jszip).catch((e) => {
				return Promise.reject(new InsightError(e));
			});
			parsedObj = tempObj;
			const numRows = parsedObj.length;
			let testDataset: TestDataset = createTestDataset(id, content, kind, numRows, parsedObj);
			this.insightDatasets.push(testDataset);

		} else {
			return Promise.reject(new InsightError("Unknown InsightDatasetKind"));
		}


		// push this dataset into the dataset list

		this.PersistenceWrite();
		// Fetch IDs of datasets for return
		return Promise.resolve(this.ListIDs());

	}

	public removeDataset(id: string): Promise<string> {
		// Check the ID before remove it
		switch (InsightFacade.IDValidTest(id)) {
			case -1: 	return Promise.reject(new InsightError(id + " contains only whitespace."));
			case -2: 	return Promise.reject(new InsightError(id + " contains underscore."));
		}

		// The remove method of array will cause an "undefined" element remain in that position.
		// So constructing a new Dataset array without the deleted element here can avoid that problem.
		let tempDataset: TestDataset[] = [];
		let foundFlag: boolean = false;
		for(let dataset of this.insightDatasets) {
			if (dataset.id === id) {
				foundFlag = true;
				continue;
			}
			tempDataset.push(dataset);
		}

		if(!foundFlag) {
			// Didn't find ID in array:
			return Promise.reject(new NotFoundError(id + " is not found."));
		} else {
			// Update datasets.
			this.insightDatasets = tempDataset;
			this.PersistenceWrite();
			return Promise.resolve(id);
		}
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		let Check = new QueryCheck(this.insightDatasets);
		let compute = new QueryCompute(this.insightDatasets);
		if (Check.queryCheck(query)) {
			let computedQuery = compute.queryCompute(query);
			if(computedQuery instanceof InsightError) {
				return Promise.reject(computedQuery);
			} else if (computedQuery.length > 5000) {
				return Promise.reject(new ResultTooLargeError("the result is over 5000"));
			} else {
				return computedQuery;
			}
		} else {
			return Promise.reject(new InsightError("query not valid"));
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let tempDatasets: InsightDataset[] = [];
		for (let dataset of this.insightDatasets) {
			let testDataset: InsightDataset;
			testDataset = {
				id : dataset.id,
				kind : dataset.kind,
				numRows : dataset.numRows
			};
			tempDatasets.push(testDataset);
		}
		return Promise.resolve(tempDatasets);
	}

	/**
		* -------------------------
		* Below are helper functions
		* -------------------------
	 */

	/**
	 * This is a helper function for checking ID validity.
	 * @param id string
	 * @return true: ID is valid OR
	 * @return InsightError: ID is not valid, reason is in error reason.
	 */
	private IDIsValid(id: string): boolean|InsightError {
		switch (InsightFacade.IDValidTest(id)) {
			case -1:
				return new InsightError(id + " contains only whitespace.");
			case -2:
				return new InsightError(id + " contains underscore.");
		}

		// Check if the Dataset already added
		if (this.HasDuplicateDataset(id)) {
			return new InsightError(id + " has been added before.");
		}

		return true;
	}

	/**
	 * This is a helper function for checking ID validity.
	 * @param id: string
	 * @return -1 (only whitespace), -2 (contains underscore), 0 (OK)
	 */
	private static IDValidTest(id: string): number {
		// ID with only whitespace
		if(id.trim().length === 0){
			return -1;
		}
		// ID contains underscore
		if(id.match("_") !== null){
			return -2;
		}
		return 0;
	}


	/**
	 * This is a helper function for checking if an ID already exists.
	 * @param id string
	 * @return true (The ID already exists), false (OK)
	 */
	private HasDuplicateDataset(id: string): boolean {
		for (let dataset of this.insightDatasets) {
			if(dataset.id === id){
				return true;
			}
		}
		return false;
	}

	/**
	 * This is a helper function for listing all IDs.
	 * @return A string[] contains all IDs
	 */
	private ListIDs(): string[] {
		let ids: string[] = [];
		for (let dataset of this.insightDatasets) {
			ids.push(dataset.id);
		}
		return ids;
	}

	private PersistenceRead(): TestDataset[]{
		return this.dataStoreHelperObject.testRead() as TestDataset[];
	}

	private PersistenceWrite(): void{
		if(fs.pathExistsSync(this.persistenceDir)) {
			fs.removeSync(this.persistenceDir);
		}
		fs.mkdirSync(this.persistenceDir);
		this.insightDatasets.forEach((dataset) => {
			this.dataStoreHelperObject.testStore(dataset, dataset.id);
		});
		console.log("PersistenceWrite To be implemented");
	}

}
