import datetime
import json
import logging
import sys
import time
import traceback

sys.path.extend(['..'])

from common.data import AttributeDict
from common.finance_components import FinanceComponents

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

cfg = AttributeDict({'source': 'yfinance', 'stocks': [{'ticker': None}], 'period': '5y'})
fc = FinanceComponents(cfg=cfg)


def yf_institutional_data(ticker, update_threshold_days=2):
    df = fc.get_institution_data_from_db(ticker=ticker)
    if not df.empty:
        status = df.status.iloc[0]
    else:
        status = {}

    if not status:
        try:
            institutional_holders, major_holders = fc.fdata.get_yf_institutions(ticker)

            end_date = institutional_holders['Date Reported'].iloc[0]
            end_date = end_date.strftime('%Y-%m-%d')
            start_date = end_date

            institutional_holders['end_date'] = end_date
            institutional_holders_json = institutional_holders[['Holder', 'Shares',
                                                                'end_date']].to_dict(orient='records')

            try:
                major_holders.set_index(1, inplace=True)
            except:
                logging.error("Failed to transform major holders (%s)" % traceback.format_exc())
            major_holders_json = major_holders.to_dict(orient='index')

            data = {'major_holders': major_holders_json, 'institutional_holders': institutional_holders_json}
            data_json = json.dumps(data)

            status.update({'yf': {'start_date': start_date, 'end_date': end_date}})
            status_json = json.dumps(status)
            cfg_save = {'column': 'yf', 'data': data_json, 'status': status_json, 'ticker': ticker}
            fc.save_institution_data_to_db(cfg_save)
            time.sleep(2)
            logging.info("Institutional data update for ticker: {} ... COMPLETED".format(ticker))

        except:
            logging.error("Failed to get institutional data for ticker, (%s)" % traceback.format_exc())


def run_sp500():
    tickers = fc.fdata.get_tickers_sp500()
    for ticker in tickers:
        yf_institutional_data(ticker=ticker)


def run_dow():
    tickers = fc.fdata.get_tickers_dow()
    for ticker in tickers:
        yf_institutional_data(ticker=ticker)


if __name__ == '__main__':
    # run_dow()
    # run_sp500()

    # Supporting funcntions
    # yf_institutional_data(ticker='OCGN')
    yf_institutional_data(ticker='RIG')

    # test_finviz_insider_data_and_analysis(ticker='RIG')
    # test_finviz_insider_data_and_analysis(ticker='HD')
    # test_finviz_insider_data_and_analysis(ticker='HUM')
