profiler = {
	common: {
		cleanup: function(data, regex)
		{
			  var lines = data.match(/[^\r\n]+/g);
              data = "";
              $.each(lines, function() {
                  if (regex.exec(this))
                  {
                    data += this + "\n";
                  }
              });
              return data;
		},
	},
	timings: {
		regex: /([:\d]+) (start|finish): (\w*)( (.*))?/,

		cleanup: function(data) {
			 return profiler.common.cleanup(data,profiler.timings.regex);
		},
		parse: function(text){
				var lines = text.split("\n");
     			// parse rows
     			for (var i = 0; i < lines.length; i++) {
     			 	 var line = lines[i];

     			   	 var match = profiler.timings.regex.exec(line);
     			   	 if (match != null) {
     			   	 	data.push({
     			   	 		time : parseInt(match[1]),
     			   	 		group : match[5],
     			   	 		mode : match[2],
     			   	 		operation : match[3]
     			   	 	})
					} 
     			};
     			//join rows
			   var rows = [];
			   for (var i = 0; i < data.length; i++) {
			   		var source = data[i];
			   		if (source.mode != "start") continue;

			   		for (var j = 0; j < data.length; j++) {
			   			var f = data[j];
			   			if (f.mode != "finish") continue;
			   			
			   			if (f.operation == source.operation && f.group == source.group)
			   			{
			   				rows.push([source.operation, source.group, new Date(source.time), new Date(f.time)])
		    			f.mode = "done"
		    			break;
			   			}
			   		};
			   }

  			
	            // Create and populate a data table.
	            var data = new google.visualization.DataTable();
	            data.addColumn('string', 'Term');
	            data.addColumn('string', 'Name');
	            data.addColumn('datetime', 'start');
	            data.addColumn('datetime', 'end');


                if (rows.length == 0)
                  return;
	            data.addRows(rows);

	            // specify options
	            var options = {
	            	height: "100%"
	            };
                    
                    // Instantiate our timeline object.
                var vis = new google.visualization.Timeline(document.getElementById('mytimeline'));
/*
                    google.visualization.events.addListener(vis, 'onmouseover', function (obj) {
                        var startDate = data.getValue(obj.row, 2);
                        var endDate   = data.getValue(obj.row, 3);

                        var timeDiff = Math.abs(startDate.getTime() - endDate.getTime());
                        var diffDays = (timeDiff / (1000 * 3600 * 24)); 

                        var durationEl = document.getElementById('duration');
                        durationEl.innerHTML = 'Duration: ' + diffDays.toFixed(4);
                    });*/

				            
				            // Draw our timeline with the created data and options
		            vis.draw(data, options);
		}


	},
	memory: {
		regex: /[\d- :.]+I\/MEMORY  \( \d+\): (.*)/,
		testRegex: /test ([\w\d.]+)/,
		processRegex: /([\w\d.]+) \(pid (\d+)\) is using (\d+) kB from (\d+) kB/,

		cleanup: function(data) {
			 return profiler.common.cleanup( data,profiler.memory.regex);
		},

		parse: function(text){
			var data = [];
			var lines = text.split("\n");
 			// parse rows
 			for (var i = 0; i < lines.length; i++) {
 			 	 var line = lines[i];

 			   	 var match = profiler.memory.regex.exec(line);
 			   	 if (match != null) {
 			   	 	line = match[1];

 			   	 	match = profiler.memory.testRegex.exec(line);
 			   	 	if (match != null)
 			   	 	{
 			   	 		data.push({ type: "test", name: match[1] });
 			   	 		continue;
 			   	 	}

 			   	 	match = profiler.memory.processRegex.exec(line);
 			   	 	if (match != null)
 			   	 	{
 			   	 		data.push({ 
 			   	 			type: "process", 
 			   	 			name: match[1],
 			   	 			pid: match[2],
 			   	 			using: parseInt(match[3]),
 			   	 			from: parseInt(match[4])
 			   	 		});
 			   	 	}
				} 
 			};
 			var processes = {};
 			var currentRow = null;
 			var rows = [];

			for (var i = 0; i < lines.length; i++) {
				 var line = data[i];
				 if (line == null)
				 	continue;

				 if (line.type == "test")
				 {
				 	if (currentRow)
				 		rows.push(currentRow);
				 	currentRow = [ line.name ];
				 }
				 else if (line.type == "process")
				 {
				 	var id = processes[ line.name ];
				 	if (!id)
				 	{
				 		processes[line.name] = id = Object.keys(processes).length + 1;
				 	}
				 	currentRow[id] = line.using;
				 }
			}
			var titlesRow = ["Process"];
			$.each(processes, function(key, value) {
				titlesRow.push(key);
			});
			titlesRow.push({ role: 'annotation' });

			var processCount = Object.keys(processes).length;
			data = [];
			data.push(titlesRow);
			for (var i = 0 ; i < rows.length; i++) {
				var row = rows[i];
				while (row.length <= processCount)
				{
					row.push(0);
				}
				row.push('');
				data.push(row);
			};

			data = google.visualization.arrayToDataTable(data);

		      var options = {
		        legend: { position: 'top', maxLines: 3 },
				bar: { groupWidth: '75%' },
		        isStacked: true,height: 800,
		        theme: "maximized",
		        hAxis: {textPosition: 'none'}
		      };
	      var chart = new google.visualization.ColumnChart(document.getElementById('mytimeline'));
		  chart.draw(data, options);
     }



	}
};
