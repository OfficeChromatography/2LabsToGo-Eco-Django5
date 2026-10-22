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

async function openValve() {
    try {
        gcode = 'G0X129\nM400\nM42P36S255\nM400\nG41\nM400\nG4S32\nM400\nM42P36S0\nM400\nG28X\nM400';
        //after 30 s, the dispensing valve closes (firmware); after 32 s (G4S32), the 3-way valve switches back
        await sendToMachine(gcode);
        console.log(gcode);
    } 
    catch (error) {
        console.error('Error in openValve:', error);
    }
}

$('#openvalve').on('click', function() {
    openValve();
});
