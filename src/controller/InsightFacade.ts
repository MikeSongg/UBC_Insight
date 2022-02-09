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

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: the PERSISTENCE part, return REJECT here if necessary.
		let testDataset: TestDataset;
		testDataset = {
			id : id,
			content : content,
			kind : kind,
			numRows : 0// HELPFUNCTION HERE
		};
		insightDatasets.push(testDataset);

		let ids: string[] = [];
		for(let dataset of insightDatasets) {
			ids.push(dataset.id);
		}
		return Promise.resolve(ids);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
