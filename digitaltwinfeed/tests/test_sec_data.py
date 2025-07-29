import datetime
import json
import logging
import sys
import time

from dateutil.relativedelta import relativedelta

sys.path.extend(['..'])

from common.data import AttributeDict
from common.finance_components import FinanceComponents
from common.finance_components_get_SEC_data import SECDataForm

sec_data = SECDataForm()

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

cfg = AttributeDict({'source': 'yfinance', 'stocks': [{'ticker': None}], 'period': '5y'})
fc = FinanceComponents(cfg=cfg)


def update_sec_info_in_db_and_save_to_repo(update_threshold_days=2):
    fc.update_sec_info_in_db_and_save_to_repo()


def test_insider_finviz(ticker, filing_type="4", update_threshold_days=2):
    ticker_data_dict = fc.get_data_for_UI(ticker=ticker)
    status = ticker_data_dict.get('status', {'data': {}, 'analysis': {}})

    today_datetime = datetime.datetime.now()
    sec_form_after_date = (today_datetime - relativedelta(years=2)).strftime('%Y-%m-%d')
    sec_form_before_date = today_datetime.strftime('%Y-%m-%d')

    cfg_sec = {
        'filing_type': filing_type,
        'num_filings_to_download': 1,
        'include_amends': False,
        'after_date': sec_form_after_date,
        'before_date': sec_form_before_date
    }

    insider_status = status['data'].get('insider', None)
    last_updated_time = None
    if insider_status is not None:
        finviz_status = insider_status.get('finviz', None)
        if finviz_status is not None:
            last_updated_time = finviz_status.get('updated_time', None)
    if last_updated_time is not None:
        last_updated_time = datetime.datetime.strptime(last_updated_time, '%Y-%m-%d %H:%M')

    if last_updated_time is None or (last_updated_time <
                                     datetime.datetime.now() + datetime.timedelta(days=-update_threshold_days)):
        result = sec_data.get_sec_form_data(ticker, cfg_sec=cfg_sec)
        result.update({'cik': ticker, 'institution': " ", 'summary': {}})
        fc.save_institution_data_sec(result)
        print(f"SEC Form data for ticker : {ticker} and filing type: {filing_type}... COMPLETE".format(
            ticker, filing_type))


def test_sec_form_by_filing_type(cik, filing_type, update_threshold_days):
    update_flag = False

    cik_df = fc.get_institution_data_from_db(cik, filing_type)
    status = cik_df['status'].iloc[0]
    status = status if status is not None else {}
    summary = cik_df['summary'].iloc[0]
    summary = summary if summary is not None else {}
    last_updated_time = cik_df['updated_time'].iloc[0]

    today_datetime = datetime.datetime.now()
    sec_form_after_date = (today_datetime - relativedelta(years=2)).strftime('%Y-%m-%d')
    sec_form_before_date = today_datetime.strftime('%Y-%m-%d')
    cfg_sec = {
        'filing_type': filing_type,
        'num_filings_to_download': 4,
        'include_amends': False,
        'after_date': sec_form_after_date,
        'before_date': sec_form_before_date
    }

    if last_updated_time is not None and (last_updated_time <
                                          datetime.datetime.now() + datetime.timedelta(days=-update_threshold_days)):
        update_flag = True

    if update_flag:
        result = sec_data.get_sec_form_data(cik, cfg_sec=cfg_sec)
        result.update({'cik': cik, 'institution': " ", 'summary': summary, 'status': status})
        fc.save_institution_data_sec(result)
        logging.debug(f"SEC Form data for ticker : {cik} and filing type: {filing_type}... COMPLETE".format(
            cik, filing_type))
    else:
        logging.debug(f"SEC Form data for ticker : {cik} and filing type: {filing_type}... SKIPPED".format(
            cik, filing_type))


if __name__ == '__main__':
    # update_sec_info_in_db_and_save_to_repo()

    # Supporting scripts
    # test_sec_form_by_filing_type(cik='OCGN', filing_type="4", update_threshold_days=0)
    test_sec_form_by_filing_type(cik='0000102909', filing_type="13F-HR", update_threshold_days=0)
    # test_sec_form_by_filing_type(cik='0000102909', filing_type="13F-NT", update_threshold_days=0)
    # test_sec_form_by_filing_type(cik='OCGN', filing_type="4", update_threshold_days=0)
