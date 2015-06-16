$('#expand-button').on('click',function(){

	hxlADMExpand($('#hxldata1').val(),$('#hxldata2').val())

});

function hxlADMExpand(data1,data2){

	var hxloutput = [];
	var hxlSet1 = hxl.parseString(data1);
	var hxlSet2 = hxl.parseString(data2);
	var admlevel = findLowestADM(hxlSet1);

	if(admlevel === -1){
		prompt("No adm hxl tag found");
	} else {
		expandRows(hxlSet1);
	}
}

function findLowestADM(hxlSet){

	var admlevel = -1;
	var admTag = "";

	hxlSet.columns.forEach(function (column, index) {    
		if(column.tag.substr(0,4)==='#adm' && parseInt(column.tag.substr(4,5))>admlevel){
			admlevel = parseInt(column.tag.substr(4,5));
		}
	});

	return admlevel;
}

function expandRows(hxlSet){
	hxlSet.forEach(function (row, index) {
	    row.get('#adm4'));      
	});
}

function prompt(message){
	console.log(message)
}

function createHXLArray(){
	
}

/////// extending hxl library

hxl.parseString = function(data) {

	return hxl.wrap(Papa.parse(data).data);

}

