/**
 * `core/widgets` data store: widget tests.
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
 * Internal dependencies
 */
import {
	createTestRegistry,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import { render } from '../../../../../tests/js/test-utils';
import { CORE_WIDGETS } from './constants';

describe( 'core/widgets Widgets', () => {
	let registry;
	let store;

	beforeEach( () => {
		registry = createTestRegistry();
		store = registry.stores[ CORE_WIDGETS ].store;
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'actions', () => {
		describe( 'assignWidget', () => {
			it( 'should assign widgets to a widget area', () => {
				const WidgetComponent = () => {
					return <div>Foo bar!</div>;
				};
				const AnotherWidgetComponent = () => {
					return <div>Howdy friend!</div>;
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'dashboard-header', {
						title: 'Dashboard Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'boxes',
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );

				// Register all the widgets.
				const slugOne = 'one';
				const settingsOne = {
					Component: WidgetComponent,
					priority: 5,
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( slugOne, settingsOne );

				const slugTwo = 'two';
				const settingsTwo = {
					Component: WidgetComponent,
					priority: 10,
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( slugTwo, settingsTwo );

				const slugThree = 'three';
				const settingsThree = {
					Component: AnotherWidgetComponent,
					priority: 500,
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( slugThree, settingsThree );

				// Assign all widgets to the widget area.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( slugOne, 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( slugTwo, 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( slugThree, 'dashboard-header' );

				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboard-header' );

				expect( widgets ).toHaveLength( 3 );
				expect( widgets ).toMatchObject( [
					{ ...settingsOne, slug: slugOne },
					{ ...settingsTwo, slug: slugTwo },
					{ ...settingsThree, slug: slugThree },
				] );
			} );

			it( 'should allow assignment of non-registered widgets', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'dashboard-header', {
						title: 'Dashboard Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'boxes',
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );

				// Assign all widgets to the widget area.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'slugOne', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'slugTwo', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'slugThree', 'dashboard-header' );

				const state = store.getState();

				expect(
					state.areaAssignments[ 'dashboard-header' ].includes(
						'slugOne'
					)
				).toEqual( true );
				expect(
					state.areaAssignments[ 'dashboard-header' ].includes(
						'slugTwo'
					)
				).toEqual( true );
				expect(
					state.areaAssignments[ 'dashboard-header' ].includes(
						'slugThree'
					)
				).toEqual( true );
			} );

			it( 'should allow assignment of non-registered widget areas', () => {
				// Assign all widgets to the widget area.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'testOne', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'testTwo', 'dashboard-header' );

				const state = store.getState();

				expect(
					state.areaAssignments[ 'dashboard-header' ].includes(
						'testOne'
					)
				).toEqual( true );
				expect(
					state.areaAssignments[ 'dashboard-header' ].includes(
						'testTwo'
					)
				).toEqual( true );
			} );
		} );

		describe( 'registerWidget', () => {
			const slug = 'widget-spinner';
			const WidgetComponent = ( props ) => {
				return <div>Hello { props.children }!</div>;
			};

			it( 'requires a component to be provided', () => {
				expect( () =>
					registry.dispatch( CORE_WIDGETS ).registerWidget( slug )
				).toThrow( 'component is required to register a widget.' );
			} );

			it( 'requires a valid width to be provided', () => {
				expect( () =>
					registry.dispatch( CORE_WIDGETS ).registerWidget( slug, {
						Component: WidgetComponent,
						width: 'HUUGE',
					} )
				).toThrow( 'Widget width should be one of' );
			} );

			it( 'registers the component with the given settings and component', () => {
				registry.dispatch( CORE_WIDGETS ).registerWidget( slug, {
					Component: WidgetComponent,
					priority: 11,
				} );

				expect( store.getState().widgets[ slug ].Component ).toEqual(
					WidgetComponent
				);
				expect( store.getState().widgets[ slug ].priority ).toEqual(
					11
				);

				// Ensure we can render a component with the widget's component, verifying it's still a
				// usable React component.
				const { Component } = store.getState().widgets[ slug ];
				const { container } = render( <Component>world</Component> );
				expect( container.firstChild ).toMatchSnapshot();
			} );

			it( 'does not overwrite an existing widget', () => {
				const WidgetOne = () => {
					return <div>Hello world!</div>;
				};
				const WidgetOneRedone = () => {
					return <div>Goodbye you!</div>;
				};
				registry.dispatch( CORE_WIDGETS ).registerWidget( slug, {
					Component: WidgetOne,
				} );

				registry.dispatch( CORE_WIDGETS ).registerWidget( slug, {
					Component: WidgetOneRedone,
				} );
				expect( console ).toHaveWarnedWith(
					`Could not register widget with slug "${ slug }". Widget "${ slug }" is already registered.`
				);

				// Ensure original widget's component is registered.
				expect( store.getState().widgets[ slug ].Component ).toEqual(
					WidgetOne
				);
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getWidgets', () => {
			it( 'requires a widgetAreaSlug', () => {
				expect( () => {
					registry.select( CORE_WIDGETS ).getWidgets();
				} ).toThrow( 'widgetAreaSlug is required.' );
			} );

			it( 'should return an empty array when no widgets have been registered', () => {
				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboardHeader' );

				expect( widgets ).toEqual( [] );
			} );

			it( "should return all widgets for a given widgetAreaSlug after they're registered", () => {
				const PageViews = () => {
					return <div>Ten people viewed your page!</div>;
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'dashboard-header', {
						title: 'Dashboard Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'boxes',
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'PageViews', {
					Component: PageViews,
				} );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'PageViews', 'dashboard-header' );

				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboard-header' );

				expect( widgets ).toHaveLength( 1 );
			} );

			it( 'should return widgets in the correct priority', () => {
				const WidgetComponent = () => {
					return <div>Foo bar!</div>;
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'dashboard-header', {
						title: 'Dashboard Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'boxes',
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );

				// Register all the widgets.
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'lowest', {
					Component: WidgetComponent,
					priority: 5,
				} );
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'mediumOne', {
					Component: WidgetComponent,
					priority: 10,
				} );
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'mediumTwo', {
					Component: WidgetComponent,
					priority: 10,
				} );
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'highest', {
					Component: WidgetComponent,
					priority: 500,
				} );

				// Assign all widgets to the widget area.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'lowest', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'mediumOne', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'mediumTwo', 'dashboard-header' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'highest', 'dashboard-header' );

				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboard-header' );

				expect( widgets ).toHaveLength( 4 );
				expect( widgets[ 0 ].slug ).toEqual( 'lowest' );
				expect( widgets[ 1 ].slug ).toEqual( 'mediumOne' );
				expect( widgets[ 2 ].slug ).toEqual( 'mediumTwo' );
				expect( widgets[ 3 ].slug ).toEqual( 'highest' );
			} );

			it( 'should not return widgets that have been assigned but not registered', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'PageViews', 'dashboard-header' );

				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboard-header' );

				expect( widgets ).toHaveLength( 0 );
			} );

			it( 'should return widgets that have been assigned before they were registered, once they have been registered', () => {
				const PageViews = () => {
					return (
						<div>
							Only one person viewed your page, and it was you :-(
						</div>
					);
				};
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'dashboard-header', 'dashboard' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'PageViews', 'dashboard-header' );
				registry.dispatch( CORE_WIDGETS ).registerWidget( 'PageViews', {
					Component: PageViews,
				} );

				const widgets = registry
					.select( CORE_WIDGETS )
					.getWidgets( 'dashboard-header' );

				expect( widgets ).toHaveLength( 1 );
			} );
		} );

		describe( 'isWidgetRegistered', () => {
			it( 'returns true if the widget is registered', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( 'TestWidget', {
						Component: () => {
							return <div>Hello test.</div>;
						},
					} );

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetRegistered( 'TestWidget' )
				).toEqual( true );
			} );

			it( 'returns false if the widget is not registered', () => {
				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( 'NotRealWidget' )
				).toEqual( false );
			} );
		} );

		describe( 'getWidget', () => {
			it( 'returns a widget if one exists', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( 'TestWidget', {
						Component: () => {
							return <div>Hello test.</div>;
						},
					} );

				expect(
					registry.select( CORE_WIDGETS ).getWidget( 'TestWidget' )
				).toMatchSnapshot();
			} );

			it( 'returns null if the widget is not registered', () => {
				expect(
					registry.select( CORE_WIDGETS ).getWidget( 'NotRealWidget' )
				).toEqual( null );
			} );
		} );
	} );
} );
