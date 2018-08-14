import React, { Component } from 'react';
import PropTypes from 'prop-types';

import COLORS from '../../services/colors';
//import Order from './Order';

export default class Txs extends Component {
   constructor(props) {
      super(props);

      this.props.getTxs('rPyURAVppfVm76jdSRsPyZBACdGiXYu4bf');

      setInterval(
         function() {
            this.props.getTxs('rPyURAVppfVm76jdSRsPyZBACdGiXYu4bf');
         }.bind(this),
         60000
      );
   }

   // componentWillReceiveProps(nextProps) {
   //
   // }

   render() {
      const { allTxs } = this.props;

      const Txs = () => {
         let pendingTxsRows = [];
         let completedTxsRows = [];

         allTxs.map((tx, i) => {
            if (
               'rPyURAVppfVm76jdSRsPyZBACdGiXYu4bf' in tx.outcome.balanceChanges !== 'undefined' &&
               tx.outcome.balanceChanges.rPyURAVppfVm76jdSRsPyZBACdGiXYu4bf.length === 1
            ) {
               pendingTxsRows.push(
                  <div
                     key={`pending_txs_${i}`}
                     //className={'orderRow'}
                     style={{ margin: '0 0 10px 0' }}
                     //onClick={() => this.props.updateFromOrder(order)}
                  >
                     <div style={{ width: '100%' }}>
                        {/*index debug*/}
                        {/*{i}.*/}
                        <span
                           style={{
                              color: tx.specification.direction === 'buy' ? COLORS.green : COLORS.red
                           }}>
                           {tx.specification.direction.toUpperCase()}
                        </span>{' '}
                        {parseFloat(tx.specification.quantity.value).toFixed(2)}
                        {tx.specification.quantity.currency}
                     </div>

                     <div style={{ display: 'flex', width: '100%' }}>
                        <div style={{ width: 8, marginRight: 7, position: 'relative', top: -1 }}>@</div>
                        <div style={{ width: 100 }}>
                           {parseFloat(
                              tx.specification.totalPrice.value / tx.specification.quantity.value
                           ).toFixed(6)}{' '}
                           {tx.specification.totalPrice.currency}
                        </div>
                     </div>
                  </div>
               );
            } else {
               completedTxsRows.push(
                  <div
                     key={`completed_txs_${i}`}
                     //className={'orderRow'}
                     style={{ margin: '0 0 10px 0' }}
                     //onClick={() => this.props.updateFromOrder(order)}
                  >
                     <div style={{ width: '100%' }}>
                        {/*index debug*/}
                        {/*{i}.*/}
                        <span
                           style={{
                              color: tx.specification.direction === 'buy' ? COLORS.green : COLORS.red
                           }}>
                           {tx.specification.direction.toUpperCase()}
                        </span>{' '}
                        {parseFloat(tx.specification.quantity.value).toFixed(2)}
                        {tx.specification.quantity.currency}
                     </div>

                     <div style={{ display: 'flex', width: '100%' }}>
                        <div style={{ width: 8, marginRight: 7, position: 'relative', top: -1 }}>@</div>
                        <div style={{ width: 100 }}>
                           {parseFloat(
                              tx.specification.totalPrice.value / tx.specification.quantity.value
                           ).toFixed(6)}{' '}
                           {tx.specification.totalPrice.currency}
                        </div>
                     </div>
                  </div>
               );
            }
            return true;
         });

         return (
            <div>
               <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid #383939' }}>
                  <h2>OPEN ORDERS</h2>
                  <div
                     className={'customScroll'}
                     style={{
                        //marginBottom: 25,
                        maxHeight: 150,
                        overflowY: 'scroll',
                        overflowX: 'hidden'
                     }}>
                     {pendingTxsRows}
                  </div>
               </div>
               <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid #383939' }}>
                  <h2>ORDER HISTORY</h2>
                  <div
                     className={'customScroll'}
                     style={{
                        maxHeight: 150,
                        overflowY: 'scroll',
                        overflowX: 'hidden'
                     }}>
                     {completedTxsRows}
                  </div>
               </div>
            </div>
         );
      };

      return (
         <div
            style={{
               display: 'flex',
               color: COLORS.white,
               fontSize: 12
            }}>
            <div
               style={{
                  width: '100%'
               }}>
               <div>
                  <Txs />
               </div>
            </div>
         </div>
      );
   }
}

Txs.propTypes = {
   allTxs: PropTypes.array,
   getTxs: PropTypes.func
};