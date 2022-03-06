
import {QueryType} from "./queryStructure";
// check if the query only has where and options and in right order
export function checkQuery1(query: unknown){
	let query2: QueryType = query as QueryType;
	return (Object.keys(query2).length === 2) && (Object.keys(query2)[0] === "WHERE")
		&& (Object.keys(query2)[1] === "OPTIONS");
}

// check if where is valid
export function checkQueryWhere(query: unknown)  {
	let query2: any = query as any;
	let where = query2["WHERE"];
	if(where === null || where === undefined) {
		return false;
	}
	if (Object.keys(where).length > 1) {
		return false;
	}
	if (Object.keys(where).length === 0) {
		return true;
	}
	if(checkWHREREFilter(where)) {
		return true;
	}

}

export function checkWHREREFilter(where: any){
	let filter = Object.keys(where)[0];
	if ((filter === "AND") || (filter === "OR")){
		return checkLogic(where[filter]);
	}
	if ((filter === "GT") || (filter === "LT") || (filter === "EQ")){
		return checkMCOMPARATOR(where[filter]);
	}
	if ((filter === "IS") ){
		return checkIs(where[filter]);
	}
	if ((filter === "NOT") ){
		checkWHREREFilter(where["NOT"]);
	} else {
		return false;
	}

}
export function checkMCOMPARATOR(obj: any) {
	if (Object.keys(obj).length !== 1){
		return false;
	}
	let key = Object.keys(obj)[0];
	if (key.split("_").length !== 2) {
		return false;
	}
	let datasetId = key.split("_") [0];
	let mfield = key.split("_")[1];
	let value = Object.values(obj)[1];
	if (typeof value !== "number") {
		return false;
	}
	if (!(mfield === "avg" || mfield === "pass" || mfield === "fail" || mfield === "audit" || mfield === "year")) {
		return false;
	}
	// should also check if the datasedId is valid  and consisitent.
	// if (datasetId != ID) {
	// 	return false
	// }


	{
		return false;
	}
}

export function checkLogic(obj: any) {
	for(let o of obj) {
		if (Object.keys(o).length !== 0) {
			checkWHREREFilter(o);
		}
	}
}

export function checkIs(obj: any) {
	if (Object.keys(obj).length !== 1){
		return false;
	}
	let key = Object.keys(obj)[0];
	if (key.split("_").length !== 2) {
		return false;
	}
	let datasetId = key.split("_") [0];
	let sfield = key.split("_")[1];
	if (!(sfield === "dept" || sfield === "id" || sfield === "instructor" || sfield === "title"
		|| sfield === "uuid")) {
		return false;
	}
	let value = Object.values(obj)[1];
	if ((typeof value !== "string") || value) {
		return false;
	}
}

