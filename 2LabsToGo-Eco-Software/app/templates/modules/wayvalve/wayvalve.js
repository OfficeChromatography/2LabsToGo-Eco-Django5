async function sendToMachine(value) {
    const data = {'gcode': value};
    console.log(data);
    return new Promise(function(resolve, reject) {
        $.ajax({
            method: 'POST',
            url: window.location.origin + '/send/',
            data: data,
            success: function(data, textStatus, jqXHR) {
                console.log("Success!");
                resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error:", errorThrown);
                reject(errorThrown);
            }
        });
    })
}

$('#valveRange').on('change',function(){
  $('#valveCycles').val($(this).val());
});

$('#valveCycles').on('change',function(){
  $('#valveRange').val($(this).val());
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wayValve() {
    n = $('#valveCycles').val();
    for (let i = 1; i <= n; i++) {
      try {
        gcode = 'M42P36S255\nG4P500\nM42P36S0\nG4P500';
        await sendToMachine(gcode);
        console.log(gcode);
        await delay(500);
      } 
      catch (error) {
        console.error('Error in wayValve:', error);
      }
    };
}

$('#valvecontrol').on('click', function() {
    wayValve();
})
