/**
 * `modules/search-console` data store
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
import Data from 'googlesitekit-data';
import Modules from 'googlesitekit-modules';
import { MODULES_SEARCH_CONSOLE } from './constants';
import report from './report';
import service from './service';
import properties from './properties';
import { submitChanges, validateCanSubmitChanges } from './settings';

const baseModuleStore = Modules.createModuleStore( 'search-console', {
	storeName: MODULES_SEARCH_CONSOLE,
	settingSlugs: [ 'propertyID', 'ownerID' ],
	adminPage: 'googlesitekit-module-search-console',
	requiresSetup: false,
	submitChanges,
	validateCanSubmitChanges,
} );

const store = Data.combineStores(
	baseModuleStore,
	report,
	service,
	properties
);

export const initialState = store.initialState;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export const registerStore = ( registry ) => {
	registry.registerStore( MODULES_SEARCH_CONSOLE, store );
};

export default store;
