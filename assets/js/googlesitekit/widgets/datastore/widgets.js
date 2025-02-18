/**
 * `core/widgets` data store: widgets info.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import invariant from 'invariant';

/**
 * Internal dependencies
 */
import { WIDGET_WIDTHS } from './constants';

const ASSIGN_WIDGET = 'ASSIGN_WIDGET';
const REGISTER_WIDGET = 'REGISTER_WIDGET';
const SET_WIDGET_STATE = 'SET_WIDGET_STATE';
const UNSET_WIDGET_STATE = 'UNSET_WIDGET_STATE';

const WidgetWidthKeys = Object.keys( WIDGET_WIDTHS )
	.map( ( key ) => `WIDGET_WIDTHS.${ key }` )
	.join( ', ' );

export const initialState = {
	areaAssignments: {},
	registryKey: undefined,
	widgets: {},
	widgetStates: {},
};

export const actions = {
	/**
	 * Assigns an existing widget (by slug) to a widget area(s).
	 *
	 * @since 1.9.0
	 *
	 * @param {string}         slug      Widget slug.
	 * @param {(string|Array)} areaSlugs Widget Area slug(s).
	 * @return {Object} Redux-style action.
	 */
	assignWidget( slug, areaSlugs ) {
		return {
			payload: {
				slug,
				areaSlugs:
					typeof areaSlugs === 'string' ? [ areaSlugs ] : areaSlugs,
			},
			type: ASSIGN_WIDGET,
		};
	},

	/**
	 * Registers a widget with a given slug and settings.
	 *
	 * @since 1.9.0
	 * @since 1.12.0 Added wrapWidget setting.
	 *
	 * @param {string}                slug                  Widget's slug.
	 * @param {Object}                settings              Widget's settings.
	 * @param {WPComponent}           settings.Component    React component used to display the contents of this widget.
	 * @param {number}                [settings.priority]   Optional. Widget's priority for ordering (lower number is higher priority, like WordPress hooks). Default is: 10.
	 * @param {string|Array.<string>} [settings.width]      Optional. Widget's maximum width to occupy. Default is: "quarter". One of: "quarter", "half", "full".
	 * @param {boolean}               [settings.wrapWidget] Optional. Whether to wrap the component with the <Widget> wrapper. Default is: true.
	 * @return {Object} Redux-style action.
	 */
	registerWidget(
		slug,
		{
			Component,
			priority = 10,
			width = WIDGET_WIDTHS.QUARTER,
			wrapWidget = true,
		} = {}
	) {
		const allWidths = Object.values( WIDGET_WIDTHS );

		invariant( Component, 'component is required to register a widget.' );
		invariant(
			( Array.isArray( width ) &&
				width.some( allWidths.includes, allWidths ) ) ||
				( ! Array.isArray( width ) && allWidths.includes( width ) ),
			`Widget width should be one of: ${ WidgetWidthKeys }, but "${ width }" was provided.`
		);

		return {
			payload: {
				slug,
				settings: {
					Component,
					priority,
					width,
					wrapWidget,
				},
			},
			type: REGISTER_WIDGET,
		};
	},

	/**
	 * Sets widget state for a given widget.
	 *
	 * Used internally by various components that can be returned by
	 * registered widget components.
	 *
	 * @since 1.25.0
	 * @private
	 *
	 * @param {string}      slug       Widget slug.
	 * @param {WPComponent} Component  Component returned by the widget.
	 * @param {Object}      [metadata] Relevant metadata / props passed to
	 *                                 the Component instance.
	 * @return {Object} Redux-style action.
	 */
	setWidgetState( slug, Component, metadata = {} ) {
		return {
			payload: {
				slug,
				Component,
				metadata,
			},
			type: SET_WIDGET_STATE,
		};
	},

	/**
	 * Unsets widget state for a given widget.
	 *
	 * The widget state will only be unset if the current widget state matches
	 * exactly the passed parameters.
	 *
	 * Used internally by various components that can be returned by
	 * registered widget components.
	 *
	 * @since 1.25.0
	 * @private
	 *
	 * @param {string}      slug       Widget slug.
	 * @param {WPComponent} Component  Component returned by the widget.
	 * @param {Object}      [metadata] Relevant metadata / props passed to
	 *                                 the Component instance.
	 * @return {Object} Redux-style action.
	 */
	unsetWidgetState( slug, Component, metadata = {} ) {
		return {
			payload: {
				slug,
				Component,
				metadata,
			},
			type: UNSET_WIDGET_STATE,
		};
	},
};

export const controls = {};

export const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case ASSIGN_WIDGET: {
			const { slug, areaSlugs } = payload;

			const { areaAssignments } = state;
			areaSlugs.forEach( ( areaSlug ) => {
				if ( areaAssignments[ areaSlug ] === undefined ) {
					areaAssignments[ areaSlug ] = [];
				}

				if ( ! areaAssignments[ areaSlug ].includes( slug ) ) {
					areaAssignments[ areaSlug ].push( slug );
				}
			} );

			return {
				...state,
				areaAssignments,
			};
		}

		case REGISTER_WIDGET: {
			const { slug, settings } = payload;

			if ( state.widgets[ slug ] !== undefined ) {
				global.console.warn(
					`Could not register widget with slug "${ slug }". Widget "${ slug }" is already registered.`
				);

				return state;
			}

			return {
				...state,
				widgets: {
					...state.widgets,
					[ slug ]: {
						...settings,
						slug,
					},
				},
			};
		}

		case SET_WIDGET_STATE: {
			const { slug, Component, metadata } = payload;

			return {
				...state,
				widgetStates: {
					...state.widgetStates,
					[ slug ]: {
						Component,
						metadata,
					},
				},
			};
		}

		case UNSET_WIDGET_STATE: {
			const { slug, Component, metadata } = payload;

			const widgetStates = { ...state.widgetStates };
			if (
				widgetStates?.[ slug ]?.Component === Component &&
				widgetStates?.[ slug ]?.metadata === metadata
			) {
				delete widgetStates[ slug ];
			}

			return {
				...state,
				widgetStates,
			};
		}

		default: {
			return state;
		}
	}
};

export const resolvers = {};

export const selectors = {
	/**
	 * Checks if a widget has been registered with a given slug.
	 *
	 * Returns `true` if the widget area has been registered.
	 * Returns `false` if the widget area has NOT been registered.
	 *
	 * @since 1.9.0
	 *
	 * @param {Object} state Data store's state.
	 * @param {string} slug  Widget's slug.
	 * @return {boolean} `true`/`false` based on whether widget has been registered.
	 */
	isWidgetRegistered( state, slug ) {
		const { widgets } = state;

		return widgets[ slug ] !== undefined;
	},

	/**
	 * Returns all widgets registered for a given widget area.
	 *
	 * Returns an array of all widgets for a given area.
	 * The widgets are returned in order of their priority, so can be rendered in
	 * the order provided by the selector.
	 *
	 * @since 1.9.0
	 *
	 * @param {Object} state          Data store's state.
	 * @param {string} widgetAreaSlug Widget context to get areas for.
	 * @return {Array} An ordered array of widgets for this area.
	 */
	getWidgets( state, widgetAreaSlug ) {
		invariant( widgetAreaSlug, 'widgetAreaSlug is required.' );

		const { areaAssignments, widgets } = state;

		return Object.values( widgets )
			.filter( ( widget ) =>
				areaAssignments[ widgetAreaSlug ]?.includes( widget.slug )
			)
			.sort( ( a, b ) => a.priority - b.priority );
	},

	/**
	 * Returns a single widget, by slug.
	 *
	 * @since 1.11.0
	 *
	 * @param {Object} state Data store's state.
	 * @param {string} slug  Widget slug.
	 * @return {Object|null} A widget object, if one exists.
	 */
	getWidget( state, slug ) {
		invariant( slug, 'slug is required to get a widget.' );

		return state.widgets[ slug ] || null;
	},

	/**
	 * Returns the state data of a widget by its slug.
	 *
	 * Used internally by the WidgetAreaRenderer component to recognize
	 * widgets in special states.
	 *
	 * @since 1.25.0
	 * @private
	 *
	 * @param {Object} state Data store's state.
	 * @param {string} slug  Widget slug.
	 * @return {Object|null} Object with `Component` and `metadata` properties,
	 *                       if the widget has a special state, or `null`.
	 */
	getWidgetState( state, slug ) {
		return state.widgetStates[ slug ] || null;
	},

	/**
	 * Returns all widget states.
	 *
	 * @since 1.28.0
	 * @private
	 *
	 * @param {Object} state Data store's state.
	 * @return {Object} Widget states, keyed by slug, with a value containing the component and metadata.
	 */
	getWidgetStates( state ) {
		return state.widgetStates;
	},
};

export default {
	initialState,
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
};
