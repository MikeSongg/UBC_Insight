
import {QueryType} from "./queryStructure";
import exp from "constants";
import {CourseObject, TestDataset} from "./dataset";
// check if the query only has where and options and in right order
export function checkQueryInitial(query: any){
	return (Object.keys(query).length === 2) && (Object.keys(query)[0] === "WHERE")
		&& (Object.keys(query)[1] === "OPTIONS");
}
// check if the option is valid. the lenght of Object.keys(opt) should be 1 or 2.
export function checkQueryOPTIONS(query: any)  {
	let opt = query["OPTIONS"];
	if(opt === null || opt === undefined) {
		return false;
	}
	if (Object.keys(opt).length < 1 || Object.keys(opt).length > 2) {
		return false;
	}
	if (Object.keys(opt).length === 1 &&  Object.keys(opt)[0] === "COLUMNS") {
		return checkColumn(opt["COLUMNS"]);
	}
	if (Object.keys(opt).length === 2 && Object.keys(opt)[0] === "COLUMNS" && Object.keys(opt)[1] === "ORDER") {
		return (checkColumn(opt["COLUMNS"]) && checkOrder(opt["ORDER"]));
	} else {
		return false;
	}
}

// check if the column is an arrary, and each element in this arrary are valid  keys.
export function checkColumn(col: any) {
	if(!Array.isArray(col)) {
		return false;
	}
	let idArrary = [];
	// check all keys are valid and id are same, also check if id is added in dataset.
	for(let key of col) {
		let datasetId = key.split("_") [0];
		let field = key.split("_")[1];
		if (!(field === "avg" || field === "pass" || field === "fail" || field === "audit" || field === "year" ||
			field === "dept" || field === "id" || field === "instructor" || field === "title" || field === "uuid")) {
			return false;
		}
		// maybe also add dataset as parameter
		if (!checkIdExist(datasetId)) {
			return false;
		} else {
			idArrary.push(datasetId);
		}

	}
	if (!allSame(idArrary)) {
		return false;
	}
}
export function allSame(Arrary: string[]) {
	return Arrary.filter((v,i,a)=>v === a[0]).length === Arrary.length;
}


export function checkIdExist(Id: string, ) {
	return false;
	let id;
}

export function checkOrder(ord: any) {
	let id = ord.split("_") [0];
	let mfield = ord.split("_")[1];
	if (!(mfield === "avg" || mfield === "pass" || mfield === "fail" || mfield === "audit" || mfield === "year")) {
		return false;
	} else {
		return checkIdExist(id);
	}
}


// check if where is valid
export function checkQueryWhere(query: any)  {
	let where = query["WHERE"];// query.WHERE
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
		return checkIdExist(datasetId);
	}
	// should also check if the datasedId is valid  and consisitent.
	// if (datasetId != ID) {
	// 	return false
	// }


	{
		return false;
	}
}
// we need to check AND OR
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
	if ((sfield === "dept" || sfield === "id" || sfield === "instructor" || sfield === "title"
		|| sfield === "uuid")) {
		return checkIdExist(datasetId);
	}
	let value = Object.values(obj)[1];
	if ((typeof value !== "string") || value) {
		return false;
	}
}

export function filterData(insightDatasets: TestDataset[], query: any ) {
	let opt = query["OPTIONS"];
	let col = opt["COLUMNS"];
	let key = col[0];
	let queryId = key.split("_")[0];
	let queryDataset = insightDatasets.find((e) => e.id === queryId);
	// we can get the dataset we want by id.
	let where = query["WHERE"];
	computeWHREREFilter(where);
	computeOPT(opt);

	// firstly, we need to confirm  the id of dataset, then we can confirm which dataset we want to use.
	// secondly, we want to filter the dataset by where : and or gt eq lt is not

}
export function computeOPT(opt: any) {
	let col = opt["COLUMNS"];
	let ord = opt["ORDER"];
	computeCOLUMNS(col);
	computeORDER(ord);
}
export function computeCOLUMNS(col: any) {
// select columns from our filtered data.

}
export function computeORDER(ord: any) {
	// rank columns by  number ascending order.

}
export function computeWHREREFilter(where: any){
	let filter = Object.keys(where)[0];
	if (filter === "AND") {
		return computeAND(where[filter]);
	}
	if (filter === "OR") {
		return computeOR(where[filter]);
	}

	// if (filter === "GT") {
	// 	return computeGT(where[filter]);
	// }
	// if (filter === "LT") {
	// 	return computeLT(where[filter]);
	// }
	if (filter === "EQ") {
		return computeEQ(where[filter]);
	}
	if ((filter === "IS") ){
		return computeIs(where[filter]);
	}
	if ((filter === "NOT") ){
		computeWHREREFilter(where["NOT"]);
	} else {
		return false;
	}
}
export function computeAND(obj: any) {
	// use for loop;
	// for (let o of obj) {
	// data = computeWHEREFILTER(o,data)
	// }
	// return data
	// we should also add dataset as paramenter
}
// inputstring:  Matches inputstring exactly
//
// *inputstring:  Ends with inputstring
//
// 	inputstring*: Starts with inputstring
//
// *inputstring*: Contains inputstring
// maybe we can do wildcard later
export function computeIs(obj: any) {
	let key = Object.keys(obj)[0];// uuid
	let value = Object.values(obj)[0]; // 1234
	let arr = [];
	let sections: any[] = [];
	for (let sec of sections) {
		if (Object.values(sec)[0] === value) {
			arr.push(sec);
		}
	}
	return arr;

}
export function computeOR(obj: any) {
	// let arr: any[] = [];
	// for (let o of obj) {
	// let concat: any[] = computeWHEREFILTER(o).concat(arr);
	// filteredArr = [...new Set(concat)];
	// }

}
export function computeEQ(obj: any) {
	let key = Object.keys(obj)[0];// course_avg
	let value = Object.values(obj)[0]; // 97
	let arr = [];
	let sections: any[] = [];
	for (let sec of sections) {
		if (Object.values(sec)[0] === value) {
			arr.push(sec);
		}
	}
	return arr;
}
// // considering add a new parameter for original data
// export function computeLT(obj: any) {
// 	let key = Object.keys(obj)[0];// course_avg
// 	let value = Object.values(obj)[0]; // 97
// 	let arr = [];
// 	let sections: any[] = [];
// 	for (let sec of sections) {
// 		if (Object.values(sec)[0] < value) {
// 			arr.push(sec);
// 		}
// 	}
// 	return arr;
// }
// export function computeGT(obj: any) {
// 	let key = Object.keys(obj)[0];// course_avg
// 	let value = Object.values(obj)[0]; // 97
// 	let arr = [];
// 	let sections: any[] = [];
// 	for (let sec of sections) {
// 		if (Object.values(sec)[0] > value) {
// 			arr.push(sec);
// 		}
// 	}
// 	return arr;
// }

