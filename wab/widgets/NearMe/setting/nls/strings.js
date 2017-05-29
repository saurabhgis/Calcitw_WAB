﻿/*global define*/
///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define({
  root: ({
    units: { // label shown in config UI dialog box(options for dropdown) and also shown as label for slider text(slider unit) and acronym in feature list
      miles: {
        displayText: "Miles",
        acronym: "mi"
      },
      kilometers: {
        displayText: "Kilometers",
        acronym: "km"
      },
      feet: {
        displayText: "Feet",
        acronym: "ft"
      },
      meters: {
        displayText: "Meters",
        acronym: "m"
      }
    },
    searchSetting: {
      searchSettingTabTitle: "Search Settings", // shown as a label in config UI dialog box for search setting
      defaultBufferDistanceLabel: "Set default buffer distance value", // shown as a label in config UI dialog box for selecting default buffer distance
      maxBufferDistanceLabel: "Set maximum buffer distance value for finding features", // shown as a label in config UI dialog box for selecting maximum buffer distance value
      bufferDistanceUnitLabel: "Buffer distance units", // shown as a label(options) of select(dropdown) in config UI dialog box
      defaultBufferHintLabel: "Hint: Use to set default value for a buffer", // shown as a label in config UI dialog box to set default value for a buffer
      maxBufferHintLabel: "Hint: Use to set maximum value for a buffer", // shown as a label in config UI dialog box to set maximum value for a buffer
      bufferUnitLabel: "Hint: Define unit for creating buffer", // shown as a label in config UI dialog box to set unit of buffer
      selectGraphicLocationSymbol: "Address or location symbol", // shown as label in config UI dialog box for graphic symbol in search setting
      graphicLocationSymbolHintText: "Hint: Symbol for searched address or clicked location", // shown as hint label in config UI dialog box for selecting graphic symbol
      fontColorLabel: "Select font color for search results", //Show as label in config UI to set the font color in widget panel.
      fontColorHintText: "Hint: Font color of search results" //Show as label in config UI to set the font color in widget panel.
    },
    layerSelector: {
      selectLayerLabel: "Select search layer(s)", // shown as a label in config UI dialog box for selecting layer on map
      layerSelectionHint: "Hint: Use the set button to select layer(s)", // shown as a label in config UI dialog box to select multiple layers
      addLayerButton: "Set", //Shown as a button text to add the layer for search
      okButton: "OK", // shown as a button text for layer selector popup
      cancelButton: "Cancel" // shown as a button text for layer selector popup
    },
    routeSetting: {
      routeSettingTabTitle: "Direction Settings", // shown as a label in config UI dialog box for route setting
      routeServiceUrl: "Routing Service", // shown as a label in config UI dialog box for setting the route url
      travelModeServiceUrl: "Travel Mode Service", // shown as a label in config UI dialog box for setting the travelmode url
      buttonSet: "Set", // shown as a button text for route setting to set route url in config UI dialog box
      routeServiceUrlHintText: "Hint: Click ‘Set’ to browse and select a routing service", // shown as a hint label in config UI dialog box to select a route url
      directionLengthUnit: "Direction length units", // shown as a label(options) of select(dropdown) in config UI dialog box in routing section
      unitsForRouteHintText: "Hint: Used to display units for route", // shown as hint label in config UI dialog box to display routing unit
      selectRouteSymbol: "Select symbol to display route", // shown as label in config UI dialog box for selecting symbol for routing
      routeSymbolHintText: "Hint: Used to display line symbol of the route", //shown as hint to select route symbol
      travelModeServiceUrlHintText: "Hint: Click ‘Set’ to browse and select a Travel Mode Service", // shown as a hint label in config UI dialog box to select a travelMode service url
      invalidTravelmodeServiceUrl: "Please specify a valid Travel Mode service ", // shown as an error label in alert box when invalid travel mode service url is configured
      routingDisabledMsg: "To enable directions ensure that routing is enabled in the ArcGIS Online item." // shown as message in routeSettings tab when routing is disabled in webmap
    },
    networkServiceChooser: {
      arcgislabel: "Add from ArcGIS Online", // shown as a label in route service configuration panel to select route url from portal
      serviceURLabel: "Add Service URL", // shown as a label in route service configuration panel to add service url
      routeURL: "Route URL", // shown as a label in route service configuration panel
      validateRouteURL: "Validate", // shown as a button text in route service configuration panel to validate url
      exampleText: "Example", // shown as a label in route service configuration panel to consider example of route services
      hintRouteURL1: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/", // shown as a label hint in route service configuration panel
      hintRouteURL2: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World", // shown as a label hint in route service configuration panel
      okButton: "OK", // shown as a button text for route service configuration panel
      cancelButton: "Cancel", // shown as a button text for route service configuration panel
      nextButton: "Next", // shown as a button text for route service configuration panel
      backButton: "Back", // shown as a button text for route service configuration panel
      invalidRouteServiceURL: "Please specify a valid Route service." // Shown as an error in alert box invalid route service url is configured.
    },
    errorStrings: {
      bufferErrorString: "Please enter valid numeric value.", // shown as an error label in text box for buffer
      selectLayerErrorString: "Please select layer(s) to search.", // shown as an error label in alert box for selecting layer from map to search
      invalidDefaultValue: "Default  buffer distance cannot be blank. Please specify the buffer distance", // shown as an error label in alert box for blank or empty text box
      invalidMaximumValue: "Maximum buffer distance cannot be blank. Please specify the buffer distance", // shown as an error label in alert box for blank or empty text box
      defaultValueLessThanMax: "Please specify the default buffer distance within the maximum limit", // shown as an error label in alert box when default value is greater than maximum value of slider
      defaultBufferValueGreaterThanZero: "Please specify the default buffer distance greater than 0", // shown as an error label in alert box when we configure default value of slider is zero
      maximumBufferValueGreaterThanZero: "Please specify the maximum buffer distance greater than 0" // shown as an error label in alert box when we configure maximum value of slider is zero
    },
    symbolPickerPreviewText: "Preview:"
  }),
  "ar": 1,
  "cs": 1,
  "da": 1,
  "de": 1,
  "el": 1,
  "es": 1,
  "et": 1,
  "fi": 1,
  "fr": 1,
  "he": 1,
  "it": 1,
  "ja": 1,
  "ko": 1,
  "lt": 1,
  "lv": 1,
  "nb": 1,
  "nl": 1,
  "pl": 1,
  "pt-br": 1,
  "pt-pt": 1,
  "ro": 1,
  "ru": 1,
  "sv": 1,
  "th": 1,
  "tr": 1,
  "vi": 1,
  "zh-cn": 1,
  "zh-hk": 1,
  "zh-tw": 1
});