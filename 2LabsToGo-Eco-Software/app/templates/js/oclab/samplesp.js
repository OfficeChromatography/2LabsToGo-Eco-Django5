window.table = new Table(0, calcVol);

let currentOrder = "updated_at";
const MAX_NUMBER_BANDS = 100;
const MIN_NUMBER_BANDS = 1;
const MIN_GAP = 0.1;

const DEFAULT_STATE_BY_PROPERTY = {
  "1": { // Number
    value: "2",
    gap: "4"
  },
  "2": { // Length
    value: "10",
    gap: "4"
  }
};

const PROPERTY_FIELDS = [
  "value",
  "gap"
];

let propertyState = {
  "1": { ...DEFAULT_STATE_BY_PROPERTY["1"] },
  "2": { ...DEFAULT_STATE_BY_PROPERTY["2"] }
};

let currentProperty = "1";
let isLoadingFromBackend = false;
let calcVolRequestCounter = 0;

function resetPropertyState() {
  propertyState = {
    "1": { ...DEFAULT_STATE_BY_PROPERTY["1"] },
    "2": { ...DEFAULT_STATE_BY_PROPERTY["2"] }
  };

  currentProperty = "1";

  $("#id_main_property").val("1");

  loadPropertyState("1");
  updatePropertyUI("1");
  normalizeBandInputs();

  const numberBands = getNumberBands();

  newComponentsTable(numberBands);
  changeGraphSize();

  if (mainCalculations()) {
    calcVol();
  }
}

function saveCurrentPropertyState() {
  if (!currentProperty) return;

  normalizeBandInputs();

  PROPERTY_FIELDS.forEach(function (fieldName) {
    const element = $('[name="' + fieldName + '"]');

    if (element.length) {
      propertyState[currentProperty][fieldName] = element.val();
    }
  });
}

function loadPropertyState(property) {
  PROPERTY_FIELDS.forEach(function (fieldName) {
    const element = $('[name="' + fieldName + '"]');

    if (element.length && propertyState[property][fieldName] !== undefined) {
      element.val(propertyState[property][fieldName]);
    }
  });

  normalizeBandInputs();
}

function updatePropertyUI(property) {
  switch (property) {
    case "1":
      $("#id_valuesunit").html("#");
      $("#lengthbandsrow").hide();
      $("#nbandsrow").show();
      $("#valueLabel").text("Number");

      $("#id_value").attr({
        min: MIN_NUMBER_BANDS,
        max: MAX_NUMBER_BANDS,
        step: 1
      });

      $("#id_gap").attr({
        min: MIN_GAP,
        step: 0.1
      });

      break;

    case "2":
      $("#id_valuesunit").html("mm");
      $("#bandlengthform").show();
      $("#nbandsrow").hide();
      $("#lengthbandsrow").show();
      $("#valueLabel").text("Length");

      $("#id_value").attr({
        min: 0.1,
        step: 0.1
      });

      $("#id_value").removeAttr("max");

      $("#id_gap").attr({
        min: MIN_GAP,
        step: 0.1
      });

      break;
  }
}

function normalizeBandInputs() {
  const property = $("#id_main_property").val();

  let gap = parseFloat($("#id_gap").val());

  if (isNaN(gap) || gap < MIN_GAP) {
    $("#id_gap").val(MIN_GAP);
  }

  if (property === "1") {
    let numberBands = parseInt($("#id_value").val());

    if (isNaN(numberBands) || numberBands < MIN_NUMBER_BANDS) {
      numberBands = MIN_NUMBER_BANDS;
    }

    if (numberBands > MAX_NUMBER_BANDS) {
      numberBands = MAX_NUMBER_BANDS;
    }

    $("#id_value").val(numberBands);
  }
}

var getData = function () {
  normalizeBandInputs();

  if (!mainCalculations()) {
    alert("Please fix the highlighted errors before saving.");
    return null;
  }

  const data = $("form:not(.band-component)").serialize()
    + "&table="
    + encodeURIComponent(JSON.stringify(table.getTableValues()));

  return data;
};

var setData = function (data) {
  isLoadingFromBackend = true;

  $.each(data, function (key, value) {
    let element = $('[name="' + key + '"]');

    if (element.is("input")) {
      element.val(value);
    }
    else if (element.is("select")) {
      element.val(value);
    }
  });

  const loadedProperty = String(data.main_property || "1");

  currentProperty = loadedProperty;

  propertyState = {
    "1": { ...DEFAULT_STATE_BY_PROPERTY["1"] },
    "2": { ...DEFAULT_STATE_BY_PROPERTY["2"] }
  };

  PROPERTY_FIELDS.forEach(function (fieldName) {
    if (data[fieldName] !== undefined && data[fieldName] !== null) {
      propertyState[loadedProperty][fieldName] = String(data[fieldName]);
    }
  });

  table.loadTable(data.bands_components || []);

  isLoadingFromBackend = false;

  updatePropertyUI(loadedProperty);
  loadPropertyState(loadedProperty);
  normalizeBandInputs();

  const numberBands = getNumberBands();

  newComponentsTable(numberBands);
  changeGraphSize();

  if (mainCalculations()) {
    calcVol();
  }
};

var list_of_saved = new listOfSaved(
  "http://127.0.0.1:8000/syringepump/save/",
  "http://127.0.0.1:8000/syringepump/list/",
  "http://127.0.0.1:8000/syringepump/load",
  getData,
  setData,
  "http://127.0.0.1:8000/syringepump/delete",
  "syringe_pump"
);

var application_control = new ApplicationControlSP(
  "http://127.0.0.1:8000/oclab/control/",
  "http://127.0.0.1:8000/syringepump/start/",
  getData
);

$(".change-graph-size-parameter").on("change", function () {
  if (isLoadingFromBackend) return;

  normalizeBandInputs();
  changeGraphSize();

  if (mainCalculations()) {
    calcVol();
  }
});

$(".change-bands-table").on("change", function () {
  if (isLoadingFromBackend) return;

  normalizeBandInputs();

  const numberBands = getNumberBands();

  newComponentsTable(numberBands);

  if (mainCalculations()) {
    calcVol();
  }
});

$(".change-volume-parameter").on("change", function () {
  if (isLoadingFromBackend) return;

  normalizeBandInputs();

  if (mainCalculations()) {
    calcVol();
  }
});

$("#id_main_property").on("change", function () {
  if (isLoadingFromBackend) return;

  handlePropertyChange();
});

$("#id_gap").on("change", function () {
  if (isLoadingFromBackend) return;

  normalizeBandInputs();

  if (mainCalculations()) {
    calcVol();
  }
});



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

function getNumberBands() {
  const gap_size = parseFloat($("#id_gap").val());
  const band_size = parseFloat($("#id_value").val());
  const property = $("#id_main_property").val();
  const working_area = nBandsWorkingArea();

  let numberBands = 0;

  if (property === "1") {
    numberBands = parseInt($("#id_value").val());
  }
  else if (property === "2") {
    numberBands = Math.trunc((working_area[0] + gap_size) / (band_size + gap_size));
  }

  if (isNaN(numberBands) || numberBands < 0) {
    return 0;
  }

  if (numberBands > MAX_NUMBER_BANDS) {
    return MAX_NUMBER_BANDS;
  }

  return numberBands;
}

function handlePropertyChange() {
  saveCurrentPropertyState();

  const newProperty = $("#id_main_property").val();

  currentProperty = newProperty;

  loadPropertyState(newProperty);
  updatePropertyUI(newProperty);
  normalizeBandInputs();

  const numberBands = getNumberBands();

  newComponentsTable(numberBands);
  changeGraphSize();

  if (mainCalculations()) {
    calcVol();
  }
}

function getStartX(number_bands, band_size, gap_size, working_area, offset_left_size, property) {
  if (property === "2") {
    const used_area = (number_bands * band_size) + ((number_bands - 1) * gap_size);
    const free_area = working_area[0] - used_area;
    return offset_left_size + (free_area / 2);
  }

  return offset_left_size;
}

function createBandsTable(number_bands = null) {
  newComponentsTable(number_bands);
}

function mainCalculations() {
  normalizeBandInputs();
  
  let motor_speed = $("#id_motor_speed").val();
  if (areErrors(
    "#id_motor_speed_error",
    isNaN(motor_speed) ||  motor_speed < 5 || motor_speed > 50
  )) {
    return false;
  }


  let plate_x_size = parseFloat($("#id_size_x").val());
  let plate_y_size = parseFloat($("#id_size_y").val());

  let offset_left_size = parseFloat($("#id_offset_left").val());
  let offset_right_size = parseFloat($("#id_offset_right").val());
  let offset_bottom_size = parseFloat($("#id_offset_bottom").val());

  let gap_size = parseFloat($("#id_gap").val());
  const number_bands = getNumberBands();
  let band_size = parseFloat($("#id_value").val());

  let band_height = parseFloat($("#id_height").val());
  let property = $("#id_main_property").val();

  if (areErrors(
    "#id_number_bands_error",
    isNaN(number_bands) ||
    number_bands < MIN_NUMBER_BANDS ||
    number_bands > MAX_NUMBER_BANDS
  )) {
    return false;
  }

  if (areErrors(
    "#id_gap_error",
    isNaN(gap_size) || gap_size < MIN_GAP
  )) {
    return false;
  }

  let missing_parameter = (
    isNaN(plate_x_size) ||
    isNaN(plate_y_size) ||
    isNaN(offset_left_size) ||
    isNaN(offset_right_size) ||
    isNaN(offset_bottom_size) ||
    isNaN(gap_size) ||
    isNaN(band_height)
  );

  if (areErrors("#id_parameter_error", missing_parameter)) {
    return false;
  }

  let working_area = nBandsWorkingArea();

  if (areErrors("#id_offsets_error", isNaN(working_area[0]) || isNaN(working_area[1]))) {
    return false;
  }

  if (areErrors("#id_space_error", working_area[1] < band_height)) {
    return false;
  }

  switch (property) {
    case "1":
      let sum_gaps_size = totalGapLength(number_bands, gap_size);

      if (areErrors("#id_gap_error", isNaN(sum_gaps_size) || sum_gaps_size >= working_area[0])) {
        return false;
      }

      band_size = totalBandsLength(working_area, sum_gaps_size, number_bands);

      if (areErrors("#id_space_error", isNaN(band_size))) {
        return false;
      }

      break;

    case "2":
      if (areErrors("#id_space_error", number_bands < 1)) {
        return false;
      }

      if (areErrors("#id_gap_error", gap_size > (working_area[0] - (band_size * number_bands)))) {
        return false;
      }

      newComponentsTable(number_bands);
      break;
  }

  const start_x = getStartX(
    number_bands,
    band_size,
    gap_size,
    working_area,
    offset_left_size,
    property
  );

  plotPreview.eliminateAllPoints();

  for (let i = 0; i < number_bands; i++) {
    let newdata = [];

    newdata[0] = {
      y: offset_bottom_size,
      x: i * (band_size + gap_size) + start_x
    };

    newdata[1] = {
      y: offset_bottom_size + band_height,
      x: i * (band_size + gap_size) + start_x
    };

    newdata[2] = {
      y: offset_bottom_size + band_height,
      x: (i + 1) * band_size + (gap_size * i) + start_x
    };

    newdata[3] = {
      y: offset_bottom_size,
      x: (i + 1) * band_size + (gap_size * i) + start_x
    };

    newdata[4] = newdata[0];

    plotPreview.addData2Chart(i, "black", newdata);
  }

  plotPreview.update();

  return true;
}

function areErrors(error_id, bolean_exp) {
  if (bolean_exp) {
    $(error_id).fadeIn();
    return true;
  }

  $(error_id).fadeOut();
  return false;
}

function nBandsWorkingArea() {
  let plate_x_size = parseFloat($("#id_size_x").val());
  let plate_y_size = parseFloat($("#id_size_y").val());
  let offset_left_size = parseFloat($("#id_offset_left").val());
  let offset_right_size = parseFloat($("#id_offset_right").val());
  let offset_bottom_size = parseFloat($("#id_offset_bottom").val());

  let working_area = [
    plate_x_size - offset_left_size - offset_right_size,
    plate_y_size - offset_bottom_size
  ];

  if (
    working_area[0] <= 0 ||
    working_area[1] <= 0 ||
    isNaN(working_area[0]) ||
    isNaN(working_area[1])
  ) {
    return [NaN, NaN];
  }

  return working_area;
}

function totalGapLength(number_bands, gap_size) {
  let number_of_gaps = number_bands - 1;

  if (number_of_gaps < 0) {
    return NaN;
  }

  return gap_size * number_of_gaps;
}

function totalBandsLength(working_area, sum_gaps_size, number_bands) {
  let bands_size = (working_area[0] - sum_gaps_size) / number_bands;

  if (bands_size <= 0) {
    return NaN;
  }

  return bands_size;
}

function newComponentsTable(desiredRows) {
  desiredRows = parseInt(desiredRows);

  if (isNaN(desiredRows) || desiredRows < 0) {
    desiredRows = 0;
  }

  if (desiredRows > MAX_NUMBER_BANDS) {
    desiredRows = MAX_NUMBER_BANDS;
  }

  const diff = desiredRows - table.numberOfRows;

  if (diff > 0) {
    table.addEmptyRows(diff);
  } else if (diff < 0) {
    table.removeRowsFromEnd(-diff);
  }
}

function changeGraphSize() {
  plotPreview.config.options.scales.xAxes[0].ticks.max = parseFloat($("#id_size_x").val());
  plotPreview.config.options.scales.yAxes[0].ticks.max = parseFloat($("#id_size_y").val());
  plotPreview.update();
}

function calcVol() {
  const requestId = ++calcVolRequestCounter;

  const formData = $('#plateform').serialize()
    + '&'
    + $('#movementform').serialize()
    + '&table='
    + encodeURIComponent(JSON.stringify(table.getTableValues()));

  const endpoint = window.location.origin + '/syringepumpcalc/';

  $.ajax({
    method: 'POST',
    url: endpoint,
    data: formData,
    timeout: 10000,

    success: function (data) {
      if (requestId !== calcVolRequestCounter) {
        return;
      }

      table.setTableCalculationValues(data.results.slice(0, -1));
      table.estim_time(data.results.slice(-1));
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.error(
        "Error calculating estimated volumes",
        jqXHR.status,
        textStatus,
        errorThrown
      );

      console.error(jqXHR.responseText);
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("import_csv_file");

  if (input) {
    input.addEventListener("change", function (event) {
      var reader = new FileReader();

      reader.onload = function (e) {
        processCSV(e.target.result);
      };

      reader.readAsText(event.target.files[0]);
    });
  }
});

function processCSV(csvData) {
  var lines = csvData.trim().split("\n");
  var result = {};

  lines.forEach(function (line) {
    let firstCommaIndex = line.indexOf(",");

    if (firstCommaIndex === -1) return;

    let key = line.substring(0, firstCommaIndex).trim();
    let value = line.substring(firstCommaIndex + 1).trim();

    value = decodeURIComponent(value);

    if (value.startsWith("[") || value.startsWith("{")) {
      try {
        result[key] = JSON.parse(value);
      } catch (error) {
        console.error("Error al parsear JSON", error);
        alert("Error con el JSON: " + error.message);
      }
    } else {
      result[key] = value;
    }
  });

  delete result.id;
  delete result.pk;
  delete result.selected_element_id;
  delete result["selected-element-id"];

  $('#selected-element-id').val('');
  $('#new_filename').prop('readonly', false);
  $("#list-load").find("a.active").removeClass("active");

  loadDataIntoForm(result);
  $("#import_csv_file").val("");
}

function loadDataIntoForm(data) {
  isLoadingFromBackend = true;

  Object.keys(data).forEach(function (key) {
    if (key === "table") {
      loadTableData(data[key]);
    } else {
      var input = document.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
      } else {
        console.warn("No input found for key:", key);
      }
    }
  });

  const loadedProperty = String(data.main_property || "1");

  currentProperty = loadedProperty;

  propertyState = {
    "1": { ...DEFAULT_STATE_BY_PROPERTY["1"] },
    "2": { ...DEFAULT_STATE_BY_PROPERTY["2"] }
  };

  PROPERTY_FIELDS.forEach(function (fieldName) {
    if (data[fieldName] !== undefined && data[fieldName] !== null) {
      propertyState[loadedProperty][fieldName] = String(data[fieldName]);
    }
  });

  isLoadingFromBackend = false;

  updatePropertyUI(loadedProperty);
  loadPropertyState(loadedProperty);
  normalizeBandInputs();

  const numberBands = getNumberBands();

  newComponentsTable(numberBands);
  changeGraphSize();

  if (mainCalculations()) {
    calcVol();
  }
}

function loadTableData(tableData) {
  if (window.table) {
    window.table.destructor();
    window.table.loadTable(tableData);
  } else {
    window.table = new Table(0, calcVol);
    window.table.loadTable(tableData);
  }
}
$(document).ready(function () {
  resetPropertyState();
  list_of_saved.loadList();
});