import {InsightError} from "../controller/IInsightFacade";
import {TestDataset} from "./dataset";

export class QueryCheckWhere {
	private Id: any;
	private courseNumberField: string[] = ["avg", "pass" , "fail" , "audit" , "year"];
	private courseStringField: string[] = ["dept", "id" , "instructor" , "title" , "uuid"];
	private roomNumberField: string[] = ["lat", "lon" , "seats"];
	private roomStringField: string[] = ["fullname", "shortname" , "number" , "name" , "address","type","furniture"
		,"href"];

	private datasetKind: string;

	constructor( datasetKind: string, id: string) {
		console.log("InsightFacadeImpl::init()");
		this.datasetKind = datasetKind;
		this.Id = id;

	}

	public  checkQueryWhere(where: any)  {
		if(where === null || where === undefined) {
			return new InsightError("where is not defined");
		}
		if (typeof where !== "object") {
			return new InsightError("where is not object");
		}
		if (Object.keys(where).length === 0) {
			return true;
		}
		if (Object.keys(where).length === 1) {
			return this.checkWHREREFilter(where);
		} else {
			return new InsightError("not 1 key in where");
		}
	}

	private checkWHREREFilter(where: any): any {
		let filter = Object.keys(where)[0];
		if ((filter === "AND") || (filter === "OR")){
			return this.checkLogic(where[filter]);
		}
		if ((filter === "GT") || (filter === "LT") || (filter === "EQ")){
			return this.checkMCOMPARATOR(where[filter]);
		}
		if ((filter === "IS") ){
			return this.checkIs(where[filter]);
		}
		if ((filter === "NOT") ){
			return this.checkWHREREFilter(where[filter]);
		} else {
			return new InsightError("filter is not defined");
		}
	}

	private  checkLogic(filters: any) {
		if (!Array.isArray(filters)) {
			return new InsightError("logic should compute an array");
		}
		if (filters.length < 1 ) {
			return new InsightError("array should be at least 1 length");
		}
		for(let o of filters) {
			if (typeof o !== "object") {
				return new InsightError("filters inside array are not objects");
			}
			if (!this.checkWHREREFilter(o)) {
				return new InsightError("filters inside array not valid");
			}
		}
		return true;
	}

	private  checkMCOMPARATOR(obj: any) {
		if (typeof obj !== "object") {
			return new InsightError("mcom is not object");
		}
		if (Object.keys(obj).length !== 1){
			return new InsightError("there should be only 1 key");
		} else {
			let key = Object.keys(obj)[0];
			if (key.split("_").length !== 2) {
				return new InsightError("key is not valid");
			} else {
				let datasetId = key.split("_") [0];
				let mfield = key.split("_")[1];
				let value = Object.values(obj)[0];
				if (typeof value !== "number") {
					return new InsightError("value should be number");
				}
				if (this.datasetKind === "course") {
					return (this.courseNumberField.includes(mfield) && this.Id === datasetId);
				}
				if (this.datasetKind === "room") {
					return (this.roomNumberField.includes(mfield) && this.Id === datasetId);
				}
			}
		}
	}

	private  checkIs(obj: any) {
		if (typeof obj !== "object") {
			return new InsightError("IS is not object");
		}
		if (Object.keys(obj).length !== 1){
			return new InsightError("not 1 key in IS");
		} else {
			let key = Object.keys(obj)[0];
			if (key.split("_").length !== 2) {
				return new InsightError("not valid key in IS");
			} else {
				let datasetId = key.split("_") [0];
				let sfield = key.split("_")[1];

				let value = Object.values(obj)[0];

				if ((typeof value !== "string")) {
					return new InsightError("value is not string");
				}
				let subvalues = value.split("*");
				if (subvalues.length > 3 || subvalues.length < 1) {
					return new InsightError("asterisk more than 1 or invalid");
				}
				if (subvalues.length === 3) {
					if (!(subvalues[0] === "" && subvalues[2] === "")) {
						return new InsightError(" value is not *a*");
					}
				}
				if (subvalues.length === 2) {
					if (!(subvalues[0] === "" || subvalues[1] === "")) {
						return new InsightError("value is not a* or *a");
					}
				}
				if (this.datasetKind === "course") {
					return (this.courseStringField.includes(sfield) && this.Id === datasetId);
				}
				if (this.datasetKind === "room") {
					return (this.roomStringField.includes(sfield) && this.Id === datasetId);
				}
			}
		}
	}
}
