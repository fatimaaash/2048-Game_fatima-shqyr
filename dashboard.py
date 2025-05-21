import streamlit as st
import pandas as pd
import plotly.express as px

# تحميل البيانات
df = pd.read_csv("full_game_data.csv")
df['move_number'] = df.index + 1

# إضافة عمود النتيجة إذا غير موجود
if 'Result' not in df.columns:
    def calculate_result(row):
        return 'Win' if row['Score'] >= 2048 else 'Loss'
    df['Result'] = df.apply(calculate_result, axis=1)

# واجهة Streamlit
st.set_page_config(page_title="لوحة تحكم 2048", layout="wide")

st.title("🎮 لوحة تحكم لعبة 2048 👑")
st.markdown(f"### 🔢 عدد الحركات المسجلة: {len(df)}")

# رسم الزمن بين الحركات
fig_time = px.line(
    df,
    x='move_number',
    y='MoveTime(ms)',
    labels={'move_number': 'رقم الحركة', 'MoveTime(ms)': 'الزمن بين الحركات (ms)'},
    title='⏱️ الزمن بين الحركات'
)
st.plotly_chart(fig_time, use_container_width=True)

# رسم أعلى بلاطة
fig_max_tile = px.histogram(
    df,
    x='MaxTile',
    nbins=10,
    title='📈 أعلى بلاطة وصلت لها خلال الجلسة',
    labels={'MaxTile': 'قيمة البلاطة'}
)
st.plotly_chart(fig_max_tile, use_container_width=True)

# تحليل اتجاهات الحركة
move_counts = df['Direction'].value_counts().reset_index()
move_counts.columns = ['Direction', 'Count']
fig_move_dir = px.bar(
    move_counts,
    x='Direction',
    y='Count',
    title='🧭 تحليل اتجاهات الحركة',
    labels={'Direction': 'الاتجاه', 'Count': 'عدد الحركات'}
)
st.plotly_chart(fig_move_dir, use_container_width=True)

# رسم نسبة الفوز والخسارة
fig_win_loss = px.pie(
    df,
    names='Result',
    title='🏁 نسبة الفوز والخسارة'
)
st.plotly_chart(fig_win_loss, use_container_width=True)
