import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPages, fetchPayPalData, setStartDate } from '../actionsApp';
import moment from 'moment';

export default function PayPalApi() {
	const dispatch = useDispatch();
	const appReducer = useSelector((state) => {
	    return state.app
	});
	const {
		startDate
	} = appReducer;

	const getPayPalData = () => {
		dispatch(fetchAllPages(startDate));
	}
	
	const [focused, setFocused] = useState(false);
	const handleFocusChange = () => {
		setFocused(!focused)
	}
	const handleDateChange2 = (date) => {
		dispatch(setStartDate(date))
	}

	return (
		<div style={{
			padding: 4,
			borderRadius: 8,
			border: '1px solid #EEE'
		}}>
			<div>
				<h3>Fetch data from PayPal</h3>
			</div>
			<div>
				<div>Start Date</div>
				<div>
					<SingleDatePicker
						isOutsideRange= {()=> false }
						onFocusChange={handleFocusChange}
						onDateChange={(d) => handleDateChange2(d)}
						date={startDate}
						focused={focused}
						displayFormat={() => moment.localeData().longDateFormat('L')}
					    monthFormat={'MMMM YYYY'}
					    small={true}
					/>
				</div>
			</div>
			<Button
	            onClick={getPayPalData}
	        >
	            Fetch
	        </Button>
	    </div>
	)
}
