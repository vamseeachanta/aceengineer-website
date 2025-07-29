import datetime
import json
import logging
import sys
import time
import traceback

sys.path.extend(['..'])

from common.data import AttributeDict, transform_df_datetime_to_str
from common.finance_components import FinanceComponents

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

cfg = AttributeDict({'source': 'yfinance', 'stocks': [{'ticker': None}], 'period': '5y'})
fc = FinanceComponents(cfg=cfg)


def yf_EOD_data(ticker, update_threshold_days=2):
    df = fc.get_EOD_data_from_db(ticker=ticker)
    if not df.empty:
        status = df.status.iloc[0]
    else:
        status = {}

    if not status:
        try:
            EOD = fc.fdata.get_EOD_data_from_yfinance(ticker=ticker)
            EOD = EOD[['Close', 'Volume']].copy()
            EOD['Date'] = EOD.index.to_list()

            start_date = EOD['Date'].min().strftime("%m-%d-%Y")
            end_date = EOD['Date'].max().strftime("%m-%d-%Y")

            EOD = transform_df_datetime_to_str(EOD, date_format="%Y-%m-%d")
            EOD.Close = EOD.Close.apply(lambda x: round(x, 4))
            data = EOD.to_dict(orient='records')
            data_json = json.dumps(data)

            status.update({'yf': {'start_date': start_date, 'end_date': end_date}})
            status_json = json.dumps(status)
            cfg_save = {'column': 'yf', 'data': data_json, 'status': status_json, 'ticker': ticker}
            fc.save_EOD_data_to_db(cfg_save)
            time.sleep(2)
            logging.info("EOD data update for ticker: {} ... COMPLETED".format(ticker))

        except:
            logging.error("Failed to get EOD data for ticker, (%s)" % traceback.format_exc())


def run_dow():
    tickers = fc.fdata.get_tickers_dow()
    for ticker in tickers:
        yf_EOD_data(ticker=ticker)


def run_sp500():
    tickers = fc.fdata.get_tickers_sp500()
    for ticker in tickers:
        yf_EOD_data(ticker=ticker)


if __name__ == '__main__':
    run_dow()
    run_sp500()

    # Supporting functions
    # yf_EOD_data(ticker='RIG')
    # finviz_insider_data(ticker='HD')
    # finviz_insider_data(ticker='HUM')
