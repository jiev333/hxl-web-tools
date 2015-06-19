$('#merge-button').on('click',function(){

	hxlmerge($('#hxldata1').val(),$('#hxldata2').val())

});

function hxlmerge(data1,data2){

	var outputDataSet =[];

	var hxlSet1 = uniqueIDColumns(hxl.parseString(data1));
	var hxlSet2 = uniqueIDColumns(hxl.parseString(data2));

	outputDataSet.push(mergeHeaders(hxlSet1,hxlSet2));

	outputDataSet = concatData(outputDataSet,hxlSet1);
	outputDataSet = concatData(outputDataSet,hxlSet2);

	console.log(outputDataSet);
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
	
	hxlSet.columns.forEach(function(c){
		console.log(c);
	})

	hxlSet.forEach(function(r,i){

		var row = [];

		console.log(r.columns);

		output[0].forEach(function(e){
			row.push(r.get(e));
		});

		output.push(row);		
	});

	return output;

}

//////// extending hxl library

hxl.parseString = function(data) {

	return hxl.wrap(Papa.parse(data).data);

}

