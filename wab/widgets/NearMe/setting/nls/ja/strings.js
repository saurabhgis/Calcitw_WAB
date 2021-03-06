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
    units: { // label shown in config UI dialog box(options for dropdown) and also shown as label for slider text(slider unit) and acronym in feature list
      miles: {
        displayText: "マイル",
        acronym: "mi"
      },
      kilometers: {
        displayText: "キロメートル",
        acronym: "km"
      },
      feet: {
        displayText: "フィート",
        acronym: "ft"
      },
      meters: {
        displayText: "メートル",
        acronym: "m"
      }
    },
    searchSetting: {
      searchSettingTabTitle: "検索設定", // shown as a label in config UI dialog box for search setting
      defaultBufferDistanceLabel: "バッファー距離のデフォルト値の設定", // shown as a label in config UI dialog box for selecting default buffer distance
      maxBufferDistanceLabel: "フィーチャを検索するためのバッファー距離の最大値の設定", // shown as a label in config UI dialog box for selecting maximum buffer distance value
      bufferDistanceUnitLabel: "バッファーの距離単位", // shown as a label(options) of select(dropdown) in config UI dialog box
      defaultBufferHintLabel: "ヒント: バッファーのデフォルト値の設定に使用します", // shown as a label in config UI dialog box to set default value for a buffer
      maxBufferHintLabel: "ヒント: バッファーの最大値の設定に使用します", // shown as a label in config UI dialog box to set maximum value for a buffer
      bufferUnitLabel: "ヒント: バッファーを作成するための単位を定義します", // shown as a label in config UI dialog box to set unit of buffer
      selectGraphicLocationSymbol: "住所または位置のシンボル", // shown as label in config UI dialog box for graphic symbol in search setting
      graphicLocationSymbolHintText: "ヒント: 検索した住所またはクリックした位置のシンボル", // shown as hint label in config UI dialog box for selecting graphic symbol
      fontColorLabel: "検索結果のフォントの色の選択", //Show as label in config UI to set the font color in widget panel.
      fontColorHintText: "ヒント: 検索結果のフォントの色" //Show as label in config UI to set the font color in widget panel.
    },
    layerSelector: {
      selectLayerLabel: "検索レイヤーの選択", // shown as a label in config UI dialog box for selecting layer on map
      layerSelectionHint: "ヒント: 設定ボタンを使用してレイヤーを選択します", // shown as a label in config UI dialog box to select multiple layers
      addLayerButton: "設定", //Shown as a button text to add the layer for search
      okButton: "OK", // shown as a button text for layer selector popup
      cancelButton: "キャンセル" // shown as a button text for layer selector popup
    },
    routeSetting: {
      routeSettingTabTitle: "ルート案内設定", // shown as a label in config UI dialog box for route setting
      routeServiceUrl: "ルート サービス", // shown as a label in config UI dialog box for setting the route url
      travelModeServiceUrl: "移動モード サービス", // shown as a label in config UI dialog box for setting the travelmode url
      buttonSet: "設定", // shown as a button text for route setting to set route url in config UI dialog box
      routeServiceUrlHintText: "ヒント: [設定] をクリックし、ルート サービスを参照して選択します", // shown as a hint label in config UI dialog box to select a route url
      directionLengthUnit: "ルート案内の長さの単位", // shown as a label(options) of select(dropdown) in config UI dialog box in routing section
      unitsForRouteHintText: "ヒント: ルートの単位の表示に使用されます", // shown as hint label in config UI dialog box to display routing unit
      selectRouteSymbol: "ルートを表示するシンボルの選択", // shown as label in config UI dialog box for selecting symbol for routing
      routeSymbolHintText: "ヒント: ルートのライン シンボルの表示に使用されます", //shown as hint to select route symbol
      travelModeServiceUrlHintText: "ヒント: [設定] をクリックし、移動モード サービスを参照して選択します", // shown as a hint label in config UI dialog box to select a travelMode service url
      invalidTravelmodeServiceUrl: "有効な移動モード サービスを指定してください ", // shown as an error label in alert box when invalid travel mode service url is configured
      routingDisabledMsg: "ルート案内を有効にするには、必ず ArcGIS Online アイテムでルート検索を有効にします。" // shown as message in routeSettings tab when routing is disabled in webmap
    },
    networkServiceChooser: {
      arcgislabel: "ArcGIS Online から追加", // shown as a label in route service configuration panel to select route url from portal
      serviceURLabel: "サービス URL の追加", // shown as a label in route service configuration panel to add service url
      routeURL: "ルート URL", // shown as a label in route service configuration panel
      validateRouteURL: "整合チェック", // shown as a button text in route service configuration panel to validate url
      exampleText: "例", // shown as a label in route service configuration panel to consider example of route services
      hintRouteURL1: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/", // shown as a label hint in route service configuration panel
      hintRouteURL2: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World", // shown as a label hint in route service configuration panel
      okButton: "OK", // shown as a button text for route service configuration panel
      cancelButton: "キャンセル", // shown as a button text for route service configuration panel
      nextButton: "次へ", // shown as a button text for route service configuration panel
      backButton: "戻る", // shown as a button text for route service configuration panel
      invalidRouteServiceURL: "有効なルート サービスを指定してください。" // Shown as an error in alert box invalid route service url is configured.
    },
    errorStrings: {
      bufferErrorString: "有効な数値を入力してください。", // shown as an error label in text box for buffer
      selectLayerErrorString: "検索するレイヤーを選択してください。", // shown as an error label in alert box for selecting layer from map to search
      invalidDefaultValue: "デフォルトのバッファー距離を空にすることはできません。バッファー距離を指定してください。", // shown as an error label in alert box for blank or empty text box
      invalidMaximumValue: "最大バッファー距離を空にすることはできません。バッファー距離を指定してください。", // shown as an error label in alert box for blank or empty text box
      defaultValueLessThanMax: "最大制限内のデフォルトのバッファー距離を指定してください", // shown as an error label in alert box when default value is greater than maximum value of slider
      defaultBufferValueGreaterThanZero: "0 より大きいデフォルトのバッファー距離を指定してください", // shown as an error label in alert box when we configure default value of slider is zero
      maximumBufferValueGreaterThanZero: "0 より大きい最大バッファー距離を指定してください" // shown as an error label in alert box when we configure maximum value of slider is zero
    },
    symbolPickerPreviewText: "プレビュー:"
  })
);