import streamlit as st
import pandas as pd
import joblib
import plotly.express as px

# تحميل البيانات من ملف CSV
@st.cache_data
def load_data():
    df = pd.read_csv("full_game_data.csv")
    df['move_number'] = df.index + 1
    return df

df = load_data()

# تحميل نموذج ML المدرب
@st.cache_resource
def load_model():
    return joblib.load("near_loss_model.pkl")

model = load_model()

# عنوان الصفحة
st.title("لوحة تحكم وتحليل لعبة 2048 👑")

# عرض أول بيانات للتأكد
st.subheader("معاينة بيانات الحركات")
st.write(df.head())

# عرض عدد الحركات المسجلة
st.write(f"عدد الحركات المسجلة: {len(df)}")

# الرسم البياني: الزمن بين الحركات
fig_time = px.line(df, x='move_number', y='MoveTime(ms)', title='⏱️ الزمن بين الحركات')
st.plotly_chart(fig_time, use_container_width=True)

# الرسم البياني: أعلى بلاطة وصلت لها
fig_max_tile = px.histogram(df, x='MaxTile', nbins=10, title='📈 أعلى بلاطة وصلت لها')
st.plotly_chart(fig_max_tile, use_container_width=True)

# تحليل اتجاهات الحركة
move_counts = df['Direction'].value_counts().reset_index()
move_counts.columns = ['Direction', 'Count']
fig_move_dir = px.bar(move_counts, x='Direction', y='Count', title='تحليل اتجاهات الحركة')
st.plotly_chart(fig_move_dir, use_container_width=True)

# نسبة الفوز والخسارة (إذا كان لديك عمود 'Win' في البيانات)
if 'Win' in df.columns:
    win_loss_counts = df['Win'].value_counts().reset_index()
    win_loss_counts.columns = ['Outcome', 'Count']
    fig_win_loss = px.pie(win_loss_counts, values='Count', names='Outcome', title='نسبة الفوز والخسارة')
    st.plotly_chart(fig_win_loss, use_container_width=True)
else:
    st.info("لا توجد بيانات للفوز والخسارة في ملف البيانات.")

# قسم التنبؤ بالخطر
st.header("تنبؤ الخطر")

# إدخال المستخدم للميزات المطلوبة بالتسلسل الصحيح
score = st.number_input("Score (النقاط)", min_value=0)
max_tile = st.number_input("MaxTile (أعلى بلاطة)", min_value=0)
move_time = st.number_input("MoveTime(ms) (الزمن بين الحركات)", min_value=0)
empty_tiles = st.number_input("EmptyTiles (عدد الخانات الفارغة)", min_value=0)

if st.button("تنبؤ"):
    input_data = pd.DataFrame([{
        'Score': score,
        'MaxTile': max_tile,
        'MoveTime(ms)': move_time,
        'EmptyTiles': empty_tiles
    }])

    try:
        prediction = model.predict(input_data)[0]
        st.success(f"✅ التنبؤ: {'⚠️ خطر وشيك' if prediction == 1 else 'آمن ✅'}")
    except Exception as e:
        st.error(f"❌ خطأ في التنبؤ: {e}")
