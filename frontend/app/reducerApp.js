import {
    APP_BUSY
} from './actionsApp';
import _get from 'lodash/get';
import moment from 'moment';

const defaultState = {
    clientId: '',
    secret: '',
    showApiKeys: false,
    startDate: new moment()
}

export default function auth(state = defaultState, action) {
    switch(action.type) {
        case 'INITIALIZE_APP': {
            const payload = action.payload;
            const clientId = _get(payload, 'paypal.clientId');
            const secret = _get(payload, 'paypal.secret');

            return {
                ...state,
                clientId,
                secret,
                showApiKeys: !clientId && !secret
            }
        }

        case 'TOOGGLE_API_KEYS': {
            const payload = action.payload;
            const showApiKeys = _get(payload, 'showApiKeys');
            return {
                ...state,
                showApiKeys: !(state.showApiKeys)
            }
        }
        case 'SET_START_DATE': {
            const startDate = _get(action, 'payload.paypal.startDate');
            return {
                ...state,
                startDate
            }
        }

        case APP_BUSY: {
            return {
                ...state,
                busy: action.payload
            }
        }
        default: return state;
    }
}
