$('#errormessage').hide();

$('#transform-button').on('click',function(){
	$('#errormessage').hide();
	$('#errormessage').html('');
	hxlWide2LongInit($('#hxldata1').val());
});

$('#hxldata1').bind('input propertychange',function(){
	$('#errormessage').hide();
	$('#errormessage').html('');	
	var tags = findWideTags($('#hxldata1').val());
	var html = '';
	tags.forEach(function(t){
		html+='<option value="' + t + '">' + t + '</option>';
	});
	$('#tagselect').html(html);
})


function hxlWide2LongInit(data){
	var outputDataSet =[];

	try {
		var hxlSet = hxl.parseString(data);

		hxlSet.columns.forEach(function(c){
			console.log(c);
		})
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}

	var tag = $('#tagselect').val();
	if(!checkTagAttributes(hxlSet,tag)){
		prompt('Chosen tag does not unique attributes for each tag use.');
	}

	$('#hxloutput').val(formatOutput(hxlWide2Long(hxlSet,tag)));
}

function checkTagAttributes(hxlSet,tag){
	var good = true;
	hxlSet.withColumns([tag]).columns.forEach(function(c){
		if(c.tag==c.displayTag){good=false;}
	})
	return good;
}

function hxlWide2Long(hxlSet,tag){

	var columns = [];

	var wide2long = [];

	var output = [];

	var row = [];

	hxlSet.withoutColumns(tag).columns.forEach(function(c){
		columns.push(c.displayTag);
		row.push(c.displayTag);
	});

	row.push(tag);
	row.push('#x_value');

	output.push(row);

	hxlSet.withColumns(tag).columns.forEach(function(c){
		wide2long.push(c.displayTag);
	});

	hxlSet.forEach(function(r){		
		wide2long.forEach(function(c){
			row = [];
			columns.forEach(function(c2){
				row.push(r.get(c2));
			})
			row.push(c.split(/\+(.+)/)[1]);
			row.push(r.get(c));
			output.push(row);
		})
	});

	return output;
}

function findWideTags(data){
	try {
		var hxlSet = hxl.parseString(data);
		hxlSet.columns.forEach(function(c){
			c;
		})
	}
	catch (err){
		prompt('No HXl data set found in data set 1 input.');
	}

	var columns = [];
	
	hxlSet.columns.forEach(function (column, index) {
	    
		var col = column.tag;
		var found = false;
		
		columns.forEach(function(c){			
			if(c.tag===col){
				found = true;
				c.count+=1;
			}
		});
		
		if(!found){
			columns.push({tag:col,count:0});
		}

	});

	var multicolumns = [];

	columns.forEach(function(c){
		if(c.count>0){
			multicolumns.push(c.tag);
		}
	})

	return multicolumns;

}


function prompt(message){
	$('#errormessage').show();
	$('#errormessage').append('<p>'+message+'</p>');	
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

