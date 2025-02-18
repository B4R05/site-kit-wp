/**
 * SettingsOverview component.
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
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { CORE_LOCATION } from '../../googlesitekit/datastore/location/constants';
import Layout from '../layout/Layout';
import { Grid, Cell, Row } from '../../material-components';
import OptIn from '../OptIn';
import ResetButton from '../ResetButton';
import UserInputPreview from '../user-input/UserInputPreview';
import { USER_INPUT_QUESTIONS_LIST } from '../user-input/util/constants';
import UserInputSettings from '../notifications/UserInputSettings';
import { useFeature } from '../../hooks/useFeature';
import { trackEvent } from '../../util';
import SettingsPlugin from './SettingsPlugin';
const { useSelect, useDispatch } = Data;

export default function SettingsAdmin() {
	const userInputEnabled = useFeature( 'userInput' );
	const isUserInputCompleted = useSelect(
		( select ) =>
			userInputEnabled &&
			select( CORE_USER ).getUserInputState() === 'completed'
	);
	const userInputURL = useSelect( ( select ) =>
		select( CORE_SITE ).getAdminURL( 'googlesitekit-user-input' )
	);

	const { navigateTo } = useDispatch( CORE_LOCATION );
	const goTo = ( questionIndex = 1 ) => {
		const questionSlug = USER_INPUT_QUESTIONS_LIST[ questionIndex - 1 ];
		if ( questionSlug ) {
			trackEvent( 'user_input', 'settings_edit', questionSlug );

			navigateTo(
				addQueryArgs( userInputURL, {
					question: questionSlug,
					redirect_url: global.location.href,
					single: 'settings', // Allows the user to edit a single question then return to the settings page.
				} )
			);
		}
	};

	useEffect( () => {
		if ( isUserInputCompleted ) {
			trackEvent( 'user_input', 'settings_view' );
		}
	}, [ isUserInputCompleted ] );

	return (
		<Row>
			{ userInputEnabled && (
				<Cell size={ 12 }>
					{ isUserInputCompleted && (
						<Layout>
							<div className="googlesitekit-settings-module googlesitekit-settings-module--active googlesitekit-settings-user-input">
								<Grid>
									<Row>
										<Cell size={ 12 }>
											<h3 className="googlesitekit-heading-4 googlesitekit-settings-module__title">
												{ __(
													'Your site goals',
													'google-site-kit'
												) }
											</h3>
											<p>
												{ __(
													'Based on your responses, Site Kit will show you metrics and suggestions that are specific to your site to help you achieve your goals',
													'google-site-kit'
												) }
											</p>
										</Cell>
									</Row>

									<UserInputPreview goTo={ goTo } noFooter />
								</Grid>
							</div>
						</Layout>
					) }
					{ ! isUserInputCompleted && (
						<UserInputSettings isDismissable={ false } />
					) }
				</Cell>
			) }

			<Cell size={ 12 }>
				<Layout>
					<div className="googlesitekit-settings-module googlesitekit-settings-module--active">
						<Grid>
							<Row>
								<Cell size={ 12 }>
									<h3 className="googlesitekit-heading-4 googlesitekit-settings-module__title">
										{ __(
											'Plugin Status',
											'google-site-kit'
										) }
									</h3>
								</Cell>
								<Cell size={ 12 }>
									<div className="googlesitekit-settings-module__meta-items">
										<p className="googlesitekit-settings-module__status">
											{ __(
												'Site Kit is connected',
												'google-site-kit'
											) }
											<span className="googlesitekit-settings-module__status-icon googlesitekit-settings-module__status-icon--connected" />
										</p>
									</div>
								</Cell>
							</Row>
						</Grid>

						<footer className="googlesitekit-settings-module__footer">
							<Grid>
								<Row>
									<Cell size={ 12 }>
										<ResetButton />
									</Cell>
								</Row>
							</Grid>
						</footer>
					</div>
				</Layout>
			</Cell>

			<Cell size={ 12 }>
				<SettingsPlugin />
			</Cell>

			<Cell size={ 12 }>
				<Layout
					className="googlesitekit-settings-meta"
					title={ __( 'Tracking', 'google-site-kit' ) }
					header
					fill
				>
					<div className="googlesitekit-settings-module googlesitekit-settings-module--active">
						<Grid>
							<Row>
								<Cell size={ 12 }>
									<div className="googlesitekit-settings-module__meta-items">
										<div className="googlesitekit-settings-module__meta-item googlesitekit-settings-module__meta-item--nomargin">
											<OptIn />
										</div>
									</div>
								</Cell>
							</Row>
						</Grid>
					</div>
				</Layout>
			</Cell>
		</Row>
	);
}
