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
define(
   ({
    units: {
      miles: "Millas", // label shown in config UI dialog box(options for dropdown) and also shown as label for slider text(slider unit)
      kilometers: "Kilómetros", // label shown in config UI dialog box(options for dropdown) and also shown as label for slider text(slider unit)
      feet: "Pies", // label shown in config UI dialog box(options for dropdown)and also shown as label for slider text(slider unit)
      meters: "Metros" // label shown in config UI dialog box(options for dropdown)and also shown as label for slider text(slider unit)
    },
    layerSetting: {
      layerSettingTabTitle: "Configuración de búsqueda", // shown as a label in config UI dialog box for layer setting
      buttonSet: "Definir", // shown as a button text to set layers
      selectLayersLabel: "Seleccionar capa",  // shown as a label in config UI dialog box for selecting polygon and its related layer from map
      selectLayersHintText: "Sugerencia: se utiliza para seleccionar la capa del polígono y su capa de puntos relacionada.", // shown as a hint text in config UI dialog box for selecting polygon and its related layer from map
      selectPrecinctSymbolLabel: "Seleccionar símbolo para resaltar polígono", // shown as hint label in config UI dialog box for selecting precinct symbol
      selectGraphicLocationSymbol: "Símbolo de dirección o ubicación", // shown as label in config UI dialog box for graphic symbol in routing
      graphicLocationSymbolHintText: "Sugerencia: símbolo para la dirección buscada o para la ubicación en la que se ha hecho clic", // shown as hint label in config UI dialog box for selecting graphic symbol
      precinctSymbolHintText: "Sugerencia: se utiliza para visualizar el símbolo para el polígono seleccionado" // shown as hint label in config UI dialog box for selecting graphic symbol for precinct
    },
    layerSelector: {
      okButton: "Aceptar", // shown as a button text for layerSelector configuration panel
      cancelButton: "Cancelar", // shown as a button text for layerSelector configuration panel
      selectPolygonLayerLabel: "Seleccionar capa de polígono", // shown as a label in config UI dialog box for selecting polygon (precinct) layer on map
      selectPolygonLayerHintText: "Sugerencia: se utiliza para seleccionar la capa del polígono.", // shown as hint label in config UI dialog box for selecting polygon (precinct) layer on map
      selectRelatedPointLayerLabel: "Seleccionar capa de puntos relacionada con capa de polígono", // shown as a label in config UI dialog box for selecting polling place layer on map
      selectRelatedPointLayerHintText: "Sugerencia: se utiliza para seleccionar la capa de puntos relacionada con la capa de polígono", // shown as hint label in config UI dialog box for selecting polling place layer on map
      polygonLayerNotHavingRelatedLayer: "Selecciona una capa de polígono que tenga una capa de puntos relacionada.", //// shown as an error in alert box if selected precinct layers in not having valid related layers
      errorInSelectingPolygonLayer: "Selecciona una capa de polígono que tenga una capa de puntos relacionada.", // shown as an error label in alert box for selecting precinct layer from map
      errorInSelectingRelatedLayer: "Selecciona una capa de puntos relacionada con la capa de polígono." // shown as an error label in alert box for selecting polling place layer from map
    },
    routeSetting: {
      routeSettingTabTitle: "Configuración de dirección", // shown as a label in config UI dialog box for route setting
      routeServiceUrl: "Servicio de generación de rutas", // shown as a label in config UI dialog box for setting the route url
      travelModeServiceUrl: "Servicio de modo de viaje", // shown as a label in config UI dialog box for setting the travelmode url
      buttonSet: "Definir", // shown as a button text for route setting to set route url in config UI dialog box
      routeServiceUrlHintText: "Sugerencia: haz clic en ‘Definir’ para examinar y seleccionar un servicio de generación de rutas para el análisis de red", // shown as a hint label in config UI dialog box to select a route url
      directionLengthUnit: "Unidades de longitud de dirección", // shown as a label(options) of select(dropdown) in config UI dialog box in routing section
      unitsForRouteHintText: "Sugerencia: se utiliza para visualizar las unidades indicadas para la ruta", // shown as hint label in config UI dialog box to display routing unit
      selectRouteSymbol: "Seleccionar símbolo para visualizar ruta", // shown as label in config UI dialog box for selcting symbol for routing
      routeSymbolHintText: "Sugerencia: se utiliza para visualizar el símbolo de línea de la ruta", //shown as hint to select route symbol
      travelModeServiceUrlHintText: "Sugerencia: haz clic en ‘Definir’ para examinar y seleccionar un servicio de modo de viaje", // shown as a hint label in config UI dialog box to select a travelMode service url
      invalidTravelmodeServiceUrl: "Especifica un servicio de modo de viaje válido", // shown as an error label in alert box when invalid travel mode service url is configured
      routingDisabledMsg: "Para habilitar las indicaciones, asegúrate de que la generación de rutas está habilitada en el elemento de ArcGIS Online." // shown as message in routeSettings tab when routing is disabled in webmap
    },
    networkServiceChooser: {
      arcgislabel: "Agregar desde ArcGIS Online", // shown as a label in route service configuration panel to select route url from portal
      serviceURLabel: "Agregar URL de servicio", // shown as a label in route service configuration panel to add service url
      routeURL: "URL de ruta", // shown as a label in route service configuration panel
      validateRouteURL: "Validar", // shown as a button text in route service configuration panel to validate url
      exampleText: "Ejemplo", // shown as a label in route service configuration panel to consider example of route services
      hintRouteURL1: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/", // shown as a label hint in route service configuration panel
      hintRouteURL2: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World", // shown as a label hint in route service configuration panel
      okButton: "Aceptar", // shown as a button text for route service configuration panel
      cancelButton: "Cancelar", // shown as a button text for route service configuration panel
      nextButton: "Siguiente", // shown as a button text for route service configuration panel
      backButton: "Atrás", // shown as a button text for route service configuration panel
      invalidRouteServiceURL: "Especifica un servicio de rutas válido." // Shown as an error in alert box invalid route service url is configured.
    },
    symbolPickerPreviewText: "Vista previa:"
  })
);