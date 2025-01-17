/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import { setOutput } from '@actions/core';

/**
 * Internal dependencies
 */
import { Logger } from '../core/logger';
import { buildProjectGraph } from './lib/project-graph';
import { getFileChanges } from './lib/file-changes';
import { createJobsForChanges } from './lib/job-processing';
import { isGithubCI } from '../core/environment';

const program = new Command( 'ci-jobs' )
	.description(
		'Generates CI workflow jobs based on the changes since the base ref.'
	)
	.argument(
		'<base-ref>',
		'Base ref to compare the current ref against for change detection.'
	)
	.action( async ( baseRef: string ) => {
		Logger.startTask( 'Parsing Project Graph', true );
		const projectGraph = buildProjectGraph();
		Logger.endTask( true );

		Logger.startTask( 'Pulling File Changes', true );
		const fileChanges = getFileChanges( projectGraph, baseRef );
		Logger.endTask( true );

		Logger.startTask( 'Creating Jobs', true );
		const jobs = await createJobsForChanges( projectGraph, fileChanges, {
			commandVars: {
				baseRef,
			},
		} );
		Logger.endTask( true );

		if ( isGithubCI() ) {
			setOutput( 'lint-jobs', JSON.stringify( jobs.lint ) );
			setOutput( 'test-jobs', JSON.stringify( jobs.test ) );
			return;
		}

		if ( jobs.lint.length > 0 ) {
			Logger.notice( 'Lint Jobs' );
			for ( const job of jobs.lint ) {
				Logger.notice( `-  ${ job.projectName } - ${ job.command }` );
			}
		} else {
			Logger.notice( 'No lint jobs to run.' );
		}

		if ( jobs.test.length > 0 ) {
			Logger.notice( 'Test Jobs' );
			for ( const job of jobs.test ) {
				Logger.notice( `-  ${ job.projectName } - ${ job.name }` );
			}
		} else {
			Logger.notice( 'No test jobs to run.' );
		}
	} );

export default program;
