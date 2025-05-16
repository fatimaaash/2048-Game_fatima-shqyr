import dash
from dash import dcc, html
import pandas as pd
import plotly.express as px

df = pd.read_csv("full_game_data.csv")
df['move_number'] = df.index + 1

# إذا ما في عمود Result أضيفيه
if 'Result' not in df.columns:
    def calculate_result(row):
        if row['Score'] >= 2048:
            return 'Win'
        else:
            return 'Loss'
    df['Result'] = df.apply(calculate_result, axis=1)

fig_time = px.line(
    df,
    x='move_number',
    y='MoveTime(ms)',
    labels={'move_number': 'رقم الحركة', 'MoveTime(ms)': 'الزمن بين الحركات (ms)'},
    title='⏱️ الزمن بين الحركات'
)

fig_max_tile = px.histogram(
    df,
    x='MaxTile',
    nbins=10,
    title='📈 أعلى بلاطة وصلت لها خلال الجلسة',
    labels={'MaxTile': 'قيمة البلاطة'}
)

move_counts = df['Direction'].value_counts().reset_index()
move_counts.columns = ['Direction', 'Count']

fig_move_dir = px.bar(
    move_counts,
    x='Direction',
    y='Count',
    title='تحليل اتجاهات الحركة',
    labels={'Direction': 'الاتجاه', 'Count': 'عدد الحركات'}
)

fig_win_loss = px.pie(
    df,
    names='Result',
    title='نسبة الفوز والخسارة'
)

app = dash.Dash(__name__)
app.title = "لوحة تحكم 2048"

app.layout = html.Div([
    html.H1("لوحة تحكم لعبة 2048 👑", style={'textAlign': 'center'}),
    html.Div(f"عدد الحركات المسجلة: {len(df)}", style={'textAlign': 'center', 'marginTop': '20px'}),
    dcc.Graph(figure=fig_time, style={'width': '95vw', 'height': '50vh', 'margin': 'auto'}),
    dcc.Graph(figure=fig_max_tile, style={'width': '95vw', 'height': '50vh', 'margin': 'auto'}),
    dcc.Graph(figure=fig_move_dir, style={'width': '95vw', 'height': '50vh', 'margin': 'auto'}),
    dcc.Graph(figure=fig_win_loss, style={'width': '95vw', 'height': '50vh', 'margin': 'auto'}),
])

if __name__ == '__main__':
    app.run(debug=True)
