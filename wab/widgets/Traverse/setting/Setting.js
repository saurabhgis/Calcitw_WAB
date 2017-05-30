///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'jimu/BaseWidgetSetting',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/_base/Color',
  'jimu/dijit/SymbolPicker',
  'jimu/dijit/ColorPicker'
],
function(declare, BaseWidgetSetting, _WidgetsInTemplateMixin, Color) {

  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-traverse-setting',
	
	// default starting color values
	_traverseColor: '#ff0000',
	_highlightColor: '#00ffff',

    postCreate: function(){
      //the config object is passed in
      this.setConfig(this.config);
    },

    setConfig: function(config){
		this.txtClosureTolerance.value = config.txtClosureTolerance;
		this.txtSPwkid.value = config.txtSPwkid;
		this.txtGeometryServiceURL.value = config.txtGeometryServiceURL;
		this.colorTraverse.setColor(new Color(config.colorTraverse));
		this.colorHighlight.setColor(new Color(config.colorHighlight));
		if (config.settingDDorDMS === "DD") {
			this.settingDD.checked = true;
			this.settingDMS.checked = false;
		} else {
			this.settingDMS.checked = true;
			this.settingDD.checked = false;
		}
		if (config.settingQuadorAz === "Quad") {
			this.settingQuad.checked = true;
			this.settingAz.checked = false;
		} else {
			this.settingAz.checked = true;
			this.settingQuad.checked = false;
		}
		this.setDistanceUnits.selectedIndex = config.setDistanceUnits;
		this.setAreaUnits.selectedIndex = config.setAreaUnits;
   },

    getConfig: function(){
      	//WAB will get config object through this method
		var tColor = this.colorTraverse.getColor();
		var hColor = this.colorHighlight.getColor();
		var DD_DMS, Quad_Az;
 		if (this.settingDD.checked) {
			DD_DMS = "DD";
		} else {
			DD_DMS = "DMS";
		}
		if (this.settingQuad.checked) {
			Quad_Az = "Quad";
		} else {
			Quad_Az = "Az";
		}
     	return {
			txtClosureTolerance: this.txtClosureTolerance.value,
			txtSPwkid: this.txtSPwkid.value,			
			txtGeometryServiceURL: this.txtGeometryServiceURL.value,			
			colorTraverse: tColor.toHex(),
			colorHighlight: hColor.toHex(),
			settingDDorDMS: DD_DMS,			
			settingQuadorAz: Quad_Az,
			setDistanceUnits: this.setDistanceUnits.selectedIndex,
			setAreaUnits: this.setAreaUnits.selectedIndex
      };
    }
  });
});