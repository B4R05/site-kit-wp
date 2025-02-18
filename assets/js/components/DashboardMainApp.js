/**
 * DashboardMainApp component.
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
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	CONTEXT_MAIN_DASHBOARD_TRAFFIC,
	CONTEXT_MAIN_DASHBOARD_CONTENT,
	CONTEXT_MAIN_DASHBOARD_SPEED,
	CONTEXT_MAIN_DASHBOARD_MONETIZATION,
} from '../googlesitekit/widgets/default-contexts';
import Header from './Header';
import WidgetContextRenderer from '../googlesitekit/widgets/components/WidgetContextRenderer';
import EntitySearchInput from './EntitySearchInput';
import DateRangeSelector from './DateRangeSelector';
import HelpMenu from './help/HelpMenu';

function DashboardMainApp() {
	return (
		<Fragment>
			<Header>
				<EntitySearchInput />
				<DateRangeSelector />
				<HelpMenu />
			</Header>
			<WidgetContextRenderer slug={ CONTEXT_MAIN_DASHBOARD_TRAFFIC } />
			<WidgetContextRenderer slug={ CONTEXT_MAIN_DASHBOARD_CONTENT } />
			<WidgetContextRenderer slug={ CONTEXT_MAIN_DASHBOARD_SPEED } />
			<WidgetContextRenderer
				slug={ CONTEXT_MAIN_DASHBOARD_MONETIZATION }
			/>
		</Fragment>
	);
}

export default DashboardMainApp;
