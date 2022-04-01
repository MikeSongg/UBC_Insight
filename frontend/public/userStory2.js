document.getElementById("click-me-button-2").addEventListener("click", handleClickMe);

function handleClickMe() {
	//alert("Button Clicked!");
	let db = document.getElementById("db").value;
	let year = document.getElementById("Year").value;
	let dept = document.getElementById("Dept").value;


	let queryObj = {
		"WHERE": {
			"AND": [
				{
					"EQ": {
					}
				},
				{
					"IS": {
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"sumCourse"
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": [
					"sumCourse"
				]
			}
		},
		"TRANSFORMATIONS": {
			"GROUP": [
			],
			"APPLY": [
				{
					"sumCourse": {
						"SUM": ""
					}
				}
			]
		}
	};
	queryObj.WHERE.AND[0].EQ[db + '_year'] = parseInt(year);
	queryObj.WHERE.AND[1].IS[db + '_dept'] = dept;
	queryObj.OPTIONS.COLUMNS.push(db + '_year');
	queryObj.OPTIONS.COLUMNS.push(db + '_dept');
	queryObj.OPTIONS.COLUMNS.push(db + '_id');
	queryObj.TRANSFORMATIONS.GROUP.push(db + '_dept');
	queryObj.TRANSFORMATIONS.GROUP.push(db + '_year');
	queryObj.TRANSFORMATIONS.GROUP.push(db + '_id');
	queryObj.TRANSFORMATIONS.APPLY[0].sumCourse.SUM = db + '_pass';




	//alert(JSON.stringify(queryObj));
	postData('http://127.0.0.1:4321/query', queryObj)
		.then(data => {
			//alert(data); // JSON data parsed by `data.json()` call
			tableCreate(data);
		});

}

// Example POST method implementation:
async function postData (url , data) {
	// Default options are marked with *
	//alert(data);
	//alert(JSON.stringify(data));
	fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	}).then(response => response.json()).then(data => {
		if(data.length === undefined || data.length === 0){
			alert("No data found or Error Happened!");
			return;
		}
		tableCreate(objResort(data));
		return data;
	}).catch((error) => {
			alert ('Error:' + error);
	});
}

function tableCreate(data) {
	if(document.getElementById("AnswerTable")) {
		document.getElementById("AnswerTable").remove();
	}

	const body = document.body, tbl = document.createElement('table');
	tbl.style.width = '80%';
	tbl.style.border = '1px solid black';
	tbl.id = "AnswerTable";

	if(data.length === undefined || data.length === 0){
		const tr = tbl.insertRow();
		const courseName = tr.insertCell();
		courseName.appendChild(document.createTextNode(`No Result Found, or Error happened.`));
		courseName.style.border = '1px solid black';
		return;
	}

	let modifiedDept = Object.keys(data[0])[0];
	let modifiedID = Object.keys(data[0])[1];

	const tr = tbl.insertRow();
	const courseName = tr.insertCell();
	courseName.appendChild(document.createTextNode(`Course Name`));
	courseName.style.border = '1px solid black';


	const sumCourse = tr.insertCell();
	sumCourse.appendChild(document.createTextNode(`Passed students`));
	sumCourse.style.border = '1px solid black';

	for (let i = 0; i < data.length; i++) {

		const tr = tbl.insertRow();

		const thisDataObj = data[i];
		const courseName = tr.insertCell();
		courseName.appendChild(document.createTextNode(thisDataObj[modifiedDept] + thisDataObj[modifiedID]));
		courseName.style.border = '1px solid black';


		const sumCourse = tr.insertCell();
		sumCourse.appendChild(document.createTextNode(`${data[i].sumCourse}`));
		sumCourse.style.border = '1px solid black';


	}
	body.appendChild(tbl);
	return tbl;
}

function objResort(obj) {
	let currentMax = 0;
	let currentObjIndex = 0;
	for (let i = 0; i < obj.length; i++) {
		currentMax = 0;
		currentObjIndex = i;
		for(let j = i; j < obj.length; j++) {
			if(parseInt(obj[j].sumCourse) > currentMax) {
				currentMax = obj[j].sumCourse;
				currentObjIndex = j;
			}
		}
		let tempObj = obj[i];
		obj[i] = obj[currentObjIndex];
		obj[currentObjIndex] = tempObj;
	}
	return obj;
}
