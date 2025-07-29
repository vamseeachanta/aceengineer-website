import datetime
import json
import logging
import sys
import time

sys.path.extend(['..'])

from common.data import AttributeDict
from common.finance_components import FinanceComponents

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

cfg = AttributeDict({'source': 'yfinance', 'stocks': [{'ticker': None}], 'period': '5y'})
fc = FinanceComponents(cfg=cfg)


def run_finviz_sp500():
    tickers = fc.fdata.get_tickers_sp500()
    for ticker in tickers:
        pass


def run_finviz_dow():
    tickers = fc.fdata.get_tickers_dow()
    for ticker in tickers:
        pass


if __name__ == '__main__':
    run_finviz_dow()
    # run_finviz_sp500()
