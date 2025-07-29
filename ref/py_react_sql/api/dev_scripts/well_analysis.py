from analysis.well_analysis import WellAnalysis

well_analysis = WellAnalysis()
well_data_df = well_analysis.get_data_from_csv()
correlation_df = well_analysis.get_data_correlations_for_well_data(well_data_df)

cfg = {'df': well_data_df, 'x': 'Maturity', 'y': 'ReservoirPressure', 'size_ref_column': 'CumOil12Month'}
reservoir_pressure_maturity_chart = well_analysis.get_reservoir_pressure_maturity_chart(cfg)

cfg = {'df': correlation_df, 'x': 'x_column', 'y': 'correlation coefficient', 'text': 'p-value'}
correlations_chart = well_analysis.get_correlations_chart(cfg)
