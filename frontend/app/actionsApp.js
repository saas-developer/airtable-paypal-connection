export const APP_BUSY = 'APP_BUSY';
import { base } from '@airtable/blocks';
import _each from 'lodash/each';
import _get from 'lodash/get';
import { getItemDetails, formatTransactions, flattenTxns } from '../utils/TransactionDetails';
import { globalConfig } from '@airtable/blocks';
import * as PaypalTransactionApi from '../utils/PayPalTransationApi';
import { showError, hideError } from './error/actionsError';

export function initializeApp() {
	const paypalApiKeys = globalConfig.get(['paypal', 'apiKeys']) || [];
	return {
		type: 'INITIALIZE_APP',
		payload: {
			paypal: {
				...paypalApiKeys
			}
		}
	}
}

export function toggleApiKeys(value) {
	return {
		type: 'TOOGGLE_API_KEYS',
		payload: value
	}
}

export function fetchAllPages(startDate) {
	return async (dispatch, getState) => {
		dispatch({
		    type: APP_BUSY,
		    payload: {}
		})
		dispatch(hideError());
		let data;
		try {
			 data = await PaypalTransactionApi.getAllPages(startDate);
		} catch (e) {
			const message = e && e.message;
			const errorMessage = message || 'An error occurred when retreiving data from PayPal';
			dispatch(showError(errorMessage));
			return;
		}
		const formattedTransactions = formatTransactions(data);
		const flatTxns = flattenTxns(formattedTransactions);

		for (let i = 0; i < flatTxns.length; i++) {
			try {
				await populateAirtableV2(flatTxns[i]);
			} catch (e) {
				dispatch(showError('An error occurred when populating Airtable'))
			}
		}
	}
}

export function setStartDate(startDate) {
	return {
		type: 'SET_START_DATE',
		payload: {
			paypal: {
				startDate
			}
		}
	}
}

export async function populateAirtableV2(txn) {
	const paypalTable = base.getTableByName('PayPal');
	try {
		await paypalTable.createRecordAsync(txn);
	} catch (e) {
		console.log('e ', e);
	}


}

export async function populateAirtable(txn) {
	const paypalTable = base.getTableByName('PayPal');
	const itemDetails = getItemDetails(txn);

	try {
		await paypalTable.createRecordAsync(itemDetails);
	} catch (e) {
		console.log('e ', e);
	}
}
