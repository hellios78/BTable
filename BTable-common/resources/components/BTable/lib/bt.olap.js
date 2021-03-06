/*
 * Copyright 2013 Biz Tech (http://www.biztech.it). All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 *
 * Covered Software is provided under this License on an “as is” basis,
 * without warranty of any kind, either expressed, implied, or statutory,
 * including, without limitation, warranties that the Covered Software is
 * free of defects, merchantable, fit for a particular purpose or non-infringing.
 * The entire risk as to the quality and performance of the Covered Software is with You.
 * Should any Covered Software prove defective in any respect, You (not any Contributor)
 * assume the cost of any necessary servicing, repair, or correction.
 * This disclaimer of warranty constitutes an essential part of this License.
 * No use of any Covered Software is authorized under this License except under this disclaimer.
 *
 * Initial contributors: Luca Pazzaglia, Massimo Bonometto
 */


var bt = bt || {};
bt.olap = bt.olap || {};

bt.olap.OlapCube = function(spec) {
    
	var defaults = {
        url: bt.helpers.olap.getServiceUrl(),
    	catalog: "",
    	cube: "",
		jndi: ""
    };

    var myself = {};
    
    myself.options = $.extend({}, defaults, spec);
	
    var olapUtils = null;
    var structure = null;
    
	myself.initialize = function() {
		olapUtils = new bt.utils.OlapUtils(myself.options);
		structure = olapUtils.getCube();
	};
	
	myself.getStructure = function() {
		return structure;
	};

	myself.getHierarchies = function() {
		var hierarchies = new Array();
		
		$.each( myself.getStructure().dimensions, function( key, value ) {
			$.each( value.hierarchies, function( key, value ) {
				hierarchies.push( value );
			});
		});
		
		return hierarchies;
	};

	myself.getLevels = function() {
		var levels = new Array();
		
		$.each( myself.getStructure().dimensions, function( key, value ) {
			$.each( value.hierarchies, function( key, value ) {
				$.each( value.levels, function( key, value ) {
					levels.push( value );
				});
			});
		});
		
		return levels;
	};
	
	myself.getElementName = function(qualifiedName) {
		var result = qualifiedName;
		$.each( myself.getLevels(), function( key, value ) {
			if(value.qualifiedName == qualifiedName) {
				result = value.name;
				return;
			}
		});
		$.each( myself.getStructure().measures, function( key, value ) {
			if(value.qualifiedName == qualifiedName) {
				result = value.name;
				return;
			}
		});
		return result;
	};

	myself.getElementFullName = function(qualifiedName) {
		var result = qualifiedName;
		$.each( myself.getLevels(), function( key, value ) {
			if(value.qualifiedName == qualifiedName) {
				var h = qualifiedName.split("].[")[0].substring(1);
				var l = value.name;
				result = h + " -> " + l;
				return;
			}
		});
		$.each( myself.getStructure().measures, function( key, value ) {
			if(value.qualifiedName == qualifiedName) {
				var h = qualifiedName.split("].[")[0].substring(1);
				var l = value.name;
				result = h + " -> " + l;
				return;
			}
		});
		return result;
	};

	myself.getElementType = function(qualifiedName) {
		var result = undefined;
		var found = false;
		
		var arr = $.map(myself.getLevels(), function(i){return i.qualifiedName});
		var idx = $.inArray(qualifiedName, arr);
		
		if(idx >= 0) {
			result = "DIMENSION";
			found = true;
		}
		
		if(!found) {
			arr = $.map(myself.getStructure().measures, function(i){return i.qualifiedName});
			
			idx = $.inArray(qualifiedName, arr);
			
			if(idx >= 0) {
				result = "MEASURE";				
			}
		}
		
		return result;
	};
	
	myself.getLevelDepth = function(qualifiedName) {
		var result = 1;
		$.each( myself.getLevels(), function( key, value ) {
			if(value.qualifiedName == qualifiedName) {
				result = value.depth;
				return;
			}
		});
		return result;
	};
	
	myself.getHierarchyLevels = function(hierarchyQualifiedName) {
		var levels = new Array();
		$.each( myself.getStructure().dimensions, function( key, value ) {
			$.each( value.hierarchies, function( key, value ) {
				if(value.qualifiedName == hierarchyQualifiedName) {
					$.each( value.levels, function( key, value ) {
						levels.push( value );
					});
					return levels;
				}
			});
		});
		return levels;
	};	
	
	myself.getLevelMembers = function(levelQualifiedName) {
		return olapUtils.getLevelMembers({level: levelQualifiedName, cube: myself.options.cube});
	};

    myself.initialize();
    
    return myself;
}
