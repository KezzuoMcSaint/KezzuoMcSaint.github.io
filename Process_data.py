import pandas as pd

file_path = 'API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_2317396.csv'

df = pd.read_csv(file_path, skiprows=4)

countries_of_interest = ['USA', 'RUS', 'CHN', 'IDN']
df_filtered = df[df['Country Code'].isin(countries_of_interest)]

df_melted = df_filtered.melt(id_vars=['Country Name', 'Country Code'], var_name='Year', value_name='GDP Growth')

df_melted = df_melted[df_melted['Year'].str.isnumeric()]
df_melted['Year'] = df_melted['Year'].astype(int)

df_melted = df_melted.dropna(subset=['GDP Growth'])

df_melted.to_csv('gdp_growth_data.csv', index=False)