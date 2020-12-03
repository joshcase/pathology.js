// SETUP
patients = [];

// CONSTANTS
CHEM_20 = "Chemistry 20 Analytes";
CRP = "C-Reactive Protein";
FBC = "Full Blood Count";
GFR = "GFR (estimated)";
UE = "Urea and Electrolytes";
UEG = "Urea, Elect, Glucose";

interestingTests = [
	CHEM_20,
	CRP,
	FBC,
	GFR,
	UE,
	UEG
];

interestingStatuses = [
	"Final",
	"Corrected"
];

maxTestsToPull = 7;

monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class PathologyCollection {
	dateCollected;
	results = new PathologyResults();
}

class PathologyResults {
	haemoglobin;
	whiteCells;
	platelets;
	sodium;
	potassium;
	creatinine;
	eGFR;
	albumin;
	bilirubinTotal;
	ALP;
	GGT;
	ALT;
	AST;
	PO;
	Mg;
	CRP;

	areEmpty() {
		for (var key in this) {
			// If property is not inherited
			if (Object.prototype.hasOwnProperty.call(this, key)) {
		        if (this[key] !== null && this[key] != "") return false;
		    }
	        
	    }
	    return true;
	}

}

class Patient {
	name;
	pathologyCollections;
	resultsFetched = false;
	URN;
}

function awaitPatientResults(callback) {
	fullyLoaded = true;
	patients.forEach(function(patient, index){
		if (patient.resultsFetched == false) {
			fullyLoaded = false;
		}
	});
	if (fullyLoaded) {
		callback();
	} else {
		setTimeout(function (){
			awaitPatientResults(callback);
		}, 1000);
	}
}

async function getTeamPatients(teamPrefix) {
	var newPatients = [];
	return new Promise(function (resolve, reject) {
		titleElements = document.getElementsByClassName("title-text");
		[...titleElements].forEach(function(element, index) {
			if (element.textContent.includes("AdmissionList") && element.textContent.includes(teamPrefix)) {
				parent = element.closest(".widget-container-container");
				patientListItems = parent.querySelectorAll('.ui-state-default');

				[...patientListItems].forEach(function(patientListItem, index){
					text = patientListItem.querySelector('.sidetip').textContent;
					URN = text.substring(4);
					text = patientListItem.querySelector('a').textContent;
					name = text.split("(",1);
					name = name.split(/\n/,1);
					newPatient = new Patient();
					newPatient.name = name;
					newPatient.URN = URN;
					newPatients.push(newPatient);
				});
			}
		});
		console.log(newPatients.length + " patients found for " + teamPrefix);
		resolve(newPatients);
	});
}

function fetchResults(patient) {
	URL = "REDACTED_URL" + patient.URN + "/GetCompletedContent";
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = async function() {
			if (this.readyState == 4 && this.status == 200) {
				patient.pathologyCollections = await parsePathologyTab(xhttp.responseXML);
				patient.resultsFetched = true;
			}
	};
	xhttp.responseType = "document";
	xhttp.open("POST", URL, true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	
	today = generateDate();
	//console.log(today);
	xhttp.send("fromDate=26-Oct-2020&toDate="+today+"&authnothrow=true&stillWaitingOn=tab-pathology&waitForCache=true");
}

function generateDate() {
	var d = new Date();
	day = d.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	month = monthNames[d.getMonth()].substr(0,3);
	year = d.getFullYear();
	return day+"-"+month+"-"+year;
}

function generateTable(patients) {

	//Not sure why this dummytable is required, but it's essential for table "Paste" formatting
	dummyTable = document.createElement("table");
	column = document.createElement("th");
	text = document.createTextNode("See data:");
	column.appendChild(text);
	dummyTable.appendChild(column);
	document.body.appendChild(dummyTable);
	// 

	table = document.createElement("table");
	table.style.borderWidth = "1px";
	table.style.borderColor = "#000";
	table.style.borderStyle = "solid";
	patients.forEach( function (patient, index){
		newRow = document.createElement("tr");

		firstColumn = document.createElement("th");
		styleTableElement(firstColumn);
		text = document.createTextNode(patient.name + "("+patient.URN+")");
		firstColumn.appendChild(text);
		newRow.appendChild(firstColumn);

		secondColumn = document.createElement("th");
		styleTableElement(secondColumn);
			
			/*
			if (patient.pathologyCollections.length == 0) { 
				label = document.createTextNode("No recent bloods found.");
				secondColumn.appendChild(label);
				newRow.appendChild(secondColumn);
				return;
			}
			*/

			pathologyTable = document.createElement("table");
				titleRow = document.createElement("tr");
				styleTableElement(titleRow);

				columnNames = [
					"Date",
					"Hb",
					"WC",
					"Plt",
					"Na",
					"K",
					"Cr",
					"eGFR",
					"Alb",
					"Bili(T)",
					"ALP",
					"GGT",
					"ALT",
					"AST",
					"PO",
					"Mg",
					"CRP"
				];

				columnNames.forEach( function (columnName, index) {
					column = document.createElement("th");
					styleTableElement(column);
					label = document.createTextNode(columnName);
					column.appendChild(label);
					titleRow.appendChild(column);
				});
				
			pathologyTable.appendChild(titleRow);
				console.log(patient);
				patient.pathologyCollections.forEach(function(pathologyCollection, index) {
					if (pathologyCollection.results.areEmpty()) { return; }
					newCollectionRow = document.createElement("tr");
					styleTableElement(newCollectionRow);

					columnValues = [
						pathologyCollection.dateCollected,
						pathologyCollection.results.haemoglobin,
						pathologyCollection.results.whiteCells,
						pathologyCollection.results.platelets,
						pathologyCollection.results.sodium,
						pathologyCollection.results.potassium,
						pathologyCollection.results.creatinine,
						pathologyCollection.results.eGFR,
						pathologyCollection.results.albumin,
						pathologyCollection.results.bilirubinTotal,
						pathologyCollection.results.ALP,
						pathologyCollection.results.GGT,
						pathologyCollection.results.ALT,
						pathologyCollection.results.AST,
						pathologyCollection.results.PO,
						pathologyCollection.results.Mg,
						pathologyCollection.results.CRP,
					];

					columnValues.forEach( function (columnValue, index) {
						column = document.createElement("th");
						styleTableElement(column);
						if (!columnValue) {columnValue = '-';}
						text = document.createTextNode(columnValue);
						column.appendChild(text);
						newCollectionRow.appendChild(column);
					});

					pathologyTable.appendChild(newCollectionRow);
					
				});
					
		secondColumn.appendChild(pathologyTable);
		newRow.appendChild(secondColumn);

		table.appendChild(newRow);
	});
	return table;
}

async function parsePathologyTab(responseXML) {
	pathologyCollections = [];
	newCollection = null;
	tbody = responseXML.querySelector('tbody');
	tests = tbody.getElementsByTagName('tr');
	[...tests].forEach(function(test, index) {
		if (test.classList.contains("clickable")) {
			testType = test.children.item(1).textContent;
			dateCollected = test.children.item(4).textContent;
			status = test.children.item(5).textContent;
			if (interestingTests.includes(testType) && interestingStatuses.includes(status)) {
				nextRowInteresting = true;
				if (newCollection == null) {
					newCollection = new PathologyCollection();
					newCollection.dateCollected = dateCollected;
				}
				if (dateCollected != newCollection.dateCollected) {
					pathologyCollections.push(newCollection);
					newCollection = new PathologyCollection();
					newCollection.dateCollected = dateCollected;
				}
			} else { 
				nextRowInteresting = false;
			}
		} else if (test.classList.contains("observation-section")) {
			
			if (nextRowInteresting) {
				switch(testType) {
				
					case CHEM_20: {
						newCollection.results.sodium = test.querySelectorAll(".included.even")[1].children[1].textContent;
						newCollection.results.potassium = test.querySelectorAll(".included.even")[2].children[1].textContent;
						newCollection.results.creatinine = test.querySelectorAll(".included.even")[10].children[1].textContent;
						newCollection.results.albumin = test.querySelectorAll(".included.even")[14].children[1].textContent;
						newCollection.results.bilirubinTotal = test.querySelectorAll(".included.even")[16].children[1].textContent;
						newCollection.results.ALP = test.querySelectorAll(".included.even")[18].children[1].textContent;
						newCollection.results.GGT = test.querySelectorAll(".included.even")[19].children[1].textContent;
						newCollection.results.ALT = test.querySelectorAll(".included.even")[20].children[1].textContent;
						newCollection.results.AST = test.querySelectorAll(".included.even")[21].children[1].textContent;
						newCollection.results.PO = test.querySelectorAll(".included.even")[25].children[1].textContent;
						if (test.querySelectorAll(".included.even")[26]) {
							newCollection.results.Mg = test.querySelectorAll(".included.even")[26].children[1].textContent;
						}
						break;
					}

					case CRP: {
						newCollection.results.CRP = test.querySelectorAll(".included.even")[0].children[1].textContent;
						break;
					}

					case FBC: {
						newCollection.results.haemoglobin = test.querySelectorAll(".included.even")[0].children[1].textContent;
						newCollection.results.whiteCells = test.querySelectorAll(".included.even")[1].children[1].textContent;
						newCollection.results.platelets = test.querySelectorAll(".included.even")[2].children[1].textContent;
						break;
					}

					case GFR: {
						newCollection.results.eGFR = test.querySelectorAll(".included.even")[0].children[1].textContent;
						break;
					}

					case UE: {
						newCollection.results.sodium = test.querySelectorAll(".included.even")[0].children[1].textContent;
						newCollection.results.potassium = test.querySelectorAll(".included.even")[1].children[1].textContent;
						newCollection.results.creatinine = test.querySelectorAll(".included.even")[6].children[1].textContent;
						break;
					}

					case UEG: {
						newCollection.results.sodium = test.querySelectorAll(".included.even")[0].children[1].textContent;
						newCollection.results.potassium = test.querySelectorAll(".included.even")[1].children[1].textContent;
						newCollection.results.creatinine = test.querySelectorAll(".included.even")[9].children[1].textContent;
						break;
					}

					default: throw 'No implementation for test of type "' + testType + '"';
				}
			}
		
		}
	
	});

	if (newCollection != null) {
		pathologyCollections.push(newCollection);
	}
	return(pathologyCollections.slice(0, maxTestsToPull).reverse());
	
}

function styleTableElement(elem) {
	elem.style.borderWidth = "1px";
	elem.style.borderColor = "#000";
	elem.style.borderStyle = "solid";
	elem.style.padding= "2px";
	elem.style.fontSize= "8px";
}

async function main() {
	//*******************************************************************************\\
	// End users can modify the code below this sentence:
	
	//patients.push(...await getTeamPatients("SUR1"));
	patients.push(...await getTeamPatients("SUR2"));
	//patients.push(...await getTeamPatients("SUR3"));
	//patients.push(...await getTeamPatients("SUR4"));

	// End users can modify the code above this sentence ^
	//*******************************************************************************\\
	
	console.log(patients);
	patients.sort(function(a, b){
    		if(a.name > b.name) { return 1; }
   		if(a.name < b.name) { return -1; }
    		return 0;
	});
	
	
	patients.forEach(function(patient, index, array) {
		console.log("Fetching results for: "+patient.name);
		fetchResults(patient);
	});
            
	awaitPatientResults(function () {
		alert("Found data for "+patients.length+" patients.");
		table = generateTable(patients);
		document.body.appendChild(table);
	});
	
}

await main();

