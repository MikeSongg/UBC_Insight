import {parse} from "parse5";
import {InsightError} from "../controller/IInsightFacade";
import * as http from "http";


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

async function ParseIndex(htmlToParse: string): Promise<BuildingObject[]> {
	let parsedBuildingSet: BuildingObject[] = [];
	let mainHTMLObj: HTMLObject = parse(htmlToParse) as HTMLObject;
	if(mainHTMLObj.childNodes === undefined) {
		return Promise.reject(new InsightError("Index has no child nodes"));
	}
	let HTMLObjectsToSearch: HTMLObject[] = mainHTMLObj.childNodes;

	let buildings = BuildingHTMLTraversal(HTMLObjectsToSearch);

	let resultWithGeographyPromiseSet: Array<Promise<BuildingObject>> = [];
	buildings.forEach((building: BuildingObject) => {
		resultWithGeographyPromiseSet.push(buildingGeogRequest(building));
	});

	let hasBad = await Promise.allSettled(resultWithGeographyPromiseSet).then((resultSet) => {
		return resultSet.every((result) =>
			result.status === "rejected"
		);
	});
	if(hasBad) {
		return Promise.reject(new InsightError("Geography request failed"));
	} else {
		await Promise.allSettled(resultWithGeographyPromiseSet).then((resultSet) => {
			resultSet.forEach((result) => {
				if(result.status === "fulfilled") {
					parsedBuildingSet.push(result.value);
				}
			});
		});
		return parsedBuildingSet;
	}
}


function BuildingHTMLTraversal(htmlObjects: HTMLObject[]): BuildingObject[] {
	let buildingFound: BuildingObject[] = [];
	for (let i of htmlObjects) {
		if(i.childNodes !== undefined) {
			let result = BuildingHTMLTraversal(i.childNodes);
			buildingFound = buildingFound.concat(result);
		}
		if(i.nodeName === "tbody" && i.childNodes !== undefined) {
			for(let child of i.childNodes) {
				if(child.nodeName === "tr") {  // The whole object.
					let parsedBuilding = buildingTRObjectsParser(child);
					if(parsedBuilding.building !== "" && parsedBuilding.link !== "") {
						if(parsedBuilding.code !== "" && parsedBuilding.address !== "") {
							buildingFound.push(parsedBuilding);
						}
					}
				}
			}
		}
	}
	return buildingFound;
}

function buildingTRObjectsParser(buildingHTML: HTMLObject): BuildingObject{
	let buildingObj: BuildingObject = {
		code: "",
		building: "",
		address: "",
		link: "",
		lat: -1,
		lon: -1,
	};
	if (buildingHTML.childNodes !== undefined && buildingHTML.childNodes.length > 10) {
		for (let attrObj of buildingHTML.childNodes) {
			/** If this object is code */
			if (attrObj.attrs !== undefined) {
				if (attrObj.attrs[0].name === "class") {
					if (attrObj.attrs[0].value === "views-field views-field-field-building-code") {
						if (attrObj.childNodes !== undefined) {
							buildingObj.code = (attrObj.childNodes[0].value as string).slice(3).trim();
						}
					}
					/** If this object is Building name (which contains href) */
					if (attrObj.attrs[0].value === "views-field views-field-title") {
						if (attrObj.childNodes !== undefined
							&& attrObj.childNodes[1].childNodes !== undefined) {
							buildingObj.building = attrObj.childNodes[1].childNodes[0].value as string;
							let bananaObj =
								(attrObj.childNodes[1].attrs as Array<{name: string, value: string}>);
							buildingObj.link = bananaObj[0].value;
						}
					}
					/** If this object is Building Address */
					if (attrObj.attrs[0].value === "views-field views-field-field-building-address") {
						if (attrObj.childNodes !== undefined) {
							buildingObj.address = (attrObj.childNodes[0].value as string).slice(3).trim();
						}
					}
				}

			}
		}
	}
	return buildingObj;
}

async function buildingGeogRequest(build: BuildingObject): Promise<BuildingObject> {
	let hostName = "http://cs310.students.cs.ubc.ca:11316";
	let escapedPath =  "/api/v1/project_team_602/" +  encodeURIComponent(build.address.trim());

	return new Promise((resolve, reject) => {
		http.get(hostName + escapedPath, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
				console.log("Data Received: " + data);
			});
			res.on("end", () => {
				let parsedBody = JSON.parse(data);
				if (parsedBody.lat !== undefined && parsedBody.lon !== undefined) {
					build.lat = parsedBody.lat;
					build.lon = parsedBody.lon;
					resolve(build);
				} else {
					reject(new InsightError("Undefined lat or lon "));
				}
			});
		}).on("error", (err) => {
			return reject(new InsightError("Geography request failed : " + err));
		});
	});
}

export {ParseIndex};
