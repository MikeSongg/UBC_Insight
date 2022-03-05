import {
	InsightError,
	InsightResult,
} from "../controller/IInsightFacade";
import {TestDataset} from "./dataset";

import {
	IntendedQuery
} from "./QueryTypes";

export default class QueryEngine {


	private insightDataset: TestDataset[];

	constructor(dataset: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDataset = dataset;
	}

	public async queryEngine(queryRequest: unknown): Promise<InsightResult[]> {
		// TODO
		// this.supertest(queryRequest);
		if (queryRequest === null) {
			return Promise.reject(new InsightError("Null object"));
		}
		let request = queryRequest as IntendedQuery;
		const indexedArray: {[key: string]: number} = {
			foo: 2118,
		};
		let random: {[key: string]: number} = request.WHERE.IS ?? indexedArray;
		// console.log(random);

		Object.entries(random).forEach(
			([key, value]) => console.log(key, value)
		);
		// let selectedCoursesStr: object
		return Promise.reject("TODO");
	}
}
