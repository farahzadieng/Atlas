# Deep Link اتصال Atlas به تقویم و یادآور اپل

## دامنه پشتیبانی
این نسخه در iPhone Safari و macOS Safari از Deep Link رسمی `shortcuts://run-shortcut` استفاده می‌کند. **این لینک فقط Shortcut را اجرا می‌کند؛ ثبت رویداد را Shortcut انجام می‌دهد، نه مرورگر**. Apple Calendar و Apple Reminders لینک عمومی مستند برای «ایجاد مستقیم آیتم با تاریخ و عنوان» در Safari ندارند.

## آماده‌سازی یک‌باره (در آیفون یا مک)
1. در Apple Shortcuts دو میانبر با نام دقیق `Atlas Calendar` و `Atlas Reminder` بسازید. اگر iCloud Sync روشن است نام‌ها می‌توانند روی هر دو دستگاه ظاهر شوند.
2. ورودی `Shortcut Input` را به دیکشنری از JSON تبدیل کنید (Get Dictionary from Input). مقادیر `title`, `notes`, `project`, `dueAt`, `hasTime`, `id` را استخراج کنید.
3. `dueAt` تاریخ محلی به فرم `YYYY-MM-DDTHH:mm` است؛ آن را به تاریخ دستگاه تبدیل کنید. **از تبدیل خودکار به UTC خودداری کنید**؛ تاریخ و ساعت باید مطابق زمان محلی انتخاب‌شده در Atlas باقی بماند.
4. در `Atlas Calendar` با اکشن Add New Event عنوان را برابر `title`، زمان شروع را `dueAt` و پایان را ۶۰ دقیقه بعد قرار دهید. Notes را از ترکیب `project` و `notes` بسازید. مقصد را Default Calendar قرار دهید و در انتها با Open App، Calendar را باز کنید.
5. در `Atlas Reminder` با اکشن Add New Reminder عنوان `title`، Notes ترکیبی و موعد `dueAt` را در لیست پیش‌فرض اضافه کنید؛ سپس Open App → Reminders قرار دهید.
6. هنگام نخستین اجرا مجوزهای Calendar/Reminders را تأیید کنید. برای پیشگیری از تکرار، بهتر است Shortcut قبل از افزودن، آیتمی را با شناسه Atlas در توضیح جست‌وجو کند؛ این رفتار **هنوز جزو کد این نسخه نیست**.

## رفتار دکمه‌ها
از کارت Task دارای موعد، روی «تقویم اپل» یا «یادآور اپل» بزنید. Safari ممکن است برای بازکردن Shortcuts تأیید بخواهد. Deep Link شامل JSON URL-encoded با مثال زیر است:

```json
{"title":"طراحی صفحه اصلی","project":"سایت","notes":"...","id":"uuid","dueAt":"2026-11-20T10:30","hasTime":true,"durationMinutes":60,"source":"Atlas"}
```

اگر در Atlas تسک بدون ساعت ذخیره شده باشد، ویرایشگر هنگام بازکردن آن ساعت پیش‌فرض 09:00 را پیشنهاد می‌کند. پیش از ارسال، ساعت مناسب را انتخاب کنید.

## محدودیت‌ها
- هیچ پاسخ قابل اتکایی درباره ثبت موفق از Shortcuts به PWA بازگردانده نمی‌شود؛ Atlas وضعیت «ثبت شد» را حدس نمی‌زند.
- ایجاد دوباره می‌تواند رویداد تکراری بسازد؛ همگام‌سازی دوطرفه نداریم.
- این روش نیازمند نصب/ساخت دو Shortcut است و به معنی لینک مستقیم `calshow://` یا `reminders://` برای ایجاد آیتم نیست.
- **روی دستگاه واقعی تست شود:** macOS Safari و iOS Safari ممکن است تأیید باز کردن URL scheme را درخواست کنند.

## مستندات رسمی
https://support.apple.com/guide/shortcuts/apd624386f42/ios
https://support.apple.com/guide/shortcuts-mac/apd624386f42/mac
