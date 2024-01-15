/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getSetting } from '@woocommerce/settings';

/**
 * Internal dependencies
 */
import type { AdditionalField } from '../additional-fields/types';
import './style.scss';

const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		heading: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ) => {
	const blockProps = useBlockProps( {
		className: 'wc-block-order-confirmation-additional-fields-wrapper',
	} );

	const additionalFields = getSetting< AdditionalField[] >(
		'checkoutAdditionalFields',
		{}
	);

	if ( Object.entries( additionalFields ).length === 0 ) {
		return null;
	}

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ [ 'core/heading' ] }
				template={ [
					[
						'core/heading',
						{
							level: 3,
							style: { typography: { fontSize: '24px' } },
							content: attributes.heading || '',
							onChangeContent: ( value: string ) =>
								setAttributes( { heading: value } ),
						},
					],
					[
						'woocommerce/order-confirmation-additional-fields',
						{
							lock: {
								remove: true,
							},
						},
					],
					[
						'woocommerce/order-confirmation-additional-information',
						{
							lock: {
								remove: true,
							},
						},
					],
				] }
			/>
		</div>
	);
};

export default Edit;
