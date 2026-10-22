

$("#pump_manual").on('click',function(e){
    e.preventDefault();
    console.log($("#rinse-form").serialize());
    $.ajax({
        method: 'POST',
        url:    window.location.origin+'/staticpurge/',
        data:   $("#rinse-form").serialize(),
        success: staticCleanMethodSuccess,
        error: staticCleanMethodError,
    });
    function staticCleanMethodSuccess(data, textStatus, jqXHR){}
    function staticCleanMethodError(jqXHR, textStatus, errorThrown){}
    })

$("#rinse-form").on('keydown',function(event){
    console.log(event.which)
    if(event.which == 13) $('#pump_manual').click()
    })

$("#valveToggle").on('click',function(e){
    e.preventDefault();
    console.log("Toggle button clicked. Current text: " + $("#toggleText").html());
    if ($("#toggleText").html() == "Open Valve"){
        console.log("Entering Open Valve");
        $("#toggleText").html("Close Valve");
        //switch 3way valve, open dispensing valve closing after 30 s (firmware), switch 3way valve back after 32 s    
        gcode = 'M42P36S255\nG41\nG4S32\nM42P36S0';
        sendToMachine(gcode);
        console.log("valve opened");
    } else {
        console.log("Entering Close Valve");
        $("#toggleText").html("Open Valve");
        sendToMachine('M42P36S0\nG40\nG28X');
        console.log("valve closed");
    }
})

$('#rinseVolModal').on('shown.bs.modal', function (e) {
    sendToMachine('G0X129');
})
