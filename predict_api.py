# تطبيق ويب صغير باستخدام Flask يسمح لك بتشغيل نموذج تعلم آلي (الذي حفظته في ملف near_loss_model.pkl) كخدمة ويب (API) حتى يمكن إرسال بيانات إليها والحصول على تنبؤات من النموذج.

from flask import Flask, request, jsonify       # استيراد Flask لإنشاء تطبيق ويب، وطلب واستجابة بصيغة JSON
import joblib                                    # لتحميل النموذج المحفوظ
import pandas as pd                              # لمعالجة البيانات وتحويلها إلى DataFrame

app = Flask(__name__)                            # إنشاء تطبيق Flask جديد
model = joblib.load("near_loss_model.pkl")      # تحميل نموذج شجرة القرار المحفوظ مسبقاً

@app.route("/predict", methods=["POST"])         # تعريف نقطة نهاية API تستقبل طلب POST في المسار /predict
def predict():
    data = request.get_json()                     # استقبال البيانات المرسلة بصيغة JSON
    df = pd.DataFrame([data])                      # تحويل البيانات إلى DataFrame لتناسب نموذج التعلم الآلي
    prediction = model.predict(df)[0]              # الحصول على التنبؤ من النموذج (هل الحالة قريبة من الخسارة)
    return jsonify({"prediction": int(prediction)})  # إرجاع النتيجة كـ JSON

if __name__ == "__main__":
    app.run(debug=True)                           # تشغيل السيرفر محليًا مع تفعيل وضع التصحيح لتتبع الأخطاء
