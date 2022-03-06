import {InsightDatasetKind} from "../controller/IInsightFacade";


/**
 * Self-designed types
 * TODO: Consider rename. Consider Persistent this.
 */

export interface TestDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
	content: string;
	// Map< ClassName, ClassObject >
	coursesObj: Map<string, string>;
}

export interface CourseObject {
	Subject: 		string; // dept
	Course:			string; // id
	Avg:			number; // avg
	Professor:		string; // instructor
	Title:			string; // title
	Pass:			number; // pass
	Fail:			number; // fail
	Audit:			number; // audit
	/** ID is number in original source but expected to be string in output. */
	id:				number; // uuid
	/** Year is string in original source but expected to be number in output. */
	Year:			string; // year
}
