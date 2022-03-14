import {InsightDatasetKind, InsightResult} from "../controller/IInsightFacade";


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
	coursesObj: CourseObject[];
}

interface OriginalCourseObject {
	Section:            string;
	Subject: 			string; // Subject
	Course:				string; // Course
	Avg:			number; // Avg
	Professor:		string; // Professor
	Title:			string; // Title
	Pass:			number; // Pass
	Fail:			number; // Fail
	Audit:			number; // Audit
	id:				number; // id
	Year:			string; // year
}

export interface CourseObject {
	dept: 			string; // Subject
	id:				string; // Course
	avg:			number; // Avg
	instructor:		string; // Professor
	title:			string; // Title
	pass:			number; // Pass
	fail:			number; // Fail
	audit:			number; // Audit
	uuid:			string; // id
	year:			number; // Year
}

export function CourseObjectHelper(section: object): CourseObject{
	let sec = section as OriginalCourseObject;
	return {
		dept: 			sec.Subject, // Subject
		id:				sec.Course, // Course
		avg:			sec.Avg, // Avg
		instructor:		sec.Professor, // Professor
		title:			sec.Title, // Title
		pass:			sec.Pass, // Pass
		fail:			sec.Fail, // Fail
		audit:			sec.Audit, // Audit
		uuid:			sec.id.toString(), // id
		year:			(sec.Section === "overall") ? 1900 : parseInt(sec.Year,10) // Year
	} as CourseObject;
}

export function CourseObjectToInsightResult(objList: CourseObject[]): InsightResult[] {
	let insightResultList: InsightResult[] = [];
	objList.forEach((cObj) => {
		let insightResult: InsightResult = {};
		let key: (keyof CourseObject);
		for(key in cObj) {
			insightResult[key] = cObj[key];
		}
		insightResultList.push(insightResult);
	});
	return insightResultList;
}
