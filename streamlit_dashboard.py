import streamlit as st
import pandas as pd
import joblib        # مكتبة لحفظ وتحميل نماذج التعلم الآلي بسهولة من/إلى ملفات
import plotly.express as px   # مكتبة لإنشاء رسومات بيانية تفاعلية وسهلة الاستخدام


import streamlit as st
import pandas as pd
import joblib
import plotly.express as px

# تطبيق ويب تفاعلي باستخدام Streamlit لتحليل بيانات لعبة 2048 والتنبؤ بخطر الخسارة

@st.cache_data
def load_data():
    # تحميل بيانات اللعبة من ملف CSV وإضافة عمود لرقم الحركة (move_number)
    df = pd.read_csv("full_game_data.csv")
    df['move_number'] = df.index + 1
    return df

df = load_data()  # تحميل البيانات مرة واحدة مع التخزين المؤقت لتحسين الأداء

@st.cache_resource
def load_model():
    # تحميل نموذج تعلم الآلة المحفوظ في ملف pkl مع التخزين المؤقت
    return joblib.load("near_loss_model.pkl")

model = load_model()  # تحميل النموذج عند بدء التطبيق

# عنوان الصفحة الرئيسي
st.title("لوحة تحكم وتحليل لعبة 2048 👑")

# عنوان فرعي مع عرض معاينة بيانات الحركات
st.subheader("معاينة بيانات الحركات")
st.write(df.head())  # عرض أول 5 صفوف من البيانات
st.write(f"عدد الحركات المسجلة: {len(df)}")  # عرض إجمالي عدد الحركات

# رسم بياني خطي للزمن بين الحركات
fig_time = px.line(df, x='move_number', y='MoveTime(ms)', title='⏱️ الزمن بين الحركات')
st.plotly_chart(fig_time, use_container_width=True)

# رسم بياني عمودي لتوزيع أعلى البلاطات التي وصل إليها اللاعب
fig_max_tile = px.histogram(df, x='MaxTile', nbins=10, title='📈 أعلى بلاطة وصلت لها')
st.plotly_chart(fig_max_tile, use_container_width=True)

# تحليل اتجاهات الحركة ورسم بياني شريطي
move_counts = df['Direction'].value_counts().reset_index()
move_counts.columns = ['Direction', 'Count']
fig_move_dir = px.bar(move_counts, x='Direction', y='Count', title='تحليل اتجاهات الحركة')
st.plotly_chart(fig_move_dir, use_container_width=True)

# قسم التنبؤ بخطر الخسارة
st.header("تنبؤ الخطر")

# إدخال بيانات من المستخدم
score = st.number_input("Score (النقاط)", min_value=0)
max_tile = st.number_input("MaxTile (أعلى بلاطة)", min_value=0)
move_time = st.number_input("MoveTime(ms) (الزمن بين الحركات)", min_value=0)
empty_tiles = st.number_input("EmptyTiles (عدد الخانات الفارغة)", min_value=0)

# زر لتنفيذ التنبؤ
if st.button("تنبؤ"):
    # تجهيز بيانات الإدخال للنموذج على شكل DataFrame
    input_data = pd.DataFrame([{
        'Score': score,
        'MaxTile': max_tile,
        'MoveTime(ms)': move_time,
        'EmptyTiles': empty_tiles
    }])
    st.write("🔍 البيانات المدخلة للنموذج:")
    st.write(input_data)

    try:
        # التنبؤ بالخطر (1 = خطر وشيك، 0 = آمن)
        prediction = model.predict(input_data)[0]
        st.success(f" التنبؤ: {'⚠️ خطر وشيك' if prediction == 1 else 'آمن '}")
    except Exception as e:
        # عرض رسالة خطأ في حالة فشل التنبؤ
        st.error(f"❌ خطأ في التنبؤ: {e}")
