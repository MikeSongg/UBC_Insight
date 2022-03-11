import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";
import QueryEngine from "../helper/QueryEngine";
import {CourseObject, TestDataset, CourseObjectHelper} from "../helper/dataset";
import {DataStore} from "../helper/dataStore";
import * as fs from "fs-extra";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */


export default class InsightFacade implements IInsightFacade {

	private insightDatasets: TestDataset[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = InsightFacade.PersistenceRead();
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

		// Parse objects and create new testDataset Object.
		let Obj: CourseObject[] = await InsightFacade.ObjectParseHelper(jszip).catch( (e) => {
			return Promise.reject(new InsightError(e));
		});

		const numRows = Obj.length;

		// push this dataset into the dataset list
		let testDataset: TestDataset;
		testDataset = {
			id: id,
			content: content,
			kind: kind,
			numRows: numRows,
			coursesObj: Obj
		};
		this.insightDatasets.push(testDataset);

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
		let engine = new QueryEngine(this.insightDatasets);

		return engine.queryEngine(query);
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
	 * This is a helper function for parsing course objects.
	 * This is a complicate function, please check comments inside.
	 * @param jszip JSZip
	 * @return Promise<Map<string, string>>
	 */
	private static async ObjectParseHelper(jszip: JSZip): Promise<CourseObject[]> {
		/** NOTE: Map < key, Object> */
		let a = new Array<CourseObject>();

		/** This set of Promises contains the Promise of every file parsing. */
		let PromiseSet: Array<Promise<boolean>> = [];

		/** Reject if the folder is empty */
		const fileList = await jszip.folder("courses")?.files;
		if (fileList === undefined) {
			return Promise.reject(new InsightError("File Reading Error"));
		} else if (Object.keys(fileList).length === 1) {
			return Promise.reject(new InsightError("Empty folder"));
		}

		/** Traverse the fileList. */
		for (let file in fileList) {
			if(file !== "courses/") {			/** Exclude the root folder. */
				PromiseSet.push(
					jszip.files[file].async("text")?.then((str) => {
						if (str === "") {
							/** Found an empty json file. */
							return Promise.reject();
						} else {
							/** File ok, parse and push. */
							let sectionList = JSON.parse(str).result as object[];
							// a.push(cObj);

							for(let section in sectionList) {
								a.push(CourseObjectHelper(sectionList[section]));
							}
							return true;
						}
					}).catch( (e) => {
						/** throw the exception to higher level. */
						return Promise.reject(e);
					})
				);
			}
		}

		/** Wait for all Promise to finish and return, then check if empty file exists. */
		let hasBlank = await Promise.allSettled(PromiseSet).then((resultSet) => {
			return resultSet.every((result) =>
				result.status === "rejected"
			);
		});

		if(hasBlank) {
			/** Reject if contains empty file. */
			return Promise.reject(new InsightError("Blank File"));
		} else {
			/** Files good, return the object hashmap */
			return Promise.resolve(a);
		}
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

	private static PersistenceRead(): TestDataset[]{
		// TODO: Read the data structure from disk
		let ds = new DataStore( "./data/");
		return ds.testRead() as TestDataset[];
	}

	private PersistenceWrite(): void{
		// TODO: Write the data structure to disk
		// this.insightDatasets = this.insightDatasets;
		let persistenceDir = "./data/";
		let ds = new DataStore(persistenceDir);
		if(fs.pathExistsSync(persistenceDir)) {
			fs.removeSync(persistenceDir);
		}
		fs.mkdirSync(persistenceDir);
		this.insightDatasets.forEach((dataset) => {
			ds.testStore(dataset, dataset.id);
		});
		console.log("PersistenceWrite To be implemented");
	}

}
