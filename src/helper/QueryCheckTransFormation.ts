import {InsightError} from "../controller/IInsightFacade";

export function checkApplyValue(value: any, id: string, datasetKind: string, courseField: string[], roomField: string[],
	courseNumberField: string[], roomNumberField: string[]) {
	if (typeof value !== "object") {
		return new InsightError("apply value should be an object");
	}
	if (Object.keys(value).length !== 1) {
		return new InsightError("length of apply value should be 1");
	}
	let applyToken = Object.keys(value)[0];
	let key = Object.values(value)[0];
	if (typeof key !== "string") {
		return new InsightError("key should be string");
	}
	if (applyToken === "COUNT") {
		let datasetId = key.split("_") [0];
		let mfield = key.split("_")[1];
		if (datasetKind === "course") {
			return courseField.includes(mfield) && id === datasetId;
		}
		if (datasetKind === "room") {
			return roomField.includes(mfield) && id === datasetId;
		}
	}
	if (applyToken === "MAX" || applyToken === "MIN" || applyToken === "AVG" || applyToken === "SUM" ) {
		let datasetId = key.split("_") [0];
		let mfield = key.split("_")[1];
		if (datasetKind === "course") {
			return courseNumberField.includes(mfield) && id === datasetId;
		}
		if (datasetKind === "room") {
			return roomNumberField.includes(mfield) && id === datasetId;
		}
	}
}
