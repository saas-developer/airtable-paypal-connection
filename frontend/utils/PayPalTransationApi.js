import _get from 'lodash/get';
import _find from 'lodash/find';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { globalConfig } from '@airtable/blocks';

const PAYPAL_ACCESS_TOKEN_URL = 'https://api.paypal.com/v1/oauth2/token';
const PAYPAL_URL = 'https://api.paypal.com/v1/reporting/transactions?start_date=2020-06-01T00:00:00Z&end_date=2020-06-30T00:00:00Z&fields=all';

export async function getAccessToken() {
	const clientId = globalConfig.get(['paypal', 'apiKeys', 'base64Key'])

	try {
		const accessTokenResponse = await fetch(PAYPAL_ACCESS_TOKEN_URL, {
			headers: {
				Authorization: `Basic ${clientId}`,
				'Content-Type': 'application/x-www-form-url-encoded'
			},
			method: 'POST',
			body: 'grant_type=client_credentials&response_type=token'
		});
		if (!accessTokenResponse.ok) {
			throw accessTokenResponse;
		}
		
		const accessTokenJson = await accessTokenResponse.json();
		const accessToken = accessTokenJson.access_token;
		return accessToken;
	} catch (e) {
		const error = new Error('ACCESS_TOKEN_ERROR');
		error.message = 'Error in retreiving access token';
		throw error;
	}
}

function getPayPalDate(date) {
	let newDate = moment(date);
	let paypalDate = newDate.format('YYYY-MM-DD');
	paypalDate = `${paypalDate}T00:00:00Z`;
	return paypalDate;
}

function getPayPalDateFiveDaysFromStart(startDate) {
	let momentStartDate = moment(startDate);
	let momentEndDate = momentStartDate.add(5, 'd');
	let momentLimitDate = moment(new Date()).add(1, 'd');
	
	let endDate = momentEndDate;
	if (momentEndDate.isAfter(momentLimitDate)) {
		endDate = momentLimitDate;
	}

	let paypalDate = endDate.format('YYYY-MM-DD');
	paypalDate = `${paypalDate}T00:00:00Z`
	return paypalDate;
}

function shouldContinue(startDate, endDate) {
	let momentStartDate = moment(startDate);
	let momentEndDate = moment(endDate);
	let momentLimitDate = moment(new Date());

	if (momentEndDate.isSameOrAfter(momentLimitDate, 'day')) {
		return false;
	}
	return true;
}

export async function getAllPages(startDate) {
	let paypalStartDate = getPayPalDate(startDate);
	let paypalEndDate = getPayPalDateFiveDaysFromStart(startDate);

	let done = false;
	let allData;

	try {
		while(!done) {
			let fiveDaysData = await getDataForFiveDays(paypalStartDate, paypalEndDate);
			allData = updateAllPagesData(allData, fiveDaysData);
			if (shouldContinue(paypalStartDate, paypalEndDate)) {
				paypalStartDate = paypalEndDate;
				paypalEndDate = getPayPalDateFiveDaysFromStart(paypalStartDate);
			} else {
				done = true;
				break;
			}
		}

		console.log('allData ', allData);
		return allData;
	} catch (e) {
		throw e;
	}
}

async function getDataForFiveDays(startDate, endDate) {
	console.log('Fetching data from ' + moment(startDate).format('YYYY MMM D') + ' to ' + moment(endDate).format('YYYY MMM D'));
	let allPagesData;
	let done = false;
	let url = getFirstPageUrl(startDate, endDate);

	try {
		let accessToken = await getAccessToken();

		while(!done) {
			let data;
			try {
				data = await getOnePage(url, accessToken);
			} catch (e) {
				const error = new Error('GET_DATA_ERROR');
				error.message = 'Error in fetching data from PayPal';
				throw error;
			}

			allPagesData = updateAllPagesData(allPagesData, data);

			let nextPageUrl = getNextPageUrl(data);

			if (!nextPageUrl) {
				done = true;
			} else {
				url = nextPageUrl;
			}
		}
		console.log('Data for 5 days ', allPagesData);
		return allPagesData;
	} catch (e) {
		throw e;
	}
}

function getFirstPageUrl(startDate, endDate) {
	let url = 'https://api.paypal.com/v1/reporting/transactions?fields=all&page_size=2';
	url = url + `&start_date=${startDate}`;
	url = url + `&end_date=${endDate}`;

	return url;
}

function getNextPageUrl(data) {
	const links = _get(data, 'links');
	const next = _find(links, (link) => {
		return link && link.rel === 'next'
	});
	return _get(next, 'href', '');
}

function updateAllPagesData(allPagesData, data) {
	if (!data) {
		return;
	}
	// First time
	if (!allPagesData) {
		allPagesData = _cloneDeep(data);
	} else {
		const transactionDetails = data.transaction_details;
		allPagesData.transaction_details = allPagesData.transaction_details.concat(transactionDetails);
	}
	return allPagesData;
}

export async function getOnePage(url, accessToken) {
	const txnDetailsResponse = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!txnDetailsResponse.ok) {
		throw txnDetailsResponse;
	}
	const txnDetails = await txnDetailsResponse.json();

	return txnDetails;
}