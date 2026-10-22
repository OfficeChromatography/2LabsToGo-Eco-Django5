var table_obj = new TableWaitingTime();
var flowGraph = null;

let currentOrder = "updated_at";
let isLoadingFromBackend = false;
let isInitializing = true;
const MIN_APPLICATIONS = 1;
const MAX_APPLICATIONS = 100;


$("#flowrate_stepcontrol").on("change", function () {
  let steps = parseInt($(this).val());

  if (isNaN(steps) || steps < 1) {
    steps = 5;
  }

  flowGraph = new flowRateGraph(steps);
});
function showSaveError(message) {
  $("#save_error_message")
    .text(message)
    .stop(true, true)
    .fadeIn();

  setTimeout(() => {
    $("#save_error_message").fadeOut();
  }, 4000);
}

$(".development-flowrate-insidence").on("change", function () {
  if (isLoadingFromBackend || isInitializing) return;

  if (mainCalculations(true)) {
    flowrateCalc(true);
  }
});

$(".change-graph-size-parameter").on("change", function () {
  if (isLoadingFromBackend || isInitializing) return;

  changeGraphSize();
  if (mainCalculations(true)) {
    flowrateCalc(true);
  }
});


$("#id_fluid").change(function () {
  $(this).val() == 'Specific' ? $('#specificFluidTable').show() : $('#specificFluidTable').hide()
});
function importCsv(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const csvData = event.target.result;
    const lines = csvData.split('\n');
    let formData = {};
    let waitingTimeData = [];
    let isWaitingTimeSection = false;

    lines.forEach(line => {
      if (!line.trim()) return;

      let key, value;

      if (line.startsWith('flowrate')) {
        key = 'flowrate';
        value = line.substring(line.indexOf('['));
      } else {
        [key, value] = line.split(',', 2);
      }

      if (key === 'Waiting Time Data') {
        isWaitingTimeSection = true;
        return;
      }

      if (isWaitingTimeSection) {
        let applicationIndex = key.match(/application_(\d+)/);
        if (applicationIndex) {
          waitingTimeData.push({
            waitTime: value,
            application: applicationIndex[1]
          });
        }
      } else {
        formData[key] = decodeURIComponent(value);
      }
    });

    delete formData.id;
    delete formData.pk;
    delete formData.selected_element_id;
    delete formData["selected-element-id"];

    $('#selected-element-id').val('');
    $('#new_filename').prop('readonly', false);
    $("#list-load").find("a.active").removeClass("active");

    setDataF(formData);
    window.importedWaitingTimeData = waitingTimeData;

    if (table_obj) {
      if (waitingTimeData.length > 0) {
        table_obj.loadFromImport(waitingTimeData);
      } else {
        table_obj.generateEmptyRows();
      }
    } else {
      console.error("table_obj is not initialized.");
    }

    $('#import_csv_file').val('');
  };

  reader.readAsText(file, 'UTF-8');
}

  $("#orderby_btn").on("click", function () {
    if (currentOrder === "updated_at") {
      currentOrder = "created_at";
      $(this).text("Created");
    } else {
      currentOrder = "updated_at";
      $(this).text("Updated");
    }
    list_of_saved.loadList();
  });
  function loadWaitingTimesFromImport(data) {
    table_obj.eliminateRows();
    data.forEach(wt => {

      table_obj.appendRow(wt.application, wt.waitingTime);
    });
  }

  function setDataF(data) {

    for (let key in data) {
      if (key === "csrfmiddlewaretoken" || key === "selected-element-id") {
        continue;
      }
      if (key === "flowrate") {
        let flowrateData = [];
        try {
          let sanitizedFlowrate = data.flowrate.slice(1, -1);
          let flowrateItems = sanitizedFlowrate.split(/},\s*{/);

          flowrateItems.forEach(item => {
            item = `{${item.replace(/^\{/, '').replace(/\}$/, '')}}`;
            let parsedItem = JSON.parse(item);
            flowrateData.push(parsedItem);
          });

          if (Array.isArray(flowrateData)) {


            if (Array.isArray(flowrateData) && flowrateData.length > 0) {
              flowGraph.loadSegment(flowrateData);
            }
          } else {
          }
        } catch (e) {
          console.error("Error al parsear flowrate:", e);
        }

      } else {
        let input = document.querySelector(`[name=${key}]`);
        if (input) {

          if (input.type === "checkbox") {
            input.checked = data[key] === "True";
          } else if (input.type === "select-one" || input.type === "text" || input.type === "number") {
            input.value = data[key];
          }
        } else {
          console.log(`Field ${key} not found in the form.`);
        }
      }
    }

    $(".change-graph-size-parameter").trigger("change");


    changeGraphSize();
    if (mainCalculations()) {
      flowrateCalc();
    }
  }


  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("import_csv_file");

    if (input) {
      input.addEventListener("change", function (event) {
        importCsv(event.target.files[0]);
      });
    }
  });

  // MAIN
  function mainCalculations(showErrors = true) {
    normalizeDevelopmentInputs();

    if (!validateNumberInputs(showErrors)) {
      return false;
    }


    let plate_x_size = parseFloat($("#id_size_x").val());
    let plate_y_size = parseFloat($("#id_size_y").val());

    let offset_left_size = parseFloat($("#id_offset_left").val());
    let offset_right_size = parseFloat($("#id_offset_right").val());
    let offset_bottom_size = parseFloat($("#id_offset_bottom").val());

    let volume = parseFloat($("#id_develop_volume").val());
    let band_height = 0.1;

    let missing_parameter = (
      isNaN(plate_x_size) ||
      isNaN(plate_y_size) ||
      isNaN(offset_left_size) ||
      isNaN(offset_right_size) ||
      isNaN(offset_bottom_size) ||
      isNaN(volume)
    );
    if (showErrors) {
      if (areErrors("#id_parameter_error", missing_parameter)) {
        return false;
      }
    } else if (missing_parameter) {
      return false;
    }


    let working_area = nBandsWorkingArea(
      plate_x_size,
      offset_left_size,
      offset_right_size,
      plate_y_size,
      offset_bottom_size
    );
    const invalidOffsets = isNaN(working_area[0]) || isNaN(working_area[1]);

    if (showErrors) {
      if (areErrors("#id_offsets_error", invalidOffsets)) {
        return false;
      }
    } else if (invalidOffsets) {
      return false;
    }

    const invalidSpace = working_area[1] < band_height;

    if (showErrors) {
      if (areErrors("#id_space_error", invalidSpace)) {
        return false;
      }
    } else if (invalidSpace) {
      return false;
    }


    let band_size = working_area[0];

    plotPreview.eliminateAllPoints();

    let newdata = [];

    newdata[0] = {
      y: offset_bottom_size,
      x: offset_left_size
    };

    newdata[1] = {
      y: offset_bottom_size + band_height,
      x: offset_left_size
    };

    newdata[2] = {
      y: offset_bottom_size + band_height,
      x: band_size + offset_left_size
    };

    newdata[3] = {
      y: offset_bottom_size,
      x: band_size + offset_left_size
    };

    newdata[4] = newdata[0];

    plotPreview.addData2Chart("1", "black", newdata);
    plotPreview.update();

    return true;
  }

  //Calculates the Working Area
  function nBandsWorkingArea(plate_x_size, offset_left_size, offset_right_size, plate_y_size, offset_bottom_size) {
    working_area = [plate_x_size - offset_left_size - offset_right_size, plate_y_size - offset_bottom_size]
    if (working_area[0] <= 0 || working_area[1] <= 0 || isNaN(working_area[0]) || isNaN(working_area[1])) {
      return [NaN, NaN];
    }
    else {
      return working_area;
    }
  }


  function areErrors(error_id, bolean_exp) {
    if (bolean_exp) {
      $(error_id).fadeIn();
      return true
    }
    else {
      $(error_id).fadeOut();
      return false
    }
  }


  $('#downloadfilebttn').on('click', function (e) {
    e.preventDefault()
    var element = document.createElement('a');

    var plate = getFormData($('#plateform'))
    var pressure = getFormData($('#pressureform'))
    var zero = getFormData($('#zeroform'))
    var table = getSpecificFluid(false)

    items = Object.assign(plate, pressure, table, zero)

    content = JSON.stringify(items);
    filename = new Date().toLocaleString() + ".json"

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  })
  $('#loadfilebttn').on('click', function (e) {
    e.preventDefault()
    var file = $('#file')[0].files[0];
    getAsText(file);
  })
  $('#removefilebttn').on('click', function (e) {
    $('#file').next('.custom-file-label').html('');
    $('#file').val('')
    $('#sizesfile').html('')
  })
  $('#file').on('change', function (e) {
    var fileName = e.target.files[0];
    $(this).next('.custom-file-label').html(fileName.name);
  })

  function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
      indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
  }

  function getAsText(readFile) {

    var reader = new FileReader();

    reader.readAsText(readFile, "UTF-8");

    reader.onload = loaded;
    reader.onerror = errorHandler;

    function loaded(evt) {
      var fileString = evt.target.result;
      jsonObject = JSON.parse(fileString)
      loadMethodSuccess(jsonObject)
    }
    function errorHandler(evt) {
      if (evt.target.error.name == "NotReadableError") {

      }
    }
  }

  function flowrateCalc(showErrors = true) {
    normalizeDevelopmentInputs();
    const length =
      parseFloat($("#id_size_x").val()) -
      parseFloat($("#id_offset_left").val()) -
      parseFloat($("#id_offset_right").val());

    const speed = parseFloat($("#id_motor_speed").val());
    const volume = parseFloat($("#id_develop_volume").val());
    const applications = parseFloat($("#id_applications").val());

    const invalid = (
      isNaN(length) ||
      isNaN(speed) ||
      isNaN(volume) ||
      isNaN(applications) ||
      length <= 0 ||
      speed <= 0 ||
      applications <= 0
    );

    if (invalid) {
      $("#flowrate").text("estimated flowrate: -");

      if (showErrors) {
        areErrors("#id_flowrate_error", true);
      } else {
        areErrors("#id_flowrate_error", false);
      }

      return false;
    }

    areErrors("#id_flowrate_error", false);

    const time = length / speed;
    const flowrate = volume / time / applications;

    $('#flowrate').text('estimated flowrate: ' + flowrate.toFixed(2) + " ul/s");
    return true;
  }

  function normalizeDevelopmentInputs() {
    let applications = parseInt($("#id_applications").val());

    if (isNaN(applications) || applications < MIN_APPLICATIONS) {
      applications = MIN_APPLICATIONS;
    }

    if (applications > MAX_APPLICATIONS) {
      applications = MAX_APPLICATIONS;
    }

    $("#id_applications").val(applications);

    let volume = parseFloat($("#id_develop_volume").val());

    if (isNaN(volume) || volume < 0) {
      $("#id_develop_volume").val(0);
    }
  }

  function validateNumberInputs(showErrors = true) {
	let motor_speed = $("#id_motor_speed").val();
    let initial_pressure = $("#id_pressure").val();
    let temperature = $("#id_temperature").val();
    console.log(temperature)
    
    if (areErrors(
      "#id_motor_speed_error",
      isNaN(motor_speed) ||  motor_speed < 5 || motor_speed > 50
    )) {
      return false;
    }
    if (areErrors(
      "#id_initial_pressure_error",
      isNaN(initial_pressure) ||  initial_pressure < 5)) {
      return false;
    }
    if (areErrors(
      "#id_temperature_error",
      isNaN(temperature) ||  temperature < 0
    )) {
      return false;
    }
	
    let isValid = true;

    $("input[type='number']:visible").each(function () {
      const input = $(this);
      const value = parseFloat(input.val());
      const min = parseFloat(input.attr("min"));
      const max = parseFloat(input.attr("max"));

      let invalid = false;

      if (isNaN(value)) {
        invalid = true;
      }

      if (!isNaN(min) && value < min) {
        invalid = true;
      }

      if (!isNaN(max) && value > max) {
        invalid = true;
      }

      if (showErrors) {
        input.toggleClass("is-invalid", invalid);
      }

      if (invalid) {
        isValid = false;
      }
    });

    if (showErrors) {
      areErrors("#id_limits_error", !isValid);
    }

    return isValid;
  }

  var getData = function () {
    if (!mainCalculations() || !flowrateCalc()) {
      showSaveError("Please fix the highlighted errors before saving.");
      return null;
    }

    let formData = $("form").serialize();
    let waitingTimes = JSON.stringify(table_obj.getValues());
    let encodedWaitingTimes = encodeURIComponent(waitingTimes);

    let data = formData + "&waitingTimes=" + encodedWaitingTimes;

    if (!flowGraph) {
      $("#flowrate_stepcontrol").trigger("change");
    }

    data = data + flowGraph.saveSegment(true);
    return data;
  };

  var setData = function (data) {
    isLoadingFromBackend = true;

    $.each(data, function (key, value) {
      let element = $('[name="' + key + '"]');

      if (element.is("input")) {
        if (element.attr("type") === "checkbox") {
          element.prop("checked", value === "True");
        } else {
          element.val(value);
        }
      } else if (element.is("select")) {
        element.val(value);
      }
    });

    if (table_obj) {
      if (data.waitingTimes) {
        table_obj.loadFromImport(data.waitingTimes);
      } else {
        table_obj.generateEmptyRows();
      }
    } else {
      console.error("table_obj no está inicializado.");
    }


    if (!flowGraph) {
      $("#flowrate_stepcontrol").trigger("change");
    }
    if (Array.isArray(data.flowrate) && data.flowrate.length > 0) {
      flowGraph.loadSegment(data.flowrate);
    } else {
      $("#flowrate_stepcontrol").trigger("change");
    }

    isLoadingFromBackend = false;


    changeGraphSize();

    if (mainCalculations(false)) {
      flowrateCalc(false);
    }
    if (flowGraph) {
      flowGraph.brd.update();
    }
  };

  var list_of_saved = new listOfSaved("http://127.0.0.1:8000/development/save/",
    "http://127.0.0.1:8000/development/list",
    "http://127.0.0.1:8000/development/load",
    getData,
    setData,
    "http://127.0.0.1:8000/development/delete",
    "development"
  )

  var application_control = new ApplicationControlDev('http://127.0.0.1:8000/oclab/control/',
    'http://127.0.0.1:8000/development/start/',
    getData)




  $(document).ready(function () {
    isInitializing = true;

    $(".is-invalid").removeClass("is-invalid");
    $("#id_limits_error").hide();
    $("#id_parameter_error").hide();
    $("#id_offsets_error").hide();
    $("#id_space_error").hide();
    $("#id_flowrate_error").hide();
    $("#save_error_message").hide();

    $("#flowrate_stepcontrol").trigger("change");

    list_of_saved.loadList();


    isInitializing = false;

    changeGraphSize();

    mainCalculations(false);
    flowrateCalc(false);

  });
  
  // Change the Graph sizes with the size x and y field values, x from -5 to 105.
function changeGraphSize(){
  sizeX = parseFloat($("#id_size_x").val());
  result = sizeX +5;
  console.log("Result=" + result);
  plotPreview.config.options.scales.xAxes[0].ticks.max = result;
  plotPreview.config.options.scales.xAxes[0].ticks.min = -5;
  plotPreview.config.options.scales.yAxes[0].ticks.max = parseFloat($("#id_size_y").val());
  plotPreview.update();
}
