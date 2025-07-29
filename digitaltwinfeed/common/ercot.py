import datetime
import json
import logging
import os

import pandas as pd


class Ercot():

    def __init__(self, cfg=None):
        pass

    def get_day_ahead_market_prices(self, date_for_analysis=None):
        if date_for_analysis is None:
            date_for_analysis = datetime.datetime.now()

    def get_real_time_prices(self, date='2021-03-15'):
        pass
