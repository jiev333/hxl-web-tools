$('#errormessage').hide();

$('#merge-button').on('click',function(){
	$('#errormessage').hide();
	$('#errormessage').html('');
	hxlmerge($('#hxldata1').val(),$('#hxldata2').val());

});

function hxlmerge(data1,data2){

	var outputDataSet =[];

	try {
		var hxlSet1 = uniqueIDColumns(hxl.parseString(data1));
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}

	try {
		var hxlSet2 = uniqueIDColumns(hxl.parseString(data2));
	}
	catch (err){
		prompt('No HXl data set found in data set 2 input.');
	}	

	outputDataSet.push(mergeHeaders(hxlSet1,hxlSet2));

	outputDataSet = concatData(outputDataSet,hxlSet1);
	outputDataSet = concatData(outputDataSet,hxlSet2);

	$('#hxloutput').val(formatOutput(outputDataSet));
}

function uniqueIDColumns(hxlSet){

	var columns = [];
	var hxlNew = hxlSet;
	
	hxlSet.columns.forEach(function (column, index) {
	    
		var col = column.displayTag;
		var found = false;
		var count = 0;
		
		columns.forEach(function(c){			
			if(c.tag===col){
				found = true;
				c.count+=1;
				count = c.count;
			}
		});
		
		if(found){
			hxlNew = hxlNew.rename(col, col+"+hm"+count, undefined, count);
		} else {
			columns.push({tag:col,count:0});
		}

	});
	
	return hxlNew;

}

function mergeHeaders(hxlSet1,hxlSet2){
	
	var hxlHeaders = [];

	hxlSet1.columns.forEach(function(c){
		hxlHeaders.push(c.displayTag);
	});

	hxlSet2.columns.forEach(function(c){
		if(hxlHeaders.indexOf(c.displayTag) === -1) {
			hxlHeaders.push(c.displayTag)
		}
	});

	return hxlHeaders;

}

function concatData(output,hxlSet){
	

	hxlSet.forEach(function(r,i){

		var row = [];

		output[0].forEach(function(e){
			row.push(r.get(e));
		});

		output.push(row);		
	});

	return output;

}

function formatOutput(hxlSet){
	var output = "";

	console.log(hxlSet);

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
