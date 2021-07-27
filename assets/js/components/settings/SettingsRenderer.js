/**
 * Settings Renderer component.
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
import { Fragment, useEffect, useState } from '@wordpress/element';
import { useParams } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import ModuleDelegationToggle from '../setup/ModuleDelegationToggle';
const { useSelect, useDispatch } = Data;

export default function SettingsRenderer( { slug } ) {
	const { action, moduleSlug } = useParams();
	const isEditing = action === 'edit';
	const isOpen = moduleSlug === slug;

	const [ initiallyConnected, setInitiallyConnected ] = useState();
	const storeName = useSelect( ( select ) => select( CORE_MODULES ).getModuleStoreName( slug ) );
	const isDoingSubmitChanges = useSelect( ( select ) => select( CORE_MODULES ).isDoingSubmitChanges( slug ) );
	const haveSettingsChanged = useSelect( ( select ) => select( storeName )?.haveSettingsChanged?.() || false );
	const module = useSelect( ( select ) => select( CORE_MODULES ).getModule( slug ) );
	const {
		SettingsEditComponent,
		SettingsViewComponent,
		SettingsSetupIncompleteComponent,
		connected,
	} = module;
	const moduleLoaded = !! module;

	// Store the initial connected state once the module is loaded.
	useEffect( () => {
		if ( moduleLoaded && initiallyConnected === undefined ) {
			setInitiallyConnected( connected );
		}
	}, [ moduleLoaded, initiallyConnected, connected ] );

	// Rollback any temporary selections to saved values if settings have changed and no longer editing.
	const { rollbackSettings } = useDispatch( storeName ) || {};
	useEffect( () => {
		if ( rollbackSettings && haveSettingsChanged && ! isDoingSubmitChanges && ! isEditing ) {
			rollbackSettings();
		}
	}, [ rollbackSettings, haveSettingsChanged, isDoingSubmitChanges, isEditing ] );

	if ( ! isOpen || ! moduleLoaded ) {
		return null;
	} else if ( isOpen && initiallyConnected === false ) {
		return <SettingsSetupIncompleteComponent slug={ slug } />;
	}

	if ( isEditing ) {
		return (
			<Fragment>
				{ module.shareable && (
					<ModuleDelegationToggle module={ module } />
				) }
				{ SettingsEditComponent && <SettingsEditComponent /> }
				{ ( ! SettingsEditComponent && SettingsViewComponent ) && <SettingsViewComponent /> }
			</Fragment>
		);
	}

	if ( SettingsViewComponent ) {
		return <SettingsViewComponent />;
	}

	return null;
}
