//This JavaScript code uses View Based requests for Get, Post, Put, and Delete NOT object based requests

var app_id = Knack.app.id;
var redirect = function (total, Council, Event) {if(total < 1) {Knack.hideSpinner(); window.location.replace('#events/event-details/' + Event)} };

//On form submission for event creation (Add Event page)
$(document).on('knack-record-create.view_109', function (event, view, record) {
  //getting council from event object - council connection on events is field 130
    var Council = $('#view_109-field_130').val();
    //gets members list from checkboxes in form (many to many connection of members on event object)
    var Members2 = record.field_192_raw;
  //gets event 
  var Event = record.id;
  //gets points
    var Points = record.field_108;
  //logging data for validation
    console.log(Event)
    console.log(Council)
    console.log(Members2)
    console.log(record)

    //user auth
    var user = Knack.getUserToken();
  var headers = { "Authorization": user, "X-Knack-Application-ID": app_id, "Content-Type":"application/json"}
  Knack.showSpinner();
  
  //Adding an engagement for each member
  //creating a total variable to limit for loop
  var total = Members2.length;
        Knack.showSpinner();
  //for loop for each member
      Members2.forEach(function (member) {
      	//target fields on engagement obj - event, council, member (these are the fields we are adding to the new engagement record)
        var data = { field_104: Event, field_183: Council, field_182: member.id, field_172: Points };
            Knack.showSpinner();
          $.ajax({
            //making a POST request to this form url 
            url: 'https://api.knack.com/v1/scenes/scene_98/views/view_160/records/',
              type: 'POST',
                headers: headers, 
                //posts var into form
              data: JSON.stringify(data),
              success: function (response) {
          total--
                console.log('Engagements added!!!');
                //redirecting to event after form is submitted
                redirect(total, Council, Event);
                }
         })
        });
  });

//This function deals with the edit button on the events table (adding new engagements, updating existing engagements, and deletes engagements for unselected members
$(document).on('knack-record-update.view_110', function (event, view, record) {
  //gets event id 
  var Event = record.id;
  //getting event name field - field 95
  var eventName = record.field_95;
  //getting event date field - field 107
  var eventDate = record.field_107;
  //getting event description field - field 187
  var eventDesc = record.field_187;
  //getting event category field - field 190
  var eventCat = record.field_190;
  //gets points field - field 108
  var Points = record.field_108;
  //getting notes field - field 109
  var Notes = record.field_109;
  //getting council from event object - council connection on events is field 130
  var Council = $('#view_110-field_130').val();
  //gets members list from checkboxes in form (many to many connection of members on event object)
  var Members2 = record.field_192_raw;

  console.log(Event)
  console.log(eventName)
  console.log(eventDate)
  console.log(eventDesc)
  console.log(eventCat)
  console.log(Points)
  console.log(Notes)
  console.log(Council)
  console.log(Members2)
  //getting a list of all the members that were selected in the newly edited form submission
  var checkedMemberList = [];
  //pulling ids of members associated with engagements for the edited event
  Members2.forEach(function (member) {
    //add member id to list of people checked off in form
    checkedMemberList.push(member.id);	
  })

  //user auth
  var user = Knack.getUserToken();
  var headers = { "Authorization": user, "X-Knack-Application-ID": app_id, "Content-Type":"application/json"}
  Knack.showSpinner();
  
  $.ajax({
    //gets data for each member associated with an engagement for this event
    //this view is the engagements table and pulls those records with the particular event id associated 
    //the engagements table is located on the event details page * this is the table that is being referenced!
    url: 'https://api.knack.com/v1/scenes/scene_67/views/view_183/records?event-details_id=' + Event,
    type: 'GET',
    headers: headers,
    success: function (data) {
      	console.log(data)
      //the old engagements variable shows the previous engagements
      	var oldEngagements = data.records
        console.log(oldEngagements)
      //this is the list of members that have engagements
      	var engagement_memberlist = []
      
      	//pulling ids of members associated with engagements for the edited event
      	oldEngagements.forEach(function (engagement) {
        //add person id assc with engagement to list of people (on engagements)
        //console.log(engagement)
          //assigning the member id to the variable engagementMemberID
        var engagementMemberID = engagement.field_182_raw[0].id
        //add this to list of engagement members
        engagement_memberlist.push(engagementMemberID);	
        })
      	console.log(engagement_memberlist)
      	console.log(checkedMemberList)
      
      	//for element in checkedMemberList - see if it's on list of members with engagements
      	//if not, add to list of members that need engagement created
      	var i = 0;
      	var engagements_to_add = [];
      	$.grep(checkedMemberList, function(el) {
            if ($.inArray(el, engagement_memberlist) == -1) engagements_to_add.push(el);
            i++;

        });
		
      	//for element in list of members with engagements - see if it's on list of checked members from form
      	//if not, add to list of members that need engagement deleted
      	var j = 0;
      	var engagements_to_delete = [];
      	$.grep(engagement_memberlist, function(el) {
            if ($.inArray(el, checkedMemberList) == -1) engagements_to_delete.push(el);
            j++;

        });
      
      	//for element in list of members with engagements and are selected in checked member list
      	var k = 0;
      	var engagements_to_update = [];
      	$.grep(engagement_memberlist, function(el) {
            if ($.inArray(el, checkedMemberList) !== -1) engagements_to_update.push(el);
            k++;

        });

        console.log(engagements_to_add)
      	console.log(engagements_to_delete)
      	console.log(engagements_to_update)
      	
      	//adding new records
      	var total = engagements_to_add.length;
      	//loops through new members selected to add new engagement
      	engagements_to_add.forEach(function (member) {
        var data = { field_104: Event, field_183: Council, field_182: member, field_172: Points };
            Knack.showSpinner();
          $.ajax({
            //this url points to the add engagement form and creates new engagements for each newly selected council member
            url: 'https://api.knack.com/v1/scenes/scene_98/views/view_160/records/',
              type: 'POST',
                headers: headers, 
                //posts var into form
              data: JSON.stringify(data),
              success: function (response) {
          total--
                console.log('New engagements added!!!');
                redirect(total, Council, Event);
                }
         })
        });
      
      	//deleting records for members that were unselected in the edit event form
        var total = engagements_to_delete.length;
      	var engagementsDelete = [];
      //looping through each member 
          engagements_to_delete.forEach(function (member) {
            console.log(1);
            //looping through each engagement
            oldEngagements.forEach(function(engagement) {
              console.log(2);
              //adding the corresponding engagement id for each member to a new list called engagementsDelete
              //engagement.field_182_raw[0].id is the member id on the data array
              if(engagement.field_182_raw[0].id == member) {
                console.log(3);
                engagementsDelete.push(engagement.id);
              }
            })
          });
            
           //loops through each engagement to delete the corresponding records
            engagementsDelete.forEach(function (engagement) {
              Knack.showSpinner();
              console.log(4);
              $.ajax({
                //this url points to the delete button the engagements table
                url: 'https://api.knack.com/v1/scenes/scene_97/views/view_159/records/' + engagement,
                type: 'DELETE',
                headers: headers, 
                //posts var into form
                data: JSON.stringify(data),
                success: function (response) {
                  total--
                  console.log('Engagement DELETED!!!');
                  redirect(total, Council, Event);
                }
              });
            })
      
      
      //updating records for the engagements that were previously selected 
      var total = engagements_to_update.length;
      //creating two lists 
      //master update list will house the final list - a list of two lists. Example: {[engagement_id1, member_id1], [engagement_id2, member_id2]} and so on
      //this needs to be done as there needs to be a way to pass in both the engagement id and the member id to be updated in the later function
      	var masterUpdate = [];
      //the engagements update list will be a temporary list to push each element (engagement and member) onto the master update list
      	var engagementsUpdate = [];
      //looping through each member
          engagements_to_update.forEach(function (member) {
            console.log(1);
            //looping through each engagement
            oldEngagements.forEach(function(engagement) {
              console.log(2);
              //this if statement checks if the member id is the same as the member id on the engagement
              //engagement.field_182_raw[0].id is the member id on the data array
              if(engagement.field_182_raw[0].id == member) {
                console.log(3);
                //pushing the engagement id onto the temporary engagementsUpdate list 
                engagementsUpdate.push(engagement.id);
                //pushing the member id onto the temporary engagementsUpdate list 
                engagementsUpdate.push(member);
                //pushing the two id onto the engagements update as a singular list ex: [engagement_id1, member_id1]
                masterUpdate.push(engagementsUpdate);
                //reseting the engagements update so that the next list is with the next corresponding ids [engagement_id2, member_id2]
                engagementsUpdate = [];
              }
            })
          });
      console.log(masterUpdate);
      
      var total = masterUpdate.length;
      //looping through the engagement ids
      	masterUpdate.forEach(function (engagement) {
          //data that needs to be updated
          //field_182:engagement[1] corresponds to the member id - it needs to be done this way as we need a way to pass in both the engagement id and the member id (hence the two for loops
          //earlier)
        var data = { field_104: Event, field_183: Council, field_182: engagement[1], field_172: Points };
          	console.log(Points);
            Knack.showSpinner();
          $.ajax({
                //this url points to the edit engagement form under the event details page and filters in the engagement id to be updated
            url: 'https://api.knack.com/v1/scenes/scene_107/views/view_184/records/' + engagement[0],
              type: 'PUT',
                headers: headers, 
            //the trycount and retrylimit allow us to bypass the 429 error to pause and send more requests (max is 10 per second)
            	tryCount : 0,
            	retryLimit: 3,
                //posts var into form
              data: JSON.stringify(data),
              success: function (response) {
          total--
                console.log('Engagements updated!!!');
                redirect(total, Council, Event);
                },
            //this error helps us bypass the 429 error and allows us to keep trying again after some time so that we can send more than 10 requests per second 
            //(example: need to update an event for 10+ people)
          error : function(request, status, error ) {
              if (request.status == 429) {
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                      console.log('try again...');
                      $.ajax(this);
                      return;
                  } else {
                      console.log('update failed!'); 
                  }
              } else {
                  //handle other errors
              }
          }
         })
        });
    }
  });
});
