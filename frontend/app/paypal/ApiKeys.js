import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeApp } from '../actionsApp';
import { ChoiceToken, Label, InputSynced } from "@airtable/blocks/ui";
import { globalConfig } from '@airtable/blocks';

export default function ApiKeys() {
	const handleApiKeyChange = () => {
		const clientId = globalConfig.get(['paypal', 'apiKeys', 'clientId'])
		const secret = globalConfig.get(['paypal', 'apiKeys', 'secret'])

		const base64EncodedApiKey = btoa(`${clientId}:${secret}`);

		globalConfig.setPathsAsync([
			{ path: ['paypal', 'apiKeys', 'base64Key'], value: base64EncodedApiKey}
		]);
	}

	return (
		<div>
			<div>
				<div><Label>Client ID</Label></div>
				<div>
					<InputSynced
						globalConfigKey={['paypal', 'apiKeys', 'clientId']}
						placeholder="Client ID"
						width="630px"
						onChange={handleApiKeyChange}
					/>
				</div>
			</div>
			<div>
				<div><Label>Secret</Label></div>
				<div>
					<InputSynced
						globalConfigKey={['paypal', 'apiKeys', 'secret']}
						placeholder="Secret"
						width="630px"
						onChange={handleApiKeyChange}
					/>
				</div>
			</div>
			<div style={{
				display: 'flex',
				alignItems: 'center'
			}}>
				<ChoiceToken
					choice={{
						color: "red",
						id: "note",
						name: "Note",
					}}
				/>
				Anybody with write access to the base can see these values
			</div>
			
	    </div>
	)
}
