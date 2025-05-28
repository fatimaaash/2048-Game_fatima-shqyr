# تحليل بيانات اللعبه باستخدام التعلم الالي
#  بهدف التنبؤ بحالة قريبة من الخسارة أثناء اللعب.
import pandas as pd                         # استيراد مكتبة pandas للتعامل مع البيانات
import matplotlib.pyplot as plt             # لاستيراد أدوات الرسم البياني
from sklearn.tree import plot_tree          # لاستيراد دالة رسم شجرة القرار

from sklearn.tree import DecisionTreeClassifier    # استيراد نموذج شجرة القرار
from sklearn.model_selection import train_test_split  # لاستيراد دالة تقسيم البيانات
from sklearn.metrics import classification_report, accuracy_score  # لاستيراد دوال تقييم النموذج

# تحميل البيانات من ملف CSV
df = pd.read_csv("full_game_data.csv")

# إنشاء عمود جديد 'is_near_loss' لتحديد الحالات القريبة من الخسارة
# إذا كان عدد الخانات الفارغة <= 3 نعتبر الحالة قريبة من الخسارة (1)، وإلا (0)
df['is_near_loss'] = df['EmptyTiles'].apply(lambda x: 1 if x <= 3 else 0)

# تجهيز الميزات (المدخلات) - الأعمدة التي يستخدمها النموذج للتنبؤ
X = df[['Score', 'MaxTile', 'MoveTime(ms)', 'EmptyTiles']]

# تجهيز العمود الهدف (ما نريد التنبؤ به)
y = df['is_near_loss']

# تقسيم البيانات إلى مجموعة تدريب (80%) واختبار (20%) مع ضبط العشوائية لنتائج متكررة
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# إنشاء نموذج شجرة القرار مع تحديد أقصى عمق للشجرة
model = DecisionTreeClassifier(max_depth=4, random_state=42)

# تدريب النموذج على بيانات التدريب
model.fit(X_train, y_train)

# رسم شجرة القرار لفهم كيفية اتخاذ النموذج للقرارات
plt.figure(figsize=(16, 8))  
plot_tree(model, 
          feature_names=['Score', 'MaxTile', 'MoveTime(ms)', 'EmptyTiles'], 
          class_names=['Not Near Loss', 'Near Loss'],
          filled=True)
plt.title("Decision Tree - Near Loss Prediction")
plt.show()

# التنبؤ باستخدام النموذج على بيانات الاختبار
y_pred = model.predict(X_test)

# طباعة تقرير التصنيف الذي يحتوي على دقة النموذج وغيرها من المقاييس
print("🎯 تقرير التصنيف:")
print(classification_report(y_test, y_pred))

# طباعة دقة النموذج كنسبة مئوية
print("✅ دقة النموذج:", accuracy_score(y_test, y_pred))

import joblib  # لاستيراد مكتبة لحفظ النموذج في ملف

# حفظ النموذج المدرب في ملف لاستخدامه لاحقاً بدون الحاجة لإعادة التدريب
joblib.dump(model, "near_loss_model.pkl")
print("✅ النموذج تم حفظه!")

