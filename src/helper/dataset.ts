import {InsightDatasetKind, InsightResult} from "../controller/IInsightFacade";


/**
 * Self-designed types
 * TODO: Consider rename. Consider Persistent this.
 */

interface TestDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
	content: string;
	// Map< ClassName, ClassObject >
	coursesObj?: CourseObject[];
	classRoomObj?: ClassRoomObject[];
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

interface CourseObject {
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

interface ClassRoomObject {
	[key: string]: unknown;
	// TODO
}

function CourseObjectHelper(section: object): CourseObject{
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

function CourseObjectToInsightResult(objList: CourseObject[]): InsightResult[] {
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

function createTestDataset(id: string, content: string, kind: InsightDatasetKind,
	numRows: number, parsedObj: object[]): TestDataset {
	let testDataset: TestDataset;
	testDataset = {
		id: id,
		content: content,
		kind: kind,
		numRows: numRows,
		coursesObj: [],
	};
	if(kind === InsightDatasetKind.Courses) {
		testDataset.coursesObj = parsedObj as CourseObject[];
	} else if (kind === InsightDatasetKind.Rooms) {
		testDataset.classRoomObj = parsedObj as ClassRoomObject[];
	}
	return testDataset;
}

export {TestDataset,
	CourseObject,
	ClassRoomObject,
	CourseObjectHelper,
	CourseObjectToInsightResult,
	createTestDataset
};
