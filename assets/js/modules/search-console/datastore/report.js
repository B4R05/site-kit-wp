/**
 * `modules/search-console` data store: report.
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
import isPlainObject from 'lodash/isPlainObject';

/**
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../../googlesitekit/datastore/user/constants';
import { CORE_SITE } from '../../../googlesitekit/datastore/site/constants';
import { DATE_RANGE_OFFSET, MODULES_SEARCH_CONSOLE } from './constants';
import { stringifyObject } from '../../../util';
import { createFetchStore } from '../../../googlesitekit/data/create-fetch-store';
import {
	isValidDateRange,
	isValidStringularItems,
} from '../../../util/report-validation';
const { createRegistrySelector } = Data;

const fetchGetReportStore = createFetchStore( {
	baseName: 'getReport',
	storeName: MODULES_SEARCH_CONSOLE,
	controlCallback: ( { options } ) => {
		return API.get(
			'modules',
			'search-console',
			'searchanalytics',
			options
		);
	},
	reducerCallback: ( state, report, { options } ) => {
		return {
			...state,
			reports: {
				...state.reports,
				[ stringifyObject( options ) ]: report,
			},
		};
	},
	argsToParams: ( options ) => {
		return { options };
	},
	validateParams: ( { options } = {} ) => {
		invariant(
			isPlainObject( options ),
			'Options for Search Console report must be an object.'
		);
		invariant(
			isValidDateRange( options ),
			'Either date range or start/end dates must be provided for Search Console report.'
		);

		const { dimensions } = options;
		if ( dimensions ) {
			invariant(
				isValidStringularItems( dimensions ),
				'Dimensions for Search Console report must be either a string or an array of strings'
			);
		}
	},
} );

const baseInitialState = {
	reports: {},
};

const baseResolvers = {
	*getReport( options = {} ) {
		const registry = yield Data.commonActions.getRegistry();
		const existingReport = registry
			.select( MODULES_SEARCH_CONSOLE )
			.getReport( options );

		// If there are already alerts loaded in state, consider it fulfilled
		// and don't make an API request.
		if ( existingReport ) {
			return;
		}

		yield fetchGetReportStore.actions.fetchGetReport( options );
	},
};

const baseSelectors = {
	/**
	 * Gets a Search Console report for the given options.
	 *
	 * @since 1.15.0
	 *
	 * @param {Object}         state                       Data store's state.
	 * @param {Object}         options                     Options for generating the report.
	 * @param {string}         options.startDate           Required, unless dateRange is provided. Start date to query report data for as YYYY-mm-dd.
	 * @param {string}         options.endDate             Required, unless dateRange is provided. End date to query report data for as YYYY-mm-dd.
	 * @param {string}         options.dateRange           Required, alternatively to startDate and endDate. A date range string such as 'last-28-days'.
	 * @param {boolean}        [options.compareDateRanges] Optional. Only relevant with dateRange. Default false.
	 * @param {Array.<string>} [options.dimensions]        Optional. List of {@link https://developers.google.com/webmaster-tools/search-console-api-original/v3/searchanalytics/query#dimensionFilterGroups.filters.dimension|dimensions} to group results by. Default an empty array.
	 * @param {string}         [options.url]               Optional. URL to get a report for only this URL. Default an empty string.
	 * @param {number}         [options.limit]             Optional. Maximum number of entries to return. Default 1000.
	 * @return {(Array.<Object>|undefined)} A Search Console report; `undefined` if not loaded.
	 */
	getReport( state, options = {} ) {
		const { reports } = state;

		return reports[ stringifyObject( options ) ];
	},

	/**
	 * Determines whether the Search Console is still gathering data or not.
	 *
	 * @since n.e.x.t
	 *
	 * @return {boolean|undefined} Returns TRUE if gathering data, otherwise FALSE. If the request is still being resolved, returns undefined.
	 */
	isGatheringData: createRegistrySelector( ( select ) => () => {
		const rangeArgs = {
			compare: true,
			offsetDays: DATE_RANGE_OFFSET,
		};

		const url = select( CORE_SITE ).getCurrentEntityURL();
		const { compareStartDate: startDate, endDate } = select(
			CORE_USER
		).getDateRangeDates( rangeArgs );

		const args = {
			dimensions: 'date',
			startDate,
			endDate,
		};

		if ( url ) {
			args.url = url;
		}

		const report = select( MODULES_SEARCH_CONSOLE ).getReport( args );
		if ( report === undefined ) {
			return undefined;
		}

		if ( ! Array.isArray( report ) || ! report.length ) {
			return true;
		}

		return false;
	} ),
};

const store = Data.combineStores( fetchGetReportStore, {
	initialState: baseInitialState,
	resolvers: baseResolvers,
	selectors: baseSelectors,
} );

export const initialState = store.initialState;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export default store;
