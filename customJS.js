var app_id = Knack.app.id;
var redirect = function (total, Council, Event) {if(total < 1) {Knack.hideSpinner(); window.location.replace('#events/event-details/' + Event)} };

//on form submission for class day creation
//now: on form submission for event creation
$(document).on('knack-record-create.view_109', function (event, view, record) {
	//gets class from class day object (getting council from event object) - council connection on events is field 130
  	var Council = $('#view_109-field_130').val();
  	//gets members list from checkboxes in form (many to many connection of members on event object)
  	var Members2 = record.field_192_raw;
  	//gets class date from class date object to pass to attendance object
	//gets event 
	var Event = record.id;
  	var Points = record.field_108;
  	console.log(Event)
  	console.log(Council)
  	console.log(Members2)
  	console.log(record)

  	//user auth
  	var user = Knack.getUserToken();
	var headers = { "Authorization": user, "X-Knack-Application-ID": app_id, "Content-Type":"application/json"}
	Knack.showSpinner();
  	
	// Request route
	//object_9 - council members
  	//object_13 - councils
	//field_185 - council connection
	var api_url = 'https://api.knack.com/v1/objects/object_13/records';

	// Prepare filters
	var filters = [
	  // Filter for records with a council selected on the form      
	  {
		"field":"field_185",
		"operator":"is",
		"value":Council,
	  }
	];

	// Add filters to route
	api_url += '?filters=' + encodeURIComponent(JSON.stringify(filters));
  	console.log(api_url)
	
	var total = Members2.length;
      	Knack.showSpinner();
    	Members2.forEach(function (member) {
          	//target fields from attendance object (connections to class day, class, student)
			//todo - target fields on engagement obj - event, council, member
    		var data = { field_104: Event, field_183: Council, field_182: member.id, field_172: Points };
          	Knack.showSpinner();
        	$.ajax({
              	//hidden view (API USE ONLY/DO NOT DELETE) containing form with student, class date, class connections
              	//all values from json field
         		url: 'https://api.knack.com/v1/scenes/scene_98/views/view_160/records/',
	            type: 'POST',
      	        headers: headers, 
              	//posts var into form
	            data: JSON.stringify(data),
     	        success: function (response) {
					total--
		            console.log('Attendance added!!!');
		            redirect(total, Council, Event);
                }
 	       })
      	});
  });
