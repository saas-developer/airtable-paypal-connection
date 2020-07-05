import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeApp, toggleApiKeys } from '../actionsApp';
import ApiKeys from './ApiKeys';
import { Box, Button } from "@airtable/blocks/ui";

export default function ApiKeysContainer() {
    const dispatch = useDispatch();
    const appReducer = useSelector((state) => {
        return state.app
    });

	useEffect(() => {
        dispatch(initializeApp())
    }, [])

    const {
    	clientId,
    	secret,
    	showApiKeys
    } = appReducer;

    const toggleApiKeys2 = () => {
		dispatch(toggleApiKeys())
    }

	return (
		<div>
			<Box
				border="thick"
				backgroundColor="white"
				borderRadius="large"
				padding={2}
				overflow="hidden"
				style={{
					marginBottom: 12
				}}
			>
				<div style={{
					display: 'flex',
					alignItems: 'center'
				}}>
					<div><h3>API Keys</h3></div>
					<div>
						<Button
							variant="secondary"
							size="small"
							onClick={() => toggleApiKeys2()}>
						    {
						    	showApiKeys ? 'Hide' : 'Show'
						    }
						</Button>
					</div>
				</div>
				{
					showApiKeys &&
					<div>
						<div>
							<ApiKeys />
						</div>
					</div>
				}
			</Box>
			
	    </div>
	)
}
