import _get from 'lodash/get';
import _findIndex from 'lodash/findIndex';
import _cloneDeep from 'lodash/cloneDeep';

export function getItemDetails(txn) {
	const cartItemDetails = _get(txn, 'cart_info.item_details[0]');
	let amount = Number(_get(txn, 'transaction_info.transaction_amount.value', '0'));
	if (isNaN(amount)) {
		amount = 0;
	}

	let transaction_amount = Number(_get(txn, 'transaction_info.transaction_amount.value', '0'));
	if (isNaN(transaction_amount)) {
		transaction_amount = 0;
	}

	// cart info
	const cart_info = {
		item_code: _get(cartItemDetails, 'item_code'),
		item_description: _get(cartItemDetails, 'item_description'),
		item_name: _get(cartItemDetails, 'item_name'),
		item_quantity: _get(cartItemDetails, 'item_quantity'),
		// amount,
		// currency: _get(txn, 'transaction_info.transaction_amount.currency_code'),
		// fee_amount: _get(txn, 'transaction_info.fee_amount.value'),
		// fee_currency: _get(txn, 'transaction_info.fee_amount.currency_code'),
	};

	const payerInfo = {
		email_address: _get(txn, 'payer_info.email_address'),
		payer_name: _get(txn, 'payer_info.payer_name.alternate_full_name'),
		country_code: _get(txn, 'payer_info.country_code'),
	}

	// const shipping_info = {
	// 	name: _get(txn, 'shipping_info.name'),
	// }
	const txn_info = {
		transaction_amount,
		transaction_currency: _get(txn, 'transaction_info.transaction_amount.currency_code'),
		transaction_updated_date: _get(txn, 'transaction_info.transaction_updated_date'),
	}

	return {
		...cart_info,
		...payerInfo,
		// ...shipping_info
		...txn_info
	}
}

export function formatTransactions(transactions) {
	let {
		transactions: editedTransactions,
		formattedTransactions
	} = formatTransactionsBillingAgreements(transactions);
	
	formattedTransactions = formatTransactionsLast(editedTransactions, formattedTransactions);

	return formattedTransactions;
}

function formatTransactionsLast(transactions, formattedTransactions) {
	const txnDetails = transactions.transaction_details;

	for (let i = 0; i < txnDetails.length; i++) {
		const txnDetail = txnDetails[i];
		const transaction_info = txnDetail.transaction_info;
		const transaction_id = transaction_info.transaction_id;
		const paypal_reference_id = transaction_info.paypal_reference_id;

		const index = _findIndex(formattedTransactions, (formattedTxn) => {
			return _get(formattedTxn, 'parentTxn.transaction_info.transaction_id') == paypal_reference_id;
		});

		if (index === -1) {
			formattedTransactions.push({
				parentTxn: txnDetail,
				childTxns: []
			})
		} else {
			formattedTransactions[index].childTxns.push(txnDetail);
		}
	}

	console.log('formattedTransactions ', formattedTransactions);
	return formattedTransactions;
}

// `paypal_reference_id_type` enum('ODR','TXN','SUB','PAP','') NOT NULL,
function formatTransactionsBillingAgreements(transactions) {
	debugger; // eslint-disable-line
	let editedTransactions = _cloneDeep(transactions);
	console.log('editedTransactions ', editedTransactions);
	const formattedTransactions = [];

	const txnDetails = transactions.transaction_details;

	for (let i = 0; i < txnDetails.length; i++) {
		const txnDetail = txnDetails[i];
		const transaction_info = txnDetail.transaction_info;
		const transaction_id = transaction_info.transaction_id;
		const paypal_reference_id = transaction_info.paypal_reference_id;
		const paypal_reference_id_type = transaction_info.paypal_reference_id_type;

		// SUB is a parent
		if (paypal_reference_id_type === 'SUB' || paypal_reference_id_type === 'PAP') {
			// Add as a parent		
			formattedTransactions.push({
				parentTxn: txnDetail,
				childTxns: []
			});

			// Remove this record from the transactions array
			editedTransactions.transaction_details.splice(i, 1);
		}
	}

	console.log('formattedTransactions ', formattedTransactions);
	return {
		transactions: editedTransactions,
		formattedTransactions
	}
}

export function flattenTxns(txns) {
	const flatTxns = [];

	for (let i = 0; i < txns.length; i++) {
		const txn = txns[i];
		flatTxns.push(convertTxnToAirtableRecord(txn.parentTxn, true));

		for (let j = 0; j < txn.childTxns.length; j++) {
			flatTxns.push(convertTxnToAirtableRecord(txn.childTxns[j]))
		}
	}
	return flatTxns;
}

export function convertTxnToAirtableRecord(txn, isParent) {
	const itemDetails = getItemDetails(txn);
	itemDetails.txn_type = isParent ? 'parent' : 'child';
	return itemDetails;
}


