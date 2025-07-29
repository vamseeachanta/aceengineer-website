import datetime
import json
import logging
import os
import sys

import pandas as pd

sys.path.extend(['..'])

from common.data import AttributeDict
from common.finance_components import FinanceComponents
from common.finance_components_get_SEC_data import SECDataForm

sec_data = SECDataForm()

logging.getLogger().setLevel(logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler())

cfg = AttributeDict({'source': 'yfinance', 'stocks': [{'ticker': None}], 'period': '5y'})
fc = FinanceComponents(cfg=cfg)

script_working_dir = os.getcwd()
if 'tests' in script_working_dir:
    script_working_dir = os.path.join(script_working_dir, '..')


def update_finance_keys_in_db(update_threshold_days=30):
    fc.save_keys()


def get_sec_valid_forms(ticker):
    valid_sec_forms = fc.fdata.sec_form.get_valid_forms(ticker)


def get_cusip_for_ticker(ticker):
    valid_sec_forms = fc.fdata.sec_form.get_valid_forms(ticker)
    cusip, cusip_status = fc.fdata.sec_form.get_cusip(ticker, valid_sec_forms)
    print(cusip)


def test_get_cusip_from_string():
    cusip = None
    lines_with_cusip = ['CUSIP No.2543682']
    fc.fdata.sec_form.get_cusip_from_string(cusip, lines_with_cusip)


def test_tickers_in_db():
    dtf_keys_df = fc.get_keys_from_db()
    dft_keys_tickers = dtf_keys_df.ticker.to_list()

    sp500_tickers_not_in_db = []
    cte_tickers_not_in_db = []
    ct_tickers_not_in_db = []

    sp500_tickers = fc.fdata.get_tickers_sp500()
    filename_json = os.path.join(script_working_dir, 'services', 'StockAnalysis', 'static', 'StockAnalysis', 'data',
                                 'company_tickers_exchange.json')

    with open(filename_json) as json_file_data:
        cte_json = json.load(json_file_data)

    cte_df = pd.DataFrame(cte_json['data'], columns=cte_json['fields'])
    cte_tickers = cte_df.ticker.to_list()
    cte_ciks = cte_df.cik.to_list()

    filename_json = os.path.join(script_working_dir, 'services', 'StockAnalysis', 'static', 'StockAnalysis', 'data',
                                 'company_tickers.json')

    with open(filename_json) as json_file_data:
        ct_json = json.load(json_file_data)
    ct_df = pd.DataFrame.from_dict(ct_json, orient='index')
    ct_tickers = ct_df.ticker.to_list()
    ct_ciks = ct_df.cik_str.to_list()

    for ticker in sp500_tickers:
        if ticker not in dft_keys_tickers:
            sp500_tickers_not_in_db.append(ticker)

    for ticker in cte_tickers:
        if ticker not in dft_keys_tickers:
            cte_tickers_not_in_db.append(ticker)

    for ticker in ct_tickers:
        if ticker not in dft_keys_tickers:
            ct_tickers_not_in_db.append(ticker)

    return sp500_tickers_not_in_db


if __name__ == '__main__':
    update_finance_keys_in_db()
    # test_tickers_in_db()

    # Supporting functions
    # get_sec_valid_forms(ticker='HD')
    # get_cusip_for_ticker(ticker='V')
    # test_get_cusip_from_string()
