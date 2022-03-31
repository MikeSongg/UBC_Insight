import {CourseObject} from "./dataset";
import {InsightError} from "../controller/IInsightFacade";


// equal, endswith and starwith, includs are helper function for asterisk

export function Equal(skey: any, filteredSections: any[], value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		if (sec[skey] === (value)) {
			arr.push(sec);
		}
	}
	return arr;
}

export function startWith(skey: any, filteredSections: any[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		if (sec[skey].startsWith(value)) {
			arr.push(sec);
		}
	}
	return arr;
}

export function includes(skey: any, filteredSections: any[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		if (sec[skey].includes(value)) {
			arr.push(sec);
		}
	}
	return arr;
}

export function endWith(skey: any, filteredSections: any[],value: any) {
	let arr = [];
	if (typeof value !== "string") {
		throw new InsightError("not valid");
	}
	for (let sec of filteredSections) {
		if (sec[skey].endsWith(value)) {
			arr.push(sec);
		}
	}
	return arr;
}

