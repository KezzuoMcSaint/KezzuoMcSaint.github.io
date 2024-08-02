import pandas as pd

gdp_data = pd.read_csv('GDP_Narrative_Visualization\data\API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_2317396.csv', skiprows=4)
country_metadata = pd.read_csv('GDP_Narrative_Visualization\data\Metadata_Country_API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_2317396.csv')
indicator_metadata = pd.read_csv('GDP_Narrative_Visualization\data\Metadata_Indicator_API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_2317396.csv')

gdp_data = gdp_data[['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'] + [str(year) for year in range(2000, 2020)]]
gdp_data = gdp_data.melt(id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'], var_name='Year', value_name='Value')

gdp_data.to_csv('gdp_data_preprocessed.csv', index=False)