import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _get from 'lodash/get';
import { hideError } from './actionsError';
import { Icon } from "@airtable/blocks/ui";

export default function GlobalError() {
	const dispatch = useDispatch();
	const errorReducer = useSelector((state) => {
	    return state.error
	});

	if (!_get(errorReducer, 'showError')) {
		return null;
	}

	const handleOnCloseClick = () => {
		dispatch(hideError());
	}

	const {
		message
	} = errorReducer;

	return (
		<div style={{
			padding: 8,
			background: '#f8d7da',
			display: 'flex',
			justifyContent: 'space-between'
		}}>
			<div>{message}</div>
			<div
				onClick={() => handleOnCloseClick()}
				style={{
					cursor: 'pointer'
				}}
			>
				<Icon name="x" size={16} />
			</div>

		</div>
	)
}