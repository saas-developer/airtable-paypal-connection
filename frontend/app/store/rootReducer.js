import { combineReducers } from 'redux';
import app from '../reducerApp';
import error from '../error/reducerError';

const rootReducer = combineReducers({
  app,
  error
});

export default rootReducer;
