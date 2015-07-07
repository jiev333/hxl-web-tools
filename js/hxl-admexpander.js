function hxlADMExpand(data1,data2){

	var hxloutput = [];
	try {
		var hxlSet1 = hxl.parseString(data1);
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}

	var admLowest = findLowestADM(hxlSet1);

	if(admLowest.level === -1){
		prompt("No adm hxl tag found");
	} else {
		if(advanced){
			var admLookUp=createADMLookUp(admLowest);
			var declaredWords = getDeclaredWords();
			$('#hxloutput').val(formatOutput(expandRows(hxlSet1,admLowest,declaredWords,admLookUp)));
		} else {
			$('#hxloutput').val(formatOutput(expandRows(hxlSet1,admLowest,[],{})));
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

function expandRows(hxlSet,admLowest,declaredWords,admLookUp){

	var hxlOut = [];
	var rowOut = [];
	hxlSet.columns.forEach(function(c){
		rowOut.push(c.displayTag);
	});
	hxlOut.push(rowOut);

	hxlSet.forEach(function (row, index) {      
	    var expandedCell = row.get(admLowest.tag).replace(/, /g,",").split(',');
	    if(expandedCell.length>1){
		    expandedCell.forEach(function(e){
		    	rowOut = [];
		    	hxlOut[0].forEach(function(cname){
		    		if(cname!==admLowest.tag){
		    			rowOut.push(row.get(cname));
		    		} else {
		    			rowOut.push(e);
		    		}
		    	});
		    	hxlOut.push(rowOut);
		    });
	    } else {
	    	if(declaredWords.indexOf(row.get('#adm'+admLowest.level))>-1){
	    		admLookUp[row.get('#adm'+(admLowest.level-1))].forEach(function(e){
					rowOut = [];
			    	hxlOut[0].forEach(function(cname){
			    		if(cname!==admLowest.tag){
			    			rowOut.push(row.get(cname));
			    		} else {
			    			rowOut.push(e);
			    		}
			    	});
			    	hxlOut.push(rowOut);	    			
		    	});
	    	} else {
	    		rowOut = [];
				hxlOut[0].forEach(function(cname){
		    		rowOut.push(row.get(cname));
		    	});
		    	hxlOut.push(rowOut);	    		
	    	}
	    }	    
	});

	return hxlOut;
}

function getDeclaredWords(){
	return $('#declaredwords').val().replace(',',' ').split(' ');
}

function createADMLookUp(admLowest){

	try {
		var admInput = hxl.parseString($('#hxldata2').val());
	}
	catch (err){
		prompt('No HXl data set found in data set 2 input.');
	}
	
	var admFound = false;
	var admDownFound = false;
	var admOutput = {};
	admInput.columns.forEach(function(c){
		if(c.tag==='#adm'+admLowest.level){
			admFound = true;
		}
		if(c.tag==='#adm'+(admLowest.level-1)){
			admDownFound = true;
		}
	});
	if(admFound&&admDownFound){
		admInput.forEach(function(r){
			var admHigher = r.get('#adm'+(admLowest.level-1));
			var admLower = r.get('#adm'+(admLowest.level));
			if(admOutput[admHigher]==undefined){
				admOutput[admHigher] = [admLower];
			} else {
				admOutput[admHigher].push(admLower);
			}
		});
	} else if(!admFound) {
		prompt('No adm of level: ' + admLowest.level + " found in look up table");
	} else {
		prompt('No adm of level: ' + (admLowest.level-1) + " found in look up table");
	}
	return admOutput;
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

function prompt(message){
	$('#errormessage').show();
	$('#errormessage').append('<p>'+message+'</p>');	
}

var advanced = false;

$('#errormessage').hide();

$('#expand-button').on('click',function(){
	$('#errormessage').hide();
	$('#errormessage').html('');	
	hxlADMExpand($('#hxldata1').val(),$('#hxldata2').val());
});

$('#advance-button').on('click',function(){
	advanced = true;
	$('.advanced').show();
});
