import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */

/**
 * Self-designed types
 * TODO: Consider rename. Consider Persistent this.
 */
interface TestDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
	content: string;
}

export default class InsightFacade implements IInsightFacade {

	private insightDatasets: TestDataset[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.insightDatasets = [];
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: the PERSISTENCE part, return REJECT here if necessary.
		// Check the ID before adding it
		switch (InsightFacade.IDValidTest(id)) {
			case -1:
				return Promise.reject(new InsightError(id + " contains only whitespace."));
			case -2:
				return Promise.reject(new InsightError(id + " contains underscore."));
		}

		// Check if the Dataset already added
		if (this.DuplicateDatasetTest(id)) {
			return Promise.reject(new InsightError(id + " has been added before."));
		}

		let jszip = new JSZip();

		// Load and list files.
		jszip = await jszip.loadAsync(content, {base64: true}).catch(
			(e) => Promise.reject(new InsightError(e + id))
		);

		if(InsightFacade.BlankJsonTest(jszip)){
			return Promise.reject(new InsightError("Found a empty json file"));
		}

		let a = await jszip.folder("courses")?.files;
		let fileList;
		if (a === undefined) {
			return Promise.reject(new InsightError("File Reading Error"));
		} else if (Object.keys(a).length === 1) {
			return Promise.reject(new InsightError("Empty folder"));
		} else {
			fileList = jszip.files;
		}
		const numRows = InsightFacade.NumRowsHelper(jszip);


		// Create a new Dataset for add
		let testDataset: TestDataset;
		testDataset = {
			id: id,
			content: content,
			kind: kind,
			numRows: numRows
		};
		this.insightDatasets.push(testDataset);

		// Fetch IDs of datasets for return

		return Promise.resolve(this.ListIDs());
	}

	public removeDataset(id: string): Promise<string> {
		// Check the ID before adding it
		switch (InsightFacade.IDValidTest(id)) {
			case -1: 	return Promise.reject(new InsightError(id + " contains only whitespace."));
			case -2: 	return Promise.reject(new InsightError(id + " contains underscore."));
		}

		// The remove method of array will cause an "undefined" element remain in that position.
		// So constructing a new Dataset array without the deleted element here can avoid that problem.
		let tempDataset: TestDataset[] = [];
		let foundFlag: number = 0;
		for(let dataset of this.insightDatasets) {
			if(dataset.id === id) {
				foundFlag = 1;
				continue;
			}
			tempDataset.push(dataset);
		}

		if(foundFlag === 0) {
			// Didn't find ID in array:
			return Promise.reject(new NotFoundError(id + " is not found."));
		} else {
			// Update datasets.
			this.insightDatasets = tempDataset;
			return Promise.resolve(id);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
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

	/* NOTE: This function may be unnecessary and will get removed upon confirmed */

	/**
	 * This is a helper function for checking if the content is OK.
	 * @param jszip
	 * @return true (Blank Json file exists), false (OK)
	 */
	private static BlankJsonTest(jszip: JSZip): boolean {
		// TODO
		/*
		let fileList = jszip.files;
		for (let file in fileList) {
			console.log(file);
			jszip.files[file].async("text")?.then( (e) => console.log(e));
		}
		*/
		return false;
	}

	/**
	 * This is a helper function for counting NumRows.
	 * @param jszip JSZip
	 * @return number
	 */
	private static NumRowsHelper(jszip: JSZip): number {
		// TODO
		return 0;
	}

	/**
	 * This is a helper function for checking if an ID already exists.
	 * @param id string
	 * @return true (The ID already exists), false (OK)
	 */
	private DuplicateDatasetTest(id: string): boolean {
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

}
