import { call, put } from 'redux-saga/effects';
import XledgActions from '../redux/XledgRedux';
//import { notification } from '../services/helpers';

const notifyError = response => {
   console.log(response);
};

const success = response => {
   // CakePHP send OK 200 if unhandled error, so need to check for success
   if (response.status === 200 && typeof response.data === 'string') {
      let failure =
         !response.ok ||
         response.data.indexOf('<!DOCTYPE html>') >= 0 ||
         response.data.indexOf('<!doctype html>') >= 0;

      return !failure;
   } else {
      return response.ok;
   }
};

// Get all gateways from data API
export function* getGateways(api) {
   const response = yield call(api.getGateways);

   if (success(response)) {
      yield put(XledgActions.getGatewaysSuccess(response));
      // notification(
      //    'success',
      //    `success`
      // );
   } else {
      notifyError(response);
      yield put(XledgActions.getGatewaysFailure(response));
   }
}

// Connect to Ripple API
export function* connect(api) {
   const response = yield call(api.connect);

   // Successfully connected to the Ripple API
   // So lets do fun things
   if (response === 'success') {
      yield put(XledgActions.connectSuccess(response));
   } else {
      notifyError(response);
      yield put(XledgActions.connectFailure(response));
   }
}

// Get the current accounts account info (XRP balance)
export function* getAccountInfo(api) {
   const response = yield call(api.getAccountInfo);

   if ('message' in response) {
      notifyError(response);
      yield put(XledgActions.getAccountInfoFailure(response));
   } else {
      yield put(XledgActions.getAccountInfoSuccess(response));
   }
}

// Get the current accounts balance sheet
export function* getBalanceSheet(api) {
   const response = yield call(api.getBalanceSheet);

   if ('message' in response) {
      notifyError(response);
      yield put(XledgActions.getBalanceSheetFailure(response));
   } else {
      yield put(XledgActions.getBalanceSheetSuccess(response));
   }
}

// Get the current order book for the selected pair
export function* updateOrderBook(api, { pair }) {
   const response = yield call(api.updateOrderBook, pair);

   if ('message' in response) {
      notifyError(response);
      yield put(XledgActions.updateOrderBookFailure(response));
   } else {
      yield put(XledgActions.updateOrderBookSuccess(response));
   }
}
