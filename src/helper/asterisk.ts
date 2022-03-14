import {CourseObject} from "./dataset";
import {InsightError} from "../controller/IInsightFacade";


// equal, endswith and starwith, includs are helper function for asterisk

export function Equal(skey: any, filteredSections: CourseObject[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		switch(skey){
			case "dept": if (sec.dept.includes(value)) {
				arr.push(sec);
			}
				break;
			case "id": if (sec.id.includes(value)) {
				arr.push(sec);
			}
				break;
			case "instructor": if (sec.instructor.includes(value)) {
				arr.push(sec);
			}
				break;
			case "title": if (sec.title.includes(value)) {
				arr.push(sec);
			}
				break;
			case "uuid": if (sec.uuid.includes(value)) {
				arr.push(sec);
			}
				break;
		}
	}


	return arr;
}

export function startWith(skey: any, filteredSections: CourseObject[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		switch(skey){
			case "dept": if (sec.dept.startsWith(value)) {
				arr.push(sec);
			}
				break;
			case "id": if (sec.id.startsWith(value)) {
				arr.push(sec);
			}
				break;
			case "instructor": if (sec.instructor.startsWith(value)) {
				arr.push(sec);
			}
				break;
			case "title": if (sec.title.startsWith(value)) {
				arr.push(sec);
			}
				break;
			case "uuid": if (sec.uuid.startsWith(value)) {
				arr.push(sec);
			}
				break;
		}
	}
	return arr;
}

export function includes(skey: any, filteredSections: CourseObject[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		switch(skey){
			case "dept": if (sec.dept.includes(value)) {
				arr.push(sec);
			}
				break;
			case "id": if (sec.id.includes(value)) {
				arr.push(sec);
			}
				break;
			case "instructor": if (sec.instructor.includes(value)) {
				arr.push(sec);
			}
				break;
			case "title": if (sec.title.includes(value)) {
				arr.push(sec);
			}
				break;
			case "uuid": if (sec.uuid.includes(value)) {
				arr.push(sec);
			}
				break;
		}
	}
	return arr;
}

export function endWith(skey: any, filteredSections: CourseObject[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		switch(skey){
			case "dept": if (sec.dept.endsWith(value)) {
				arr.push(sec);
			}
				break;
			case "id": if (sec.id.endsWith(value)) {
				arr.push(sec);
			}
				break;
			case "instructor": if (sec.instructor.endsWith(value)) {
				arr.push(sec);
			}
				break;
			case "title": if (sec.title.endsWith(value)) {
				arr.push(sec);
			}
				break;
			case "uuid": if (sec.uuid.endsWith(value)) {
				arr.push(sec);
			}
				break;
		}
	}
	return arr;
}
