function hxlADMExpand(data1,data2,matchMethod){
	try {
		var hxlSet1 = hxl.parseString(data1);
		var hxlSet2 = hxl.parseString(data2);
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}
	
	admLowest = findLowestADM(hxlSet1);

	if(admLowest.level === -1){
		prompt("No adm hxl tag found");
	} 
	else {
		var declaredWords = getDeclaredWords(); // to do: need to remove empty item in "declaredWords"
		var admLookUp=createADMLookUp(admLowest, declaredWords);
		if (admLookUp.columns.length>0) {
			$('#hxloutput').val(formatOutput(expandRows(hxlSet1,admLowest,declaredWords,admLookUp,matchMethod)));
		}
		if (closestList.length>0) {
			userSelectMatch();
		}
	}
}

function findLowestADM(hxlSet){

	var admlevel = -1;
	var admTag = "";
	try {
		hxlSet.columns.forEach(function (column, index) { 
			if(column.tag.substr(0,4)==='#adm' && parseInt(column.tag.substr(4,5))>admlevel){
				admlevel = parseInt(column.tag.substr(4,5));
				admTag = column.displayTag;
			}
		});
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}
	return {'level':admlevel,'tag':admTag};
}

function expandRows(hxlSet,admLowest,declaredWords,admLookUp,matchMethod){

	hxlOut = [];		// set global variable for output
	closestList=[];	// set global valiable for selecting list
	var rowOut = [];
	
	var admLower = '#adm'+admLowest.level;
	var admHigher = '#adm'+(admLowest.level-1);
	
	// add tags to the first row of hxlOut
	hxlSet.columns.forEach(function(c){	
		rowOut.push(c.displayTag);
	});
	rowOut.push(admLower+"(matched)"); // add the closest matched adm
	rowOut.push(declaredWords);
	hxlOut.push(rowOut);
	
	// add the data to hxlOut
	var expandedCell  = [];
	hxlSet.forEach(function (row, index) { 
		expandedCell = exactMatch(row,admHigher,admLower,declaredWords,admLookUp);
		if (expandedCell.length===0&&matchMethod==="closest_match") {
			expandedCell=closestMatch(row,admHigher,admLower,declaredWords,admLookUp);
		}
		if (expandedCell.length===0) {	// if nothing matched, write out the adm names to the output
			expandedCell=origDataToOutput(row);
		}
		
		hxlOut.push(expandedCell);
	});

	return hxlOut;
}

function getDeclaredWords(){
	return $('#declaredwords').val().replace(',',' ').split(' ');
}

// VO get admLower, admHigher and declaredWords from #hxldata2
function createADMLookUp(admLowest, declaredWords){
	
	try {
		var admInput = hxl.parseString($('#hxldata2').val());
	}
	catch (err){
		prompt('No HXl data set found in data set 2 input.');
	}
	
	try {
		var toMatch = ['#adm'+(admLowest.level-1),'#adm'+admLowest.level];
		toMatch = toMatch.concat(declaredWords);
		// data.hasColumn() does not work, using for loop
		
		//for (var i=0; i<toMatch.length; i++) {	// data.tags does not work if with + e.g #adm3+code would return #adm3
		//	if (admInput.tags.indexOf(toMatch[i])===-1) throw toMatch[i];
		//}
		
		found=0;
		for (var i=0; i<toMatch.length; i++) {
			admInput.columns.forEach(function (column, index) { 
				if(column.displayTag===toMatch[i]){
					found+=1;
				}
			});
		}
		if (found!==toMatch.length) throw "Declare adm and pcode name to expand";
	}
	catch (err){
		//prompt('Tag "' + err + '" can not be found in data set 2.');
		prompt('The tags in"' + err + '" can not be found in data set 2.');
		return [];
	}
	
	return admInput.withColumns(toMatch);
}

function formatOutput(hxlSet){
	var output = "";

	hxlSet.forEach(function(r){
		r.forEach(function(e){
			output+=e+',';
		});
		output+='\n';
	});
	return output;
}

function updateFormatOutput(hxlSet){
	var output = "";

	for (i=0;i<hxlSet.length;i++) {
		for (j=0;j<hxlSet[i].length;j++) {
			output+=hxlSet[i][j]+',';
		}
		output+='\n';
	}
	
	return output;
}

function prompt(message){
	$('#errormessage').show();
	$('#errormessage').append('<p>'+message+'</p>');	
}

function origDataToOutput(row) {
	var origData=[];
	//expandedCell=[row.get(admHigher),row.get(admLower)];
	for (i=0;i<row.values.length;i++) {		
		origData.push(row.values[i]);
	}
	return origData;
}

function exactMatch(data,admHigher,admLower,declaredWords,admLookUp) {
	
	var expandedCell=[];
	var row;
	var iterator = admLookUp.iterator();
	while (row = iterator.next()) {
		if (data.get(admHigher).toLowerCase()===row.get(admHigher).toLowerCase() && data.get(admLower).toLowerCase()===row.get(admLower).toLowerCase()) {
			expandedCell=origDataToOutput(data);
			expandedCell.push(row.get(admLower));	// add the closest matched adm
			declaredWords.forEach(function(tag) {
				expandedCell.push(row.get(tag));
			});
			break;
		}
	}
	return expandedCell; 
}


function closestMatch(data,admHigher,admLower,declaredWords,admLookUp) {
	
	var expandedCell=[];
	var admNames=[];
	var costs=[];
	var expandedValues=[];
	admLowerList = admLookUp.getValues(admLower);
	//row.getValue(admLower) does not work
	
	admLookUp.forEach(function (row, index) {
		if (data.get(admHigher).toLowerCase()===row.get(admHigher).toLowerCase()) {
			cost=getLevenshteinDistance(row.get(admLower),data.get(admLower));
			if (checkDuplicates(admNames,row.get(admLower))===false) {
				admNames.push(row.get(admLower));
				costs.push(cost);
				expandedValues.push(getdeclaredWordsValues(row,declaredWords));
				newArray=removeMaxCost(admNames,costs,expandedValues);
				admNames=newArray[0];
				costs=newArray[1];
				expandedValues=newArray[2];
			}
		}
	});
	
	if (admNames.length===0){
		expandedCell=origDataToOutput(data);
		return expandedCell;
	}
	else if (admNames.length===1){
		expandedCell=origDataToOutput(data);
		expandedCell.push(admNames[0]);	// add the closest matched adm
		expandedCell.push(expandedValues);
		return expandedCell;
	}
	else {
		var origAdm=[data.get(admHigher),data.get(admLower)];
		closestList.push(buildObject(origAdm,admNames,expandedValues));
	}
	
	return expandedCell;
}

function userSelectMatch() {
	$('#selection').show();
	var htmlNameBox = "<select id=adm_name>";
	htmlNameBox +="<option>" + closestList[0]['origAdm'] + "</option>";
	htmlNameBox +="</select>";
	$("#name_box").html(htmlNameBox);
	msg = "No matched";
	var htmlListBox = "<select id=adm_list size=6>";
	htmlListBox +="<option selected value = 0>" + msg + "</option>";
	for(var i=0;i<closestList[0]['closetAdm'].length;i++){
		htmlListBox +="<option value=" + (i+1) + ">" + closestList[0]['closetAdm'][i] + "</option>"; 
	}
	htmlListBox +="</select>";
	$("#list_box").html(htmlListBox);
		
	$("#adm_list").click(function() {
		updateHxlOut($(this).val()-1);
	});	
}

function updateHxlOut(selected) {
	var admLower = '#adm'+admLowest.level;
	var admHigher = '#adm'+(admLowest.level-1);
	admLowerIndex=hxlOut[0].indexOf(admLower);
	admHigherIndex=hxlOut[0].indexOf(admHigher);
	for (i=1;i<hxlOut.length;i++) {
		if (hxlOut[i].length===hxlOut[0].length) continue;
		if (hxlOut[i][admHigherIndex]===closestList[0]['origAdm'][0]&&hxlOut[i][admLowerIndex]===closestList[0]['origAdm'][1]) {
			if (selected>=0) {
				hxlOut[i].push(closestList[0]['closetAdm'][selected]);
				hxlOut[i].push(closestList[0]['expVal'][selected]); // need foreach?
			}
		}
	}
	$('#hxloutput').val(updateFormatOutput(hxlOut));
	closestList.splice(0, 1); // rfemove this obj from the list
	
	if (closestList.length>0) {
		userSelectMatch();
	}
	else
		$('#selection').hide();
}

function getdeclaredWordsValues(row,declaredWords) {
	var declaredWordValues=[];
	declaredWords.forEach(function(tag) {
		declaredWordValues.push(row.get(tag));
	});
	return declaredWordValues;
}

function removeMaxCost(admNames,costs,expandedValues) {
	if (costs.length>5) {
		var largest=Math.max.apply(Math, costs);
		var index=costs.indexOf(largest);
		admNames.splice(index, 1);
		costs.splice(index, 1);
		expandedValues.splice(index, 1);
	}
	return [admNames,costs,expandedValues];
}


function buildObject(origAdm,closetAdm,expandedValues) {
	var obj = {
		origAdm: origAdm,				// [admHigher,admLower]
		closetAdm: closetAdm,
		expVal: expandedValues
	};
	return obj;
}

function checkDuplicates(admNames, adm) {
	for (var i=0;i<admNames.length;i++) {
		if (admNames[i]===adm)
			return true;
	}
	return false;
}


// a code copy of levenshtein.js from https://gist.github.com/andrei-m/982927
function getLevenshteinDistance (a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
}

$('#errormessage').hide();
$('#selection').hide();

$('#expand-button').on('click',function(){
	$('#errormessage').hide();
	$('#errormessage').html('');	
	hxlADMExpand($('#hxldata1').val(),$('#hxldata2').val(),$('#match_method').val());
});
