import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { updateInput } from '../../services/helpers';
import COLORS from '../../services/colors';

export default class OrderBook extends Component {
   constructor(props) {
      super(props);

      this.updateInput = updateInput.bind(this);
   }

   render() {
      const { orderBook, titleTextAlign, height } = this.props;

      const Orders = props => {
         let orderRows = [];

         props.orders.map((order, i) => {
            orderRows.push(
               <div
                  className={'orderRow'}
                  key={`${props.type}_${i}`}
                  style={{ display: 'flex', margin: '3px 0' }}
                  onClick={() => this.props.updateFromOrder(order)}>
                  <div style={{ width: 75, marginRight: 7, textAlign: 'right' }}>
                     {parseFloat(order.specification.quantity.value).toFixed(2)}
                  </div>
                  <div style={{ width: 30 }}>{order.specification.quantity.currency}</div>
                  <div style={{ width: 10, marginRight: 7, position: 'relative', top: -1 }}>@</div>
                  <div style={{ width: 100 }}>
                     {parseFloat(
                        order.specification.totalPrice.value / order.specification.quantity.value
                     ).toFixed(6)}{' '}
                     {order.specification.totalPrice.currency}
                  </div>
               </div>
            );
            return true;
         });

         return orderRows;
      };

      return (
         <div
            style={{
               display: 'flex',
               color: COLORS.white,
               padding: 15,
               fontSize: 12
               //flexDirection: this.props.action === 'buy' ? 'row' : 'row-reverse'
            }}>
            <div
               style={{
                  width: '100%'
               }}>
               <h2
                  style={{
                     color: this.props.action === 'buy' ? COLORS.red : COLORS.white,
                     textAlign: titleTextAlign
                  }}>
                  OFFERS TO SELL
               </h2>
               <div style={{ maxHeight: height, overflow: 'auto' }}>
                  <Orders orders={orderBook.asks} type={'asks'} />
               </div>
            </div>
            <div
               style={{
                  width: '100%'
               }}>
               <h2
                  style={{
                     color: this.props.action === 'sell' ? COLORS.green : COLORS.white,
                     textAlign: titleTextAlign
                  }}>
                  OFFERS TO BUY
               </h2>
               <div style={{ maxHeight: height, overflow: 'auto' }}>
                  <Orders orders={orderBook.bids} type={'bids'} />
               </div>
            </div>
         </div>
      );
   }
}

OrderBook.propTypes = {
   orderBook: PropTypes.object,
   action: PropTypes.string,
   updateFromOrder: PropTypes.func,
   titleTextAlign: PropTypes.string,
   height: PropTypes.number
};
