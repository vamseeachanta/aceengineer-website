import logging
import os

import pandas as pd
from scipy import stats


class WellAnalysis:

    def __init__(self):
        self.y_columns = ['CumOil12Month']
        self.x_columns = [
            'LateralLength_FT', 'WellDepth', 'ReservoirThickness', 'OilInPlace', 'Porosity', 'ReservoirPressure',
            'WaterSaturation', 'StructureDerivative', 'TotalOrganicCarbon', 'ClayVolume', 'CarbonateVolume',
            'Maturity', 'LateralLength_FT', 'ProppantIntensity_LBSPerFT'
        ]

    def get_data_from_csv(self, cfg={}):
        if len(cfg) == 0:
            script_working_dir = os.getcwd()
            if 'app' in script_working_dir:
                file_name = os.path.join(script_working_dir, 'data', 'AnalysisData.csv')
            elif 'api' in script_working_dir:
                script_working_dir = os.path.join(script_working_dir, '..')
                file_name = os.path.join(script_working_dir, 'api', 'data', 'AnalysisData.csv')

            if not os.path.isfile(file_name):
                print("Raw data analysis file ... NOT Found")
                print(os.getcwd())
                logging.debug("Raw data analysis file ... NOT Found")
            else:
                logging.debug("Raw data analysis file ...  Found")

            cfg = {'file_name': file_name}

        try:
            well_data_df = pd.read_csv(cfg['file_name'])
        except:
            well_data_df = pd.DataFrame()

        return well_data_df

    def get_data_correlations_for_2_variables(self, cfg={}):
        df = cfg['df']
        x_column = cfg['x_column']
        y_column = cfg['y_column']
        df_analysis = df[[x_column, y_column]].copy()
        df_analysis.dropna(axis=0, how='any', inplace=True)
        correlation_result = stats.pearsonr(df_analysis[x_column], df_analysis[y_column])

        return correlation_result

    def get_data_correlations_for_well_data(self, df):
        columns = ['x_column', 'y_column', 'correlation coefficient', 'p-value']
        correlation_df = pd.DataFrame(columns=columns)
        y_column = self.y_columns[0]
        for x_column in self.x_columns:
            cfg = {'df': df, 'x_column': x_column, 'y_column': y_column}
            correlation_result = self.get_data_correlations_for_2_variables(cfg)
            df_row = [x_column, y_column, round(correlation_result[0], 5), round(correlation_result[1], 5)]
            correlation_df.loc[len(correlation_df)] = df_row

        return correlation_df

    def get_reservoir_pressure_maturity_chart(self, cfg):
        from common.visualization import Visualization
        viz = Visualization()

        df = cfg['df']
        x = cfg['x']
        y = cfg['y']
        size_ref_column = cfg['size_ref_column']
        sizeref_max = df[size_ref_column].max()
        sizeref = viz.get_custom_size_ref(sizeref_max, sizemax=40)

        porosity_list = df['Porosity'].to_list()
        well_depth_list = df['WellDepth'].to_list()
        text_array = [str(porosity) + '%;' + '<br>' + str(well_depth)  + 'ft;' for porosity, well_depth in zip(porosity_list, well_depth_list)]
        df['text'] = text_array

        layout = {
            'title': '12Month Cummulative Production with Reservoir Pressure and Maturity',
            'yaxis': {
                'title': 'Reservoir Pressure (psi)'
            },
            'xaxis': {
                'title': 'Maturity (Percent)'
            },
        }
        cfg_plot_data = {
            'data_source': df,
            'mode': 'markers',
            'marker': {
                'size': [],
                'sizemode': 'area',
                'sizeref': sizeref,
                'sizecolumn': size_ref_column,
                'sizerefcolumn': size_ref_column,
                'sizemin': 4,
                'sizemax': 40,
                'color': 'rgb(255, 65, 54)'
            },
            'name': ['CumOil12Month'],
            'x': [x],
            'y': [y],
            'text': ['text']
        }
        cfg_plot_data.update({'layout': layout})

        plotly_data = viz.get_plotly_data(cfg_plot_data)
        return plotly_data

    def get_correlations_chart(self, cfg):
        from common.visualization import Visualization
        viz = Visualization()

        df = cfg['df']
        x = cfg['x']
        y = cfg['y']
        text = cfg['text']
        text_array = df[text].to_list()
        text_array = ["p-value: " + str(p_value) for p_value in text_array]
        df['text'] = text_array

        layout = {
            'title': '12Month Cummulative Production Correlation with Variables',
            'xaxis': {
                'tickangle': -45,
                'type': 'category',
                'categoryorder': 'category ascending'
            },
            'yaxis': {
                'title': 'Correlation Coefficient'
            },
            'hovermode': "closest",
        }
        cfg_plot_data = {
            'data_source': df,
            'type': 'bar',
            'name': ['CumOil12Month'],
            'x': [x],
            'y': [y],
            'text': ['text']
        }
        cfg_plot_data.update({'layout': layout})

        plotly_data = viz.get_plotly_data(cfg_plot_data)
        return plotly_data
