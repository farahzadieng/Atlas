# Atlas v0.4.2 — راهنمای تست و انتشار

## 1) پیش از انتشار
- فایل `atlas.config.json` خودتان را در پوشه ریشه جایگزین نمونهٔ فایل این ZIP کنید؛ فایل نمونه placeholder دارد.
- `allowedEmail` و `dexieCloudUrl` در Build مرورگر قرار می‌گیرند و **رمز/Secret نیستند**؛ کلید مدیریتی `dexie-cloud.key` هرگز منتشر یا Commit نشود.
- اگر از نسخه قدیمی Atlas اطلاعات دارید، **قبل از فعال‌سازی Dexie Cloud بکاپ JSON بگیرید**؛ دیتابیس محلی جدید لزوماً داده‌های قبلی را نمی‌بیند.
- `npm install` و سپس `npm run build` را **بدون sudo** اجرا کنید.
- Build موفق تضمین‌کننده عملکرد ورود، Sync یا مالکیت داده نیست؛ آن‌ها باید در دستگاه واقعی آزمایش شوند.

## 2) آیکون‌های PWA
- `public/icon-192.png` و `public/icon-512.png`: آیکون‌های معمولی
- `public/icon-maskable-512.png`: نسخهٔ دارای حاشیه امن برای ماسک سیستم‌عامل
- `public/apple-touch-icon.png`: آیکون Home Screen آیفون
- `public/favicon-64.png`: favicon مرورگر
- `public/atlas-icon-source-1024.png`: تصویر با کیفیت بالا برای خروجی‌های آینده
- Manifest توسط `vite-plugin-pwa` در Build تولید می‌شود و لازم نیست manifest دستی جداگانه بسازید.

## 3) GitHub
- یک Repository **Private** بسازید.
- سورس همین پوشه را به ریشه Repository منتقل کنید (نه خود فولدر ZIP به صورت یک زیرپوشه).
- `node_modules`, `dist`, `dexie-cloud.key`, `dexie-cloud.json` را Commit نکنید. `.gitignore` موجود آن‌ها را مستثنا می‌کند.
- پس از اولین Commit، شاخه `main` را Push کنید.

## 4) Cloudflare Pages
- Workers & Pages → Create application → Pages → Connect to Git → GitHub Repository
- Framework preset: Vite یا React (Vite)
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: Repository root
- در صورت نیاز، `NODE_VERSION` را `22` قرار دهید.
- پس از Deploy یک دامنه شبیه `https://your-project.pages.dev` می‌گیرید.

## 5) Dexie Cloud origin
از **همان پوشه محلی** که `dexie-cloud.key` را دارد:

```bash
npx dexie-cloud whitelist https://your-project.pages.dev
npx dexie-cloud whitelist
```

برای توسعه محلی در صورت نیاز: `npx dexie-cloud whitelist http://localhost:5173`.
برای دامنهٔ اختصاصی، origin واقعی جدید را هم whitelist کنید. **این کار امنیت لاگین نیست؛ تنظیم CORS/Origin سرویس است.**

## 6) تست قبل از ذخیره اطلاعات واقعی
- Safari مک: ورود OTP، ساخت پروژه آزمایشی و کارت، خروج و بازگشت و بررسی نشست.
- Safari آیفون: بازکردن همان دامنه، ورود OTP مستقل و مشاهده تغییر آزمایشی مک.
- آفلاین: بعد از اولین بارگذاری و ورود، اینترنت را قطع و داده آزمایشی ثبت کنید، سپس اتصال را برگردانید؛ بررسی کنید Sync انجام شود.
- دسترسی غیرمجاز: با یک حساب دیگر نباید بتوان اطلاعات کاربر اصلی را خواند. صرف `allowedEmail` در فرانت‌اند محدودیت امنیتی سمت سرور نیست.
- روی iPhone: Safari → Share → Add to Home Screen و آیکون را بررسی کنید.
- اگر آیکون قدیمی مانده، پس از بررسی فایل `apple-touch-icon.png` و Deploy تازه، میانبر قبلی Home Screen را حذف و دوباره اضافه کنید.

## هشدارهای مهم
- Cloudflare Pages نسخه استاتیک رابط را به همه بازدیدکنندگان می‌دهد؛ دسترسی به داده باید توسط Dexie Cloud محدود باشد.
- ورود و Sync هنوز بدون اجرای عملی در Safari و ساخت Release واقعی تأیید نشده‌اند.
- URLهای preview جداگانه را تا زمانی که برای Dexie Cloud whitelist نکرده‌اید برای ورود استفاده نکنید.
