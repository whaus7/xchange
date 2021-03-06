import { createReducer, createActions } from 'reduxsauce';
import update from 'immutability-helper';
import PouchDB from 'pouchdb';
import CurrencyFormatter from 'currency-formatter';
import { groupBy, notification } from '../services/helpers';
//import Order from '../containers/components/Order';

PouchDB.plugin(require('pouchdb-upsert'));

/* ------------- Types and Action Creators ------------- */
const { Types, Creators } = createActions({
   // UI Actions
   updateWindowDimensions: ['width', 'height'],

   // xLedg Actions
   setAccount: ['status'], // 'new', 'existing', 'corrupt'
   updateAction: ['action'],
   updateBaseAmount: ['amount'],
   updateBaseCurrency: ['currency'],
   updateCounterPrice: ['price'],
   updateCounterCurrency: ['currency'],
   updateFromOrder: ['order'],

   // Ripple API Actions
   connect: [],
   connectSuccess: ['response'],
   connectFailure: ['error'],

   getAccountInfo: ['address'],
   getAccountInfoSuccess: ['response'],
   getAccountInfoFailure: ['error'],

   getBalanceSheet: ['address'],
   getBalanceSheetSuccess: ['response'],
   getBalanceSheetFailure: ['error'],

   updateOrderBook: ['address', 'pair'],
   updateOrderBookSuccess: ['response'],
   updateOrderBookFailure: ['error'],

   prepareOrder: ['address', 'order', 'options'],
   prepareOrderSuccess: ['response', 'order'],
   prepareOrderFailure: ['error'],

   cancelOrder: ['address', 'orderCancellation'],
   cancelOrderSuccess: ['response'],
   cancelOrderFailure: ['error'],

   signTx: ['txJSON', 'key'],
   signTxSuccess: ['response'],
   signTxFailure: ['error'],

   submitTx: ['signedTx'],
   submitTxSuccess: ['response'],
   submitTxFailure: ['error'],

   getTxStatus: ['txID'],
   getTxStatusSuccess: ['response'],
   getTxStatusFailure: ['error'],

   getTxs: ['address'],
   getTxsSuccess: ['response'],
   getTxsFailure: ['error'],

   getOrders: ['address', 'options'],
   getOrdersSuccess: ['response'],
   getOrdersFailure: ['error'],

   // Data API Actions
   getGateways: [],
   getGatewaysSuccess: ['response'],
   getGatewaysFailure: ['error'],

   getExchangeHistory: ['baseCurrency', 'counterCurrency'],
   getExchangeHistorySuccess: ['response'],
   getExchangeHistoryFailure: ['error'],

   // Ledger API Actions
   openTransport: [],
   openTransportSuccess: ['response'],
   openTransportFailure: ['error'],

   getWalletAddress: [],
   getWalletAddressSuccess: ['response'],
   getWalletAddressFailure: ['error']
});

export const ActionTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = {
   // UI
   winH: window.innerHeight,
   winW: window.innerWidth,

   // xLedg UI
   publicAddress: 'rPyURAVppfVm76jdSRsPyZBACdGiXYu4bf',
   //publicAddress: null,
   publicKey: null,
   db: new PouchDB('xledg_db'),
   walletStatus: null,
   action: 'buy',

   // Data API
   gateways: null,
   exchangeHistory: null,

   // Ripple API
   rippleApiConnected: false,
   accountInfo: null,
   balanceSheet: null,
   balances: {},
   assetTotals: {},
   baseAmount: '',
   baseCurrency: {
      icon: '/icons/xrp.png',
      label: 'XRP',
      value: 'XRP'
   },
   counterPrice: '',
   counterCurrency: {
      icon: '/icons/usd.png',
      label: 'Dollar',
      value: 'USD'
   },
   pair: {
      // Default Pair
      base: {
         currency: 'XRP'
      },
      counter: {
         currency: 'USD',
         counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' // Bitstamp
      }
   },
   orderBook: null,
   preparedOrder: null,
   preparedOrderData: null,
   signedTx: null,
   allTxs: [],
   openOrders: [],

   // Ledger Hardware API
   bip32Path: "44'/144'/0'/0/0",
   transportOpen: false
};

/* ------------- Reducers ------------- */
export const uiReducer = (state, action) => {
   switch (action.type) {
      case 'UPDATE_WINDOW_DIMENSIONS':
         return update(state, {
            winH: { $set: action.height },
            winW: { $set: action.width }
         });
      default:
         return state;
   }
};

export const xledgReducer = (state, action) => {
   switch (action.type) {
      case 'RESET_TO_IDLE':
         return state;
      case 'SET_ACCOUNT':
         return update(state, {
            walletStatus: { $set: action.status }
         });
      case 'UPDATE_ACTION':
         return update(state, {
            action: { $set: action.action }
         });
      case 'UPDATE_BASE_AMOUNT':
         return update(state, {
            baseAmount: { $set: action.amount }
         });
      case 'UPDATE_BASE_CURRENCY':
         if (action.currency === null) {
            return update(state, {
               baseCurrency: {
                  icon: { $set: null },
                  label: { $set: null },
                  value: { $set: null }
               },
               pair: { base: { $set: null } },
               orderBook: { $set: null },
               exchangeHistory: { $set: null }
            });
         } else {
            let base = {
               currency: action.currency.value
            };
            if (action.currency.value !== 'XRP') {
               //base.counterparty = action.currency.counterparty;
               // TODO need counterparty selection in UI
               base.counterparty = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B';
            }

            return update(state, {
               baseCurrency: { $set: action.currency },
               pair: { base: { $set: base } }
            });
         }
      case 'UPDATE_COUNTER_PRICE':
         return update(state, {
            counterPrice: { $set: action.price }
         });
      case 'UPDATE_COUNTER_CURRENCY':
         if (action.currency === null) {
            return update(state, {
               counterCurrency: {
                  icon: { $set: null },
                  label: { $set: null },
                  value: { $set: null }
               },
               pair: { counter: { $set: null } },
               orderBook: { $set: null },
               exchangeHistory: { $set: null }
            });
         } else {
            let counter = {
               currency: action.currency.value
            };
            if (action.currency.value !== 'XRP') {
               //counter.counterparty = action.currency.counterparty;
               // TODO need counterparty selection in UI
               counter.counterparty = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B';
            }

            return update(state, {
               counterCurrency: { $set: action.currency },
               pair: { counter: { $set: counter } }
            });
         }
      case 'UPDATE_FROM_ORDER':
         console.log('DEBUG REDUX - update from order');
         console.log(state);
         console.log(action);

         //order.specification.totalPrice.value / order.specification.quantity.value
         // TODO update trading UI with fullfilled order
         return update(state, {
            action: { $set: action.order.specification.direction === 'sell' ? 'buy' : 'sell' },
            baseAmount: { $set: action.order.specification.quantity.value },
            counterPrice: {
               $set: parseFloat(
                  action.order.specification.totalPrice.value / action.order.specification.quantity.value
               ).toFixed(6)
            }
         });
      // case 'UPDATE_TOTALS':
      //    return update(state, {
      //       assetTotals: { $set: action.totals }
      //    });

      //return state;
      default:
         return state;
   }
};

export const dataApiReducer = (state, action) => {
   switch (action.type) {
      // Get all registered gateways
      case 'GET_GATEWAYS':
         return state;
      case 'GET_GATEWAYS_SUCCESS':
         console.log('DEBUG REDUX - get gateways success');
         console.log(state);
         console.log(action);

         return update(state, {
            gateways: { $set: action.response.data }
         });
      case 'GET_GATEWAYS_FAILURE':
         return state;

      case 'GET_EXCHANGE_HISTORY':
         return state;
      case 'GET_EXCHANGE_HISTORY_SUCCESS':
         // console.log('DEBUG REDUX - exchange history');
         // console.log(state);
         // console.log(action);

         let reversedHistory = update(action.response.data, {
            exchanges: { $set: action.response.data.exchanges.reverse() }
         });

         return update(state, {
            exchangeHistory: { $set: reversedHistory }
         });
      case 'GET_EXCHANGE_HISTORY_FAILURE':
         return state;

      default:
         return state;
   }
};

export const rippleApiReducer = (state, action) => {
   switch (action.type) {
      // CONNECT
      case 'CONNECT':
         return state;
      case 'CONNECT_SUCCESS':
         return update(state, {
            rippleApiConnected: { $set: true }
         });
      case 'CONNECT_FAILURE':
         return update(state, {
            rippleApiConnected: { $set: false }
         });

      // ACCOUNT INFO
      case 'GET_ACCOUNT_INFO':
         return state;
      case 'GET_ACCOUNT_INFO_SUCCESS':
         console.log('DEBUG REDUX - get account info successfull!');
         console.log(state);
         console.log(action);

         return update(state, {
            accountInfo: { $set: action.response }
         });
      case 'GET_ACCOUNT_INFO_FAILURE':
         return state;

      // BALANCE SHEET
      case 'GET_BALANCE_SHEET':
         return state;
      case 'GET_BALANCE_SHEET_SUCCESS':
         console.log('DEBUG REDUX - get balance sheet successfull!');
         console.log(state);
         console.log(action);

         let groupedAssets = {};
         let totals = {};

         if ('assets' in action.response) {
            groupedAssets = groupBy(action.response.assets, 'currency');

            for (let key in groupedAssets) {
               let total = 0;
               groupedAssets[key].map(asset => {
                  total += parseFloat(asset.value, 10);
                  return true;
               });
               //groupedAssets[key].total = CurrencyFormatter.format(total, { code: key });
               totals[key] = { formatted: CurrencyFormatter.format(total, { code: key }), value: total };
            }
         }

         return update(state, {
            balanceSheet: { $set: 'assets' in action.response ? action.response : {} },
            balances: { $set: groupedAssets },
            assetTotals: { $set: totals }
         });
      case 'GET_BALANCE_SHEET_FAILURE':
         return state;

      // ORDER BOOK
      case 'UPDATE_ORDER_BOOK':
         return state;
      case 'UPDATE_ORDER_BOOK_SUCCESS':
         return update(state, {
            orderBook: { $set: action.response }
         });
      case 'UPDATE_ORDER_BOOK_FAILURE':
         return state;

      // PREPARE ORDER
      case 'PREPARE_ORDER':
         return state;
      case 'PREPARE_ORDER_SUCCESS':
         console.log('DEBUG REDUX - prepare order successfull!');
         console.log(state);
         console.log(action);

         return update(state, {
            preparedOrder: { $set: action.response },
            preparedOrderData: { $set: action.order }
         });
      case 'PREPARE_ORDER_FAILURE':
         return state;

      // CANCEL ORDER
      case 'CANCEL_ORDER':
         return state;
      case 'CANCEL_ORDER_SUCCESS':
         console.log('DEBUG REDUX - cancel order successfull!');
         console.log(state);
         console.log(action);
         //return state;
         return update(state, {
            preparedOrder: { $set: action.response }
         });
      case 'CANCEL_ORDER_FAILURE':
         return state;

      // SIGN TRANSACTION
      case 'SIGN_TX':
         return state;
      case 'SIGN_TX_SUCCESS':
         return update(state, {
            signedTx: { $set: action.response },
            //signedTx: { $set: { signedTransaction: action.response } },
            preparedOrder: { $set: null }
         });
      case 'SIGN_TX_FAILURE':
         return state;

      // SUBMIT TRANSACTION
      case 'SUBMIT':
         return state;
      case 'SUBMIT_TX_SUCCESS':
         console.log('DEBUG REDUX - submit order SUCCESS');
         console.log(state);
         console.log(action);

         // switch (action.response.resultCode) {
         //    case 'tecUNFUNDED_OFFER':
         //       notification(
         //          `<span style="margin-right: 20px">ERROR</span>${action.response.resultMessage}`,
         //          'error'
         //       );
         //       break;
         // }

         return update(state, {
            signedTx: { $set: null },
            preparedOrderData: { $set: null }
         });
      case 'SUBMIT_TX_FAILURE':
         console.log('DEBUG REDUX - submit order FAILURE');
         console.log(state);
         console.log(action);

         if ('resultMessage' in action.error) {
            notification(
               `<span style="color: #ff6161; margin-right: 20px">ERROR</span>${action.error.resultMessage}`,
               'error'
            );
         }

         return state;

      // GET TRANSACTION STATUS
      case 'GET_TX_STATUS':
         return state;
      case 'GET_TX_STATUS_SUCCESS':
         // console.log('DEBUG REDUX - TX status success');
         // console.log(state);
         // console.log(action);
         //let newPendingTxs = [];

         return state;
      // return update(state, {
      //    openOrders: {
      //       $set: state.openOrders.filter(tx => {
      //          if (tx.id !== action.response.id) {
      //             return tx;
      //          }
      //          //newPendingTxs.push(tx);
      //       })
      //    }
      // });
      case 'GET_TX_STATUS_FAILURE':
         return state;

      // GET ALL TRANSACTIONS FOR ACCOUNT
      case 'GET_TXS':
         return state;
      case 'GET_TXS_SUCCESS':
         // console.log('DEBUG REDUX - all TXs success');
         // console.log(state);
         // console.log(action);

         return update(state, {
            allTxs: { $set: action.response }
         });
      case 'GET_TXS_FAILURE':
         return state;

      // GET ALL OPEN ORDERS FOR ACCOUNT
      case 'GET_ORDERS':
         return state;
      case 'GET_ORDERS_SUCCESS':
         // console.log('DEBUG REDUX - all open orders success');
         // console.log(state);
         // console.log(action);

         //   return state;
         return update(state, {
            openOrders: { $set: action.response }
         });
      case 'GET_ORDERS_FAILURE':
         return state;

      default:
         return state;
   }
};

export const ledgerApiReducer = (state, action) => {
   switch (action.type) {
      case 'OPEN_TRANSPORT':
         return state;
      case 'OPEN_TRANSPORT_SUCCESS':
         // console.log('DEBUG REDUX - open transport success');
         // console.log(state);
         // console.log(action);

         return update(state, {
            transportOpen: { $set: true }
         });
      case 'OPEN_TRANSPORT_FAILURE':
         return state;

      case 'GET_WALLET_ADDRESS':
         return state;
      case 'GET_WALLET_ADDRESS_SUCCESS':
         console.log('DEBUG REDUX - get wallet address success');
         console.log(state);
         console.log(action);

         //return state;
         return update(state, {
            publicAddress: { $set: action.response.address },
            publicKey: { $set: action.response.publicKey.toUpperCase() }
         });
      case 'GET_WALLET_ADDRESS_FAILURE':
         return state;

      default:
         return state;
   }
};

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
   // UI Actions
   [Types.UPDATE_WINDOW_DIMENSIONS]: uiReducer,

   // xLedg Actions
   [Types.SET_ACCOUNT]: xledgReducer,
   [Types.UPDATE_ACTION]: xledgReducer,
   [Types.UPDATE_BASE_AMOUNT]: xledgReducer,
   [Types.UPDATE_BASE_CURRENCY]: xledgReducer,
   [Types.UPDATE_COUNTER_PRICE]: xledgReducer,
   [Types.UPDATE_COUNTER_CURRENCY]: xledgReducer,
   [Types.UPDATE_FROM_ORDER]: xledgReducer,

   // Ripple API Actions
   [Types.CONNECT]: rippleApiReducer,
   [Types.CONNECT_SUCCESS]: rippleApiReducer,
   [Types.CONNECT_FAILURE]: rippleApiReducer,

   [Types.GET_ACCOUNT_INFO]: rippleApiReducer,
   [Types.GET_ACCOUNT_INFO_SUCCESS]: rippleApiReducer,
   [Types.GET_ACCOUNT_INFO_FAILURE]: rippleApiReducer,

   [Types.GET_BALANCE_SHEET]: rippleApiReducer,
   [Types.GET_BALANCE_SHEET_SUCCESS]: rippleApiReducer,
   [Types.GET_BALANCE_SHEET_FAILURE]: rippleApiReducer,

   [Types.UPDATE_ORDER_BOOK]: rippleApiReducer,
   [Types.UPDATE_ORDER_BOOK_SUCCESS]: rippleApiReducer,
   [Types.UPDATE_ORDER_BOOK_FAILURE]: rippleApiReducer,

   [Types.PREPARE_ORDER]: rippleApiReducer,
   [Types.PREPARE_ORDER_SUCCESS]: rippleApiReducer,
   [Types.PREPARE_ORDER_FAILURE]: rippleApiReducer,

   [Types.CANCEL_ORDER]: rippleApiReducer,
   [Types.CANCEL_ORDER_SUCCESS]: rippleApiReducer,
   [Types.CANCEL_ORDER_FAILURE]: rippleApiReducer,

   [Types.SIGN_TX]: rippleApiReducer,
   [Types.SIGN_TX_SUCCESS]: rippleApiReducer,
   [Types.SIGN_TX_FAILURE]: rippleApiReducer,

   [Types.SUBMIT_TX]: rippleApiReducer,
   [Types.SUBMIT_TX_SUCCESS]: rippleApiReducer,
   [Types.SUBMIT_TX_FAILURE]: rippleApiReducer,

   [Types.GET_TX_STATUS]: rippleApiReducer,
   [Types.GET_TX_STATUS_SUCCESS]: rippleApiReducer,
   [Types.GET_TX_STATUS_FAILURE]: rippleApiReducer,

   [Types.GET_TXS]: rippleApiReducer,
   [Types.GET_TXS_SUCCESS]: rippleApiReducer,
   [Types.GET_TXS_FAILURE]: rippleApiReducer,

   [Types.GET_ORDERS]: rippleApiReducer,
   [Types.GET_ORDERS_SUCCESS]: rippleApiReducer,
   [Types.GET_ORDERS_FAILURE]: rippleApiReducer,

   // Data API Actions
   [Types.GET_GATEWAYS]: dataApiReducer,
   [Types.GET_GATEWAYS_SUCCESS]: dataApiReducer,
   [Types.GET_GATEWAYS_FAILURE]: dataApiReducer,

   // Get Exchange History for Charts
   [Types.GET_EXCHANGE_HISTORY]: dataApiReducer,
   [Types.GET_EXCHANGE_HISTORY_SUCCESS]: dataApiReducer,
   [Types.GET_EXCHANGE_HISTORY_FAILURE]: dataApiReducer,

   // Ledger Hardware API Actions
   [Types.OPEN_TRANSPORT]: ledgerApiReducer,
   [Types.OPEN_TRANSPORT_SUCCESS]: ledgerApiReducer,
   [Types.OPEN_TRANSPORT_FAILURE]: ledgerApiReducer,

   [Types.GET_WALLET_ADDRESS]: ledgerApiReducer,
   [Types.GET_WALLET_ADDRESS_SUCCESS]: ledgerApiReducer,
   [Types.GET_WALLET_ADDRESS_FAILURE]: ledgerApiReducer
});
