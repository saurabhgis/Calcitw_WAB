///////////////////////////////////////////////////////////////////////////
//
//  Traverse Widget - for creating simple traverse drawings WAB
//
//  09/30/2016 - Initial coding of the Traverse widget 2.2.0
//  12/02/2016 - Fixed problem that was preventing widget use in projections other than Web Mercator
//  12/06/2016 - Added warning to user when changing distance unit type or angle type when the traverse has courses
//               Popups were disabled to prevent display when drawing courses
//               Default values were added to the settings for DD or DMS, Quadrant or Azimuth, Distance Units and Area Units
//               Logic was added to allow the user to key in a file name when saving a traverse, GeoJSON or a report
//
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 'dijit/_WidgetsInTemplateMixin', 'jimu/BaseWidget',
        'dojo/on',
        'dojo/_base/lang',
        "dgrid/Grid",
        "dgrid/Keyboard",
        "dgrid/Selection",
        "dgrid/editor",
        "dojo/_base/array",
		"dijit/Dialog",
		"dijit/form/Form",
		"dijit/form/TextBox",
		"dijit/form/Button",
		"dojo/dom-style",

        "esri/Color",
        "esri/layers/GraphicsLayer",
        "esri/graphic",
        "esri/SpatialReference",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/CartographicLineSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/toolbars/edit",
        "esri/geometry/geometryEngine",
        "esri/geometry/scaleUtils",
        "esri/geometry/webMercatorUtils",
        "esri/tasks/GeometryService",
        "esri/tasks/ProjectParameters",
		"./UnitConverter",
		"./FileSaver",
		'jimu/exportUtils',
		'jimu/dijit/Popup',
        'jimu/dijit/ColorPicker'
    ],
    function(declare, _WidgetsInTemplateMixin, BaseWidget,
        on,
        lang,
        Grid, Keyboard, Selection, editor,
        arrayUtils,
		Dialog,
		Form,
		TextBox,
		Button,
		domStyle,

        Color,
        GraphicsLayer,
        Graphic,
        SpatialReference,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        CartographicLineSymbol,
        PictureMarkerSymbol,
        TextSymbol,
        Font,
        Point,
        Polyline,
        Polygon,
        Edit,
        geometryEngine,
        scaleUtils,
        webMercatorUtils,
        GeometryService,
        ProjectParameters,
		UnitConverter,
		FileSaver,
		exportUtils,
		Popup

    ) {
        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget, _WidgetsInTemplateMixin], {
            name: 'Traverse',
            baseClass: 'jimu-widget-traverse',
            grid: null,
            gridSelectHandler: null,
            gridDeselectHandler: null,
            gridChangeHandler: null,
            courseArray: [],
            previousCourseObject: null,
            totalDistance: 0,
            traverseArea: 0,
            traverseLine: null,
			traverseGraphic: null,
            useGeodesic: true,
            reader: null,
            startingPoint: null,
            startingPointProjected: null,
            endingPoint: null,
            endingPointProjected: null,
            firstCoursePoint: null,
            editToolbar: null,
            mapClickHandler: null,
            traverseLayer: null,
            angleLayer: null,
            highlightCourseLayer: null,
            highSymbol: null,
            geometryService: null,
            mathPointArray: [],
            drawDistance: 0,
            drawBearing: null,
            clickHandler: null,
            doubleClickHandler: null,
            drawHandler: null,
            contextMenuHandler: null,
			traverseInputFileHandler: null,
			traverseOutputFileHandler: null,
			traverseJSONFileHandler: null,
			traverseClearHandler: null,
			traverseReportHandler: null,
			ucPopup: null,

            postMixInProperties: function() {
                this.inherited(arguments);
            },

            postCreate: function() {
                this.inherited(arguments);

                this.geometryService = new GeometryService(this.config.txtGeometryServiceURL);

                this.highSymbol = new SimpleLineSymbol();
                this.highSymbol.setWidth(7);
                this.highSymbol.setStyle(SimpleLineSymbol.STYLE_SOLID);
                var hc = new Color(this.config.colorHighlight).toRgba();
                hc[3] = 0.3;
                this.highSymbol.setColor(new Color(hc));

                this.colorPicker.setColor(new Color(this.config.colorTraverse));
				if (this.config.settingDDorDMS === "DD") {
					this.rdoDD.checked = true;
					this.rdoDMS.checked = false;
				} else {
					this.rdoDMS.checked = true;
					this.rdoDD.checked = false;
				}
				if (this.config.settingQuadorAz === "Quad") {
					this.rdoQuad.checked = true;
					this.rdoAz.checked = false;
				} else {
					this.rdoAz.checked = true;
					this.rdoQuad.checked = false;
				}
				this.distanceUnits.selectedIndex = this.config.setDistanceUnits;
				this.areaUnits.selectedIndex = this.config.setAreaUnits;

                // Use custom grid to manage traverse course information
                var CustomGrid = declare([Grid, Keyboard, Selection, editor]);
                this.grid = new CustomGrid({
                    columns: {
                        course: {
                            label: '#',
                            field: 'course',
                            sortable: false
                        },
                        quadrant: editor({
                            label: 'Quad',
                            field: 'quadrant',
                            sortable: false,
                            editable: true
                        }, "text"),
                        degree: editor({
                            label: 'Deg',
                            field: 'degree',
                            sortable: false,
                            editable: true
                        }, "text"),
                        minute: editor({
                            label: 'Min',
                            field: 'minute',
                            sortable: false,
                            editable: true
                        }, "text"),
                        second: editor({
                            label: 'Sec',
                            field: 'second',
                            sortable: false,
                            editable: true
                        }, "text"),
                        distance: editor({
                            label: 'Dist',
                            field: 'distance',
                            sortable: false,
                            editable: true
                        }, "text")
                    },
                    selectionMode: "single",
                    cellNavigation: true
                }, this.courseList);
                this.setGridEvents();

                // add drag and drop for traverse text files
                var dropZone = this.grid;
                on(dropZone, "dragover", lang.hitch(this, function(e) {
                    e.preventDefault();
                }));
                on(dropZone, "dragenter", lang.hitch(this, function(e) {
                    e.preventDefault();
                }));
                on(dropZone, "drop", lang.hitch(this, this.dropZoneDrop));

                // set initial display
                this.btnDrawCourse.disabled = true;
                this.btnInsertCourse.disabled = true;
                this.btnDuplicateCourse.disabled = true;
                this.btnDeleteCourse.disabled = true;
                this.btnCloseCourse.disabled = true;
                this.btnSetAngle.disabled = true;

                // add coordinate change events
                this.own(on(this.txtXcoord, 'change', lang.hitch(this, this.enteredStartingPoint)));
                this.own(on(this.txtYcoord, 'change', lang.hitch(this, this.enteredStartingPoint)));

                // add click event to each button
                this.own(on(this.btnStartPoint, 'click', lang.hitch(this, this.addStartingPoint)));
                this.own(on(this.btnAddCourse, 'click', lang.hitch(this, this.addCourse)));
                this.own(on(this.btnDrawCourse, 'click', lang.hitch(this, this.drawCourse)));
                this.own(on(this.btnInsertCourse, 'click', lang.hitch(this, this.insertCourse)));
                this.own(on(this.btnDuplicateCourse, 'click', lang.hitch(this, this.duplicateCourse)));
                this.own(on(this.btnDeleteCourse, 'click', lang.hitch(this, this.deleteCourse)));
                this.own(on(this.btnCloseCourse, 'click', lang.hitch(this, this.addClosureCourse)));
                this.own(on(this.btnSetAngle, 'click', lang.hitch(this, this.startSetRotationAngle)));

                this.own(on(this.traverseZoom, 'click', lang.hitch(this, this.zoomTraverse)));
                this.own(on(this.traverseInputFile, 'change', lang.hitch(this, this.readTraverse)));
                this.traverseOutputFileHandler = this.own(on(this.traverseOutputFile, 'click', lang.hitch(this, this.saveTraverse)));
                this.traverseJSONFileHandler = this.own(on(this.traverseJSONFile, 'click', lang.hitch(this, this.saveGeoJSONTraverse)));
                this.traverseClearHandler = this.own(on(this.traverseClear, 'click', lang.hitch(this, this.clearTraverse)));
                this.traverseReportHandler = this.own(on(this.traverseReport, 'click', lang.hitch(this, this.reportTraverse)));

                // add other events
                this.own(on(this.txtRotationAngle, 'change', lang.hitch(this, this.drawTraverse)));
                this.own(on(this.txtRotationAngle, 'focus', lang.hitch(this, this.addCourse)));
                this.own(on(this.distanceUnits, 'change', lang.hitch(this, this.notifyUser)));
				this.own(on(this.rdoDD, 'change', lang.hitch(this, this.notifyUser)));
				this.own(on(this.rdoDMS, 'change', lang.hitch(this, this.notifyUser)));
				this.own(on(this.rdoQuad, 'change', lang.hitch(this, this.notifyUser)));
				this.own(on(this.rdoAz, 'change', lang.hitch(this, this.notifyUser)));
                this.own(on(this.btnHelp, 'click', lang.hitch(this, function() {
                    var win = window.open("widgets/Traverse/help/TraverseHelp.pdf", "_blank");
                    win.focus();
                })));

                // add logic to use the + button to tab through data entry.
                document.addEventListener('keydown', function(evt) {
                    var keyName = evt.key;
                    if (keyName === "+" || keyName === "Add" || keyName === "Enter" || keyName === "Tab") {
                        // if + key or enter key are used move to the next input cell
                        evt.preventDefault();
                        var inputs = document.getElementsByTagName("input");
                        var nextInput = inputs[arrayUtils.indexOf(inputs, document.activeElement) + 1];
                        if (nextInput) {
                            nextInput.focus();
                        }
                    }
                }, false);

                // is basemap using a geodesic or planar projection?
                var wkid = this.map.spatialReference.wkid;
                if (wkid === 102100 || wkid === 3857 || wkid === 102113 || wkid === 4326) {
                    this.useGeodesic = true;
                } else {
                    this.useGeodesic = false;
                }

                this.traverseLayer = new GraphicsLayer();
                this.map.addLayer(this.traverseLayer);

                var line = new SimpleLineSymbol();
                line.setWidth(3.25);
                line.setStyle(SimpleLineSymbol.STYLE_SOLID);
                line.setColor(new Color([0, 0, 255, 1]));
                var marker = new SimpleMarkerSymbol();
                marker.setSize(10);
                marker.setColor(new Color([0, 0, 255, 1]));

                this.editToolbar = new Edit(this.map, {
                    allowAddVertices: false,
                    allowDeleteVertices: false,
                    ghostLineSymbol: line,
                    vertexSymbol: marker
                });
                this.own(on(this.colorPicker, "change", lang.hitch(this, this.drawTraverse)));
                this.own(on(this.areaUnits, "change", lang.hitch(this, this.drawTraverse)));

                this.highlightCourseLayer = new GraphicsLayer();
                this.map.addLayer(this.highlightCourseLayer);

                // add the first course
                this.addCourse();

            },
			
			notifyUser: function(e) {
				if (this.courseArray.length > 0 && this.courseArray[0].distance !== "") {
					var id = e.target.id;
					var message;
					if (id === "distanceUnits"){
						message = "Changing units while a traverse has courses may cause problems as only one unit may used for all traverse courses.";
					} else {
						message = "Changing angle types while a traverse has courses may cause unexpected results.";
					}
					var notifyDialog = new Dialog({
						title: "Traverse Warning!",
						content: message,
						style: "width: 250px"
					});
					notifyDialog.show();
					setTimeout(function() {notifyDialog.hide();}, 6000);
					this.drawTraverse();
				}	
			},

            setGridEvents: function() {
                this.gridSelectHandler = this.grid.on('dgrid-select', lang.hitch(this, function(e) {
                    this.btnInsertCourse.disabled = false;
                    this.btnDuplicateCourse.disabled = false;
                    this.btnDeleteCourse.disabled = false;
                    this.highlightSelectedCourse(e);
                }));
                this.gridDeselectHandler = this.grid.on('dgrid-deselect', lang.hitch(this, function() {
                    this.btnInsertCourse.disabled = true;
                    this.btnDuplicateCourse.disabled = true;
                    this.btnDeleteCourse.disabled = true;
                    this.highlightCourseLayer.clear();
                }));
                this.gridChangeHandler = this.grid.on('dgrid-datachange', lang.hitch(this, this.validateCourseEntry));
            },

            removeGridEvents: function() {
                this.grid.clearSelection();
                this.gridSelectHandler.remove();
                this.gridDeselectHandler.remove();
                this.gridChangeHandler.remove();
            },

            enteredStartingPoint: function() {
                if (this.txtXcoord.value !== "" && this.txtYcoord.value !== "") {
                    this.startingPointProjected = new Point(this.txtXcoord.value, this.txtYcoord.value, new SpatialReference(Number(this.config.txtSPwkid)));

                    // project the point to the configuration wkid
                    var params = new ProjectParameters();
                    params.geometries = [this.startingPointProjected];
                    params.outSR = this.map.spatialReference;
                    params.transformation = this.map.spatialReference.wkid;
                    this.geometryService.project(params, lang.hitch(this, this.loadProjectedResults));
                }
            },

            addStartingPoint: function() {
				if (this.mapClickHandler) {
					this.mapClickHandler.remove();
				}
                this.mapClickHandler = this.map.on("click", lang.hitch(this, this.setTraverseStartingPoint));
            },

            setTraverseStartingPoint: function(e) {
                this.mapClickHandler.remove();
                this.txtXcoord.value = e.mapPoint.x.toFixed(2);
                this.txtYcoord.value = e.mapPoint.y.toFixed(2);
                this.startingPoint = e.mapPoint;

                // project the point to the configuration wkid
                var params = new ProjectParameters();
                var wkid = Number(this.config.txtSPwkid);
                var outSR = new SpatialReference(wkid);
                params.geometries = [e.mapPoint];
                params.outSR = outSR;
                this.geometryService.project(params, lang.hitch(this, this.showProjectedPoint));

                this.drawTraverse();
            },

            showProjectedPoint: function(e) {
                this.txtXcoord.value = e[0].x.toFixed(2);
                this.txtYcoord.value = e[0].y.toFixed(2);
                this.startingPointProjected = new Point(e[0].x, e[0].y, new SpatialReference(Number(this.config.txtSPwkid)));
            },

            addCourse: function() {
                // check to see if we have a blank course otherwise add one
                var hasBlankCourse = false;
                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.quadrant === "" && course.degree === "" && course.minute === "" && course.second === "" && course.distance === "") {
                        hasBlankCourse = true;
                    }
                }));
                if (!hasBlankCourse) {
                    var courseObject = {
                        course: this.courseArray.length + 1,
                        quadrant: "",
                        degree: "",
                        minute: "",
                        second: "",
                        distance: ""
                    };
                    this.courseArray.push(courseObject);
                    this.refreshGrid();
                    window.setTimeout(lang.hitch(this, function() {
                        this.grid.select(this.courseArray.length - 1);
                        var inputs = document.getElementsByTagName("input");
                        var nextInput = inputs[arrayUtils.indexOf(inputs, document.activeElement) - 5];
                        if (nextInput) {
                            nextInput.focus();
                        }

                    }, 10));
                }
            },

            removeBlankCourse: function() {
                // check to see if we have a blank course otherwise add one
                var blankCourse = -1;
                for (var i = 0; i < this.courseArray.length; i++) {
                    var course = this.courseArray[i];
                    if (course.quadrant === "" && course.degree === "" && course.minute === "" && course.second === "" && course.distance === "") {
                        blankCourse = i;
                    }
                }
                if (blankCourse >= 0) {
                    this.courseArray.splice(blankCourse, 1);
                    this.renumberCourses();
                    this.drawTraverse();
                }
            },

            insertCourse: function() {
                var courseObject = {
                    course: this.courseArray.length + 1,
                    quadrant: "",
                    degree: "",
                    minute: "",
                    second: "",
                    distance: ""
                };
                var rowSelected = this.grid._lastSelected.rowIndex;
                this.courseArray.splice(rowSelected, 0, courseObject);
                this.renumberCourses();
            },

            duplicateCourse: function() {
                var rowSelected = this.grid._lastSelected.rowIndex;
                var course = this.courseArray[rowSelected];
                var courseObject = {
                    course: this.courseArray.length + 1,
                    quadrant: course.quadrant,
                    degree: course.degree,
                    minute: course.minute,
                    second: course.second,
                    distance: course.distance
                };
                this.courseArray.splice(rowSelected, 0, courseObject);
                this.renumberCourses();
                this.drawTraverse();
            },

            deleteCourse: function() {
                var rowSelected = this.grid._lastSelected.rowIndex;
                this.courseArray.splice(rowSelected, 1);
                this.renumberCourses();
                this.drawTraverse();
            },

            renumberCourses: function() {
                for (var i = 0; i < this.courseArray.length; i++) {
                    var c = this.courseArray[i];
                    c.course = i + 1;
                }
                this.refreshGrid();
            },

            highlightSelectedCourse: function() {
                this.highlightCourseLayer.clear();
                var rowSelected = parseInt(this.objToString(this.grid.selection).split("::")[0]);
                if (this.traverseLine) {
                    var path = this.traverseLine.paths[0];
                    if (path.length > 1 && rowSelected < path.length - 1) {
                        var pt1 = new Point(path[rowSelected][0], path[rowSelected][1], this.map.spatialReference);
                        var pt2 = new Point(path[rowSelected + 1][0], path[rowSelected + 1][1], this.map.spatialReference);
                        var pl = new Polyline(this.map.spatialReference);
                        pl.addPath([pt1, pt2]);
                        var highlightGraphic = new Graphic(pl, this.highSymbol);
                        this.highlightCourseLayer.add(highlightGraphic);
                    }
                }
            },

            objToString: function(obj) {
                var str = '';
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str += p + '::' + obj[p] + '\n';
                    }
                }
                return str;
            },

            refreshGrid: function() {
                this.grid.refresh();
                this.grid.renderArray(this.courseArray);
                this.btnAddCourse.disabled = false;
                this.btnInsertCourse.disabled = true;
                this.btnDuplicateCourse.disabled = true;
                this.btnDeleteCourse.disabled = true;
            },

            dropZoneDrop: function(evt) {
                evt.preventDefault();
                var output = ""; //placeholder for text output
                this.reader = new FileReader();
                this.reader.onload = lang.hitch(this, function(e) {
                    output = e.target.result;
                    this.parseTraverseFile(output);
                }); //end onload()
                this.reader.readAsText(evt.dataTransfer.files[0]);
            },

            zoomTraverse: function() {
                if (this.traverseLine) {
                    this.map.setExtent(this.traverseLine.getExtent().expand(3), true);
                }
            },

            clearTraverse: function() {
				this.txtClosure.innerHTML = "";
                this.txtXcoord.value = "";
                this.txtYcoord.value = "";
                this.txtRotationAngle.value = "0";
                this.startingPoint = null;
                this.firstCoursePoint = null;
                this.endingPoint = null;
                this.courseArray = [];
                this.refreshGrid();
                this.traverseLayer.clear();
                this.btnDrawCourse.disabled = true;
                if (this.highlightLayer) {
                    this.hightlightLayer.clear();
                }
				if (this.mapClickHandler) {
					this.mapClickHandler.remove();
				}
                this.traverseInputFile.value = "";
            },

            readTraverse: function(evt) {
                evt.preventDefault();
                var output = ""; //placeholder for text output
                this.reader = new FileReader();
                this.reader.onload = lang.hitch(this, function(e) {
                    output = e.target.result;
                    this.parseTraverseFile(output);
                });
                this.reader.readAsText(evt.target.files[0]);
            },

            parseTraverseFile: function(data) {
                this.clearTraverse();
                var traverseArray = data.split("\n");

                // set the radio buttons based on the types that are found
                if (traverseArray[0].indexOf("QB") > 0) {
                    this.rdoQuad.checked = true;
                } else {
                    this.rdoAz.checked = true;
                }
                if (traverseArray[1].indexOf("DMS") > 0) {
                    this.rdoDMS.checked = true;
                } else {
                    this.rdoDD.checked = true;
                }

                // set the starting point
                var startArray = traverseArray[2].split(" ");
                this.startingPointProjected = new Point(parseFloat(startArray[1]), parseFloat(startArray[2]), new SpatialReference(Number(this.config.txtSPwkid)));

                // loop through the entire 
                var carr, dms, courseObject, quad;
                for (var i = 4; i < traverseArray.length; i++) {
                    var course = traverseArray[i];
                    if (course !== "") {
                        carr = course.split(" ");
                        var len = 0;
                        if (carr[1].indexOf("-") > 0) {
                            dms = carr[1].split("-");
                            len = dms[2].length;
                            quad = dms[0].substring(0, 1) + dms[2].substring(len - 1, len);
                        } else {
                            dms = carr[1];
                            len = dms.length;
                            quad = dms.substring(0, 1) + dms.substring(len - 1, len);
                        }
                        if (course.substring(0, 3) === "DMS") {
                            courseObject = {
                                course: this.courseArray.length + 1,
                                quadrant: quad,
                                degree: dms[0].substring(1),
                                minute: dms[1],
                                second: dms[2].substring(0, len - 1),
                                distance: carr[2]
                            };
                            this.courseArray.push(courseObject);
                        }

                        if (course.substring(0, 2) === "DD") {
							if (course.indexOf("-") > 0) {
								courseObject = {
									course: this.courseArray.length + 1,
									quadrant: quad,
									degree: dms[0].substring(1),
									minute: dms[1],
									second: dms[2].substring(0, len - 1),
									distance: carr[2]
								};
							} else {
								courseObject = {
									course: this.courseArray.length + 1,
									quadrant: quad,
									degree: dms.substring(1, len - 1),
									minute: "0",
									second: "0",
									distance: carr[2]
								};
							}
                            this.courseArray.push(courseObject);
                        }

                        if (course.substring(0, 2) === "AD") {
                            courseObject = {
                                course: this.courseArray.length + 1,
                                quadrant: "",
                                degree: dms[0],
                                minute: dms[1],
                                second: dms[2],
                                distance: carr[2]
                            };
                            this.courseArray.push(courseObject);
                        }
                    }
                }

                // display the coordinates in the dialog
                this.txtXcoord.value = this.startingPointProjected.x;
                this.txtYcoord.value = this.startingPointProjected.y;

                // project the point to the configuration wkid
                var params = new ProjectParameters();
                params.geometries = [this.startingPointProjected];
                params.outSR = this.map.spatialReference;
                this.geometryService.project(params, lang.hitch(this, this.loadProjectedResults));

                this.refreshGrid();
            },

            loadProjectedResults: function(e) {
                this.startingPoint = new Point(e[0].x, e[0].y, e[0].spatialReference);
                this.drawTraverse();
                this.zoomTraverse();
            },

            saveTraverse: function() {
                // Save traverse into ESRI standard format for reading and loading into parcel fabric too
                var textToWrite = "";
                if (this.rdoAz.checked) {
                    textToWrite = "DT NA\n";
                } else {
                    textToWrite = "DT QB\n";
                }

                if (this.rdoDD.checked) {
                    textToWrite += "DU DD\n";
                } else {
                    textToWrite += "DU DMS\n";
                }

                textToWrite += "SP " + this.startingPointProjected.x.toFixed(2) + " " + this.startingPointProjected.y.toFixed(2) + "\n";
                textToWrite += "EP " + this.endingPointProjected.x.toFixed(2) + " " + this.endingPointProjected.y.toFixed(2) + "\n";
                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "" && course.distance !== 0) {
                        var quad = course.quadrant;
                        var deg = (course.degree);
                        var min = (course.minute);
                        var sec = (course.second);
                        var dist = (course.distance);

                        if (min === "") {
                            min = 0;
                        }
                        if (sec === "") {
                            sec = 0;
                        }

                        // Replaced DD with AD for angle distance with check  - Change 5a - Dean
                        if (this.rdoAz.checked) {
                            textToWrite += "AD " + deg + "-" + min + "-" + sec + " " + dist + "\n";
                        } else {
                            var bearingStart = "";
                            var bearingEnd = "";
                            switch (quad.toUpperCase()) {
                                case "N":
                                    deg = "0";
                                    bearingStart = "N";
                                    bearingEnd = "E";
                                    break;
                                case "S":
                                    deg = "0";
                                    bearingStart = "S";
                                    bearingEnd = "E";
                                    break;
                                case "E":
                                    deg = "90";
                                    bearingStart = "S";
                                    bearingEnd = "E";
                                    break;
                                case "W":
                                    deg = "90";
                                    bearingStart = "N";
                                    bearingEnd = "W";
                                    break;
                                case "NE":
                                case "1":
                                    bearingStart = "N";
                                    bearingEnd = "E";
                                    break;
                                case "SE":
                                case "2":
                                    bearingStart = "S";
                                    bearingEnd = "E";
                                    break;
                                case "SW":
                                case "3":
                                    bearingStart = "S";
                                    bearingEnd = "W";
                                    break;
                                case "NW":
                                case "4":
                                    bearingStart = "N";
                                    bearingEnd = "W";
                                    break;
                            }
                            if (this.rdoDD.checked) {
                                textToWrite += "DD " + bearingStart + deg + bearingEnd + " " + dist + "\n";
                            } else {
                                textToWrite += "DD " + bearingStart + deg + "-" + min + "-" + sec + bearingEnd + " " + dist + "\n";
                            }
                        }
                    }
                }));
                textToWrite = textToWrite.replace(/\n/g, "\r\n");
                var textFileAsBlob = new Blob([textToWrite], {
                    type: 'text/plain'
                });
				var fileNameToSaveAs = "traverse_" + this.getTimeStamp() + ".txt";
				var form = new Form();
				var fileTextBox = new TextBox({
						name: "saveFilename",
						id: "saveFilename",
						style: "width: 87%",
						value: fileNameToSaveAs,
						placeHolder: "Enter your filename..."
					}).placeAt(form.containerNode);
				var saveButton = new Button({
						label: "Save",
						onClick: function() {
							var fn = fileTextBox.value;
							if (fn.indexOf(".txt") === -1) {
								fn = fn + ".txt";
							}
							if (!fn.match(/^[0-9a-zA-Z_\.]*$/)) {
								alert("Invalid filename entry...");
							} else {
								saveAs(textFileAsBlob, fn);
								saveDialog.hide();
							}
						}
					}).placeAt(form.containerNode);
				var saveDialog = new Dialog({
					title: "Save Traverse File",
					content: form,
					onHide: function() {
						this.destroyRecursive();
					},
					style: "width: 400px"
				});
				form.startup();
				saveDialog.show();
            },

            getTimeStamp: function() {
                var now = new Date();
                var mm = now.getMonth() + 1;
                mm = mm < 10 ? "0" + mm : mm.toString();
                var dd = now.getDate();
                dd = dd < 10 ? "0" + dd : dd.toString();
                var yyyy = now.getFullYear();
                var dateTimeStamp = mm + dd + yyyy + "_" +
                    now.getHours() +
                    ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) :
                        (now.getMinutes())) +
                    ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) :
                        (now.getSeconds()));
                return dateTimeStamp;
            },

            saveGeoJSONTraverse: function() {
				var fileNameToSaveAs = "traverse_" + this.getTimeStamp() + ".geojson";
				var content = {
					"features" : [],
					"displayFieldName" : "",
					"fieldAliases" : {},
					"spatialReference" : this.map.spatialReference.toJson(),
					"fields" : []
				};
				this.traverseGraphic.setAttributes({"name":"Traverse", "length": this.totalDistance, "area": this.traverseArea});
				content.features.push(this.traverseGraphic.toJson());
                var json = JSON.stringify(content);
                var textFileAsBlob = new Blob([json], {
                    type: 'text/plain;charset=utf-8'
                });
				var form = new Form();
				var fileTextBox = new TextBox({
						name: "saveFilename",
						id: "saveFilename",
						style: "width: 87%",
						value: fileNameToSaveAs,
						placeHolder: "Enter your filename..."
					}).placeAt(form.containerNode);
				var saveButton = new Button({
						label: "Save",
						onClick: function() {
							var fn = fileTextBox.value;
							if (fn.indexOf(".geojson") === -1) {
								fn = fn + ".geojson";
							}
							if (!fn.match(/^[0-9a-zA-Z_\.]*$/)) {
								alert("Invalid filename entry...");
							} else {
								saveAs(textFileAsBlob, fn);
								saveDialog.hide();
							}
						}
					}).placeAt(form.containerNode);
				var saveDialog = new Dialog({
					title: "Save GeoJSON Traverse File",
					content: form,
					onHide: function() {
						this.destroyRecursive();
					},
					style: "width: 400px"
				});
				form.startup();
				saveDialog.show();
            },

            reportTraverse: function() {
                var textToWrite = "Traverse Report\n\n";
                textToWrite += "Total Distance: " + this.totalDistance.toFixed(2) + " " + this.distanceUnits[this.distanceUnits.selectedIndex].label + "\n";
                textToWrite += "Traverse Area: " + this.traverseArea.toFixed(2) + " " + this.areaUnits[this.areaUnits.selectedIndex].label + "\n";
                textToWrite += "Approximate Starting Point: X = " + this.startingPointProjected.x.toFixed(2) + "  Y = " + this.startingPointProjected.y.toFixed(2) + "\n";
                textToWrite += "Approximate Ending Point:   X = " + this.endingPointProjected.x.toFixed(2) + "  Y = " + this.endingPointProjected.y.toFixed(2) + "\n";
                textToWrite += "WKID: " + this.config.txtSPwkid + "\n";

                var pt1 = null;
                var pt2 = null;
                pt1 = new Point(0, 0);

                var courseCount = 0;
                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "" && course.distance !== 0) {
                        pt2 = this.GetNextMathPt(pt1, course);
                        pt1 = pt2;
                        courseCount += 1;
                    }
                }));

                textToWrite += "Number of Courses: " + courseCount + "\n\n";

                var mathclosure = this.GetMathClosure(pt1);
                textToWrite += "Closure Error Information:\n";

                // get the closure tolerance 
                var closureTolerance = parseFloat(this.config.txtClosureTolerance);
                var closureDistance = parseFloat(mathclosure.distance);
                if (closureDistance < closureTolerance) {
                    textToWrite += "The traverse is closed\n\n";
                } else {
                    var closureFactor = closureDistance / this.totalDistance;
                    var closurePrecision = 1 / closureFactor;
                    var closureBearing = mathclosure.bearing;
                    textToWrite += "Distance: " + closureDistance.toFixed(4) + " " + this.distanceUnits[this.distanceUnits.selectedIndex].label + "\n";
                    textToWrite += "Bearing: " + closureBearing + "\n";
                    textToWrite += "Precision: 1:" + closurePrecision.toFixed(1) + "\n\n";
                }

                // Added to report on quadrant or azimuth entered - Change 4a - Dean		
                if (this.rdoAz.checked) {
                    textToWrite += "Course Direction Type: Azimuth\n\n";
                } else {
                    textToWrite += "Course Direction Type: Quadrant\n\n";
                }

                textToWrite += "Course Information:\n";

                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "" && course.distance !== 0) {
                        var deg = (course.degree);
                        var min = (course.minute);
                        var sec = (course.second);
                        var dist = (course.distance);

                        if (min === "") {
                            min = 0;
                        }
                        if (sec === "") {
                            sec = 0;
                        }

                        // Changed report on quadrant or azimuth entered for each course - Change 4b - Dean
                        if (this.rdoAz.checked) {
                            if (this.rdoDMS.checked) {
                                textToWrite += course.course + ": " + deg + "-" + min + "-" + sec + ", " + dist + "\n";
                            } else {
                                textToWrite += course.course + ": " + deg + ", " + dist + "\n";
                            }
                        } else {
                            if (this.rdoDMS.checked) {
                                textToWrite += course.course + ": " + deg + "-" + min + "-" + sec + "-" + course.quadrant + ", " + dist + "\n";
                            } else {
                                textToWrite += course.course + ": " + deg + "-" + course.quadrant + ", " + dist + "\n";
                            }
                        }
                    }
                }));

                textToWrite = textToWrite.replace(/\n/g, "\r\n");
                var textFileAsBlob = new Blob([textToWrite], {
                    type: 'text/plain'
                });
                var fileNameToSaveAs = "TraverseReport_" + this.getTimeStamp() + ".txt";
				var form = new Form();
				var fileTextBox = new TextBox({
						name: "saveFilename",
						id: "saveFilename",
						value: fileNameToSaveAs,
						style: "width: 87%",
						placeHolder: "Enter your filename..."
					}).placeAt(form.containerNode);
				var saveButton = new Button({
						label: "Save",
						onClick: function() {
							var fn = fileTextBox.value;
							if (fn.indexOf(".txt") === -1) {
								fn = fn + ".txt";
							}
							if (!fn.match(/^[0-9a-zA-Z_\.]*$/)) {
								alert("Invalid filename entry...");
							} else {
								saveAs(textFileAsBlob, fn);
								saveDialog.hide();
							}
						}
					}).placeAt(form.containerNode);
				var saveDialog = new Dialog({
					title: "Save Traverse Report File",
					content: form,
					onHide: function() {
						this.destroyRecursive();
					},
					style: "width: 400px"
				});
				form.startup();
				saveDialog.show();
            },

            destroyClickedElement: function(evt) {
                document.body.removeChild(evt.target);
            },

            validateCourseEntry: function(evt) {
                this.errorMessage.innerHTML = "&nbsp;";
                var errMessage = "";
                var field = evt.cell.column.field;
                var val = evt.value;
                switch (field) {
                    case "quadrant":
                        val = val.toUpperCase();
                        evt.cell.row.data.quadrant = val;
                        if (val !== "1" && val !== "2" && val !== "3" && val !== "4") {
                            if (val !== "N" && val !== "S" && val !== "E" && val !== "W") {
                                if (val !== "NE" && val !== "SE" && val !== "SW" && val !== "NW") {
                                    errMessage = "Quadrant must be: 1,2,3,4 or N, E, S, W or NE, SE, SW, NW";
                                }
                            }
                        }
                        if (val === "N" || val === "S" || val === "E" || val === "W") {
                            evt.cell.row.data.degree = "0";
                            evt.cell.row.data.minute = "0";
                            evt.cell.row.data.second = "0";
                        }
                        break;
                    case "degree":
                        evt.cell.row.data.degree = val;
                        val = parseFloat(val);
                        if (val > 90 && val < -90 || isNaN(val)) {
                            errMessage = "Invalid degree value";
                        }
                        break;
                    case "minute":
                        evt.cell.row.data.minute = val;
                        val = parseFloat(val);
                        if (val >= 60 || val < 0 || isNaN(val)) {
                            errMessage = "Invalid minute value";
                        }
                        break;
                    case "second":
                        evt.cell.row.data.second = val;
                        val = parseFloat(val);
                        if (val >= 60 || val < 0 || isNaN(val)) {
                            errMessage = "Invalid second value";
                        }
                        break;
                    case "distance":
                        var v = parseFloat(val);
                        if (v <= 0 || isNaN(v)) {
                            errMessage = "Invalid distance value";
                        } else {
                            evt.cell.row.data.distance = val;
                            // check the DMS and change any blanks to zero to properly calculate the course
                            if (evt.cell.row.data.degree === "") {
                                evt.cell.row.data.degree = "0";
                            }
                            if (evt.cell.row.data.minute === "") {
                                evt.cell.row.data.minute = "0";
                            }
                            if (evt.cell.row.data.second === "") {
                                evt.cell.row.data.second = "0";
                            }
                            this.drawTraverse();
                        }
                        break;
                }
                if (errMessage !== "") {
                    this.errorMessage.innerHTML = errMessage;
                } else {
                    // if the course is valid, we just need a distance to draw it
                    var dist = parseFloat(evt.cell.row.data.distance);
                    if (dist > 0) {
                        this.drawTraverse();
                    }
                }
            },

            validateCourse: function() {
                this.errorMessage.innerHTML = "&nbsp;";

                var deg = (this.txtDegree.value);
                var min = (this.txtMinute.value);
                var sec = (this.txtSecond.value);
                var dist = (this.txtDistance.value);

                if (min === "") {
                    min = 0;
                }
                if (sec === "") {
                    sec = 0;
                }

                deg = parseFloat(deg);
                min = parseFloat(min);
                sec = parseFloat(sec);

                if (!this.startingPoint) {
                    this.errorMessage.innerHTML = "No starting point has be set";
                }
                if (isNaN(deg)) {
                    this.errorMessage.innerHTML = "A bad value for Degree has been entered";
                }
                if (isNaN(min)) {
                    this.errorMessage.innerHTML = "A bad value for Minute has been entered";
                }
                if (isNaN(sec)) {
                    this.errorMessage.innerHTML = "A bad value for Second has been entered";
                }
                if (isNaN(dist)) {
                    this.errorMessage.innerHTML = "A bad value for Distance has been entered";
                }

                var validCourse = false;

                if (this.errorMessage.innerHTML === "&nbsp;") {
                    validCourse = true;
                }
                return validCourse;

            },

            drawTraverse: function() {

                var marker = new SimpleMarkerSymbol();
                marker.setSize(10);
                marker.setColor(new Color(this.colorPicker.getColor()));

                this.traverseLayer.clear();

                var startPT = null;
                var traverseLinePath = [];
                traverseLinePath.push(this.startingPoint);
                var startGraphic = new Graphic(this.startingPoint, marker);
                this.traverseLayer.add(startGraphic);
                this.totalDistance = 0;
                if (this.startingPoint) {
                    this.btnDrawCourse.disabled = false;
                }
                // calculate the traverse to draw
                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "") {
                        var coursePT = null;
                        if (!startPT) {
                            startPT = this.startingPoint;
                        }
						coursePT = this.geodesicCoursePoint(startPT, course);
                        if (course.course === 1) {
                            this.firstCoursePoint = coursePT; // used for setting the rotation angle
                        }
                        traverseLinePath.push(coursePT);
                        startPT = coursePT;
                        this.endingPoint = coursePT;
                        this.totalDistance += parseFloat(course.distance);
                    }
                }));
                // calculate the math traverse to use for calculating traverse area
                this.mathPointArray = [];
                startPT = null;
                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "") {
                        var angle = 0;
                        if (this.rdoAz.checked) {
                            var d = parseFloat(course.degree);
                            angle = d * (Math.PI / 180);
                        } else {
                            angle = this.calculateCourseAngle(course);
                        }
                        var coursePT = null;
                        if (!startPT) {
                            startPT = {
                                x: 0,
                                y: 0
                            };
                            this.mathPointArray.push(startPT);
                        }
                        coursePT = this.mathCoursePoint(angle, startPT, course);
                        this.mathPointArray.push(coursePT);
                        startPT = coursePT;
                    }
                }));

                // draw the traverse line
                var line = new CartographicLineSymbol();
                line.setWidth(4);
                line.setStyle(CartographicLineSymbol.STYLE_SHORTDOT);
                line.setColor(new Color(this.colorPicker.getColor()));
                this.traverseLine = new Polyline(this.map.spatialReference);
                this.traverseLine.addPath(traverseLinePath);
                if (this.txtRotationAngle.value !== 0) {
                    this.traverseLine = geometryEngine.rotate(this.traverseLine, this.txtRotationAngle.value, this.startingPoint);
                }
                this.traverseGraphic = new Graphic(this.traverseLine, line);
                this.traverseLayer.add(this.traverseGraphic);
                // add course graphics
                arrayUtils.forEach(this.traverseLine.paths[0], lang.hitch(this, function(pathPT) {
                    var pt = new Point(pathPT[0], pathPT[1], this.map.spatialReference);
                    var courseGraphic = new Graphic(pt, marker);
                    this.traverseLayer.add(courseGraphic);
                }));

                // enable set rotation angle button if there is at least one course
                if (this.courseArray.length > 0) {
                    this.btnSetAngle.disabled = false;
                } else {
                    this.btnSetAngle.disabled = true;
                }

                // Display distance and area
                this.traverseArea = 0;
                if (this.courseArray.length > 1) {
                    this.traverseRing = traverseLinePath;
                    this.traverseRing.push(this.startingPoint);
                    var traversePolygon = new Polygon(this.map.spatialReference);
                    traversePolygon.addRing(this.traverseRing);
                    this.traverseArea = this.calculateTraverseArea();
                }
                this.txtClosure.innerHTML = "<br>Total Distance: <strong>" + this.totalDistance.toFixed(2) + " " + this.distanceUnits[this.distanceUnits.selectedIndex].label + "</strong> | Area: <strong>" + this.traverseArea.toFixed(2) + " " + this.areaUnits[this.areaUnits.selectedIndex].label + "</strong>";
                this.calculateMathClosure();
                this.highlightSelectedCourse();


                // project the ending point to the configuration wkid
                if (this.courseArray.length > 1) {
                    var params = new ProjectParameters();
                    var wkid = Number(this.config.txtSPwkid);
                    var outSR = new SpatialReference(wkid);
                    params.geometries = [this.endingPoint];
                    params.outSR = outSR;
                    //params.transformation = wkid;
                    this.geometryService.project(params, lang.hitch(this, this.setProjectedEndingPoint));
                }

            },

            setProjectedEndingPoint: function(e) {
                this.endingPointProjected = new Point(e[0].x, e[0].y, new SpatialReference(Number(this.config.txtSPwkid)));
            },

            calculateTraverseArea: function() {
                // area will be accumulated in the loop
                var area = 0;
                // The last vertex is the 'previous' one to the first
                var j = this.mathPointArray.length - 1;

                for (var i = 0; i < this.mathPointArray.length; i++) {
                    var pt1 = this.mathPointArray[i];
                    var pt2 = this.mathPointArray[j];

                    area = area + (pt2.x + pt1.x) * (pt2.y - pt1.y);
                    j = i;
                }

                var measureFactor = 1; // feet
                switch (this.distanceUnits[this.distanceUnits.selectedIndex].label) {
                    case "Yards":
                        measureFactor = 9;
                        break;
                    case "Rods":
                        measureFactor = 272.25;
                        break;
                    case "Chains":
                        measureFactor = 4356;
                        break;
                    case "Links":
                        measureFactor = 0.4356;
                        break;
                    case "Meters":
                        measureFactor = 10.7636486;
                        break;
                }

                var areaFactor = 1; // square feet
                switch (this.areaUnits.value) {
                    case "acres":
                        areaFactor = 43560;
                        break;
                    case "square-meters":
                        areaFactor = 10.76391041671;
                        break;
                    case "square-kilometers":
                        areaFactor = 10763910.41671;
                        break;
                    case "square-miles":
                        areaFactor = 27878399.999612;
                        break;
                    case "square-yards":
                        areaFactor = 9;
                        break;
                }

                area = area * measureFactor / areaFactor / 2;

                return Math.abs(area);
            },

            calculateCourseAngle: function(course) {
                var radangle = 0;
                var angle = this.calculateAngle(course);
                radangle = angle * (Math.PI / 180);
                return radangle;
            },

            calculateAngle: function(course) {
                // logic to convert xx.xxxx to DMS when selected
                var deg, min, sec;
                if (this.rdoDMS.checked && course.degree.indexOf(".") !== -1) {
                    var dmsArray = course.degree.split(".");
                    deg = dmsArray[0];
                    min = dmsArray[1].substring(0, 2);
                    sec = dmsArray[1].substring(2, 4);
                } else {
                    deg = (course.degree);
                    min = (course.minute);
                    sec = (course.second);
                }

                if (min === "") {
                    min = 0;
                }
                if (sec === "") {
                    sec = 0;
                }

                deg = parseFloat(deg);
                min = parseFloat(min);
                sec = parseFloat(sec);
                sec = sec / 60;
                min = min + sec;
                min = min / 60;

                var angle = deg + min;

                return angle;

            },

            mathCoursePoint: function(radangle, startPT, course) {

                // get distance factor to use in calculation.
                var dist = course.distance;

                // calculate deltax and deltay
                var dx = dist * Math.sin(radangle);
                var dy = dist * Math.cos(radangle);
                var x1 = startPT.x;
                var y1 = startPT.y;
                var x2 = x1 + dx;
                var y2 = y1 + dy;

                switch (course.quadrant.toUpperCase()) {
                    case "N":
                        x2 = x1;
                        y2 = y1 + parseFloat(dist);
                        break;
                    case "S":
                        x2 = x1;
                        y2 = y1 - parseFloat(dist);
                        break;
                    case "E":
                        x2 = x1 + parseFloat(dist);
                        y2 = y1;
                        break;
                    case "W":
                        x2 = x1 - parseFloat(dist);
                        y2 = y1;
                        break;
                    case "NE":
                    case "1":
                        x2 = x1 + dx;
                        y2 = y1 + dy;
                        break;
                    case "SE":
                    case "2":
                        x2 = x1 + dx;
                        y2 = y1 - dy;
                        break;
                    case "SW":
                    case "3":
                        x2 = x1 - dx;
                        y2 = y1 - dy;
                        break;
                    case "NW":
                    case "4":
                        x2 = x1 - dx;
                        y2 = y1 + dy;
                        break;
                }

                // now that we have the new x and y values, create a new point.
                var coursePoint = {
                    x: x2,
                    y: y2
                };

                return coursePoint;

            },

            geodesicCoursePoint: function(pt, course) {

                var angle = this.calculateAngle(course);
                var bearing = 0;

                var quadrant = (course.quadrant);

                switch (quadrant.toUpperCase()) {
                    case "N":
                        bearing = 0;
                        break;
                    case "S":
                        bearing = 180;
                        break;
                    case "E":
                        bearing = 90;
                        break;
                    case "W":
                        bearing = 270;
                        break;
                    case "NE":
                    case "1":
                        bearing = angle;
                        break;
                    case "SE":
                    case "2":
                        bearing = 180 - angle;
                        break;
                    case "SW":
                    case "3":
                        bearing = angle + 180;
                        break;
                    case "NW":
                    case "4":
                        bearing = 360 - angle;
                        break;
                }

                // Added to report on quadrant or azimuth entered - Change 3 - Dean		
                if (this.rdoAz.checked) {
                    bearing = angle;
                }

                // convert point to geographic
                pt = webMercatorUtils.webMercatorToGeographic(pt, false);

                // apply distance factor
                var distance = course.distance * this.getDistanceFactor();
                // Distance provided is in meters convert to km
                distance = distance / 1000;
                // Convert distance to angular distance in radians based on the earth's radius
                distance = distance / 6371;
                // Convert variables to radians;
                bearing = this.toRadians(bearing);
                var lat1 = this.toRadians(pt.y);
                var lon1 = this.toRadians(pt.x);
                // Calculate the new points position
                var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance) +
                    Math.cos(lat1) * Math.sin(distance) * Math.cos(bearing));
                var lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(lat1),
                    Math.cos(distance) - Math.sin(lat1) * Math.sin(lat2));
                lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180...+180
                // convert back to degrees
                lat2 = this.toDegrees(lat2);
                lon2 = this.toDegrees(lon2);
                // return the new destination point
                var pt2 = new Point(lon2, lat2, this.map.spatialReference);
                pt2 = webMercatorUtils.geographicToWebMercator(pt2);
                return pt2;
            },

            toDegrees: function(val) {
                return val * 180 / Math.PI;
            },

            toRadians: function(val) {
                return val * Math.PI / 180;
            },

            getDistanceFactor: function() {
                var basemapUnits = scaleUtils.getUnitValueForSR(this.map.spatialReference);
                var units = this.distanceUnits[this.distanceUnits.selectedIndex].label;

                var distanceFactor = 1;

                if (basemapUnits === 1) { // 1 indicates meters
                    switch (units) {
                        case "Yards":
                            distanceFactor = 0.9144;
                            break;
                        case "Rods":
                            distanceFactor = 5.0292;
                            break;
                        case "Chains":
                            distanceFactor = 20.1168;
                            break;
                        case "Links":
                            distanceFactor = 0.201168;
                            break;
                        case "Feet":
                            distanceFactor = 0.3048;
                            break;
                    }
                } else {
                    switch (units) {
                        case "Yards":
                            distanceFactor = 3;
                            break;
                        case "Rods":
                            distanceFactor = 16.5;
                            break;
                        case "Chains":
                            distanceFactor = 66;
                            break;
                        case "Links":
                            distanceFactor = 0.66;
                            break;
                        case "Meters":
                            distanceFactor = 3.2808;
                            break;
                    }
                }


                return distanceFactor;
            },

            // function to calculate and provide a bearing for the points being drawn.  Code provided by Dean Anderson of Polk County, OR
            getBearing: function(point_a, point_b) {
                var bearing = '-';
                var quad = "";
                var d = 0;
                var m = 0;
                var s = 0;
                if (point_a && point_b) {
                    bearing = 'N0-0-0E';

                    var rise = (point_b.y - point_a.y).toFixed(2);
                    var run = (point_b.x - point_a.x).toFixed(2);
                    if (rise === 0) {
                        if (point_a.x > point_b.x) {
                            bearing = 'W0-0-0';
                            quad = "W";
                        } else {
                            bearing = 'E0-0-0';
                            quad = "E";
                        }
                    } else if (run === 0) {
                        if (point_a.y > point_b.y) {
                            bearing = 'S0-0-0';
                            quad = "S";
                        } else {
                            bearing = 'N0-0-0';
                            quad = "N";
                        }
                    } else {
                        var ns_quad = 'N';
                        var ew_quad = 'E';
                        if (point_a.y > 0) {
                            if (rise > 0) {
                                ns_quad = 'S';
                            }
                        } else {
                            if (rise < 0) {
                                ns_quad = 'S';
                            }
                        }
                        if (point_a.x > 0) {
                            if (run < 0) {
                                ew_quad = 'W';
                            }
                        } else {
                            if (run > 0) {
                                ew_quad = 'W';
                            }
                        }
                        quad = ns_quad + ew_quad;
                        // we've determined the quadrant, so we can make these absolute
                        rise = Math.abs(rise);
                        run = Math.abs(run);
                        // Calculation suggested by Dean Anderson, refs: #153
                        var degrees = Math.atan(run / rise) / (2 * Math.PI) * 360;

                        if (this.rdoDMS.checked) {
                            // and to DMS ...
                            d = parseInt(degrees);
                            var t = (degrees - d) * 60;
                            m = parseInt(t);
                            s = parseInt(60 * (t - m));
                            bearing = ns_quad + d + '-' + m + '-' + s + ew_quad;
                        } else {
                            d = degrees.toFixed(4);
                            m = 0;
                            s = 0;
                            bearing = ns_quad + d + ew_quad;
                        }
                    }
                }
                return {
                    bearing: bearing,
                    quadrant: quad,
                    degree: d.toString(),
                    minute: m.toString(),
                    second: s.toString()
                };
            },

            startSetRotationAngle: function() {
                if (this.btnSetAngle.value === "Set") {
                    this.btnSetAngle.value = "Done";
                    this.btnSetAngle.innerHTML = "Done";

                    // reset the rotation value
                    this.txtRotationAngle.value = 0;
                    this.drawTraverse();

                    this.map.disableDoubleClickZoom();

                    this.angleLayer = new GraphicsLayer();
                    this.map.addLayer(this.angleLayer);

                    var marker = new PictureMarkerSymbol();
                    marker.setHeight(21);
                    marker.setWidth(21);
                    marker.setUrl("widgets/Traverse/images/rotateCursor.png");

                    var line = new CartographicLineSymbol();
                    line.setColor(new Color([255, 0, 0, 0.35]));
                    line.setWidth(3);
                    line.setStyle(CartographicLineSymbol.STYLE_SHORTDOT);
                    var drawPL = new Polyline(this.map.spatialReference);
                    drawPL.addPath([this.startingPoint, this.firstCoursePoint]);

                    var drawLineGraphic = new Graphic(drawPL, line, null, null);
                    this.angleLayer.add(drawLineGraphic);
                    var drawGraphic = new Graphic(this.firstCoursePoint, marker, null, null);
                    this.angleLayer.add(drawGraphic);

                    var font = new Font();
                    font.setSize(15);
                    font.setWeight(Font.WEIGHT_BOLD);
                    font.setFamily("arial");
                    var textSym = new TextSymbol();
                    textSym.setFont(font);
                    textSym.setText("");
                    textSym.setVerticalAlignment("bottom");
                    textSym.setHorizontalAlignment("left");
                    textSym.setOffset(10, 10);
                    var textGraphic = new Graphic(this.firstCoursePoint, textSym, null, null);
                    this.angleLayer.add(textGraphic);

                    this.editToolbar.activate(Edit.MOVE, drawGraphic);

                    this.drawHandler = on(this.map, "mouse-move", lang.hitch(this, function(evt) {
                        this.editToolbar.deactivate();
                        var pt = evt.mapPoint;
                        var r = Math.atan2(pt.y - this.startingPoint.y, pt.x - this.startingPoint.x) - Math.atan2(this.firstCoursePoint.y - this.startingPoint.y, this.firstCoursePoint.x - this.startingPoint.x);
                        var ang = this.toDegrees(r);

                        drawGraphic.setGeometry(pt);
                        var att = {
                            angle: ang.toFixed(2)
                        };
                        drawGraphic.setAttributes(att);
                        textSym.setText(ang.toFixed(2));
                        textGraphic.setGeometry(pt);
                        var pl = new Polyline(this.map.spatialReference);
                        pl.addPath([pt, this.startingPoint]);
                        drawLineGraphic.setGeometry(pl);
                    }));

                    this.clickHandler = on(this.map, "mouse-up", lang.hitch(this, function(e) {
                        var att = e.graphic.attributes;
                        this.txtRotationAngle.value = att.angle;
                    }));
                    this.doubleClickHandler = on(this.map, "dbl-click", lang.hitch(this, function() {
                        this.finishRotateTraverse();
                    }));
                } else {
                    this.finishRotateTraverse();
                }
            },

            finishRotateTraverse: function() {
                this.clickHandler.remove();
                this.doubleClickHandler.remove();
                this.map.enableDoubleClickZoom();
                this.editToolbar.deactivate();
                this.btnSetAngle.value = "Set";
                this.btnSetAngle.innerHTML = "Set";
                if (this.angleLayer) {
                    this.angleLayer.clear();
                    this.map.removeLayer(this.angleLayer);
                }
                if (this.drawHandler) {
                    this.drawHandler.remove();
                    this.drawHandler = null;
                }
                this.drawTraverse();
            },

            drawCourse: function() {
                this.drawDistance = 0;
                this.drawBearing = "";
                this.previousCourseObject = {
                    course: 0,
                    quadrant: "",
                    degree: "",
                    minute: "",
                    second: "",
                    distance: ""
                };

                if (this.btnDrawCourse.innerHTML === "Draw") {
                    this.btnDrawCourse.value = "Done";
                    this.btnDrawCourse.innerHTML = "Done";
                    this.btnStartPoint.disabled = true;
                    this.btnAddCourse.disabled = true;
                    this.btnCloseCourse.disabled = true;
					this.traverseInputFile.disabled = true;
					this.traverseOutputFileHandler[0].remove();
					this.traverseJSONFileHandler[0].remove();
					this.traverseClearHandler[0].remove();
					this.traverseReportHandler[0].remove();
                    this.btnSetAngle.disabled = true;
                    this.removeGridEvents();
                    this.removeBlankCourse();

                    this.map.disableDoubleClickZoom();
                    this.contextMenuHandler = on(document, "contextmenu", function(e) {
                        e.preventDefault();
                    }, false);

                    this.angleLayer = new GraphicsLayer();
                    this.map.addLayer(this.angleLayer);

                    var startPT = this.startingPoint;

                    if (this.endingPoint !== null) {
                        startPT = this.endingPoint;
                    }

                    var marker = new PictureMarkerSymbol();
                    marker.setHeight(21);
                    marker.setWidth(21);
                    marker.setUrl("widgets/Traverse/images/drawCursor.png");

                    var line = new CartographicLineSymbol();
                    line.setColor(new Color([0, 0, 0, 0.35]));
                    line.setWidth(3);
                    line.setStyle(CartographicLineSymbol.STYLE_SHORTDOT);
                    var dragPL = new Polyline(this.map.spatialReference);
                    dragPL.addPath([startPT, startPT]);

                    var drawLineGraphic = new Graphic(dragPL, line, null, null);
                    this.angleLayer.add(drawLineGraphic);
                    var drawGraphic = new Graphic(startPT, marker, null, null);
                    this.angleLayer.add(drawGraphic);

                    var font = new Font();
                    font.setSize(15);
                    font.setWeight(Font.WEIGHT_BOLD);
                    font.setFamily("arial");
                    var textSym = new TextSymbol();
                    textSym.setFont(font);
                    textSym.setText("");
                    textSym.setVerticalAlignment("bottom");
                    textSym.setHorizontalAlignment("left");
                    textSym.setOffset(10, 10);
                    var textGraphic = new Graphic(startPT, textSym, null, null);
                    this.angleLayer.add(textGraphic);

                    this.editToolbar.activate(Edit.MOVE, drawGraphic);

                    this.drawHandler = on(this.map, "mouse-move", lang.hitch(this, function(evt) {
                        this.editToolbar.deactivate();
                        var pt = evt.mapPoint;
                        drawGraphic.setGeometry(pt);
                        var bearing;
                        if (this.rdoAz.checked) {
                            // this proves I don't know trig well enough...
                            var r = Math.atan2(pt.y - startPT.y, pt.x - startPT.x) - Math.atan2(startPT.y + 100 - startPT.y, startPT.x - startPT.x);
                            var ang = this.toDegrees(r);
                            if (ang < 0) {
                                ang = Math.abs(ang);
                            } else {
                                ang = 360 - ang;
                            }
                            ang = ang.toFixed(2);
							if (this.rdoDMS.checked) {
								var dms = this.GetDMS(ang);
								bearing = {
									bearing: dms[0] + "-" + dms[1] + "-" + dms[2],
									degree: dms[0].toString(),
									minute: dms[1],
									second: dms[2],
									quadrant: ""
								};
								
							} else {
								bearing = {
									bearing: ang,
									degree: ang.toString(),
									minute: "0",
									second: "0",
									quadrant: ""
								};
							}
                        } else {
                            bearing = this.getBearing(pt, startPT);
                        }
                        var pl = new Polyline(this.map.spatialReference);
                        pl.addPath([pt, startPT]);
                        if (this.useGeodesic) {
                            this.drawDistance = geometryEngine.geodesicLength(pl, this.distanceUnits.value);
                        } else {
                            this.drawDistance = geometryEngine.planarLength(pl, this.distanceUnits.value);
                        }
                        if (this.distanceUnits[this.distanceUnits.selectedIndex].label === "Rods") {
                            this.drawDistance = this.drawDistance / 16.5;
                        }
                        if (this.distanceUnits[this.distanceUnits.selectedIndex].label === "Chains") {
                            this.drawDistance = this.drawDistance / 66;
                        }
                        if (this.distanceUnits[this.distanceUnits.selectedIndex].label === "Links") {
                            this.drawDistance = this.drawDistance / 0.66;
                        }
                        this.drawDistance = (this.drawDistance).toFixed(1);
                        this.drawBearing = bearing;
                        var att = {
                            bearing: bearing,
                            distance: this.drawDistance
                        };
                        drawGraphic.setAttributes(att);
                        if (att.distance === "0.0") {
                            textSym.setText(" ");
                        } else {
                            textSym.setText(bearing.bearing + " " + this.drawDistance + " " + this.distanceUnits[this.distanceUnits.selectedIndex].label);
                        }
                        textGraphic.setGeometry(pt);
                        drawLineGraphic.setGeometry(pl);
                    }));

                    this.doubleClickHandler = this.map.on("dbl-click", lang.hitch(this, function() {
                        this.finishDrawCourse();
                    }));
                    this.clickHandler = this.map.on("mouse-up", lang.hitch(this, function(e) {
                        this.addDrawCourse();
                        startPT = e.mapPoint;
                    }));
                } else {
                    this.finishDrawCourse();
                }
            },

            addDrawCourse: function() {
                var gra = this.angleLayer.graphics[1];
                var att = gra.attributes;
                if (att.distance !== "0.0") {
                    var courseObject = {
                        course: this.courseArray.length + 1,
                        quadrant: att.bearing.quadrant,
                        degree: att.bearing.degree,
                        minute: att.bearing.minute,
                        second: att.bearing.second,
                        distance: att.distance
                    };
                    if (courseObject.degree === this.previousCourseObject.degree && courseObject.minute === this.previousCourseObject.minute && courseObject.second === this.previousCourseObject.second && courseObject.distance === this.previousCourseObject.distance) {
                        // if they are all equal, we don't want to do anything
                    } else {
                        this.courseArray.push(courseObject);
                        this.renumberCourses();
                        this.drawTraverse();
                        this.btnAddCourse.disabled = true;
                        this.btnCloseCourse.disabled = true;
						this.btnSetAngle.disabled = true;
                    }
                    this.previousCourseObject = courseObject;
                }
            },

            finishDrawCourse: function() {
                this.clickHandler.remove();
                this.doubleClickHandler.remove();
                this.contextMenuHandler.remove();
                this.editToolbar.deactivate();
                this.btnDrawCourse.value = "Draw";
                this.btnDrawCourse.innerHTML = "Draw";
                this.btnStartPoint.disabled = false;
                this.btnAddCourse.disabled = false;
                this.btnCloseCourse.disabled = false;
                this.traverseInputFile.disabled = false;
                this.traverseOutputFileHandler = this.own(on(this.traverseOutputFile, 'click', lang.hitch(this, this.saveTraverse)));
                this.traverseJSONFileHandler = this.own(on(this.traverseJSONFile, 'click', lang.hitch(this, this.saveGeoJSONTraverse)));
                this.traverseClearHandler = this.own(on(this.traverseClear, 'click', lang.hitch(this, this.clearTraverse)));
                this.traverseReportHandler = this.own(on(this.traverseReport, 'click', lang.hitch(this, this.reportTraverse)));
                this.btnSetAngle.disabled = false;
                this.setGridEvents();
                this.map.enableDoubleClickZoom();
                if (this.angleLayer) {
                    this.angleLayer.clear();
                    this.map.removeLayer(this.angleLayer);
                }
                if (this.drawHandler) {
                    this.drawHandler.remove();
                    this.drawHandler = null;
                }
            },

            addClosureCourse: function() {

                var pt1 = new Point(0, 0);
                var pt2 = null;

                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "") {
                        pt2 = this.GetNextMathPt(pt1, course);
                        pt1 = pt2;
                    }
                }));

                var mathclosure = this.GetMathClosure(pt1);
                var closureDistance = parseFloat(mathclosure.distance).toFixed(2);
                // closure is calculated, lets add the new course.
                var courseObject = {
                    course: this.courseArray.length + 1,
                    quadrant: mathclosure.quadrant,
                    degree: mathclosure.degrees.toString(),
                    minute: mathclosure.minutes.toString(),
                    second: mathclosure.seconds.toString(),
                    distance: closureDistance.toString()
                };
                this.courseArray.push(courseObject);
                this.refreshGrid();
                this.drawTraverse();

            },

            calculateMathClosure: function() {

                var pt1 = null;
                var pt2 = null;
                pt1 = new Point(0, 0);

                arrayUtils.forEach(this.courseArray, lang.hitch(this, function(course) {
                    if (course.distance !== "") {
                        pt2 = this.GetNextMathPt(pt1, course);
                        pt1 = pt2;
                    }
                }));

                var mathclosure = this.GetMathClosure(pt1);

                // get the closure tolerance 
                var closureTolerance = parseFloat(this.config.txtClosureTolerance);
                var closureDistance = parseFloat(mathclosure.distance);
                if (closureDistance < closureTolerance) {
                    this.txtClosure.innerHTML += "<br>The traverse is closed";
                    this.btnCloseCourse.disabled = true;

                } else {
                    var closureFactor = closureDistance / this.totalDistance;
                    var closurePrecision = 1 / closureFactor;
                    var closureBearing = mathclosure.bearing;
                    this.txtClosure.innerHTML += "<br>Closure Error distance: <strong>" + closureDistance.toFixed(2) + "</strong><br>Bearing: <strong>" + closureBearing + "</strong><br>Precision: <strong>1:" + closurePrecision.toFixed(1) + "</strong>";
                    this.btnCloseCourse.disabled = false;
                }

            },

            GetNextMathPt: function(pt, course) {

                var deg = (course.degree);
                var min = (course.minute);
                var sec = (course.second);
                var dist = (course.distance);
                var quad = (course.quadrant);
                var angle, bearing;


                if (min === "") {
                    min = 0;
                }
                if (sec === "") {
                    sec = 0;
                }

                // calculate decimal degrees 

                if (this.rdoDMS.checked) {
                    deg = parseFloat(deg);
                    min = parseFloat(min);
                    sec = parseFloat(sec);
                    sec = sec / 60;
                    min = min + sec;
                    min = min / 60;

                    angle = deg + min;

                } else {
                    angle = parseFloat(deg);
                }

                switch (quad.toUpperCase()) {
                    case "N":
                        bearing = 0;
                        break;
                    case "S":
                        bearing = 180;
                        break;
                    case "E":
                        bearing = 90;
                        break;
                    case "W":
                        bearing = 270;
                        break;
                    case "NE":
                    case "1":
                        bearing = angle;
                        break;
                    case "SE":
                    case "2":
                        bearing = 180 - angle;
                        break;
                    case "SW":
                    case "3":
                        bearing = angle + 180;
                        break;
                    case "NW":
                    case "4":
                        bearing = 360 - angle;
                        break;
                }

                // Added to report on quadrant or azimuth entered - Change 3 - Dean		
                if (this.rdoAz.checked) {
                    bearing = angle;
                }

                // calculate radians 
                var radangle = bearing * (Math.PI / 180);

                // delta xy
                var dx = dist * Math.sin(radangle);
                var dy = dist * Math.cos(radangle);

                // Make new point 
                var x1 = pt.x;
                var y1 = pt.y;

                var x2 = x1 + dx;
                var y2 = y1 + dy;

                var NextMathpt = {
                    x: x2,
                    y: y2
                };

                return NextMathpt;

            },

            GetDMS: function(degrees) {

                // Given Degrees returns an indexed array DMS of Degrees, minutes, and seconds 

                var d = parseInt(degrees);
                var t = ((degrees - d) * 60).toPrecision(4);
                var m = parseInt(t);
                var s = ((t - m) * 60).toPrecision(4);
                s = parseInt(s);

                var dms = [d, m, s];

                return dms;
            },


            GetMathClosure: function(pt) {
                var qns = "";
                var qew = "";
                var dms = [0, 0, 0];
                var distance = 0;
                var degrees = 0;
                var bearing, brg, azd;

                // Calc Angle 
                var x = Math.abs(pt.x);
                var y = Math.abs(pt.y);

                degrees = (Math.atan(x / y) * (180 / Math.PI)).toPrecision(12);

                // Calc Distance 
                var xx = x * x;
                var yy = y * y;
                var xxyy = parseFloat(xx) + parseFloat(yy);
                distance = (Math.sqrt(xxyy)).toPrecision(8);

                // Convert angle to program quardrant and dms or az	

                // Do quadrant 

                if (this.rdoQuad.checked) {
                    // Find source quadrant 
                    qns = "S";
                    qew = "W";
                    if (pt.y < 0) {
                        qns = "N";
                    }
                    if (pt.x < 0) {
                        qew = "E";
                    }
                    //var quandrant = qns + qew;
                    if (this.rdoDMS.checked) {
                        // dms
                        dms = this.GetDMS(degrees);
                        brg = dms[0] + "-" + dms[1] + "-" + dms[2];
                    } else {
                        // DD 
                        brg = parseFloat(degrees).toFixed(4);
                        dms = [brg, 0, 0];
                    }
                    bearing = qns + brg + qew;
                    //alert ("bearing: " + bearing );
                } else {
                    // Do AZ 
                    if (pt.x > 0) {
                        if (pt.y > 0) { // NE quadrant 
                            azd = parseFloat(180 + parseFloat(degrees)).toFixed(4);
                            //alert (azd);
                        } else { // SE quadrant 
                            azd = parseFloat(360 - degrees).toFixed(4);
                        }
                    } else {
                        if (pt.y > 0) { // NW Quadrant 
                            azd = parseFloat(180 - degrees).toFixed(4);
                        } else { // SW Quadrant
                            azd = parseFloat(degrees).toFixed(4);
                        }
                    }
                    if (this.rdoDMS.checked) {
                        // DMS 
                        dms = this.GetDMS(azd);
                        bearing = dms[0] + "-" + dms[1] + "-" + dms[2];
                    } else {
                        // DD
                        bearing = azd;
                        dms = [azd, 0, 0];
                    }
                }

                // Create and return closure array 

                var closure = {
                    quadrant: qns + qew,
                    degrees: dms[0],
                    minutes: dms[1],
                    seconds: dms[2],
                    bearing: bearing,
                    distance: distance
                };

                return closure;

            },
			
			btnUnitConverterClicked: function() {
				var width = 800;
				var height = 120;
				if(width < 100 || height < 100){
				  return;
				}
				var bigPreview = new UnitConverter();
				this.ucPopup = new Popup({
				  width: width,
				  height: height,
				  titleLabel: "Unit Converter",
				  content: bigPreview,
				  onClose: lang.hitch(this, function(){
					bigPreview.destroy();
					bigPreview = null;
					this.ucPopup = null;
				  })
				});
			},

            onOpen: function() {
				this.map.setInfoWindowOnClick(false);
                if (this.traverseLine) {
                    this.drawTraverse();
                }
            },

            onClose: function() {
				this.map.setInfoWindowOnClick(true);
                this.traverseLayer.clear();
                this.highlightCourseLayer.clear();
                if (this.angleLayer) {
                    this.angleLayer.clear();
                }
            }


        });
    });