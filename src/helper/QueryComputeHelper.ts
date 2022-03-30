// helper function cited from https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
import {InsightError, InsightResult} from "../controller/IInsightFacade";


// cited from https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
export function multipleGroupByArray(dataArray: any, groupPropertyArray: any) {
	let groups: any  = {};
	for (let data of dataArray) {
		const group = JSON.stringify(groupPropertyArray(data));
		groups[group] = groups[group] || [];
		groups[group].push(data);
	}
	return Object.keys(groups).map(function(group) {
		return groups[group];
	});
}

export function convertResult(KeyList: string[], sections: any[],id: string) {
	let resultList: InsightResult[] = [];
	for(let cObj of sections) {
		let insightResult: InsightResult = {};
		for(let key of KeyList) {
			insightResult[id + "_" + key] = cObj[key];
		}
		resultList.push(insightResult);

	}
	return resultList;
}

export function checkResult(result: any) {
	if (result === undefined || result === null) {
		return new InsightError("not defined");
	} else {
		return result;
	}
}
