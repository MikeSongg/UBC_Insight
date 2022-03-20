import {parse} from "parse5";
import {InsightError} from "../controller/IInsightFacade";

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
}

function ParseIndex(htmlToParse: string): string[] | InsightError {
	let mainHTMLObj: HTMLObject = parse(htmlToParse) as HTMLObject;
	if(mainHTMLObj.childNodes === undefined) {
		return new InsightError("Index has no child nodes");
	}
	let HTMLObjectsToSearch: HTMLObject[] = mainHTMLObj.childNodes;
	let result = HTMLTraversal(HTMLObjectsToSearch);
	if(!(result instanceof InsightError)) {
		/** Original result should be like "\n     ACU    " */
		for(let i: number = 0; i < result.length; i++) {
			result[i] = result[i].slice(3, result[i].length).trim();
		}
	}
	return result;
}

function HTMLTraversal(htmlObjects: HTMLObject[]): string[] | InsightError {
	let buildingFound: string[] = [];
	for (let i of htmlObjects) {
		if(i.childNodes !== undefined) {
			let result = HTMLTraversal(i.childNodes);
			if(result instanceof InsightError) {
				return result;
			} else {
				buildingFound = buildingFound.concat(result);
			}
		}
		if(i.nodeName === "td" && i.attrs !== undefined) {
			for(let attr of i.attrs) {
				if(attr.name === "class" && attr.value === "views-field views-field-field-building-code") {
					console.log("Found building code");
					if(i.childNodes !== undefined && i.childNodes[0].value !== undefined) {
						buildingFound.push(i.childNodes[0].value);
					}
				}
			}
		}
	}
	return buildingFound;
}


export {ParseIndex};
