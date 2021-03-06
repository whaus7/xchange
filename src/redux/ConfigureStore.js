import { createStore, applyMiddleware } from 'redux';
//import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import createSagaMiddleware from 'redux-saga';

// creates the store
export default (rootReducer, rootSaga) => {
   /* ------------- Redux Configuration ------------- */

   const middleware = [];
   const enhancers = [];

   /* ------------- Saga Middleware ------------- */

   const sagaMiddleware = createSagaMiddleware();
   middleware.push(sagaMiddleware);

   /* ------------- Assemble Middleware ------------- */
   enhancers.push(applyMiddleware(...middleware));

   /* ------------- Create the Store ------------- */

   const store = createStore(rootReducer, composeWithDevTools(...enhancers));

   // run root saga AFTER store created with sagaMiddleware
   sagaMiddleware.run(rootSaga);

   return store;
};
