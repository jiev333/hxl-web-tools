$('#merge-button').on('click',function(){

	hxlmerge($('#hxldata1').val(),$('#hxldata2').val())

});

function hxlmerge(data1,data2){

	var outputDataSet =[];

	var hxlSet1 = hxl.parseString(data1);
	var hxlSet2 = hxl.parseString(data2);

	uniqueIDColumns(hxlSet1);


}

function uniqueIDColumns(hxlSet){

	var columns = [];

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
			hxlSet.rename(col, col+"+hm"+count, undefined, count);
		} else {
			columns.push({tag:col,count:0});
		}

	});
	console.log(hxlSet);
}

//////// extending hxl library

hxl.parseString = function(data) {

	return hxl.wrap(Papa.parse(data).data);

}

