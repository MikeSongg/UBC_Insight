import {InsightDatasetKind} from "../controller/IInsightFacade";


/**
 * Self-designed types
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
	// Full building name (e.g., "Hugh Dempster Pavilion").
	fullname: string;
	// Short building name (e.g., "DMP").
	shortname: string;
	// The room number. Not always a number, so represented as a string.
	number: string;
	// The room id; should be rooms_shortname+"_"+rooms_number.
	name: string;
	// The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
	address: string;
	// The latitude of the building, as received via HTTP request.
	lat: number;
	// The longitude of the building, as received via HTTP request.
	lon: number;
	// The number of seats in the room. The default value for this field
	// (should this value be missing in the dataset) is 0.
	seats: number;
	// The room type (e.g., "Small Group").
	type: string;
	// The room furniture (e.g., "Classroom-Movable Tables & Chairs").
	furniture: string;
	// The link to full details online
	// (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").
	href: string;
}

interface HTMLObject {
	nodeName: string;
	name?: string;
	value?: string;
	parentNode?: HTMLObject;
	attrs?: Array<{
		name: string;
		value: string;
	}>;
	childNodes?: HTMLObject[];
}

interface BuildingObject {
	code: string;
	building: string;
	address: string;
	link: string;
	lat: number;
	lon: number;
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
/* Function that no longer needed.
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
*/
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
	HTMLObject,
	BuildingObject,
	CourseObjectHelper,
	createTestDataset
};
