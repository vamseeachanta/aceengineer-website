import datetime

from analysis.well_analysis import WellAnalysis
from flask import Flask

app = Flask(__name__, static_folder='../build', static_url_path='/')

well_analysis = WellAnalysis()
well_data_df = well_analysis.get_data_from_csv()
try:
    correlation_df = well_analysis.get_data_correlations_for_well_data(well_data_df)
except:
    pass


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/time')
def get_current_time():
    time_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    return {'time': time_str}


@app.route('/api/reservoir_pressure_maturity')
def get_reservoir_pressure_maturity_chart():
    cfg = {'df': well_data_df, 'x': 'Maturity', 'y': 'ReservoirPressure', 'size_ref_column': 'CumOil12Month'}
    reservoir_pressure_maturity_chart = well_analysis.get_reservoir_pressure_maturity_chart(cfg)

    return reservoir_pressure_maturity_chart

@app.route('/api/correlations')
def get_correlations_chart():
    cfg = {'df': correlation_df, 'x': 'x_column', 'y': 'correlation coefficient', 'text': 'p-value'}
    reservoir_pressure_maturity_chart = well_analysis.get_correlations_chart(cfg)

    return reservoir_pressure_maturity_chart
