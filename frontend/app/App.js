import React, { useEffect } from 'react';
import { loadCSSFromURLAsync, loadCSSFromString } from '@airtable/blocks/ui';
loadCSSFromURLAsync('https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css');
import ApiKeysContainer from './paypal/ApiKeysContainer';
import PayPalApi from './paypal/PayPalApi';
import GlobalError from './error/GlobalError';
import reactDates from '../styles/react-dates';
loadCSSFromString(reactDates);

export default function App() {

    return (
        <div style={{ padding: 20 }}>
        	<GlobalError />
        	<ApiKeysContainer />
            <PayPalApi />
        </div>
    )
}
