import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { strings } from '../lang/orders';
import { strings as masterStrings } from '../lang/master';
import { strings as commonStrings } from '../lang/common';
import { strings as headerStrings } from '../lang/header';
import * as Helper from '../common/Helper';
import UserService from '../services/UserService';
import OrderService from '../services/OrderService';
import {
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
} from '@mui/icons-material';
import Env from '../config/env.config';
import Link from 'next/link';
import { fr, enUS } from "date-fns/locale";
import NoMatch from '../components/NoMatch';
import { format } from 'date-fns';
import PaymentType from '../components/PaymentType';
import OrderStatus from '../components/OrderStatus';
import PaymentTypeFilter from '../components/PaymentTypeFilter';
import OrderStatusFilter from '../components/OrderStatusFilter';
import OrderDateFilter from '../components/OrderDateFilter';
import { useRouter } from 'next/router';

import styles from '../styles/orders.module.css';

export default function Orders({
  _user,
  _signout,
  _language,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _orders,
  _noMatch,
  _paymentTypes,
  _statuses,
  _from,
  _to
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leftPanelRef, setLeftPanelRef] = useState();
  const [orderListRef, setOrderListRef] = useState();
  const [statuses, setStatuses] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const _fr = _language === 'fr';
  const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm';
  const _locale = _fr ? fr : enUS;

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
    Helper.setLanguage(headerStrings);
  }, []);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout();
    }
  }, [_signout]);

  useEffect(() => {
    if (orderListRef) orderListRef.scrollTo(0, 0);
  }, [_orders, orderListRef]);

  useEffect(() => {
    if (_orders) {
      setStatuses(_orders.map((order) => order.status));
    }
  }, [_orders]);

  useEffect(() => {
    if (_from) {
      setFrom(new Date(_from));
    } else {
      setFrom(null);
    }
  }, [_from]);

  useEffect(() => {
    if (_to) {
      setTo(new Date(_to));
    } else {
      setTo(null);
    }
  }, [_to]);

  const handleResend = async (e) => {
    try {
      e.preventDefault();
      const data = { email: _user.email };

      const status = await UserService.resendLink(data);

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT);
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
    }
  };

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className='content'>

          {_noMatch && <NoMatch />}

          {!_noMatch &&
            <div className={styles.main}>
              <div
                ref={el => setLeftPanelRef(el)}
                className={styles.leftPanel}
              >
                <PaymentTypeFilter
                  onChange={(paymentTypes) => {
                    const pt = paymentTypes.join(',');
                    const os = _statuses.join(',');
                    const url = `/orders?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  selectedOptions={_paymentTypes}
                  className={styles.paymentTypeFilter}
                />

                <OrderStatusFilter
                  onChange={(statuses) => {
                    const pt = _paymentTypes.join(',');
                    const os = statuses.join(',');
                    const url = `/orders?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  selectedOptions={_statuses}
                  className={styles.statusFilter}
                />

                <OrderDateFilter
                  language={_language}
                  from={from}
                  to={to}
                  onSubmit={(filter) => {
                    const { from, to } = filter;

                    const pt = _paymentTypes.join(',');
                    const os = _statuses.join(',');
                    const url = `/orders?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  className={styles.dateFilter}
                />
              </div>

              <div className={styles.orders}>
                {
                  _totalRecords === 0 &&
                  <Card variant="outlined" className={styles.emptyList}>
                    <CardContent>
                      <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                    </CardContent>
                  </Card>
                }

                {
                  _totalRecords > 0 &&
                  <>
                    <div
                      ref={el => setOrderListRef(el)}
                      className={styles.orderList}
                    >
                      {
                        _orders.map((order, index) => (
                          <article key={order._id}>
                            <div className={styles.order}>
                              <div className={styles.orderContent}>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.ID}</span>
                                  <span>{order._id}</span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.STATUS}</span>
                                  <span>
                                    {
                                    <OrderStatus value={statuses[index]} />
                                    }
                                  </span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.PAYMENT_TYPE}</span>
                                  <span><PaymentType value={order.paymentType} /></span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.ORDER_ITEMS}</span>
                                  <div className={styles.orderItems}>
                                    {
                                      order.orderItems.map((orderItem) => (
                                        <div key={orderItem._id} className={styles.orderItem}>
                                          <div className={styles.orderItemInfo}>
                                            <span className={styles.orderItemLabel}>{strings.PRODUCT}</span>
                                            <span>
                                              <Link href={`/product?p=${orderItem.product._id}`}>
                                                <a className={styles.orderItemText} title={orderItem.product.name}>
                                                  {orderItem.product.name}
                                                </a>
                                              </Link>
                                            </span>
                                          </div>
                                          <div className={styles.orderItemInfo}>
                                            <span className={styles.orderItemLabel}>{commonStrings.PRICE}</span>
                                            <span>{`${orderItem.product.price} ${commonStrings.CURRENCY}`}</span>
                                          </div>
                                          <div className={styles.orderItemInfo}>
                                            <span className={styles.orderItemLabel}>{commonStrings.QUANTITY}</span>
                                            <span>{orderItem.quantity}</span>
                                          </div>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.ORDERED_AT}</span>
                                  <span>{Helper.capitalize(format(new Date(order.createdAt), _format, { locale: _locale }))}</span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.TOTAL}</span>
                                  <span>{`${order.total} ${commonStrings.CURRENCY}`}</span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))
                      }
                    </div>

                    {
                      (_page > 1 || _rowCount < _totalRecords) &&
                      <div className={styles.footer}>

                        <div className={styles.pager}>
                          <div className={styles.rowCount}>
                            {`${((_page - 1) * Env.PAGE_SIZE) + 1}-${_rowCount} ${commonStrings.OF} ${_totalRecords}`}
                          </div>

                          <div className={styles.actions}>

                            <Link href={`/orders?pt=${encodeURIComponent(_paymentTypes.join(','))}&os=${encodeURIComponent(_statuses.join(','))}&${`p=${_page - 1}`}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
                              <a className={_page === 1 ? styles.disabled : ''}>
                                <PreviousPageIcon className={styles.icon} />
                              </a>
                            </Link>

                            <Link href={`/orders?pt=${encodeURIComponent(_paymentTypes.join(','))}&os=${encodeURIComponent(_statuses.join(','))}&${`p=${_page + 1}`}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
                              <a className={_rowCount === _totalRecords ? styles.disabled : ''}>
                                <NextPageIcon className={styles.icon} />
                              </a>
                            </Link>
                          </div>
                        </div>

                      </div>
                    }
                  </>
                }
              </div>
            </div>
          }
        </div>
      }

      {
        !_user.verified &&
        <div className="validate-email">
          <span>{masterStrings.VALIDATE_EMAIL}</span>
          <Button
            type="button"
            variant="contained"
            size="small"
            className="btn-primary btn-resend"
            onClick={handleResend}
          >{masterStrings.RESEND}</Button>
        </div>
      }
    </>
  );
};

export async function getServerSideProps(context) {
  let _user = null, __user = null, _signout = false, _page = 1, _keyword = '',
    _totalRecords = 0, _rowCount = 0, _orders = [], _noMatch = false, _paymentTypes = [], _statuses = [], _from = null, _to = null;
  const _language = UserService.getLanguage(context);

  try {
    const currentUser = UserService.getCurrentUser(context);

    if (currentUser) {
      let status;
      try {
        status = await UserService.validateAccessToken(context);
      } catch (err) {
        console.log('Unauthorized!');
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id);

        if (_user) {

          if (_user.verified) {
            if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p);
            if (typeof context.query.s !== 'undefined') _keyword = context.query.s;
            if (typeof context.query.o !== 'undefined') _keyword = context.query.o;
            if (typeof context.query.from !== 'undefined') _from = parseInt(context.query.from);
            if (typeof context.query.to !== 'undefined') _to = parseInt(context.query.to);

            if (typeof context.query.pt !== 'undefined') {
              const allPaymentTypes = Helper.getPaymentTypes();
              _paymentTypes = [];
              const pts = context.query.pt.split(',');

              for (const pt of pts) {
                if (allPaymentTypes.includes(pt)) _paymentTypes.push(pt);
              }
            } else {
              _paymentTypes = Helper.getPaymentTypes();
            }

            if (typeof context.query.os !== 'undefined') {
              const allStatuses = Helper.getOrderStatuses();
              _statuses = [];
              const oss = context.query.os.split(',');

              for (const os of oss) {
                if (allStatuses.includes(os)) _statuses.push(os);
              }
            } else {
              _statuses = Helper.getOrderStatuses();
            }

            if (_page >= 1) {
              const data = await OrderService.getOrders(
                context,
                 _user._id,
                _page,
                Env.PAGE_SIZE,
                _keyword,
                _paymentTypes,
                _statuses,
                _from,
                _to);
              const _data = data[0];
              _orders = _data.resultData;
              _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _orders.length;
              _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0;

              if (_totalRecords > 0 && _page > Math.ceil(_totalRecords / Env.PAGE_SIZE)) {
                _noMatch = true;
              }
            } else {
              _noMatch = true;
            }
          }

        } else {
          _signout = true;
        }
      } else {
        _signout = true;
      }
    } else {
      _signout = true;
    }
  } catch (err) {
    console.log(err);
    _signout = true;
  }

  return {
    props: {
      _user,
      _signout,
      _language,
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _orders,
      _noMatch,
      _paymentTypes,
      _statuses,
      _from,
      _to
    }
  };
}
