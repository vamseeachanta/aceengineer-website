import datetime

from common.ercot import Ercot

ercot = Ercot()


def test_DAM_prices(date_for_analysis=None):
    ercot.get_day_ahead_market_prices()


def test_real_time_prices(day):
    pass


if __name__ == '__main__':
    test_DAM_prices()
