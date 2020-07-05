import _get from 'lodash/get';

const defaultState = {
    showError: false,
    message: ''
}

export default function error(state = defaultState, action) {
    switch(action.type) {
        case 'SHOW_ERROR': {
            const payload = action.payload;

            return {
                ...state,
                showError: true,
                message: _get(action, 'payload.message')
            }
        }
        case 'HIDE_ERROR': {
            const payload = action.payload;

            return {
                ...state,
                showError: false
            }
        }
        default: return state;
    }
}
