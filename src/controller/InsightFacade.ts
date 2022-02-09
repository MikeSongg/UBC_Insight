import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import internal from "stream";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let insightDatasets: TestDataset[] = [];

interface TestDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
	content: string;
}


export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	// This is a helper function for checking ID validity.
	public IDValidTest(id: string): number {
		// ID with only whitespace
		if(id.trim().length === 0){
			return -1;
		}
		// ID contains underscore
		if(id.match("/^[^_]+$/") === null){
			return -2;
		}
		return 0;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: the PERSISTENCE part, return REJECT here if necessary.
		// Check the ID before adding it
		switch (this.IDValidTest(id)) {
			case -1: 	return Promise.reject(new InsightError(id + " contains only whitespace.")); break;
			case -2: 	return Promise.reject(new InsightError(id + " contains underscore.")); break;
		}

		// Create a new Dataset for add
		let testDataset: TestDataset;
		testDataset = {
			id : id,
			content : content,
			kind : kind,
			// TODO: Need a helper function for numRows.
			numRows : 0
		};
		insightDatasets.push(testDataset);

		// Fetch IDs of datasets for return
		let ids: string[] = [];
		for(let dataset of insightDatasets) {
			ids.push(dataset.id);
		}
		return Promise.resolve(ids);
	}

	public removeDataset(id: string): Promise<string> {
		// Check the ID before adding it
		switch (this.IDValidTest(id)) {
			case -1: 	return Promise.reject(new InsightError(id + " contains only whitespace.")); break;
			case -2: 	return Promise.reject(new InsightError(id + " contains underscore.")); break;
		}

		// The remove method of array will cause an "undefined" element remain in that position.
		// So constructing a new Dataset array without the deleted element here can avoid that problem.
		let tempDataset: TestDataset[] = [];
		let foundFlag: number = 0;
		for(let dataset of insightDatasets) {
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
			insightDatasets = tempDataset;
			return Promise.resolve(id);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let tempDatasets: InsightDataset[] = [];
		for (let dataset of insightDatasets) {
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
}
