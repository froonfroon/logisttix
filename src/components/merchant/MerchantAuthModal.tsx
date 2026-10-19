import { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Modal, Button, Field, inputClass } from '../ui';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface MerchantAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'LOGIN' | 'REGISTER';
}

export function MerchantAuthModal({ isOpen, onClose, defaultMode = 'REGISTER' }: MerchantAuthModalProps) {
  const { state, registerMerchant } = useData();
  const { setActiveMerchantId, setPortal } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(defaultMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Register multi-step form state
  const [regData, setRegData] = useState({
    companyName: '',
    name: '',
    phone: '010',
    email: '',
    category: 'أزياء وملابس ومصنوعات جلدية',
    storeUrl: '',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    pickupAddress: '',
    expectedDailyOrders: '30 - 60 شحنة/يوم',
    commercialReg: '',
    bankName: 'البنك التجاري الدولي CIB',
    accountHolder: '',
    iban: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      toast('يرجى إدخال اسم المتجر أو البريد الإلكتروني أو الهاتف', 'error');
      return;
    }

    const found = state.merchants.find(
      (m) =>
        m.email.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
        m.phone.includes(loginIdentifier.trim()) ||
        m.companyName.toLowerCase().includes(loginIdentifier.trim().toLowerCase())
    );

    if (found) {
      setActiveMerchantId(found.id);
      setPortal('MERCHANT');
      toast(`مرحباً بك مجدداً في بوابة المتجر (${found.companyName})`, 'success');
      onClose();
    } else {
      toast('لم يتم العثور على حساب تاجر بهذه البيانات، يمكنك تسجيل حساب جديد', 'error');
    }
  };

  const handleRegisterSubmit = () => {
    if (!regData.companyName.trim()) {
      toast('يرجى إدخال اسم المتجر أو العلامة التجارية', 'error');
      setStep(1);
      return;
    }
    if (!regData.name.trim()) {
      toast('يرجى إدخال اسم المسؤول عن المتجر', 'error');
      setStep(2);
      return;
    }
    if (!regData.phone.trim() || regData.phone.length < 11) {
      toast('يرجى إدخال رقم هاتف محمول صالح مكون من 11 رقماً', 'error');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerMerchant(regData);
      setIsSubmitting(false);

      if (res.ok && res.merchant) {
        setActiveMerchantId(res.merchant.id);
        setPortal('MERCHANT');
        toast('تم إرسال طلب انضمام المتجر بنجاح! طلبك قيد مراجعة وتدقيق الإدارة', 'success');
        onClose();
      } else {
        toast(res.error || 'حدث خطأ أثناء إرسال الطلب', 'error');
      }
    }, 600);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={mode === 'LOGIN' ? 'تسجيل الدخول إلى بوابة التاجر' : 'طلب انضمام وشراكة لوجستية لمتجرك'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Mode Toggle Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'REGISTER'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            فتح حساب تاجر جديد
          </button>
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'LOGIN'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            تسجيل دخول تاجر قائم
          </button>
        </div>

        {/* ---------------- LOGIN MODE ---------------- */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200">
              أدخل البريد الإلكتروني أو رقم هاتف المتجر المسجل للوصول الفوري إلى لوحة القيادة وإدارة الشحنات.
            </div>

            <Field label="البريد الإلكتروني أو هاتف المتجر أو اسم الشركة">
              <input
                type="text"
                placeholder="مثال: info@brandzone.eg أو 01012345678"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </Field>

            {/* Quick Demo Switcher */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">أو تسجيل سريع بحسابات المتاجر المعتمدة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {state.merchants.filter((m) => m.status === 'ACTIVE').slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveMerchantId(m.id);
                      setPortal('MERCHANT');
                      toast(`تم تسجيل الدخول بحساب: ${m.companyName}`, 'success');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-orange-500/50 text-right transition-all group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">{m.companyName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={onClose}>إلغاء</Button>
              <Button variant="primary" type="submit">تسجيل الدخول</Button>
            </div>
          </form>
        ) : (
          /* ---------------- REGISTER ONBOARDING WIZARD ---------------- */
          <div className="space-y-5">
            {/* Steps Navigation Bar */}
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              
              <div className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer`} onClick={() => setStep(1)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 1 ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-[11px] font-bold ${step === 1 ? 'text-orange-400' : 'text-slate-400'}`}>بيانات المتجر</span>
              </div>

              <div className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer`} onClick={() => setStep(2)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 2 ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <span className={`text-[11px] font-bold ${step === 2 ? 'text-orange-400' : 'text-slate-400'}`}>المسؤول والموقع</span>
              </div>

              <div className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer`} onClick={() => setStep(3)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3 ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  3
                </div>
                <span className={`text-[11px] font-bold ${step === 3 ? 'text-orange-400' : 'text-slate-400'}`}>السجل والبنك</span>
              </div>
            </div>

            {/* STEP 1: STORE PROFILE */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="اسم المتجر / العلامة التجارية (Brand Name) *">
                    <input
                      type="text"
                      placeholder="مثال: متجر تريندي للأزياء"
                      value={regData.companyName}
                      onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                      className={inputClass}
                      autoFocus
                    />
                  </Field>

                  <Field label="نشاط وتصنيف المنتجات *">
                    <select
                      value={regData.category}
                      onChange={(e) => setRegData({ ...regData, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="أزياء وملابس ومصنوعات جلدية">أزياء وملابس ومصنوعات جلدية</option>
                      <option value="إلكترونيات وهواتف ذكية وملحقات">إلكترونيات وهواتف ذكية وملحقات</option>
                      <option value="مستحضرات تجميل وعناية شخصية">مستحضرات تجميل وعناية شخصية</option>
                      <option value="أدوات منزلية ومستلزمات مطبخ">أدوات منزلية ومستلزمات مطبخ</option>
                      <option value="أحذية وحقائب واكسسوارات">أحذية وحقائب واكسسوارات</option>
                      <option value="منتجات عامة ومتنوعة">منتجات عامة ومتنوعة</option>
                    </select>
                  </Field>

                  <Field label="رابط المتجر أو صفحة السوشيال ميديا">
                    <input
                      type="text"
                      placeholder="https://yourstore.com أو صفحة إنستغرام"
                      value={regData.storeUrl}
                      onChange={(e) => setRegData({ ...regData, storeUrl: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="حجم الشحنات اليومي المتوقع *">
                    <select
                      value={regData.expectedDailyOrders}
                      onChange={(e) => setRegData({ ...regData, expectedDailyOrders: e.target.value })}
                      className={inputClass}
                    >
                      <option value="10 - 30 شحنة/يوم">10 - 30 شحنة/يوم (فئة البداية)</option>
                      <option value="30 - 80 شحنة/يوم">30 - 80 شحنة/يوم (فئة النمو)</option>
                      <option value="80 - 200 شحنة/يوم">80 - 200 شحنة/يوم (تاجر متقدم Pro)</option>
                      <option value="أكثر من 200 شحنة/يوم">أكثر من 200 شحنة/يوم (Enterprise VIP)</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT & PICKUP */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="اسم الشخص المسؤول / مالك المتجر *">
                    <input
                      type="text"
                      placeholder="الاسم ثلاثي"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      className={inputClass}
                      autoFocus
                    />
                  </Field>

                  <Field label="رقم هاتف المالك / واتساب *">
                    <input
                      type="text"
                      placeholder="01012345678"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="البريد الإلكتروني الرسمي *">
                    <input
                      type="email"
                      placeholder="owner@yourstore.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="محافظة استلام الشحنات (Pickup) *">
                    <select
                      value={regData.governorate}
                      onChange={(e) => setRegData({ ...regData, governorate: e.target.value })}
                      className={inputClass}
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="القليوبية">القليوبية</option>
                      <option value="الشرقية">الشرقية</option>
                      <option value="الدقهلية">الدقهلية</option>
                      <option value="الغربية">الغربية</option>
                    </select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="عنوان المخزن أو مقر الاستلام التفصيلي *">
                      <input
                        type="text"
                        placeholder="المنطقة، الشارع، رقم العقار أو المستودع"
                        value={regData.pickupAddress}
                        onChange={(e) => setRegData({ ...regData, pickupAddress: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: KYB & BANK REMITTANCE */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300">
                  تُستخدم هذه البيانات للتحقق التجاري والضريبي ولتحويل مبالغ الـ COD إلى حسابك البنكي دورياً.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="رقم السجل التجاري / وثيقة العمل الحر">
                    <input
                      type="text"
                      placeholder="CR-123456 أو رقم الوثيقة"
                      value={regData.commercialReg}
                      onChange={(e) => setRegData({ ...regData, commercialReg: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="اسم البنك لتحويل الأرباح">
                    <input
                      type="text"
                      placeholder="البنك التجاري الدولي CIB / البنك الأهلي"
                      value={regData.bankName}
                      onChange={(e) => setRegData({ ...regData, bankName: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="اسم صاحب الحساب البنكي">
                    <input
                      type="text"
                      placeholder="مطابق لبيانات البنك الرسمية"
                      value={regData.accountHolder}
                      onChange={(e) => setRegData({ ...regData, accountHolder: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="رقم الآيبان (IBAN) للتحويل">
                    <input
                      type="text"
                      placeholder="EG..."
                      value={regData.iban}
                      onChange={(e) => setRegData({ ...regData, iban: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep((prev) => (prev - 1) as any)}>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                  السابق
                </Button>
              ) : (
                <Button variant="ghost" onClick={onClose}>
                  إلغاء
                </Button>
              )}

              {step < 3 ? (
                <Button variant="primary" onClick={() => setStep((prev) => (prev + 1) as any)}>
                  التالي: {step === 1 ? 'بيانات المسؤول' : 'البيانات البنكية والسجل'}
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleRegisterSubmit} disabled={isSubmitting}>
                  <Sparkles className="w-4 h-4 ml-1.5" />
                  {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام للتدقيق'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
