var loading = false;
var debug = false;
var interval = 0;
AUTO_REFRESH = 600000; 
function success(data)
{
 if(debug)
 	$('#main').html(data);
 
 $('#time').strftime( '%H:%M %d %b');
 $.mobile.hidePageLoadingMsg();
 loading = false;
 var json = $.parseJSON(data);
 if(json.hasOwnProperty('data') && json.data.hasOwnProperty('passenger'))
 {
  var passenger = parseStatus(json.data.passenger[0]);
  $('.main-ticket-wrapper .ticket-status-text').html(passenger.state);
  $('.main-ticket-wrapper .ticket-status-num').html(passenger.number);
  $('.main-ticket-wrapper .ticket-box').addClass(passenger.color);
 }
 $('.ticket-content').show();
}

function reloadData(url)
{    
    if (typeof url != 'string') {
     url = "http://pnrapi.alagu.net/api/v1.0/pnr/4437279839";
    }
    loading = true;
    $.mobile.showPageLoadingMsg();
    $('.ticket-content').hide();
	$.ajax({url:url,
	        success:success,
	        cache:false});
}

function appReady()
{
	var url = "http://pnrapi.alagu.net/api/v1.0/pnr/4437279839";
	
	reloadData(url);
}

function autoRefreshHandler(event, ui) 
{
		var nextReloadUpdate = function() {
			var nextReload = new Date((new Date()).getTime() + AUTO_REFRESH);
			$('#nextreload').strftime( 'Next refresh at %H:%M:%S', nextReload);
		};
		
		var value = ($(event.target).val());
		if (value == 'yes')
		{
			console.log("Starting  interval");
			nextReloadUpdate();
			interval = window.setInterval(function(){
				console.log("interval happening");
				reloadData();
				nextReloadUpdate();
			}, AUTO_REFRESH);
		}
		else
		{
			console.log("Clearing interval");
			window.clearInterval(interval);
			$('#nextreload').html('');
		}
};

function init() {
    document.addEventListener("deviceready", appReady, false);
    $( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!

    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
});

	$('#reload').click(reloadData);
	$( "#autoreload" ).bind( "change", autoRefreshHandler);
}




function parseStatus(passenger)
{   
    var isRAC = function(text)
    {
        return text.toLowerCase().indexOf('rac') >= 0;
    }

    var isWL = function(text)
    {
        return (text.toLowerCase().indexOf('w/l') >= 0) || (text.toLowerCase().indexOf('wl') >= 0);
    }

    state  = '';
    stateCode  = '';
    color = 'unknown'
    if (passenger['status'] == 'CNF') {
        splits = passenger['seat_number'].split(',');

        stateCode = 'CNF';
        state  = splits[0].replace(' ','');
        number = splits[1].replace(' ','');
        color = 'green';
    } 
    else if (isRAC(passenger['status']) && isRAC(passenger['seat_number']))
    {
        text = passenger['status'];
        
        state = stateCode = 'RAC';
        number = text.match(/(\d+)/)[0];
        color  = 'orange';
    }
    else if (passenger['status'] == 'Confirmed')
    {        
        state  = stateCode =  'CNF';
        number = ''
        color  = 'green';
    }
    else if (passenger['status'] == 'Can/Mod')
    {
        state  = stateCode =   'CAN';
        number = 'Cancelled';
        color  = 'grey';
    }
    else if (isWL(passenger['status']) && isWL(passenger['seat_number']))
    {
        text = passenger['status'];
        
        state  = stateCode = 'WL';
        number = text.match(/(\d+)/)[0]; 
        color  = 'red';
    }
    else if (isWL(passenger['seat_number']) && isRAC(passenger['status']))
    {
        text  = passenger['status'];
        
        state  = stateCode = 'RAC';
        number = text.match(/(\d+)/)[0];
        color  = 'orange';
    }
    else if ((!isWL(passenger['seat_number']) && !isRAC(passenger['seat_number']))
             && passenger['seat_number'].indexOf(passenger['status']) == 0)
    {
        
        splits = passenger['status'].split(',');
        stateCode = 'CNF';
        state  = splits[0].replace(' ','');
        number = splits[1].replace(' ','');
        color = 'green';
    }
    else 
    {
        status = passenger['status'].replace(',','');
        splits = status.split(' ');
        state  = splits[0];
        number = (splits[1] == '') ? splits[2] : splits[1];
        
        color = 'green';  
        stateCode = 'CNF';      
    }
    
    return {'color':color, 'state':state, 'number':number, 'stateCode' : stateCode};
    
}

