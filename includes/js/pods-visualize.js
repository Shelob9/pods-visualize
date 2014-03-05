(function ( $ ) {
	"use strict";

	$(function () {

		var pod_data = pods_visualization_data; // global, passed via wp_localize_script

		var color_codes = {
			'post_type': '#88aacc',
			'cpt': '#88aacc',
			'taxonomy': '#FBEC5D',
			'ct': '#FBEC5D',
			'user': '#CDB38B',
			'media': '#FFA54F',
			'comment': '#ecf0f1',
			'pod': '#A2C257',
			'settings': '#dddde5',
			'custom-simple': '#ffffff'
		};

		// ToDo: Magic numbers
		var y_offset = 70;
		var x_offset = 400;
		var element_size = {
			width: 200,
			height: 50
		};

		var graph = new joint.dia.Graph;

		var paper = new joint.dia.Paper( {
			el: $( '#paper' ),
			width: 800,
			height: 600,
			gridSize: 1,
			model: graph
		} );

		/**
		 *
		 * @param x
		 * @param y
		 * @param label
		 * @returns joint.shapes.basic.Rect
		 */
		var element = function( x, y, label, fill ) {

			var new_element = new joint.shapes.basic.Rect( {
				size: element_size,
				position: { x: x,  y: y }
			} );

			new_element.attr( {
				rect: {
					fill: fill,
					rx: 5,
					ry: 10,
					'stroke-width': "2",
					stroke: '#bdc3c7'
				},
				text: {
					text: label,
					fill: '#000000',
					'font-family': 'Courier New',
					'font-size': 12,
					'font-weight': 'normal'
				}
			} );

			graph.addCell( new_element );
			return new_element;
		};

		/**
 		 * @param elm1
		 * @param elm2
		 * @param label
		 * @param bidirectional
		 * @returns {Link}
		 */
		var link = function( elm1, elm2, label, bidirectional ) {

			var new_link = new joint.dia.Link( {
				source: { id: elm1.id },
				target: { id: elm2.id }
			} );

			// Link attributes
			new_link.attr( {
				'.connection': {
					stroke: '#bdc3c7',
					'stroke-width': 2
				},
				'.marker-target': {
					fill: '#bdc3c7',
					d: 'M 10 0 L 0 5 L 10 10 z'
				}
			} );

			if ( bidirectional ) {
				new_link.attr( {
					'.marker-source': {
						fill: '#bdc3c7',
						d: 'M 10 0 L 0 5 L 10 10 z'
					}
				} );
			}

			// Link presentation
			new_link.set( 'smooth', true );

			// Link label
			new_link.label( 0, {
				position: .7,
				attrs: {
					text: {
						text: label,
						'font-family': 'Courier New',
						'font-size': 11
					}
				}
			} );


			graph.addCell( new_link );
			return new_link;
		};

		// Iterate the pods
		var y = 10;
		var x = 10;
		for ( var pod_key in pod_data ) {

			if ( !pod_data.hasOwnProperty( pod_key ) ) {
				continue;
			}

			var this_pod = pod_data[ pod_key ];
			var new_y = y;

			var pod_element = element( x, y, this_pod.name, color_codes[ this_pod.type ] );

			// Iterate the fields in this pod
			for ( var field_key in this_pod.fields ) {

				if ( !this_pod.fields.hasOwnProperty( field_key ) ) {
					continue;
				}

				var this_field = this_pod.fields[ field_key ];

				if ( 'pick' == this_field.type ) {

					var related_element_name = '';
					if ( 'pod' == this_field[ 'pick_object' ] ) {
						related_element_name = this_field[ 'pick_val' ];
					}
					else {
						related_element_name = this_field['pick_object'];
					}

					var related_element = element( x + x_offset, new_y, related_element_name, color_codes[ this_field[ 'pick_object' ] ] );
					link ( pod_element, related_element, this_field.name, this_field[ 'sister_id' ] );

					new_y += y_offset;
				}
			}

			var parent_y = new_y - y;

			// Any relationships?
			if ( 0 != parent_y ) {

				// Subtract out the final increment and center vertically
				parent_y -= y_offset;
				parent_y /= 2;
			}
			else {
				// No relationships pushed the y offset, so add it
				new_y += y_offset;
			}

			// Re-position the parent pod
			pod_element.translate( x, parent_y );

			y = new_y;
		}

		paper.fitToContent( 1, 1, 100 );

	});

}(jQuery));