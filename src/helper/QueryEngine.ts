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


export default class QueryEngine {

	private insightDataset: TestDataset[];

	constructor(dataset: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDataset = dataset;
	}

	public async query(query: any): Promise<InsightResult[]> {
		this.supertest(query);
		console.log("CaptureMe!");
		return Promise.reject("TODO");
	}

	private supertest(query: string): string {
		return "haha";
	}
}
