/*
	script.js
	Title: Canvas Person Fetch - User Lookup
	Author: Nazmus
	URL: http://www.easyprogramming.net
	Instructure Docs: https://canvas.instructure.com/doc/api/users.html
	Github: https://github.com/naztronaut/

	Custom JS file for EFetch
*/

$(document).ready(function () {

    var show_pid;
    var showEmail = 1; //email is checked by default
    var showName;
    var multiples = []; // array placeholder for any results that return multiples

    //check to see if the checkboxes statuses have been altered and assign a 1 or 0
    $("#showId").change(function () {
        show_pid = this.checked ? 1 : 0;
    });
    $("#showEmail").change(function () {
        showEmail = this.checked ? 1 : 0;
    });
    $("#showName").change(function () {
        showName = this.checked ? 1 : 0;
    });

    $("#myForm").on("submit", function (e) {
        var apiKey = $("#apiKey").val();

        var domain = $("#domain").val();
        multiples = []; //reset multiples array
        var table = $("<table>").addClass("table table-striped table-hover table-bordered");
        var thead = $("<thead>");
        var row = $("<tr>");

        $("#output").html("<div id='resultTitle'>Results</div>"); //clear HTML
        $("#multiples").html('');

        (showName == 1) ? $(thead).append($(row).append($("<th>").append("Name").addClass("info"))): ''; //if show Name is checked
        (show_pid == 1) ? $(thead).append($(row).append($("<th>").append("SIS ID").addClass("info"))): ''; //if show PersonID is checked
        (showEmail == 1) ? $(thead).append($(row).append($("<th>").append("Email").addClass("info"))): ''; //if show email is checked

        $(table).append($(thead));
        var list = $("#text").val().split("\n"); // array item per newline 
        list.forEach(function (item, i) {
            var item1;
            (item == "") ? "" : searchMe(item);

            function searchMe(item) {
                $.ajax({
                    url: 'code/efetch/canvascurler.php',
                    method: 'GET',
                    data: {
                        'url' : 'instructure.com/api/v1/accounts/self/users?search_term=' + item,
                        'domain' : domain,
                        'apiKey' : apiKey
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data[0].length == 0){
                            console.log('nothing here');
                        }
                        console.log(data.length);
                        (data.length > 1) ? multiples.push(item): '';

                        var id = data[0]['id']; //get id from result - if multiple results, only the first ID will be grabbed, the rest will be ignored
                        getEmail(id, show_pid, showEmail, showName, table, domain,apiKey); //pass id for another canvas api call -- add showPic argument to pass in picture
                    }
                }).done(function () {
                    (multiples.length > 0) ? $("#multiples").html("The following searches returned multiple results, please double check: " + multiples).addClass("bg-danger"): ''; // when the ajax is completed, display the list of users who appeared multiple times
                });
            }
            $("#output").append($(table));
        });
        e.preventDefault();
    });
    $(document).ajaxStart(function () {
        $("#spinner").show();
    });
    $(document).ajaxStop(function () {
        $("#spinner").hide();
    });
});

//add sPic parameter to get Picture
function getEmail(id, pId, eId, sName, table, domain, apiKey) {
    var tr = $("<tr>");
    $.ajax({
//        url: 'https://' + environment + '.instructure.com/api/v1/users/' + id + '/profile?access_token=' + canHBSkey,
        url: 'code/efetch/canvascurler.php',
        method: 'GET',
        dataType: "json",
        data: {
            'url': 'instructure.com/api/v1/users/' + id + '/profile?',
//            'environment' : environment,
            'domain' : domain,
            'apiKey' : apiKey
//            'params': {
//                search_term: null
//            }
        },
        success: function (data) {
            console.log(data);
            console.log(apiKey);
            console.log(domain);
            var email = data['primary_email']; //get primary email from canvas profile 

            if (data !== '') {
                if (sName == 1) {
                    $(tr).append($("<td>").append('<a href="https://' + domain + '.instructure.com/users/' + data['id'] + '" target="_blank">' + data['name'] + '</a>'));
                }
                if (pId == 1) {
                    $(tr).append($("<td>").append(data['sis_login_id']));
                }
                if (eId == 1) {
                    $(tr).append($("<td>").append(email));
                }
                $(table).append(tr);
                $("#output").append(table);
                if (!pId && !eId) {
                    $("#output").html("<br /><br />What do you want from me? Email? Person ID? Both?")
                }
            }
        }
    });
}