define(['dojo/_base/declare',
	'dojo/on',
	'dojo/_base/lang',
    'dojo/text!./UnitConverter.html',
    'dojo/dom-style',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'
], function(declare, on, lang, template, domStyle, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare([_WidgetBase,
        _TemplatedMixin, _WidgetsInTemplateMixin
    ], {
        baseClass: 'jimu-widget-unitconverter',
        templateString: template,

        toolLabel: null,
        nls: null,
        config: null,
        rowData: null,

		postMixInProperties: function() {
			this.inherited(arguments);
		},

        postCreate: function() {
			this.inherited(arguments);
			this.own(on(this.inputData, 'change', lang.hitch(this, this.convertUnits)));
			this.own(on(this.inputUnits, 'change', lang.hitch(this, this.convertUnits)));
			this.own(on(this.outputUnits, 'change', lang.hitch(this, this.convertUnits)));
			this.own(on(this.clearAll, 'click', lang.hitch(this, this.clearit)));
		},

        convertUnits: function() {

			var inputfeet = parseFloat(this.inputData.value);
			var output = 0;
			
            if (isNaN(this.inputData.value)) {
                this.outputData.value = "Not a number";
            } else {

                switch (this.inputUnits.value) {
                    case "feet":
                        inputfeet = inputfeet;
                        break;
                    case "yards":
                        inputfeet = inputfeet * 3;
                        break;
                    case "meters":
                        inputfeet = inputfeet * 3.28084;
                        break;
                    case "kilometers":
                        inputfeet = inputfeet * 3280.84;
                        break;
                    case "chains":
                        inputfeet = inputfeet * 66;
                        break;
                    case "rods":
                        inputfeet = inputfeet * 16.5;
                        break;
                    case "links":
                        inputfeet = inputfeet * 0.659449;
                        break;
                    case "miles":
                        inputfeet = inputfeet * 5280;
                        break;
                }

                switch (this.outputUnits.value) {
                    case "feet":
                        output = inputfeet;
                        break;
                    case "yards":
                        output = inputfeet / 3;
                        break;
                    case "meters":
                        output = inputfeet / 3.28084;
                        break;
                    case "kilometers":
                        output = inputfeet / 3280.84;
                        break;
                    case "chains":
                        output = inputfeet / 66;
                        break;
                    case "rods":
                        output = inputfeet / 16.5;
                        break;
                    case "links":
                        output = inputfeet / 0.659449;
                        break;
                    case "miles":
                        output = inputfeet / 5280;
                        break;
                }
                this.outputData.value = output;
            }
        },

        clearit: function() {
            this.inputData.value = " ";
            this.outputData.value = " ";
        }

    });
});