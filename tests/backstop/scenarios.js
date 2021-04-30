const parser = require( '@babel/parser' );
const traverse = require( '@babel/traverse' ).default;
const storybookHost = require( './detect-storybook-host' );
const rootURL = `${ storybookHost }iframe.html?id=`;
const storybookStories = require( '../../.storybook/storybook-data' );
const glob = require( 'glob' );
const fs = require( 'fs' );
const csf = require( '@componentdriven/csf' );

const storyFiles = glob.sync( './assets/js/**/*.stories.js' );
storyFiles.forEach( ( storyFile ) => {
	const code = fs.readFileSync( storyFile ).toString();
	const ast = parser.parse( code, { sourceType: 'module', plugins: [ 'jsx' ] } );

	const stories = {};
	let defaultTitle = '';
	let defaultComponent = '';

	traverse( ast, {
		ExportDefaultDeclaration: ( { node } ) => {
			const properties = {};
			node.declaration.properties.forEach( ( property ) => {
				properties[ property.key.name ] = property.value.value || property.value.name;
			} );

			defaultTitle = properties?.title || '';
			defaultComponent = properties?.component || '';
		},
		AssignmentExpression: ( { node } ) => {
			if ( node.right.type === 'StringLiteral' && node.left.property.name === 'storyName' ) {
				stories[ node.left.object.name ] = stories[ node.left.object.name ] || {};
				stories[ node.left.object.name ][ node.left.property.name ] = node.right.value;
			} else if ( node.right.type === 'ObjectExpression' ) {
				const properties = {};
				node.right.properties.forEach( ( property ) => {
					properties[ property.key.name ] = property.value.value;
				} );

				stories[ node.left.object.name ] = stories[ node.left.object.name ] || {};
				stories[ node.left.object.name ][ node.left.property.name ] = properties;
			}
		},
	} );

	// Export to storybook compatible stories.json format.
	const finalStories = {};
	for ( const [ key, value ] of Object.entries( stories ) ) {
		const storyID = csf.toId( defaultTitle, value.storyName ); // eslint-disable-line

		finalStories[ storyID ] = { ...value };
		finalStories[ storyID ].key = key;
		finalStories[ storyID ].id = storyID;
		finalStories[ storyID ].name = value.storyName;
		finalStories[ storyID ].kind = defaultTitle;
		finalStories[ storyID ].story = value.storyName;
		finalStories[ storyID ].scenarios = value.scenario || {};
		finalStories[ storyID ].component = defaultComponent;
		finalStories[ storyID ].parameters = {
			__id: storyID,
		};
		if ( finalStories[ storyID ].args ) {
			finalStories[ storyID ].parameters.__isArgsStory = true;
		}

		if ( value?.scenario && Object.keys( value?.scenario ).length > 0 && value?.scenario?.constructor === Object ) {
			// Merge storybook stories
			storybookStories.push( {
				id: storyID,
				kind: defaultTitle,
				name: value.storyName,
				story: 'VRT Story',
				parameters: {
					fileName: storyFile,
					options: { ...value.scenario },
				},
			} );
		}
	}

	console.log( JSON.stringify( storybookStories ) ); // eslint-disable-line
} );

module.exports = storybookStories.map( ( story ) => {
	return {
		label: `${ story.kind }/${ story.name }`,
		url: `${ rootURL }${ story.id }`,
		readySelector: story.parameters.options.readySelector,
		hoverSelector: story.parameters.options.hoverSelector,
		clickSelector: story.parameters.options.clickSelector,
		clickSelectors: story.parameters.options.clickSelectors,
		postInteractionWait: story.parameters.options.postInteractionWait,
		delay: story.parameters.options.delay,
		onReadyScript: story.parameters.options.onReadyScript,
		misMatchThreshold: story.parameters.options.misMatchThreshold,
	};
} );
