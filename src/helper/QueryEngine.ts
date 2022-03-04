// TODO
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "../controller/IInsightFacade";
import JSZip from "jszip";
import {TestDataset} from "./dataset";
import {
	IntendedQueryRequest,
	IntendedWHERE,
	IntendedOPTIONS
} from "./QueryTypes";


export default class QueryEngine {


	private insightDataset: TestDataset[];

	constructor(dataset: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDataset = dataset;
	}

	public async queryEngine(queryRequest: unknown): Promise<InsightResult[]> {
		// this.supertest(queryRequest);
		if (queryRequest === null) {
			return Promise.reject(new InsightError("Null object"));
		}
		console.log((queryRequest as IntendedQueryRequest).WHERE);
		// console.log((queryRequest as object) ["WHERE"]);
		return Promise.reject("TODO");
	}
}
