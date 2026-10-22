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

$('#pumpRange').on('change',function(){
  $('#pumpCycles').val($(this).val());
});

$('#pumpCycles').on('change',function(){
  $('#pumpRange').val($(this).val());
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pump() {
    n = $('#pumpCycles').val();
    for (let i = 1; i <= n; i++) {
        try {
            gcode = 'G50\nG4P500\nG51\nG4P500';
            await sendToMachine(gcode);
            console.log(gcode);
            await delay(500);
        }
        catch (error) {
            console.error('Error in drypump:', error);
        }
    };
}

$('#pumpcontrol').on('click', function() {
    pump();
});
