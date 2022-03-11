import {
	InsightError,
	InsightResult, NotFoundError,
} from "../controller/IInsightFacade";
import {CourseObject, TestDataset} from "./dataset";

import {
	IntendedBody, IntendedOptions,
	IntendedQuery
} from "./QueryTypes";

/**
 * Map< String of queryKeys, String of key in data source >
 *
 * Extra information about id -> Course and uuid -> id
 * https://piazza.com/class/ky0cd80u11m7bs?cid=650
 */
const keyTranslation: Map<string, string> = new Map<string, string>([
	["dept", "dept"],
	["id", "Course"],
	["avg", "Avg"],
	["instructor", "Professor"],
	["title", "Title"],
	["pass", "Pass"],
	["fail", "Fail"],
	["audit", "Audit"],
	["uuid", "id"],
	["year", "Year"]
]);

export default class QueryEngine {


	private insightDataset: TestDataset[];

	constructor(dataset: TestDataset[]) {
		console.log("InsightFacadeImpl::init()");
		this.insightDataset = dataset;
	}

	public async queryEngine(queryRequest: unknown): Promise<InsightResult[]> {
		// TODO
		// this.supertest(queryRequest);

		let request = queryRequest as IntendedQuery;
		if (QueryEngine.isQueryValid(request) !== true) {
			return Promise.reject(new InsightError(""));
		}
		let columns = request.OPTIONS.COLUMNS;
		/*
		if(typeProtect !== undefined) {
			random = typeProtect;
		} else {
			return Promise.reject("Object does not fit.");
		}
		*/

		/*
		let theSelectedDataset: Map<string, string>;
		Object.entries(columns).forEach(
			([key, value]) => {
				console.log(key, value);
				console.log(QueryEngine.queryKeysParser(key));

			}
		);
		*/

		// let selectedCoursesStr: object

		/*
		let tempCourseObj = this.fetchCourseObj("courses");
		if(tempCourseObj instanceof NotFoundError) {
			return Promise.reject(tempCourseObj);
		} else {
			console.log("Haha");
		}
		 */
		return Promise.reject("TODO");
	}

	/**
	 * -------------------------
	 * Below are helper functions
	 * -------------------------
	 */

	/**
	 *
	 * @param queryKey
	 * @private
	 * @param queryKey string
	 * @return string[]
	 * the first element in this array will be dataset_id, the second will be dataset_key.
	 */
	private static queryKeysParser(queryKey: string): string[] {
		let stringArrayForReturn: string[] = [];
		let cuttingPlace = queryKey.indexOf("_");
		stringArrayForReturn.push(queryKey.substring(0, cuttingPlace));
		stringArrayForReturn.push(queryKey.substring(cuttingPlace + 1));
		return stringArrayForReturn;
	}

	/**
	 * @private
	 * @param where IntendedBody
	 * @param courseObj courseObject
	 * @return boolean
	 * the first element in this array will be dataset_id, the second will be dataset_key.
	 */
	private courseMeetConstraints(where: IntendedBody, courseObj: CourseObject): boolean {
		// TODO
		return true;
	}

	/**
	 * @private
	 * @param where IntendedBody
	 * @param courseObj courseObject
	 * @return boolean
	 * the first element in this array will be dataset_id, the second will be dataset_key.
	 */
	/*
	private fetchCourseObj(key: string): Map<string, CourseObject> | NotFoundError {
		// Maybe it's possible to make this async?
		let selectedDataset: Map<string, CourseObject> | undefined;

		this.insightDataset.forEach((dataset) => {
			if(dataset.id === key) {
				selectedDataset = dataset.coursesObj;
			}
		});

		if(selectedDataset === undefined) {
			return new NotFoundError("Database not found.");
		} else {
			return selectedDataset;
		}
	}
	 */

	/**
	 * @private
	 * @param where IntendedBody
	 * @param courseObj courseObject
	 * @return boolean
	 * the first element in this array will be dataset_id, the second will be dataset_key.
	 */
	private static isQueryValid(queryRequest: unknown): boolean {
		/**
		 * TODO: InsightError when querying multiple datasets
		 * TODO: InsightError when order not in columns
		 */
		if (queryRequest === null) {
			return false;
		} else if (!("WHERE" in (queryRequest as IntendedQuery))) {
			return false;
		} else if (!("OPTIONS" in (queryRequest as IntendedQuery))) {
			return false;
		} else if (queryRequest === "IntendedQuery") {
			return true;

		}
		return true;
	}
}
