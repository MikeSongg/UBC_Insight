document.getElementById("click-me-button").addEventListener("click", handleClickMe);

function handleClickMe() {
	let db = document.getElementById("db").value;
	let min = document.getElementById("Min").value;
	let max = document.getElementById("Max").value;
	let amount = document.getElementById("Amount").value;

	let queryObj = {
		"WHERE": {
			"AND": [
				{
					"GT": {
					}
				},
				{
					"LT": {
					}
				},
				{
					"GT": {
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"AvgCourseScore",
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": [
					"AvgCourseScore"
				]
			}
		},
		"TRANSFORMATIONS": {
			"GROUP": [
			],
			"APPLY": [
				{
					"AvgCourseScore": {
						"AVG": ""
					}
				}
			]
		}
	}

	queryObj.WHERE.AND[0].GT[db + '_avg'] = min;
	queryObj.WHERE.AND[1].LT[db + '_avg'] = max;
	queryObj.WHERE.AND[2].GT[db + '_pass'] = amount;
	queryObj.OPTIONS.COLUMNS.push(db + '_dept');
	queryObj.OPTIONS.COLUMNS.push(db + '_id');
	queryObj.TRANSFORMATIONS.GROUP.push(db + '_dept');
	queryObj.TRANSFORMATIONS.GROUP.push(db + '_id');
	queryObj.TRANSFORMATIONS.APPLY[0].AvgCourseScore.AVG = db + '_avg';


	let data = postData('http://127.0.0.1:4321/query', queryObj);
	console.log(data);
}

async function postData (url , data) {
	// Default options are marked with *
	//alert(data);
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
		tableCreate(data);
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
	tbl.style.width = '100%';
	tbl.style.border = '1px solid black';
	tbl.id = "AnswerTable";

	if(data.length === undefined || data.length === 0){
		const tr = tbl.insertRow();
		const courseName = tr.insertCell();
		courseName.appendChild(document.createTextNode(`No result found, or Error happened.`));
		courseName.style.border = '1px solid black';
		body.appendChild(tbl);
		return;
	}

	let modifiedDept = Object.keys(data[0])[0];
	let modifiedID = Object.keys(data[0])[1];

	const tr = tbl.insertRow();
	const courseName = tr.insertCell();
	courseName.appendChild(document.createTextNode(`Course Name`));
	courseName.style.border = '1px solid black';


	const sumCourse = tr.insertCell();
	sumCourse.appendChild(document.createTextNode(`Average Score`));
	sumCourse.style.border = '1px solid black';

	for (let i = 0; i < data.length; i++) {

		const tr = tbl.insertRow();


		const courseName = tr.insertCell();
		courseName.appendChild(document.createTextNode(`${(data[i])[modifiedDept] + (data[i])[modifiedID]}`));
		courseName.style.border = '1px solid black';


		const sumCourse = tr.insertCell();
		sumCourse.appendChild(document.createTextNode(`${data[i].AvgCourseScore}`));
		sumCourse.style.border = '1px solid black';


	}
	body.appendChild(tbl);
	return tbl;
}
