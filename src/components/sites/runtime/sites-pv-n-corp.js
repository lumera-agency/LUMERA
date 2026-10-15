/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-n-corp.js (the working folder); unchanged. */
/* «Дизайн і сайти» (/dyzain-i-saity), round 10: the Базовий sample for Корпоративний сайт (5–7 сторінок; the sample shows 4
 * behind the frame's tabs, opts.page 0–3): a dental clinic, «Ваш бренд», vash-sait.ua, Київ. Art direction «Перлина»
 * (scratchpad redesign/clinic.md; the richer round: redesign/clinic-r10.md): a calm private clinic seen through a pearl.
 * Pearl white paper with a fine grain, soft nacre orbs and thin rings behind the key blocks, plum-graphite ink and two
 * deep bands (the first visit, the footer); layered photo frames, round photos, glass cards, line icons in nacre wells.
 * Type: Source Serif 4 (headings, light, upright; the key word in deep nacre with a sheen crossing it once), Geologica.
 * Multi-page cues: the header (an info bar with today's hours, the bar with the pages as pills, the current one lit and
 * numbered), four pearls on a thread in the left margin, the breadcrumb and «0N / 04», «Далі: …», the sitemap footer; a
 * page change lets a nacre disc grow from the page's name until the old page is fully covered, then fades onto the new one.
 *
 * Pages and blocks:
 *   01 Головна   — first screen (the operating light in a large frame; a round photo, a glass card with the nearest slot,
 *                  a circular badge and the pearl's pocket around it; three facts) · the services ribbon · «Що вас
 *                  турбує?» (worries as a list with icons → the service with its photo, price, visits and time) ·
 *                  numbers («Дані умовні») · the site's sections as a bento (each card opens its page) · the first visit
 *                  (a deep band: the badge, three steps, the call)
 *   02 Послуги   — page head · three price cards (the middle one deep) · all prices (categories, rows that open) · the
 *                  four pearls on the smile's curve · band
 *   03 Про нас   — page head · the rooms (captions, a fact card) · principles (icon cards) · doctors (a nacre field with
 *                  initials, the role, a week strip, «Записатися»; no names, no faces) · reviews (placeholders) · band
 *   04 Контакти  — page head · the booking as a product (steps that light up, service, day, time, contacts; a deep
 *                  summary that follows the choice; sent) · contacts (the map with a glass address card, the week's hours
 *                  with today lit, the cards)
 * Prices, visits, years and counts are illustrative and marked «Дані умовні». No medical promises.
 *
 * Components (rebuilt here in vanilla JS + CSS + WAAPI, inside the cqw miniature):
 *   ReactBits (reactbits.dev, David Haz, MIT + Commons Clause, notice below): SplitText (line masks), ShinyText (the key
 *   word's sheen, once), CircularText (the round badges: they turn once as they arrive and on hover), Counter (digits
 *   roll), PillNav (the pages as pills, the lit one slides on a page change), CardNav (the «Меню» cards), Stepper (the
 *   first visit's steps; the four pearls on the curve), Carousel (the reviews, quiet), SpotlightCard (the bento and the
 *   contact cards), TiltedCard (the round photos), SpringCheck (the booking choices), GlareHover (a sheen over the photos
 *   on hover), AccordionGallery (the rooms), Noise (one static grain over the paper).
 *   21st.dev (behaviour rebuilt from the public demos, no code taken): FlowButton · Kain Xu · MIT (every button: a circle
 *   of colour grows to fill the pill, the arrow leaves on the right while its twin enters on the left, the label shifts);
 *   Underline Animation · Daniel Petho (Fancy Components) · MIT; Number Flow · Maxwell Barvian · MIT; Sliding Number ·
 *   Julien Thibeaut (Motion Primitives) · MIT; Reveal images · Hari Lamichhane (Animata) · MIT («Далі»); Truncating
 *   Navbar · Maxim Bortnikov · MIT (the info bar folds away, the bar tightens); Restaurant Menu Block · Oliver
 *   (olewandowski1) · MIT (all prices); Booking Slot Calendar · bidyut10 · MIT; Contact 01 · ShadcnSpace · MIT; Mega
 *   Sitemap Footer · Oliver · MIT-0. Footer patterns from footer.design (dark, large type, cards: ideas only).
 *   Own: the nacre page change, the pearl string, the photos opening through a growing circle, the services ribbon.
 * The visitor's own hands (the engine's take-over): the scroll-linked parts watch the frame's viewport; every link goes
 *   to its page and, through ctx.scrollTo, to its section (a service's «Записатися» to the booking with that service
 *   chosen, «Усі ціни» to its row opened, a doctor's «Записатися» to the booking with the doctor's service); the
 *   scripted demo (the auto-picked worry) stops once the visitor takes over; a click inside never turns the page itself.
 * Photos: Cedric Fauntleroy, Pexels License (img/sites/photos/corp/CREDITS.md), one dental-clinic shoot: light.jpg 4269491,
 *   tools.jpg 4269356, chair.jpg 4269277, window.jpg 4269361, cab-1/2/3.jpg 4269264 / 4269272 / 4269276, handles.jpg
 *   4269354, kit.jpg 4269355, tray.jpg 4270967 (https://www.pexels.com/photo/<id>/); phone copies in m/.
 * 3D (opts.three, «3D-обʼєкт»): a pearl, the clinic's mark, resting in the first screen's pocket on the photo's lower
 *   edge: three.js r186 core, MeshPhysicalMaterial with iridescence and clearcoat and a faint nacre (SimplexNoise, once),
 *   a soft studio environment (PMREM), a real soft shadow (ShadowMaterial) on a transparent ground. It rolls in once, then
 *   rests; with a mouse it turns a little toward the pointer (frames only while the pointer moves). DPR ≤ 1.5, one
 *   context; reduced motion draws one still frame.
 * Motion: transform/opacity (and the photos' circular clip), each block once on entering the frame and only while it is
 *   on screen; nothing runs at rest; reduced motion shows the final frame. Styles: css/sites-pv-n-corp.css, all under
 *   .pv-site--n.pv-n-corporate.
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 */
export const meta = { theme: 'light', cube: 'light', bg: '#f6f2ee' };
export const object3d = true;

const PH = '/img/sites/photos/corp/';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const two = (n) => String(n).padStart(2, '0');
const MAIL = 'hello@vash-sait.ua';

/* ---------- the clinic's copy (UA / RU); the sample's frame gives only the brand, the address and the tabs ---------- */
const T = {
  uk: {
    eyebrow: 'Стоматологічна клініка · Київ',
    h1: ['Стоматологія, де вам', 'усе пояснюють'],
    sub: 'Спершу огляд і зрозумілий план із цінами. Лікування починаємо, коли ви все вирішили.',
    btn: 'Записатися на огляд', btn2: 'Послуги й ціни', cta: 'Записатися', menu: 'Меню',
    since: 'з 2014 року',
    openTill: 'Відчинено до', closedNow: 'Зараз зачинено', hoursShort: 'Пн–Пт 9–20 · Сб 10–16',
    trust: [['plan', 'План і ціна до лікування'], ['clock', 'Перший огляд 30 хв'], ['cal', 'Працюємо Пн–Сб']],
    slotK: 'Найближчий запис', badge: 'ПЕРШИЙ ОГЛЯД · 30 ХВИЛИН · ПЛАН І ЦІНА · ',
    pickK: 'Ваш запит', pickT: 'Що вас турбує?', pickP: 'Оберіть, і ми покажемо послугу, ціну й кількість візитів.',
    worries: ['Болить зуб', 'Час на чистку', 'Немає зуба', 'Нерівні зуби', 'Хочу світліші зуби', 'Просто огляд'],
    price: 'Ціна', visits: 'Візити', time: 'Тривалість', all: 'Усі ціни', book: 'Записатися',
    cond: 'Дані умовні',
    numsK: 'Клініка в цифрах', nums: [['2014', 'рік відкриття', 'cal'], ['4', 'кабінети', 'door'], ['9', 'лікарів у команді', 'people']],
    startK: 'Розділи сайту', startT: 'Почніть звідси',
    doors: [['Послуги й ціни', '7 послуг з цінами й візитами'], ['Про клініку', 'Лікарі, кабінети, принципи'], ['Запис і контакти', 'Онлайн-запис, адреса, графік']],
    visitK: 'Перший візит', visitT: ['Перший огляд —', '30 хвилин'], visitP: 'Ви йдете з планом і цінами. Лікування — тільки коли вирішите.',
    visitSteps: [['Огляд', 'Лікар дивиться й питає'], ['Знімок', 'Якщо потрібно'], ['План', 'Варіанти й ціни']], visitBadge: '30 хв',
    band: ['', 'Не знайшли свою послугу? Напишіть, і ми підкажемо.', 'Познайомтеся з лікарем на першому огляді.'],
    next: 'Далі',
    svcIntro: 'Ціни орієнтовні. Точну суму називаємо після огляду, до початку лікування.', svcChip: '7 послуг · ціни орієнтовні',
    packsK: 'Почніть з цього', packsT: 'Три популярні візити',
    packs: [['Перший візит', 0, ['Огляд і консультація', 'Знімок за потреби', 'План лікування з цінами'], 'Новим пацієнтам'], ['Професійна гігієна', 1, ['Ультразвук і полірування', 'Поради з догляду', '60 хвилин'], 'Раз на пів року'], ['Відбілювання', 6, ['Процедура в кабінеті', 'Одна процедура', '90 хвилин'], '']],
    allK: 'Прайс', allT: 'Усі ціни',
    cats: ['Усі', 'Профілактика', 'Лікування', 'Імплантація', 'Ортодонтія', 'Естетика'],
    head: ['Послуга', 'Ціна', 'Візити'],
    svc: [
      ['Консультація і план', '500 ₴', '1 візит', '30 хв', 1, 'Огляд, знімок за потреби і план лікування з цінами.'],
      ['Професійна гігієна', '1 600 ₴', '1 візит', '60 хв', 1, 'Чистка ультразвуком, полірування і поради з догляду.'],
      ['Лікування карієсу', 'від 1 400 ₴', '1 візит', '60 хв', 2, 'Лікування і пломба за один візит.'],
      ['Лікування каналів', 'від 3 200 ₴', '2–3 візити', '90 хв', 2, 'Лікування і пломбування каналів.'],
      ['Імплантація', 'від 19 000 ₴', '3–4 візити', 'за планом', 3, 'Імплант і коронка. План складаємо після знімка.'],
      ['Елайнери', 'від 48 000 ₴', 'раз на 6–8 тижнів', 'за планом', 4, 'Прозорі капи замість брекетів.'],
      ['Відбілювання', '6 800 ₴', '1 візит', '90 хв', 5, 'Відбілювання в кабінеті за одну процедуру.'],
    ],
    stepsK: 'Як проходить лікування', stepsT: 'Від огляду до контролю',
    steps: [['Огляд', 'Дивимося і робимо знімок, якщо потрібно.'], ['План', 'Пояснюємо варіанти й ціну кожного.'], ['Лікування', 'За планом, у зручний для вас час.'], ['Контроль', 'Кличемо на огляд раз на пів року.']],
    aboutT: 'Про клініку', aboutIntro: 'Відкрилися у 2014 році. Чотири кабінети в центрі Києва.', aboutChip: 'з 2014 року · 4 кабінети',
    roomsK: 'Кабінети', roomsT: 'Світло, тиша, порядок', rooms: ['Кабінет 1', 'Кабінет 2', 'Кабінет 3'], roomsFact: ['4', 'кабінети з денним світлом'],
    princK: 'Принципи', princ: [['plan', 'Спершу план', 'Ціну ви знаєте до початку лікування.'], ['clock', 'Без поспіху', 'Перший огляд триває 30 хвилин.'], ['people', 'Один лікар', 'Веде вас від огляду до контролю.']],
    docK: 'Хто вас прийме', docT: 'Лікарі', docDays: 'Приймає',
    docs: [['Терапевт', 'О. К.', [1, 3, 5], 2], ['Ортодонт', 'М. Л.', [2, 4], 4], ['Хірург-імплантолог', 'А. С.', [1, 4], 3], ['Гігієніст', 'Т. В.', [1, 2, 3, 4, 5, 6], 1]],
    revK: 'Відгуки пацієнтів', rev: 'Тут буде відгук вашого пацієнта', revBy: 'Ваш пацієнт', revCtx: ['Професійна гігієна', 'Елайнери'],
    conT: 'Запис і контакти', conIntro: 'Оберіть послугу і зручний час. Ми зателефонуємо, щоб підтвердити.', conChip: 'Пн–Пт 9–20 · Сб 10–16',
    formK: 'Запис онлайн', formT: 'Оберіть послугу і час', bookSteps: ['Послуга', 'Дата', 'Час', 'Контакти'],
    formSvc: ['Консультація', 'Гігієна', 'Лікування', 'Імплантація', 'Елайнери', 'Відбілювання'],
    fSvc: 'Послуга', fDay: 'День', fTime: 'Час', busy: 'зайнято', you: 'Ваш запис', sumPrice: 'Орієнтовна ціна', sumWhen: 'Дата і час',
    fields: [['Імʼя', 'Олена'], ['Телефон', '+380 67 ••• •• ••']],
    sent: 'Заявку надіслано', sentNote: 'Зателефонуємо, щоб підтвердити час.',
    items: [['Адреса', 'Київ, вул. Саксаганського, 41'], ['Телефон', '+380 44 ••• •• ••'], ['Графік', 'Пн–Пт 9:00–20:00, Сб 10:00–16:00'], ['Пошта', MAIL]],
    hoursK: 'Графік', week: [['Пн–Пт', '9:00–20:00'], ['Субота', '10:00–16:00'], ['Неділя', 'вихідний']], today: 'сьогодні',
    open: 'Зараз відчинено', closed: 'Зараз зачинено', map: 'Ми тут', street: 'вул. Саксаганського', call: 'Подзвонити',
    wd: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    cols: ['Сторінки', 'Послуги', 'Клініка', 'Контакти'],
    company: [['Про клініку', 2, ''], ['Лікарі', 2, 'docs'], ['Відгуки', 2, 'rev']],
    cards: [['Послуги', [['Послуги й ціни', 1, 'svc'], ['Як проходить лікування', 1, 'steps']]], ['Клініка', [['Про клініку', 2, ''], ['Лікарі', 2, 'docs'], ['Відгуки', 2, 'rev']]], ['Запис', [['Записатися онлайн', 3, 'form'], ['Адреса й графік', 3, 'con']]]],
    label: 'Стоматологічна клініка · Київ', copy: '© 2026 Ваш бренд',
    ftrT: ['Запишіться', 'на огляд'], ftrP: 'Перший огляд — 30 хвилин. Ми зателефонуємо, щоб підтвердити час.',
  },
  ru: {
    eyebrow: 'Стоматологическая клиника · Киев',
    h1: ['Стоматология, где вам', 'всё объясняют'],
    sub: 'Сначала осмотр и понятный план с ценами. Лечение начинаем, когда вы всё решили.',
    btn: 'Записаться на осмотр', btn2: 'Услуги и цены', cta: 'Записаться', menu: 'Меню',
    since: 'с 2014 года',
    openTill: 'Открыто до', closedNow: 'Сейчас закрыто', hoursShort: 'Пн–Пт 9–20 · Сб 10–16',
    trust: [['plan', 'План и цена до лечения'], ['clock', 'Первый осмотр 30 мин'], ['cal', 'Работаем Пн–Сб']],
    slotK: 'Ближайшая запись', badge: 'ПЕРВЫЙ ОСМОТР · 30 МИНУТ · ПЛАН И ЦЕНА · ',
    pickK: 'Ваш запрос', pickT: 'Что вас беспокоит?', pickP: 'Выберите, и мы покажем услугу, цену и количество визитов.',
    worries: ['Болит зуб', 'Пора на чистку', 'Нет зуба', 'Неровные зубы', 'Хочу светлее зубы', 'Просто осмотр'],
    price: 'Цена', visits: 'Визиты', time: 'Длительность', all: 'Все цены', book: 'Записаться',
    cond: 'Данные условные',
    numsK: 'Клиника в цифрах', nums: [['2014', 'год открытия', 'cal'], ['4', 'кабинета', 'door'], ['9', 'врачей в команде', 'people']],
    startK: 'Разделы сайта', startT: 'Начните отсюда',
    doors: [['Услуги и цены', '7 услуг с ценами и визитами'], ['О клинике', 'Врачи, кабинеты, принципы'], ['Запись и контакты', 'Онлайн-запись, адрес, график']],
    visitK: 'Первый визит', visitT: ['Первый осмотр —', '30 минут'], visitP: 'Вы уходите с планом и ценами. Лечение — только когда решите.',
    visitSteps: [['Осмотр', 'Врач смотрит и спрашивает'], ['Снимок', 'Если нужно'], ['План', 'Варианты и цены']], visitBadge: '30 мин',
    band: ['', 'Не нашли свою услугу? Напишите, и мы подскажем.', 'Познакомьтесь с врачом на первом осмотре.'],
    next: 'Далее',
    svcIntro: 'Цены ориентировочные. Точную сумму называем после осмотра, до начала лечения.', svcChip: '7 услуг · цены ориентировочные',
    packsK: 'Начните с этого', packsT: 'Три популярных визита',
    packs: [['Первый визит', 0, ['Осмотр и консультация', 'Снимок при необходимости', 'План лечения с ценами'], 'Новым пациентам'], ['Профессиональная гигиена', 1, ['Ультразвук и полировка', 'Советы по уходу', '60 минут'], 'Раз в полгода'], ['Отбеливание', 6, ['Процедура в кабинете', 'Одна процедура', '90 минут'], '']],
    allK: 'Прайс', allT: 'Все цены',
    cats: ['Все', 'Профилактика', 'Лечение', 'Имплантация', 'Ортодонтия', 'Эстетика'],
    head: ['Услуга', 'Цена', 'Визиты'],
    svc: [
      ['Консультация и план', '500 ₴', '1 визит', '30 мин', 1, 'Осмотр, снимок при необходимости и план лечения с ценами.'],
      ['Профессиональная гигиена', '1 600 ₴', '1 визит', '60 мин', 1, 'Чистка ультразвуком, полировка и советы по уходу.'],
      ['Лечение кариеса', 'от 1 400 ₴', '1 визит', '60 мин', 2, 'Лечение и пломба за один визит.'],
      ['Лечение каналов', 'от 3 200 ₴', '2–3 визита', '90 мин', 2, 'Лечение и пломбирование каналов.'],
      ['Имплантация', 'от 19 000 ₴', '3–4 визита', 'по плану', 3, 'Имплант и коронка. План составляем после снимка.'],
      ['Элайнеры', 'от 48 000 ₴', 'раз в 6–8 недель', 'по плану', 4, 'Прозрачные капы вместо брекетов.'],
      ['Отбеливание', '6 800 ₴', '1 визит', '90 мин', 5, 'Отбеливание в кабинете за одну процедуру.'],
    ],
    stepsK: 'Как проходит лечение', stepsT: 'От осмотра до контроля',
    steps: [['Осмотр', 'Смотрим и делаем снимок, если нужно.'], ['План', 'Объясняем варианты и цену каждого.'], ['Лечение', 'По плану, в удобное для вас время.'], ['Контроль', 'Зовём на осмотр раз в полгода.']],
    aboutT: 'О клинике', aboutIntro: 'Открылись в 2014 году. Четыре кабинета в центре Киева.', aboutChip: 'с 2014 года · 4 кабинета',
    roomsK: 'Кабинеты', roomsT: 'Свет, тишина, порядок', rooms: ['Кабинет 1', 'Кабинет 2', 'Кабинет 3'], roomsFact: ['4', 'кабинета с дневным светом'],
    princK: 'Принципы', princ: [['plan', 'Сначала план', 'Цену вы знаете до начала лечения.'], ['clock', 'Без спешки', 'Первый осмотр длится 30 минут.'], ['people', 'Один врач', 'Ведёт вас от осмотра до контроля.']],
    docK: 'Кто вас примет', docT: 'Врачи', docDays: 'Принимает',
    docs: [['Терапевт', 'О. К.', [1, 3, 5], 2], ['Ортодонт', 'М. Л.', [2, 4], 4], ['Хирург-имплантолог', 'А. С.', [1, 4], 3], ['Гигиенист', 'Т. В.', [1, 2, 3, 4, 5, 6], 1]],
    revK: 'Отзывы пациентов', rev: 'Здесь будет отзыв вашего пациента', revBy: 'Ваш пациент', revCtx: ['Профессиональная гигиена', 'Элайнеры'],
    conT: 'Запись и контакты', conIntro: 'Выберите услугу и удобное время. Мы позвоним, чтобы подтвердить.', conChip: 'Пн–Пт 9–20 · Сб 10–16',
    formK: 'Запись онлайн', formT: 'Выберите услугу и время', bookSteps: ['Услуга', 'Дата', 'Время', 'Контакты'],
    formSvc: ['Консультация', 'Гигиена', 'Лечение', 'Имплантация', 'Элайнеры', 'Отбеливание'],
    fSvc: 'Услуга', fDay: 'День', fTime: 'Время', busy: 'занято', you: 'Ваша запись', sumPrice: 'Ориентировочная цена', sumWhen: 'Дата и время',
    fields: [['Имя', 'Елена'], ['Телефон', '+380 67 ••• •• ••']],
    sent: 'Заявка отправлена', sentNote: 'Позвоним, чтобы подтвердить время.',
    items: [['Адрес', 'Киев, ул. Саксаганского, 41'], ['Телефон', '+380 44 ••• •• ••'], ['График', 'Пн–Пт 9:00–20:00, Сб 10:00–16:00'], ['Почта', MAIL]],
    hoursK: 'График', week: [['Пн–Пт', '9:00–20:00'], ['Суббота', '10:00–16:00'], ['Воскресенье', 'выходной']], today: 'сегодня',
    open: 'Сейчас открыто', closed: 'Сейчас закрыто', map: 'Мы здесь', street: 'ул. Саксаганского', call: 'Позвонить',
    wd: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    cols: ['Страницы', 'Услуги', 'Клиника', 'Контакты'],
    company: [['О клинике', 2, ''], ['Врачи', 2, 'docs'], ['Отзывы', 2, 'rev']],
    cards: [['Услуги', [['Услуги и цены', 1, 'svc'], ['Как проходит лечение', 1, 'steps']]], ['Клиника', [['О клинике', 2, ''], ['Врачи', 2, 'docs'], ['Отзывы', 2, 'rev']]], ['Запись', [['Записаться онлайн', 3, 'form'], ['Адрес и график', 3, 'con']]]],
    label: 'Стоматологическая клиника · Киев', copy: '© 2026 Ваш бренд',
    ftrT: ['Запишитесь', 'на осмотр'], ftrP: 'Первый осмотр — 30 минут. Мы позвоним, чтобы подтвердить время.',
  },
};
// «Друга мова»: the first screen and the bar in English
const EN = { h1: ['Dentistry that', 'explains everything'], sub: 'First a check-up and a clear plan with prices. Treatment starts once you have decided.', btn: 'Book a check-up', btn2: 'Services & prices', cta: 'Book' };
// a worry → its service (the price list's rows); a service → its choice in the booking; a choice → its service
const WORRY_SVC = [2, 1, 4, 5, 6, 0];
const SVC_CHIP = [0, 1, 2, 2, 3, 4, 5];
const CHIP_SVC = [0, 1, 2, 4, 5, 6];
const TIMES = ['09:30', '11:00', '12:30', '15:00', '16:30', '18:30'];
const BUSY = 2;
// photos: the pages' heads (and the bento), a service's photo, the photos of «Далі» (the next page's head and a detail)
const HEADS = ['light.jpg', 'tools.jpg', 'chair.jpg', 'window.jpg'];
const SVC_PH = ['light.jpg', 'handles.jpg', 'tools.jpg', 'kit.jpg', 'cab-1.jpg', 'cab-2.jpg', 'window.jpg'];
const NEXT_PH = [['light.jpg', 'handles.jpg'], ['tools.jpg', 'tray.jpg'], ['chair.jpg', 'cab-1.jpg'], ['window.jpg', 'cab-3.jpg']];
// the worries' icons
const WORRY_ICO = ['care', 'spark', 'implant', 'curve', 'sun', 'lens'];

// the mark: a pearl with its light
const MARK = '<i class="pl-mark" aria-hidden="true"></i>';
const ARR = '<svg class="pl-arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></svg>';
const TICK = '<svg class="pl-tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="24" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
// the line icons, one stroke weight, drawn for this clinic (no teeth)
const IP = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  plan: '<path d="M6.5 3.5h8l3.5 3.5v13.5h-11.5z"/><path d="M14.5 3.5V7H18M9 11h6M9 14h6M9 17h3.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  door: '<path d="M5.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h10a1.5 1.5 0 0 1 1.5 1.5v15.5M3.5 20.5h17"/><circle cx="14.6" cy="12.4" r="0.9"/>',
  people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.8 14.4c2.3.1 4 1.8 4.7 4.6"/>',
  care: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  spark: '<path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5z"/><path d="M18.5 15.5c.2 1.5.8 2.1 2.2 2.3-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.3z"/>',
  implant: '<path d="M8.5 4.5h7l-1 3h-5z"/><path d="M10 7.5h4v11.5l-2 2-2-2z"/><path d="M10 10.5l4-1M10 13.5l4-1M10 16.5l4-1"/>',
  curve: '<path d="M3.5 7.5c2.5 6.5 5.4 9.5 8.5 9.5s6-3 8.5-9.5"/><path d="M6.5 7.5c1.9 4.4 3.7 6.3 5.5 6.3s3.6-1.9 5.5-6.3"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  lens: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M8 10.5h5M10.5 8v5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7.5 8 5.5 8-5.5"/>',
};
const ico = (k, cls = 'pl-ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IP[k] || ''}</svg>`;

/* the clinic now (Kyiv time): open Пн–Пт 9–20, Сб 10–16; and the next five working days (the booking's days) */
function kyivNow() {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: '2-digit', hourCycle: 'h23', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { wd, h: +p.hour, date: new Date(+p.year, +p.month - 1, +p.day) };
  } catch (error) {
    const d = new Date();
    return { wd: d.getDay(), h: d.getHours(), date: d };
  }
}
function openNow() {
  const { wd, h } = kyivNow();
  return (wd >= 1 && wd <= 5 && h >= 9 && h < 20) || (wd === 6 && h >= 10 && h < 16);
}
function nextDays(n = 5) {
  const out = [];
  const d = new Date(kyivNow().date);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push([d.getDay(), d.getDate()]);
  }
  return out;
}

/* the drawn map: quiet blocks, the boulevard across, a square, the clinic as a pearl with its pin */
function mapSVG(label, street) {
  let blocks = '';
  const xs = [0, 64, 128, 196, 262, 330, 420], ys = [0, 56, 116, 172, 230, 280];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      if (i === 2 && j === 2) continue;
      const x = xs[i] + 8, y = ys[j] + 8, w = xs[i + 1] - xs[i] - 16, h = ys[j + 1] - ys[j] - 16;
      blocks += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>`;
    }
  }
  return `<svg class="pl-map__svg" viewBox="0 0 420 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect class="pl-map__ground" width="420" height="270"/>
    <g class="pl-map__bl">${blocks}</g>
    <circle class="pl-map__sq" cx="162" cy="144" r="22"/>
    <path class="pl-map__avl" d="M-20 224 C 120 196, 260 120, 440 92"/><path class="pl-map__av" d="M-20 224 C 120 196, 260 120, 440 92"/>
    <text class="pl-map__st" transform="translate(300 106) rotate(-12)">${street}</text>
    <g class="pl-map__pin"><ellipse class="pl-map__sh" cx="276" cy="160" rx="9" ry="3"/><g class="pl-map__drop"><circle class="pl-map__me" cx="276" cy="146" r="11"/><circle class="pl-map__hl" cx="272" cy="142" r="3.4"/></g></g>
    <text class="pl-map__me-t" x="294" y="150">${label}</text>
  </svg>`;
}
// decorative rings (thin concentric circles) for the backgrounds
const RINGS = '<svg class="pl-rings" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="98"/><circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="58"/><circle cx="100" cy="100" r="38"/></svg>';

/* ---------- build: the page's HTML ---------- */
// (a link inside the sample that leads to a section of another page: the next page reads it after the bloom)
let PENDING = null;
// each render's SVG ids are its own (two pages stand in the frame during a page change)
let UID = 0;

// the four pearls on the smile's curve (Як проходить лікування): points of the curve in its 1000 × 260 box
const ARC = 'M20 40 C 300 250, 700 250, 980 40';
const arcAt = (t) => {
  const P = [[20, 40], [300, 250], [700, 250], [980, 40]], u = 1 - t;
  const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [P.reduce((s, p, i) => s + p[0] * b[i], 0), P.reduce((s, p, i) => s + p[1] * b[i], 0)];
};

export function build(H, c, k, e, opts = {}) {
  const { esc, lx } = H;
  const lang = opts.lang === 'ru' ? 'ru' : 'uk';
  const W = T[lang];
  const pg = Math.max(0, Math.min(3, opts.page || 0));
  const tabs = c.tabs.corporate;
  const E = e ? { ...EN, nav: e.nav } : null;
  const svc = W.svc;
  const uid = `pl${++UID}`;
  const now = kyivNow();
  const open = openNow();
  const days = nextDays(5);
  const todayRow = now.wd === 0 ? 2 : now.wd === 6 ? 1 : 0;

  // words in line masks (SplitText). The key word carries the nacre and its sheen (ShinyText); a title the pointer can
  // weigh (VariableProximity) carries its letters as .pl-l
  const words = (t, letters = false) => String(t).split(/\s+/).filter(Boolean).map((w) => `<span class="pl-w"><span>${letters ? [...w].map((ch) => `<i class="pl-l">${esc(ch)}</i>`).join('') : esc(w)}</span></span>`).join(' ');
  const head = (a, b, letters = false) => `${a ? `${words(a, letters)} ` : ''}<span class="pl-key">${words(b, letters)}</span>`;
  const split = (t) => { const w = String(t).split(/\s+/); return [w.slice(0, -1).join(' '), w[w.length - 1]]; };
  const kick = (n, t, cls = '') => `<span class="pl-kick${cls}" data-rv><b>${esc(n)}</b>${esc(t)}</span>`;
  const to = (go, where = '', more = '') => ` data-go="${go}"${where ? ` data-to="${where}"` : ''}${more}`;
  // a button (FlowButton): a circle of colour grows to fill the pill, the arrow leaves on the right while its twin
  // enters on the left, the label shifts over
  const btn = (label, go, cls = '', where = '', more = '') => `<span class="pl-btn${cls}"${to(go, where, more)}><i class="pl-btn__fill" aria-hidden="true"></i><span class="pl-btn__in"><span class="pl-btn__l" aria-hidden="true">${ARR}</span><span class="pl-btn__t">${label}</span><span class="pl-btn__r" aria-hidden="true">${ARR}</span></span></span>`;
  const link = (label, go, where = '', more = '', cls = '') => `<span class="pl-link${cls}"${to(go, where, more)}><span class="pl-link__t">${label}</span>${ARR}</span>`;
  const anc = (n) => `<i class="pl-anc" data-anc="${n}" aria-hidden="true"></i>`;
  const glare = '<i class="pl-glare" aria-hidden="true"></i>';
  const cond = `<span class="pl-cond" data-rv>${esc(W.cond)}</span>`;
  const well = (kk) => `<span class="pl-well">${ico(kk)}</span>`;
  // a value whose digits roll (Counter / Number Flow): two turns of 0–9 per digit, parked on the second turn
  const ctr = (n) => `<span class="pl-ctr">${[...String(n)].map((ch) => (/\d/.test(ch)
    ? `<span class="pl-d"><span class="pl-d__c" style="--d:${10 + +ch}">${[...'01234567890123456789'].map((x) => `<i>${x}</i>`).join('')}</span></span>`
    : `<span>${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`)).join('')}</span>`;
  const img = (f, pos = '') => `<img src="${PH}${f}" alt="" decoding="async"${pos ? ` style="object-position:${pos}"` : ''}>`;
  // a round badge (CircularText): its words around a circle, a pearl in the middle
  let badges = 0;
  const badge = (text, inner = '', cls = '') => { const id = `${uid}c${badges++}`; return `<span class="pl-badge${cls}" data-badge aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs><text><textPath href="#${id}" textLength="232">${esc(text)}</textPath></text></svg>${inner || '<i class="pl-badge__p"></i>'}</span>`; };
  const hours = (cls = '') => `<ul class="pl-hours${cls}">${W.week.map(([d, h], i) => `<li class="${i === todayRow ? 'is-today' : ''}"><span>${esc(d)}${i === todayRow ? `<em>${esc(W.today)}</em>` : ''}</span><i></i><b>${esc(h)}</b></li>`).join('')}</ul>`;
  const closeAt = now.wd === 6 ? '16:00' : '20:00';

  /* the header: an info bar (today's hours, the address, the phone, UA/EN) over the bar (the mark, the pages as
     numbered pills with the current one lit, «Записатися», «Меню»); the info bar folds away once the page moves */
  const header = `<header class="pv-hdr pl-hdr" data-pg="${pg}">
    <div class="pl-info">
      <span class="pl-info__st${open ? ' is-open' : ''}"><i></i>${esc(open ? `${W.openTill} ${closeAt}` : W.closedNow)}</span>
      <span class="pl-info__h">${esc(W.hoursShort)}</span>
      <span class="pl-info__a"${to(3, 'con')}>${ico('pin')}${esc(W.items[0][1])}</span>
      <span class="pl-info__r"><span class="pl-info__p"${to(3, 'con')}>${ico('phone')}${esc(W.items[1][1])}</span><span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span></span>
    </div>
    <div class="pl-bar"><i class="pl-bar__bg" aria-hidden="true"></i>
      <span class="pl-logo" data-go="0">${MARK}<span>${esc(c.brand)}</span></span>
      <nav class="pl-nav">${tabs.map((x, i) => `<span class="pl-nav__i${i === pg ? ' is-on' : ''}" data-go="${i}"><small>${two(i + 1)}</small><span class="pl-link__t">${lx(x, E?.nav?.[i])}</span></span>`).join('')}</nav>
      <div class="pl-bar__r">${btn(lx(W.cta, E?.cta), 3, ' pl-btn--sm', 'form')}<span class="pl-callbtn"${to(3, 'con')}>${ico('phone')}</span><span class="pl-menubtn" data-menu><i></i><i></i></span></div>
    </div>
  </header>`;

  /* the pearl string: the four pages as pearls on a thread in the left margin, the current one lit with nacre */
  const string = `<nav class="pl-str" style="--f:${pg}" aria-hidden="true"><i class="pl-str__thread"></i>${tabs.map((x, i) => `<span class="pl-str__p${i === pg ? ' is-on' : ''}" data-go="${i}" data-f="${i}"><i class="pl-str__b"></i><b>${two(i + 1)}</b><em>${esc(x)}</em></span>`).join('')}<i class="pl-str__glint"></i></nav>`;

  /* «Меню» (CardNav): the bar opens downward into three cards */
  const menu = `<div class="pl-menu" aria-hidden="true"><i class="pl-menu__bg"></i><div class="pl-menu__in">${W.cards.map(([t, list], ci) => `<div class="pl-card pl-card--${ci}"${to(list[0][1])}>
      <span class="pl-card__k"><b>${two(list[0][1] + 1)}</b>${esc(t)}</span>
      <ul>${list.map(([x, go, where]) => `<li${to(go, where)}>${ARR}<span class="pl-link__t">${esc(x)}</span></li>`).join('')}</ul></div>`).join('')}</div></div>`;

  /* an inner page's head: the path, «0N / 04», the title, its line, a chip; the page's photo with a round one over it */
  const phead = (title, intro, chip, pos, second) => `<section class="pl-ph pl-ph--${pg}" data-sec data-scene="head">
      <i class="pl-orb pl-orb--ph" aria-hidden="true"></i>
      <div class="pl-ph__t">
        <span class="pl-crumb" data-rv><span data-go="0">${esc(tabs[0])}</span><i>/</i><b>${esc(tabs[pg])}</b></span>
        <span class="pl-ph__no" data-rv>${two(pg + 1)}<small>/ ${two(tabs.length)}</small></span>
        <h1 class="pl-ph__h" data-lines data-prox>${head(...split(title), true)}</h1>
        <p class="pl-ph__p" data-rv>${esc(intro)}</p>
        <span class="pl-chip" data-rv><i class="pl-chip__p"></i>${esc(chip)}</span>
      </div>
      <div class="pl-ph__vis">${RINGS}
        <figure class="pl-ph__ph" data-iris>${img(HEADS[pg], pos)}${glare}</figure>
        <figure class="pl-ph__round" data-iris data-tilt>${img(second)}</figure>
      </div>
    </section>`;

  /* the band at the end of Послуги and Про нас: a nacre panel with a round photo, a badge, the line and the button */
  const band = (text) => `<section class="pl-band" data-sec data-scene="band">${anc('band')}<div class="pl-band__in">
      <i class="pl-orb pl-orb--band" aria-hidden="true"></i>
      <figure class="pl-band__ph" data-iris>${pg === 2 ? img('light.jpg', '62% 40%') : img('handles.jpg', '50% 40%')}</figure>
      ${badge(W.badge, `<b class="pl-badge__v">${esc(W.visitBadge)}</b>`, ' pl-badge--band')}
      <div class="pl-band__t"><p class="pl-band__h" data-lines>${words(text)}</p><span data-rv>${btn(esc(W.cta), 3, '', 'form')}</span></div>
      <i class="pl-band__sheen" aria-hidden="true"></i></div></section>`;

  let body = '';
  if (pg === 0) {
    const h1 = E ? `<span class="pv-lx pv-lx--blk"><span class="pv-lx__a">${head(...W.h1, true)}</span><span class="pv-lx__b" lang="en">${head(...E.h1)}</span></span>` : head(...W.h1, true);
    const ribbon = [...svc.map((s) => s[0]), ...svc.map((s) => s[0])];
    body = `<section class="pl-hero" data-sec data-scene="hero">
        <i class="pl-orb pl-orb--a" aria-hidden="true"></i><i class="pl-orb pl-orb--b" aria-hidden="true"></i>
        <div class="pl-hero__t">
          <span class="pl-chip" data-rv><i class="pl-chip__p"></i>${esc(W.eyebrow)}</span>
          <h1 class="pl-h1" data-lines data-prox>${h1}</h1>
          <p class="pl-hero__sub" data-rv>${lx(W.sub, E?.sub)}</p>
          <div class="pl-hero__cta" data-rv>${btn(lx(W.btn, E?.btn), 3, '', 'form')}${btn(lx(W.btn2, E?.btn2), 1, ' pl-btn--ghost', 'svc')}</div>
          <ul class="pl-trust" data-rv>${W.trust.map(([kk, t]) => `<li>${well(kk)}<span>${esc(t)}</span></li>`).join('')}</ul>
        </div>
        <div class="pl-hero__vis">${RINGS}
          <figure class="pl-hero__ph" data-iris>${img('light.jpg')}${glare}<span class="pl-hero__tag">${esc(W.since)}</span></figure>
          <figure class="pl-hero__round" data-iris data-tilt>${img('handles.jpg', '50% 35%')}</figure>
          ${badge(W.badge, '', ' pl-badge--hero')}
          <div class="pl-slot" data-rv${to(3, 'form')}>${well('cal')}<span><small>${esc(W.slotK)}</small><b>${esc(W.wd[days[0][0]])} ${days[0][1]}, ${TIMES[1]}</b></span>${ARR}</div>
          <div class="pl-pocket" aria-hidden="true"><i class="pl-pocket__pool"></i><i class="pl-pocket__ring"></i>${opts.three ? '<div class="pl-obj" data-obj><canvas class="pl-obj__gl"></canvas></div>' : ''}</div>
        </div>
      </section>
      <div class="pl-ribbon" data-sec data-scene="ribbon" aria-hidden="true"><div class="pl-ribbon__in">${ribbon.map((n) => `<span>${esc(n)}</span><i></i>`).join('')}</div></div>
      <section class="pl-sec pl-pick" data-sec data-scene="pick">${anc('pick')}
        <div class="pl-sec__h">${kick('01', W.pickK)}<h2 class="pl-h2" data-lines>${head(...split(W.pickT))}</h2><p class="pl-lead" data-rv>${esc(W.pickP)}</p></div>
        <div class="pl-pick__box" data-rv>
          <div class="pl-wos"><i class="pl-wos__ind" aria-hidden="true"></i>${W.worries.map((t, i) => `<span class="pl-wo${i ? '' : ' is-on'}" data-wo="${i}">${well(WORRY_ICO[i])}<span class="pl-wo__t">${esc(t)}</span>${ARR}</span>`).join('')}</div>
          <div class="pl-ans">${W.worries.map((_, i) => {
            const si = WORRY_SVC[i], s = svc[si];
            return `<div class="pl-ans__c${i ? '' : ' is-on'}" data-ans="${i}">
              <figure class="pl-ans__ph">${img(SVC_PH[si])}<span class="pl-ans__n">${two(si + 1)}</span></figure>
              <div class="pl-ans__b">
                <div class="pl-ans__top"><b class="pl-ans__t">${words(s[0])}</b><span class="pl-cond">${esc(W.cond)}</span></div>
                <p class="pl-ans__d">${esc(s[5])}</p>
                <div class="pl-ans__f"><span><small>${esc(W.price)}</small><b>${ctr(s[1])}</b></span><span><small>${esc(W.visits)}</small><b>${ctr(s[2])}</b></span><span><small>${esc(W.time)}</small><b>${ctr(s[3])}</b></span></div>
                <div class="pl-ans__a">${btn(esc(W.book), 3, ' pl-btn--sm', 'form', ` data-chip="${SVC_CHIP[si]}"`)}${link(esc(W.all), 1, 'svc', ` data-row="${si}"`)}</div>
              </div>
            </div>`;
          }).join('')}</div>
        </div>
      </section>
      <section class="pl-nums" data-sec data-scene="nums">${anc('nums')}<i class="pl-orb pl-orb--nums" aria-hidden="true"></i>${RINGS}
        <div class="pl-nums__top">${kick('02', W.numsK)}${cond}</div>
        <div class="pl-nums__row">${W.nums.map(([n, l, kk]) => `<div class="pl-num" data-rv data-num>${well(kk)}<b>${ctr(n)}</b><small>${esc(l)}</small></div>`).join('')}</div>
      </section>
      <section class="pl-sec pl-bento" data-sec data-scene="bento">${anc('start')}
        <div class="pl-sec__h">${kick('03', W.startK)}<h2 class="pl-h2" data-lines>${head(...split(W.startT))}</h2></div>
        <div class="pl-bento__g">
          <div class="pl-bc pl-bc--svc" data-go="1" data-rv>
            <figure class="pl-bc__ph">${img('tools.jpg', '40% 50%')}${glare}</figure>
            <div class="pl-bc__b"><span class="pl-bc__n">02</span><b class="pl-bc__t">${esc(W.doors[0][0])}</b><span class="pl-bc__d">${esc(W.doors[0][1])}</span>
              <ul class="pl-bc__list">${[0, 1, 4, 6].map((i) => `<li><span>${esc(svc[i][0])}</span><i></i><b>${esc(svc[i][1])}</b></li>`).join('')}</ul></div>
            <span class="pl-bc__go">${ARR}</span>
          </div>
          <div class="pl-bc pl-bc--about" data-go="2" data-rv>
            <figure class="pl-bc__round" data-tilt>${img('chair.jpg', '25% 60%')}</figure>
            <span class="pl-bc__n">03</span><b class="pl-bc__t">${esc(W.doors[1][0])}</b><span class="pl-bc__d">${esc(W.doors[1][1])}</span>
            <span class="pl-bc__ini">${W.docs.map(([, ini]) => `<i>${esc(ini.replace(/[\s.]/g, ''))}</i>`).join('')}</span>
            <span class="pl-bc__go">${ARR}</span>
          </div>
          <div class="pl-bc pl-bc--con" data-go="3" data-rv>${RINGS}
            <span class="pl-bc__n">04</span><b class="pl-bc__t">${esc(W.doors[2][0])}</b><span class="pl-bc__d">${esc(W.doors[2][1])}</span>
            ${hours(' pl-hours--dark')}
            <span class="pl-bc__go">${ARR}</span>
          </div>
        </div>
      </section>
      <section class="pl-visit" data-sec data-scene="visit">${anc('visit')}<div class="pl-visit__in">
        <i class="pl-orb pl-orb--deep" aria-hidden="true"></i>${RINGS}
        ${badge(W.badge, `<b class="pl-badge__v">${esc(W.visitBadge)}</b>`, ' pl-badge--visit')}
        <div class="pl-visit__t">${kick('04', W.visitK, ' pl-kick--light')}<h2 class="pl-h2" data-lines>${head(...W.visitT)}</h2><p data-rv>${esc(W.visitP)}</p><span data-rv>${btn(esc(W.btn), 3, ' pl-btn--pearl', 'form')}</span></div>
        <ol class="pl-visit__steps">${W.visitSteps.map(([t, d], i) => `<li data-rv><i class="pl-visit__p" aria-hidden="true"></i><span class="pl-visit__n">${two(i + 1)}</span><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol>
      </div></section>`;
  } else if (pg === 1) {
    const pts = [0.1, 0.37, 0.63, 0.9].map(arcAt);
    body = `${phead(W.doors[0][0], W.svcIntro, W.svcChip, '50% 55%', 'tray.jpg')}
      <section class="pl-sec pl-packs" data-sec data-scene="packs">${anc('packs')}
        <div class="pl-sec__h">${kick('01', W.packsK)}<h2 class="pl-h2" data-lines>${head(...split(W.packsT))}</h2>${cond}</div>
        <div class="pl-packs__g">${W.packs.map(([name, si, list, tag], i) => `<div class="pl-pack${i === 1 ? ' pl-pack--deep' : ''}" data-rv>
            ${tag ? `<span class="pl-pack__tag">${esc(tag)}</span>` : ''}
            <figure class="pl-pack__ph" data-tilt>${img(i === 2 ? 'tray.jpg' : SVC_PH[si])}</figure>
            <b class="pl-pack__t">${esc(name)}</b>
            <span class="pl-pack__p">${ctr(svc[si][1])}</span>
            <ul class="pl-pack__l">${list.map((x) => `<li>${TICK}<span>${esc(x)}</span></li>`).join('')}</ul>
            ${btn(esc(W.book), 3, i === 1 ? ' pl-btn--pearl' : ' pl-btn--ghost', 'form', ` data-chip="${SVC_CHIP[si]}"`)}
          </div>`).join('')}</div>
      </section>
      <section class="pl-sec pl-svc" data-sec>${anc('svc')}
        <div class="pl-sec__h">${kick('02', W.allK)}<h2 class="pl-h2" data-lines>${head('', W.allT)}</h2></div>
        <div class="pl-cats" data-rv><span class="pl-cats__in"><i class="pl-cats__ind" aria-hidden="true"></i>${W.cats.map((x, i) => `<span class="pl-cat${i ? '' : ' is-on'}" data-cat="${i}">${esc(x)}</span>`).join('')}</span><span class="pl-cond">${esc(W.cond)}</span></div>
        <div class="pl-rows__h" data-rv><span></span><span>${esc(W.head[0])}</span><span></span><span>${esc(W.head[1])}</span><span>${esc(W.head[2])}</span><span></span></div>
        <div class="pl-rows">${svc.map((s, i) => `<div class="pl-row${i ? '' : ' is-open'}" data-acc data-c="${s[4]}" data-rv>
            <span class="pl-row__n">${two(i + 1)}</span><b class="pl-row__t">${esc(s[0])}</b><i class="pl-row__dots" aria-hidden="true"></i>
            <span class="pl-row__p">${ctr(s[1])}</span><span class="pl-row__v">${esc(s[2])}</span><i class="pl-row__x" aria-hidden="true"></i>
            <div class="pl-row__b"><div class="pl-row__in"><figure class="pl-row__ph">${img(SVC_PH[i])}</figure><p>${esc(s[5])} <span>${esc(s[3])}</span></p>${btn(esc(W.book), 3, ' pl-btn--sm', 'form', ` data-chip="${SVC_CHIP[i]}"`)}</div></div>
          </div>`).join('')}</div>
      </section>
      <section class="pl-sec pl-steps" data-sec data-scene="steps">${anc('steps')}
        <div class="pl-sec__h">${kick('03', W.stepsK)}<h2 class="pl-h2" data-lines>${head(...split(W.stepsT))}</h2></div>
        <div class="pl-arc" data-rv>
          <svg class="pl-arc__svg" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true"><path class="pl-arc__bg" d="${ARC}"/><path class="pl-arc__path" pathLength="1" d="${ARC}"/></svg>
          ${W.steps.map(([t, d], i) => `<div class="pl-step${i ? '' : ' is-on'}" data-step="${i}" style="--x:${(pts[i][0] / 10).toFixed(2)}%;--y:${(pts[i][1] / 2.6).toFixed(2)}%"><i class="pl-step__p" aria-hidden="true">${ico(['lens', 'plan', 'care', 'cal'][i])}</i><span class="pl-step__n">${two(i + 1)}</span><b>${esc(t)}</b><span class="pl-step__d">${esc(d)}</span></div>`).join('')}
        </div>
      </section>
      ${band(W.band[1])}`;
  } else if (pg === 2) {
    body = `${phead(W.aboutT, W.aboutIntro, W.aboutChip, '30% 50%', 'cab-3.jpg')}
      <section class="pl-sec pl-rooms" data-sec data-scene="rooms">${anc('rooms')}
        <div class="pl-sec__h">${kick('01', W.roomsK)}<h2 class="pl-h2" data-lines>${head(...split(W.roomsT))}</h2></div>
        <div class="pl-rooms__g">${['cab-1.jpg', 'cab-2.jpg', 'cab-3.jpg'].map((f, i) => `<figure class="pl-room${i === 1 ? ' is-on' : ''}" data-room="${i}" data-iris>${img(f)}${glare}<figcaption>${esc(W.rooms[i])}</figcaption></figure>`).join('')}
          <div class="pl-rooms__fact" data-rv><b>${ctr(W.roomsFact[0])}</b><span>${esc(W.roomsFact[1])}</span><small>${esc(W.cond)}</small></div></div>
      </section>
      <section class="pl-sec pl-princ" data-sec>${anc('princ')}
        <div class="pl-sec__h">${kick('02', W.princK)}</div>
        <div class="pl-princ__g">${W.princ.map(([kk, t, d]) => `<div class="pl-pr" data-rv>${well(kk)}<b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>
      </section>
      <section class="pl-sec pl-docs" data-sec data-scene="docs">${anc('docs')}
        <div class="pl-sec__h">${kick('03', W.docK)}<h2 class="pl-h2" data-lines>${head('', W.docT)}</h2></div>
        <div class="pl-docs__g">${W.docs.map(([r, ini, dd, chip]) => `<div class="pl-doc" data-rv>
            <span class="pl-doc__face" aria-hidden="true">${RINGS}<b>${esc(ini)}</b></span>
            <span class="pl-doc__r">${esc(r)}</span>
            <span class="pl-doc__wk"><small>${esc(W.docDays)}</small><span>${[1, 2, 3, 4, 5, 6].map((d) => `<i class="${dd.includes(d) ? 'is-on' : ''}">${esc(W.wd[d])}</i>`).join('')}</span></span>
            ${btn(esc(W.book), 3, ' pl-btn--ghost pl-btn--sm', 'form', ` data-chip="${chip}"`)}
          </div>`).join('')}</div>
      </section>
      <section class="pl-sec pl-rev" data-sec>${anc('rev')}
        <div class="pl-rev__card" data-rv>
          <span class="pl-rev__q" aria-hidden="true">“</span>
          <div class="pl-car"><div class="pl-car__track" data-car="1">${W.revCtx.map((s, i) => `<figure class="pl-car__s${i ? '' : ' is-on'}"><p>${words(W.rev)}</p><figcaption><span class="pl-car__m" aria-hidden="true"></span>${esc(W.revBy)}<small>${esc(s)}</small></figcaption></figure>`).join('')}</div></div>
          <div class="pl-rev__side"><span class="pl-stars">${STAR.repeat(5)}</span><span class="pl-rev__k">${esc(W.revK)}</span>
            <span class="pl-car__nav"><span class="pl-car__b pl-car__b--p" data-car="-1">${ARR}</span><span class="pl-car__no"><span class="pl-sn"><b>1</b></span> / 2</span><span class="pl-car__b" data-car="1">${ARR}</span></span></div>
        </div>
      </section>
      ${band(W.band[2])}`;
  } else {
    const box = (cls) => `<i class="${cls}" aria-hidden="true">${TICK}</i>`;
    body = `${phead(W.conT, W.conIntro, W.conChip, '50% 62%', 'cab-2.jpg')}
      <section class="pl-sec pl-book" data-sec data-scene="book">${anc('form')}
        <div class="pl-sec__h">${kick('01', W.formK)}<h2 class="pl-h2" data-lines>${head(...split(W.formT))}</h2><p class="pl-lead" data-rv>${esc(W.sentNote)}</p></div>
        <div class="pl-book__w" data-rv>
          <ol class="pl-steps4">${W.bookSteps.map((t, i) => `<li class="pl-steps4__i${i < 3 ? ' is-done' : ' is-cur'}" data-bstep="${i}"><b>${i + 1}</b><span>${esc(t)}</span></li>`).join('')}</ol>
          <div class="pl-book__l">
            <div class="pl-book__g"><small>${esc(W.fSvc)}</small><div class="pl-opts" data-group="svc">${W.formSvc.map((x, i) => `<span class="pl-opt${i ? '' : ' is-on'}" data-opt="${i}" data-price="${esc(svc[CHIP_SVC[i]][1])}">${box('pl-opt__t')}<span>${esc(x)}</span></span>`).join('')}</div></div>
            <div class="pl-book__g"><small>${esc(W.fDay)}</small><div class="pl-opts pl-opts--day" data-group="day">${days.map(([wd, d], i) => `<span class="pl-opt pl-opt--day${i ? '' : ' is-on'}" data-opt="${i}" data-label="${esc(W.wd[wd])} ${d}"><em>${esc(W.wd[wd])}</em><b>${d}</b></span>`).join('')}</div></div>
            <div class="pl-book__g"><small>${esc(W.fTime)}</small><div class="pl-opts pl-opts--time" data-group="time">${TIMES.map((t, i) => `<span class="pl-opt pl-opt--time${i === 1 ? ' is-on' : ''}${i === BUSY ? ' is-busy' : ''}" data-opt="${i}" data-label="${t}"><span class="pl-opt__v">${t}</span>${i === BUSY ? `<small>${esc(W.busy)}</small>` : ''}</span>`).join('')}</div></div>
            <div class="pl-fields">${W.fields.map(([a, b]) => `<span class="pl-field" data-field><small>${esc(a)}</small><b>${esc(b)}</b></span>`).join('')}</div>
          </div>
          <aside class="pl-book__s">${RINGS}
            <small>${esc(W.you)}</small>
            <b class="pl-book__svc" data-sum-svc>${esc(W.formSvc[0])}</b>
            <span class="pl-book__row"><small>${esc(W.sumPrice)}</small><b data-sum-price>${esc(svc[0][1])}</b></span>
            <span class="pl-book__row"><small>${esc(W.sumWhen)}</small><b><span data-sum-day>${esc(W.wd[days[0][0]])} ${days[0][1]}</span> · <span data-sum-time>${TIMES[1]}</span></b></span>
            <span class="pl-send" data-send><i class="pl-send__fill" aria-hidden="true"></i><span class="pl-send__a">${esc(W.book)}${ARR}</span><span class="pl-send__b">${TICK}${esc(W.sent)}</span></span>
            <span class="pl-book__note">${esc(W.cond)}</span>
          </aside>
        </div>
      </section>
      <section class="pl-sec pl-con" data-sec data-scene="map">${anc('con')}
        <div class="pl-map" data-rv data-map>${mapSVG(esc(W.map), esc(W.street))}
          <div class="pl-map__card"><span class="pl-status${open ? ' is-open' : ''}"><i></i>${esc(open ? W.open : W.closed)}</span><b>${esc(W.items[0][1])}</b>${hours()}<span class="pl-map__go">${btn(esc(W.cta), 3, ' pl-btn--sm', 'form')}</span></div>
        </div>
        <div class="pl-con__cards">${[1, 3].map((i) => `<div class="pl-cc" data-rv data-cc="${i}">${well(i === 1 ? 'phone' : 'mail')}<small>${esc(W.items[i][0])}</small><b>${esc(W.items[i][1])}</b></div>`).join('')}
          <div class="pl-cc pl-cc--hours" data-rv data-cc="2">${well('clock')}<small>${esc(W.hoursK)}</small><b>${esc(W.items[2][1])}</b></div></div>
      </section>`;
  }

  /* the end of every page: «Далі», then the footer (a deep band: the call with the week's hours, the sitemap, the
     brand in large type, the legal line) */
  const nx = (pg + 1) % 4;
  const footer = `<div class="pl-next" data-go="${nx}"><span class="pl-next__k">${esc(W.next)} · ${two(nx + 1)}</span><b class="pl-next__t">${esc(tabs[nx])}<span class="pl-next__ph" aria-hidden="true">${NEXT_PH[nx].map((x, i) => `<span class="pl-next__im pl-next__im--${i}"><img src="${PH}${x}" alt="" loading="lazy" decoding="async">${glare}</span>`).join('')}</span></b>${ARR}</div>
    <footer class="pl-ftr" data-sec data-scene="ftr">
      <i class="pl-orb pl-orb--ftr" aria-hidden="true"></i>
      <div class="pl-ftr__cta">
        <div class="pl-ftr__l"><h2 class="pl-ftr__h" data-lines>${head(...W.ftrT)}</h2><p data-rv>${esc(W.ftrP)}</p><span data-rv>${btn(esc(W.btn), 3, ' pl-btn--pearl', 'form')}</span></div>
        <div class="pl-ftr__card" data-rv>
          <span class="pl-status${open ? ' is-open' : ''}"><i></i>${esc(open ? W.open : W.closed)}</span>
          ${hours(' pl-hours--dark')}
          <span class="pl-ftr__ln"${to(3, 'con')}>${ico('pin')}${esc(W.items[0][1])}</span>
          <span class="pl-ftr__ln"${to(3, 'con')}>${ico('phone')}${esc(W.items[1][1])}</span>
        </div>
      </div>
      <div class="pl-ftr__map">
        <div class="pl-ftr__brand"><span class="pl-logo" data-go="0">${MARK}<span>${esc(c.brand)}</span></span><span>${esc(W.label)}</span></div>
        <nav class="pl-ftr__c"><small>${esc(W.cols[0])}</small>${tabs.map((x, i) => `<span class="${i === pg ? 'is-on' : ''}" data-go="${i}"><i>${two(i + 1)}</i><span class="pl-link__t">${esc(x)}</span></span>`).join('')}</nav>
        <nav class="pl-ftr__c"><small>${esc(W.cols[1])}</small>${[0, 1, 2, 4, 5].map((i) => `<span${to(1, 'svc', ` data-row="${i}"`)}><span class="pl-link__t">${esc(svc[i][0])}</span></span>`).join('')}</nav>
        <nav class="pl-ftr__c"><small>${esc(W.cols[2])}</small>${W.company.map(([a, go, where]) => `<span${to(go, where)}><span class="pl-link__t">${esc(a)}</span></span>`).join('')}</nav>
        <div class="pl-ftr__c"><small>${esc(W.cols[3])}</small>${[W.items[1][1], MAIL].map((x, i) => `<span${to(3, i ? 'form' : 'con')}><span class="pl-link__t">${esc(x)}</span></span>`).join('')}</div>
      </div>
      <div class="pl-ftr__word" aria-hidden="true"><span>${esc(c.brand)}</span><i class="pl-ftr__pearl"></i></div>
      <div class="pl-ftr__bot"><span>${esc(W.copy)}</span><span>${esc(W.cond)}</span><span>${esc(c.url)}</span></div>
    </footer>`;

  return `${header}${string}${menu}<div class="pv-scroll pl-scroll"><i class="pl-sent" aria-hidden="true"></i>${body}${footer}</div>`;
}

/* ---------- enhance: the interactions, the entrances, the page change, the 3D; nothing runs at rest ---------- */
export function enhance(site, ctx = {}) {
  const rm = !!ctx.reducedMotion;
  const page = Math.max(0, Math.min(3, ctx.page || 0));
  const pvw = site.closest('.pvw');
  const vp = ctx.viewport || site.parentElement || site;
  const fine = !rm && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const timers = new Set();
  const offs = [];
  const alive = () => site.isConnected && !site.classList.contains('pv-site--old');
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive()) fn(); }, ms); timers.add(t); };
  ctx.onDispose?.(() => { timers.forEach(clearTimeout); timers.clear(); offs.forEach((fn) => fn()); });
  const on = (el, type, fn, o) => { el?.addEventListener(type, fn, o); };
  const $ = (q, r = site) => r.querySelector(q);
  const $$ = (q, r = site) => [...r.querySelectorAll(q)];

  const hdr = $('.pl-hdr');
  const menu = $('.pl-menu');
  const scroller = $('.pv-scroll');

  /* the old page of this sample (a page change, or the same page drawn again for 3D / the second language) */
  const old = site.parentElement?.querySelector('.pv-site--old');
  const mine = !!old?.classList.contains('pv-n-corporate') && !!old.querySelector('.pl-hdr');
  const oldPage = mine ? +(old.querySelector('.pl-hdr')?.dataset.pg ?? -1) : -1;
  const turning = mine && oldPage !== page && oldPage >= 0 && !rm;
  const same = mine && oldPage === page;
  const wanted = PENDING && PENDING.page === page && Date.now() - PENDING.at < 6000 ? PENDING : null;
  PENDING = null;

  let armed = !turning;
  let seen = false;
  const pending = new Set();
  if (!rm && !same) site.classList.add('pl-armed');

  // the visitor took the sample in their hands: the scripted demo (the auto-picked worry) stops
  let touched = !!ctx.user;
  ctx.onUser?.(() => { touched = true; });

  /* ---------- small motions shared by the blocks ---------- */
  // digits that roll (Number Flow / Counter): a full turn up to the value, right to left
  const roll = (box, d = 0) => {
    if (rm || !box) return;
    const cols = $$('.pl-d__c', box);
    cols.forEach((col, i) => col.animate([{ transform: 'translateY(calc((var(--d) - 10) * -1em))' }, { transform: 'translateY(calc(var(--d) * -1em))' }], { duration: 1000, delay: d + (cols.length - 1 - i) * 60, easing: 'cubic-bezier(0.25, 1, 0.3, 1)', fill: 'backwards' }));
  };
  // words rising in their masks, line by line (SplitText)
  const rise = (el, d = 0) => {
    if (rm || !el) return;
    const ws = $$('.pl-w > span', el);
    const tops = ws.map((w) => w.parentElement.offsetTop);
    const lines = [...new Set(tops)].sort((a, b) => a - b);
    ws.forEach((w, i) => w.animate([{ transform: 'translateY(112%)' }, { transform: 'none' }], { duration: 1100, delay: d + lines.indexOf(tops[i]) * 110 + i * 16, easing: EASE, fill: 'backwards' }));
  };
  // the key word's nacre sheen crosses it once (ShinyText)
  const shine = (el, d = 0) => {
    if (rm || !el) return;
    $$('.pl-key .pl-w > span', el).forEach((w, i) => w.animate([{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { duration: 1800, delay: d + 500 + i * 140, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'backwards' }));
  };
  // a photo opens through a growing circle (once)
  const iris = (el, d = 0) => {
    if (rm || !el) return;
    el.animate([{ clipPath: 'circle(0% at 40% 60%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 1400, delay: d, easing: 'cubic-bezier(0.65, 0, 0.25, 1)', fill: 'backwards' });
    el.querySelector('img')?.animate([{ transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 1800, delay: d, easing: EASE, fill: 'backwards' });
  };
  const fadeUp = (el, d = 0, dist = '1.4cqw') => { if (!rm && el) el.animate([{ opacity: 0, transform: `translateY(${dist})` }, { opacity: 1, transform: 'none' }], { duration: 800, delay: d, easing: EASE, fill: 'backwards' }); };

  /* ---------- the menu (CardNav): opens downward under the bar, the cards let down one by one ---------- */
  let isOpen = false;
  function toggle(v = !isOpen) {
    if (!menu || v === isOpen) return;
    isOpen = v;
    site.classList.toggle('is-menu', isOpen);
    scroller?.getAnimations().forEach((a) => (isOpen ? a.pause() : !pvw?.hasAttribute('data-paused') && a.play()));
    if (rm) return;
    if (isOpen) {
      $('.pl-menu__bg').animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 560, easing: EASE });
      $$('.pl-card', menu).forEach((el, i) => {
        el.animate([{ clipPath: 'inset(0 0 100% 0 round 2cqw)' }, { clipPath: 'inset(0 0 0% 0 round 2cqw)' }], { duration: 700, delay: 90 + i * 90, easing: EASE, fill: 'backwards' });
        $$('.pl-card__k, li', el).forEach((x, j) => fadeUp(x, 260 + i * 90 + j * 50, '1cqw'));
      });
    } else {
      menu.animate([{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }], { duration: 260, easing: 'linear' });
    }
  }

  /* ---------- a nacre pill that glides to the chosen item (the worries, the categories) ---------- */
  function glideTo(bead, host, from, toEl) {
    if (!bead || !toEl) return;
    const hr = host.getBoundingClientRect(), r1 = toEl.getBoundingClientRect();
    bead.style.setProperty('--bx', `${r1.left - hr.left}px`);
    bead.style.setProperty('--by', `${r1.top - hr.top}px`);
    bead.style.setProperty('--bw', `${r1.width}px`);
    bead.style.setProperty('--bh', `${r1.height}px`);
    if (rm || !from || from === toEl || !r1.width) return;
    const r0 = from.getBoundingClientRect();
    bead.animate([{ transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width}, ${r0.height / r1.height})` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' });
  }
  const placeBeads = () => {
    const th = $('.pl-wos');
    if (th) { const on = $('.pl-wo.is-on', th); glideTo($('.pl-wos__ind', th), th, null, on); }
    const ct = $('.pl-cats__in');
    if (ct) glideTo($('.pl-cats__ind', ct), ct, null, $('.pl-cat.is-on', ct));
  };

  /* ---------- «Що вас турбує?»: a worry → its service, price, visits, time (the card turns, its numbers roll) ---------- */
  function pick(i, user = true) {
    const th = $('.pl-wos');
    if (!th) return;
    if (user) touched = true;
    const opts = $$('[data-wo]', th);
    const from = opts.find((o) => o.classList.contains('is-on'));
    const toEl = opts[i];
    if (!toEl || from === toEl) return;
    opts.forEach((o) => o.classList.toggle('is-on', o === toEl));
    glideTo($('.pl-wos__ind', th), th, from, toEl);
    const cards = $$('[data-ans]');
    const a = cards.find((x) => x.classList.contains('is-on'));
    const b = cards[i];
    cards.forEach((x) => x.classList.toggle('is-on', x === b));
    if (rm) return;
    a?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'linear' });
    b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 100, easing: 'linear', fill: 'backwards' });
    rise($('.pl-ans__t', b), 120);
    $$('.pl-ans__f b', b).forEach((x, j) => roll(x, 220 + j * 110));
    $$('.pl-ans__d, .pl-ans__a', b).forEach((x, j) => fadeUp(x, 260 + j * 80, '0.8cqw'));
    $('.pl-ans__ph img', b)?.animate([{ transform: 'scale(1.14)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 1100, easing: EASE });
  }

  /* ---------- the price list: categories (the pearl glides, the rows sort), rows open smoothly ---------- */
  function cat(i) {
    const box = $('.pl-cats__in');
    const cs = $$('[data-cat]', box);
    const from = cs.find((x) => x.classList.contains('is-on'));
    if (!cs[i] || from === cs[i]) return;
    cs.forEach((x) => x.classList.toggle('is-on', x === cs[i]));
    glideTo($('.pl-cats__ind', box), box, from, cs[i]);
    const rows = $$('[data-acc]');
    rows.forEach((r) => {
      const show = i === 0 || +r.dataset.c === i;
      const was = !r.classList.contains('is-hidden');
      r.classList.toggle('is-hidden', !show);
      if (show && !was) fadeUp(r, 60, '0.8cqw');
    });
    const first = rows.find((r) => !r.classList.contains('is-hidden'));
    if (first && !first.classList.contains('is-open')) openRow(first, true);
  }
  function openRow(row, force = false) {
    if (!row) return;
    const was = row.classList.contains('is-open');
    if (was && force) return;
    $$('[data-acc].is-open').forEach((x) => {
      if (x === row && !was) return;
      const bx = $('.pl-row__b', x);
      if (rm || !bx || x.classList.contains('is-hidden')) { x.classList.remove('is-open'); return; }
      const h = bx.offsetHeight;
      bx.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 360, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }).onfinish = () => x.classList.remove('is-open');
    });
    if (was) return;
    if (row.classList.contains('is-hidden')) cat(0);
    row.classList.add('is-open');
    if (rm) return;
    const b = $('.pl-row__b', row);
    b.animate([{ height: '0px' }, { height: `${b.offsetHeight}px` }], { duration: 520, easing: EASE });
    fadeUp($('.pl-row__in', row), 80, '-0.6cqw');
    roll($('.pl-row__p', row), 60);
  }

  /* ---------- the four pearls on the curve: a step chosen lights its pearl ---------- */
  function step(el) {
    $$('[data-step]').forEach((x) => x.classList.toggle('is-on', x === el));
    if (!rm) $('.pl-step__p', el)?.animate([{ transform: 'scale(0.6)' }, { transform: 'scale(1.25)', offset: 0.55 }, { transform: 'none' }], { duration: 640, easing: EASE });
  }

  /* ---------- the rooms (AccordionGallery): the chosen one opens, the others step back ---------- */
  const room = (el) => $$('[data-room]').forEach((x) => x.classList.toggle('is-on', x === el));

  /* ---------- the review slider (Carousel, quiet): the words rise, the number slides (Sliding Number) ---------- */
  let slide = 0;
  function car(d) {
    const box = $('.pl-car');
    if (!box) return;
    const s = $$('.pl-car__s', box);
    const n = (slide + d + s.length) % s.length;
    if (n === slide) return;
    const a = s[slide], b = s[n];
    slide = n;
    s.forEach((x) => x.classList.toggle('is-on', x === b));
    const sn = $('.pl-sn', box);
    const oldN = $('b', sn);
    const newN = document.createElement('b');
    newN.textContent = String(n + 1);
    sn.append(newN);
    if (rm) { oldN.remove(); return; }
    oldN.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${-d * 100}%)`, opacity: 0 }], { duration: 420, easing: EASE }).onfinish = () => oldN.remove();
    newN.animate([{ transform: `translateY(${d * 100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: EASE });
    a.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'linear' });
    b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 80, easing: 'linear', fill: 'backwards' });
    rise($('p', b), 80);
    fadeUp($('figcaption', b), 280, '0.8cqw');
  }

  /* ---------- the booking: service, day, time (SpringCheck; a taken slot shakes), the summary turns, sent ---------- */
  function opt(el) {
    const group = el.closest('[data-group]');
    if (!group) return;
    if (el.classList.contains('is-busy')) {
      if (!rm) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 360, easing: 'ease-out' });
      return;
    }
    if (el.classList.contains('is-on')) return;
    $$('[data-opt]', group).forEach((x) => x.classList.toggle('is-on', x === el));
    const kind = group.dataset.group;
    const swap = (node, text) => {
      if (!node) return;
      node.textContent = text;
      if (!rm) node.animate([{ opacity: 0, transform: 'translateY(60%)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: EASE });
    };
    swap($(`[data-sum-${kind}]`), el.dataset.label || el.textContent.trim());
    if (kind === 'svc') swap($('[data-sum-price]'), el.dataset.price || '');
    // the steps above the widget: the chosen one lights (Послуга · Дата · Час · Контакти)
    const si = { svc: 0, day: 1, time: 2 }[kind];
    const st = $$('[data-bstep]')[si];
    if (st && !rm) st.querySelector('b')?.animate([{ transform: 'scale(0.7)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'none' }], { duration: 560, easing: EASE });
    if (rm) return;
    el.animate([{ transform: 'scale(0.93)' }, { transform: 'scale(1.04)', offset: 0.55 }, { transform: 'none' }], { duration: 520, easing: EASE });
    $('.pl-opt__t', el)?.animate([{ transform: 'scale(0.3)' }, { transform: 'scale(1.2)', offset: 0.6 }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' });
    $('.pl-tick path', el)?.animate([{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 420, delay: 140, easing: EASE, fill: 'backwards' });
  }
  const chipPick = (i) => { const el = $$('[data-group="svc"] [data-opt]')[i]; if (el) opt(el); };
  function send(b) {
    if (b.classList.contains('is-sending') || b.classList.contains('is-sent')) return;
    if (rm) { b.classList.add('is-sent'); later(() => b.classList.remove('is-sent'), 3000); return; }
    b.classList.add('is-sending');
    $('.pl-send__fill', b).animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }).onfinish = (ev) => {
      if (!alive()) return;
      b.classList.replace('is-sending', 'is-sent');
      $$('[data-bstep]').forEach((x) => x.classList.add('is-done'));
      $('.pl-send__b', b)?.animate([{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: EASE });
      $('.pl-send__b .pl-tick path', b)?.animate([{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 480, delay: 160, easing: EASE, fill: 'backwards' });
      later(() => { b.classList.remove('is-sent'); ev.target.cancel(); }, 3000);
    };
  }

  /* ---------- the map's pin (the clinic's pearl) drops again ---------- */
  function pin() {
    if (rm) return;
    $('.pl-map__drop')?.animate([{ transform: 'translateY(-24px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.6 }, { transform: 'translateY(-4px)', offset: 0.8 }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(0.3, 0, 0.3, 1)' });
    $('.pl-map__sh')?.animate([{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 200, easing: EASE });
  }

  /* ---------- links inside the sample: a page, and on it a section (ctx.scrollTo), a row, a service ---------- */
  const goTab = (i) => pvw?.querySelector(`.pvw__tab[data-page="${i}"]`)?.click();
  function apply(t) {
    if (t.row != null) openRow($$('[data-acc]')[t.row], true);
    if (t.chip != null) chipPick(t.chip);
    const el = t.to ? $(`[data-anc="${t.to}"]`) : $('[data-sec]');
    if (el && ctx.scrollTo) ctx.scrollTo(el);
  }
  function go(i, t) {
    if (isOpen) toggle(false);
    if (i === page) { apply(t); return; }
    PENDING = t.to || t.row != null || t.chip != null ? { page: i, at: Date.now(), ...t } : null;
    goTab(i);
  }
  const target = (g) => ({ to: g.dataset.to || '', row: g.dataset.row != null ? +g.dataset.row : null, chip: g.dataset.chip != null ? +g.dataset.chip : null });

  // one listener for the whole sample; every click inside it stays inside it (a tap never turns the page by itself)
  site.addEventListener('click', (ev) => {
    const t = ev.target instanceof Element ? ev.target : null;
    if (!t) return;
    ev.stopPropagation();
    const at = (q) => t.closest(q);
    let x;
    if ((x = at('[data-menu]'))) toggle();
    else if ((x = at('[data-wo]'))) pick(+x.dataset.wo);
    else if ((x = at('[data-cat]'))) cat(+x.dataset.cat);
    else if ((x = at('[data-opt]'))) opt(x);
    else if ((x = at('[data-car]'))) car(+x.dataset.car);
    else if ((x = at('[data-send]'))) send(x);
    else if ((x = at('[data-field]'))) { $$('[data-field]').forEach((f) => f.classList.toggle('is-focus', f === x)); $$('[data-bstep]')[3]?.classList.add('is-cur'); }
    else if ((x = at('[data-go]'))) go(+x.dataset.go, target(x));
    else if ((x = at('[data-acc]'))) openRow(x);
    else if ((x = at('[data-step]'))) step(x);
    else if ((x = at('[data-room]'))) room(x);
    else if ((x = at('[data-num]'))) roll(x);
    else if ((x = at('[data-map]'))) pin();
    else if ((x = at('[data-cc]'))) apply({ to: 'form' });
    else if (isOpen && !t.closest('.pl-menu__in')) toggle(false);
  });

  /* ---------- the pointer (a mouse only; reduced motion: none of it) ---------- */
  if (fine) {
    // TiltedCard: the round photos and the price cards' photos turn toward the pointer
    $$('[data-tilt]').forEach((ph) => {
      const host = ph.closest('.pl-bc, .pl-pack, .pl-hero__vis, .pl-ph__vis') || ph;
      on(host, 'pointermove', (ev) => {
        const r = ph.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        ph.style.setProperty('--rx', `${(-Math.max(-1, Math.min(1, y)) * 9).toFixed(2)}deg`);
        ph.style.setProperty('--ry', `${(Math.max(-1, Math.min(1, x)) * 11).toFixed(2)}deg`);
      });
      on(host, 'pointerleave', () => { ph.style.setProperty('--rx', '0deg'); ph.style.setProperty('--ry', '0deg'); });
    });
    // SpotlightCard: the contact cards lit by a soft nacre light under the pointer
    $$('.pl-cc, .pl-bc, .pl-pack').forEach((cc) => on(cc, 'pointermove', (ev) => {
      const r = cc.getBoundingClientRect();
      cc.style.setProperty('--x', `${ev.clientX - r.left}px`);
      cc.style.setProperty('--y', `${ev.clientY - r.top}px`);
    }));
    // the rooms open on hover too
    $$('[data-room]').forEach((r) => on(r, 'pointerenter', () => room(r)));
    // VariableProximity: the titles grow heavier under the pointer (Source Serif 4, weight 300–600)
    $$('[data-prox]').forEach((h) => {
      const host = h.closest('section');
      const ls = $$('.pl-l', h).filter((l) => !l.closest('.pv-lx__b'));
      if (!host || !ls.length) return;
      let pts = null, base = null, top0 = 0, raf = 0, px = 0, py = 0;
      const measure = () => { top0 = host.getBoundingClientRect().top; pts = ls.map((l) => { const b = l.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }); };
      const upd = () => {
        raf = 0;
        if (!pts) return;
        if (Math.abs(host.getBoundingClientRect().top - top0) > 1) measure();
        const R = site.clientWidth * 0.1;
        ls.forEach((l, i) => {
          const k = Math.max(0, 1 - Math.hypot(px - pts[i][0], py - pts[i][1]) / R);
          l.style.fontWeight = k > 0.01 ? String(Math.round(base[i] + (560 - base[i]) * k * k)) : '';
        });
      };
      on(host, 'pointerenter', () => { base = ls.map((l) => parseFloat(getComputedStyle(l.parentElement).fontWeight) || 300); measure(); });
      on(host, 'pointermove', (ev) => { if (!pts) return; px = ev.clientX; py = ev.clientY; if (!raf) raf = requestAnimationFrame(upd); });
      on(host, 'pointerleave', () => { pts = null; ls.forEach((l) => { l.style.fontWeight = ''; }); });
    });
  }

  /* ---------- the bar tightens once the page moves (Truncating Navbar), the tour's or the visitor's ---------- */
  const sentEl = $('.pl-sent');
  if (sentEl && hdr) {
    const hio = new IntersectionObserver((es) => { hdr.classList.toggle('is-solid', !es[es.length - 1].isIntersecting); }, { root: vp, threshold: 0 });
    hio.observe(sentEl);
    offs.push(() => hio.disconnect());
  }

  /* ---------- the entrances: each block once, as it comes into the frame, only while the frame is on screen ---------- */
  // a round badge (CircularText) turns once as it arrives
  const turn = (el, d = 0) => { if (!rm && el) $('svg', el)?.animate([{ transform: 'rotate(-140deg)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 1800, delay: d, easing: EASE, fill: 'backwards' }); };
  const SCENES = {
    hero(sec, d) {
      if (!sec.querySelector('.pl-obj')) iris($('.pl-hero__ph', sec), d + 100);
      else fadeUp($('.pl-hero__ph', sec), d + 100, '0px');
      iris($('.pl-hero__round', sec), d + 650);
      turn($('.pl-badge', sec), d + 900);
      fadeUp($('.pl-pocket', sec), d + 1000, '0px');
      $('.pl-rings', sec)?.animate([{ transform: 'scale(0.86)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1800, delay: d, easing: EASE, fill: 'backwards' });
      sec.querySelector('.pl-glare')?.animate([{ transform: 'translateX(-130%) skewX(-14deg)' }, { transform: 'translateX(330%) skewX(-14deg)' }], { duration: 2000, delay: d + 1400, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
    },
    head(sec, d) { iris($('.pl-ph__ph', sec), d + 120); iris($('.pl-ph__round', sec), d + 600); },
    ribbon(sec, d) { $('.pl-ribbon__in', sec)?.animate([{ transform: 'translateX(-6%)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'none', opacity: 1 }], { duration: 2600, delay: d, easing: EASE, fill: 'backwards' }); },
    pick(sec, d) {
      $$('.pl-wo', sec).forEach((w, i) => fadeUp(w, d + 260 + i * 60, '0.8cqw'));
      $$('.pl-ans__c.is-on .pl-ans__f b', sec).forEach((b, i) => roll(b, d + 600 + i * 110));
      // the tour's one named interaction: «Час на чистку», once, unless the visitor has the sample in hand
      if (!rm) later(() => { if (!touched && !ctx.user) pick(1, false); }, 2200);
    },
    nums(sec, d) { $$('.pl-num', sec).forEach((n, i) => roll(n, d + 260 + i * 150)); },
    bento(sec, d) { $$('.pl-bc__round', sec).forEach((r) => iris(r, d + 300)); },
    visit(sec, d) {
      turn($('.pl-badge', sec), d + 300);
      $$('.pl-visit__p', sec).forEach((p, i) => p.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.25)', offset: 0.6 }, { transform: 'none' }], { duration: 700, delay: d + 500 + i * 260, easing: EASE, fill: 'backwards' }));
    },
    packs(sec, d) { $$('.pl-pack__p', sec).forEach((p, i) => roll(p, d + 400 + i * 140)); },
    steps(sec, d) {
      $('.pl-arc__path', sec)?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1600, delay: d + 200, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'backwards' });
      $$('.pl-step', sec).forEach((s, i) => {
        $('.pl-step__p', s)?.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2)', offset: 0.6 }, { transform: 'none' }], { duration: 700, delay: d + 400 + i * 360, easing: EASE, fill: 'backwards' });
        $$('.pl-step__n, b, .pl-step__d', s).forEach((x, j) => fadeUp(x, d + 520 + i * 360 + j * 60, '0.8cqw'));
      });
    },
    rooms(sec, d) { $$('.pl-room', sec).forEach((r, i) => iris(r, d + 100 + i * 160)); roll($('.pl-rooms__fact b', sec), d + 700); },
    docs(sec, d) { $$('.pl-doc__face b', sec).forEach((m, i) => m.animate([{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1000, delay: d + 300 + i * 120, easing: EASE, fill: 'backwards' })); },
    book(sec, d) { $$('.pl-opt', sec).forEach((o, i) => fadeUp(o, d + 300 + i * 24, '0.6cqw')); },
    band(sec, d) {
      iris($('.pl-band__ph', sec), d + 150);
      turn($('.pl-badge', sec), d + 600);
      $('.pl-band__sheen', sec)?.animate([{ transform: 'translateX(-60%)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translateX(60%)', opacity: 0 }], { duration: 2400, delay: d + 500, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
    },
    map(sec, d) {
      $('.pl-map__drop', sec)?.animate([{ transform: 'translateY(-24px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.6 }, { transform: 'translateY(-4px)', offset: 0.8 }, { transform: 'none' }], { duration: 900, delay: d + 500, easing: 'cubic-bezier(0.3, 0, 0.3, 1)', fill: 'backwards' });
      $('.pl-map__sh', sec)?.animate([{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: d + 700, easing: EASE, fill: 'backwards' });
      fadeUp($('.pl-map__card', sec), d + 300);
    },
    ftr(sec, d) { $('.pl-ftr__word span', sec)?.animate([{ transform: 'translateY(40%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1400, delay: d + 300, easing: EASE, fill: 'backwards' }); },
  };
  function play(sec, d = 0) {
    sec.classList.add('is-in');
    $$('[data-lines]', sec).forEach((h) => { rise(h, d); shine(h, d); });
    $$('[data-rv]', sec).forEach((el, i) => fadeUp(el, d + 160 + i * 70));
    SCENES[sec.dataset.scene]?.(sec, d);
  }
  function flush() {
    if (!seen || !armed) return;
    let i = 0;
    for (const s of pending) { if (s.classList.contains('is-in')) continue; play(s, i++ * 120); }
    pending.clear();
  }
  const ready = []; // what waits for the frame to be seen and the bloom to clear (the 3D pearl)
  const kick = () => { if (seen && armed) ready.splice(0).forEach((fn) => fn()); };
  if (!rm && !same) {
    const sio = new IntersectionObserver((es) => {
      for (const x of es) if (x.isIntersecting) { sio.unobserve(x.target); pending.add(x.target); }
      flush();
    }, { root: vp, threshold: 0, rootMargin: '0px 0px -8% 0px' });
    $$('[data-sec]').forEach((s) => sio.observe(s));
    offs.push(() => sio.disconnect());
  }
  const vio = new IntersectionObserver((es) => {
    const v = es[es.length - 1].intersectionRatio >= 0.15 && document.visibilityState === 'visible';
    if (v && !seen) { seen = true; flush(); kick(); }
  }, { threshold: [0, 0.15] });
  vio.observe(vp);
  const onVis = () => { if (document.visibilityState === 'visible' && !seen) { vio.unobserve(vp); vio.observe(vp); } };
  document.addEventListener('visibilitychange', onVis);
  offs.push(() => { vio.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  // the pearls under the worries and the categories find their places (one layout read, after the fonts)
  requestAnimationFrame(placeBeads);
  document.fonts?.ready?.then(() => { if (alive()) placeBeads(); });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => placeBeads());
    ro.observe(site);
    offs.push(() => ro.disconnect());
  }

  /* ---------- the page change: a nacre disc grows from the page's name until the old page is covered, then fades ---------- */
  if (mine) {
    const os = old.querySelector('.pv-scroll');
    if (os) os.style.translate = getComputedStyle(os).translate;
    old.querySelectorAll('.pl-bloom').forEach((n) => n.remove());
    old.classList.remove('pl-trans', 'pl-hold');
  }
  if (turning) {
    const fades = old.getAnimations();
    fades.forEach((a) => { a.pause(); a.currentTime = 0; });
    const oh = old.querySelector('.pl-hdr');
    const wasSolid = !!oh?.classList.contains('is-solid');
    if (oh) oh.style.visibility = 'hidden';
    old.querySelector('.pl-str')?.style.setProperty('visibility', 'hidden');
    site.classList.add('pl-trans', 'pl-hold');
    if (!wasSolid && hdr) { hdr.classList.add('pl-hdr--flat'); void getComputedStyle(hdr).opacity; requestAnimationFrame(() => hdr.classList.remove('pl-hdr--flat')); }
    // where the disc starts: the new page's name in the bar (or the menu button on a phone), at the cover's top edge
    const navOn = $('.pl-nav__i.is-on');
    const origin = navOn?.offsetWidth ? navOn : $('.pl-menubtn');
    const W0 = site.clientWidth, H0 = site.clientHeight;
    const top = hdr ? ($('.pl-bar', hdr)?.offsetHeight || hdr.offsetHeight) : 0;
    const sr = site.getBoundingClientRect(), orr = origin?.getBoundingClientRect();
    const ox = orr ? orr.left - sr.left + orr.width / 2 : W0 / 2, oy = 0;
    const R = Math.ceil(Math.hypot(Math.max(ox, W0 - ox), H0 - top - oy)) + 4;
    const layer = document.createElement('div');
    layer.className = 'pl-bloom';
    layer.setAttribute('aria-hidden', 'true');
    const lt = navOn?.querySelector('.pl-link__t');
    const name = (lt?.querySelector('.pv-lx__a') || lt || navOn)?.textContent || '';
    layer.innerHTML = `<i class="pl-bloom__disc" style="left:${ox - R}px;top:${oy - R}px;width:${2 * R}px;height:${2 * R}px"></i><span class="pl-bloom__t"><i class="pl-bloom__p"></i><b>${two(page + 1)}</b><span>${name.replace(/[<>&]/g, '')}</span></span>`;
    site.append(layer);
    const disc = $('.pl-bloom__disc', layer), label = $('.pl-bloom__t', layer);
    const GROW = 620, HOLD = 240, FADE = 560;
    disc.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: GROW, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' });
    label.animate([{ opacity: 0, transform: 'translateY(30%)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: GROW - 180, easing: EASE, fill: 'both' });
    // the header's plum line slides to the new page; the glint rides the thread from the old pearl to the new one
    const navOld = $(`.pl-nav__i[data-go="${oldPage}"]`);
    if (navOn && navOld && navOn.offsetWidth && navOld.offsetWidth) {
      const a = navOld.getBoundingClientRect(), b = navOn.getBoundingClientRect();
      try { navOn.animate([{ transform: `translateX(${a.left - b.left}px) scaleX(${a.width / b.width})` }, { transform: 'none' }], { duration: 760, delay: 80, easing: EASE, fill: 'backwards', pseudoElement: '::before' }); } catch (error) { /* it simply appears */ }
    }
    const glint = $('.pl-str__glint'), pOn = $(`.pl-str__p[data-f="${page}"]`), pOld = $(`.pl-str__p[data-f="${oldPage}"]`);
    if (glint && pOn && pOld) glint.animate([{ transform: `translateY(${pOld.offsetTop - pOn.offsetTop}px)` }, { transform: 'none' }], { duration: GROW + HOLD, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'backwards' });
    later(() => {
      // fully covered: the old page goes (the frame's own fade finishes at once), this page shows under the disc
      if (fades.length) fades.forEach((a) => a.finish()); else old.style.visibility = 'hidden';
      site.classList.remove('pl-trans');
      if (wanted) apply(wanted);
      later(() => {
        label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'linear', fill: 'both' });
        layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE, delay: 80, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
        armed = true;
        flush();
        kick();
        later(() => { layer.remove(); site.classList.remove('pl-hold'); }, FADE + 120);
      }, HOLD);
    }, GROW + 30);
  } else if (wanted) {
    requestAnimationFrame(() => { if (alive()) apply(wanted); });
  }

  /* ---------- 3D: the pearl in the first screen's pocket ---------- */
  if (ctx.three && $('.pl-obj')) {
    const run = { go: null };
    ready.push(() => { run.queued = true; run.go?.(); });
    pearl(site, ctx, run, rm, fine);
  }
  kick();
}

/* ---------- the pearl (three.js r186 core): one large pearl resting in the first screen's pocket ---------- */
async function pearl(site, ctx, run, rm, fine) {
  const box = site.querySelector('.pl-obj');
  const canvas = box?.querySelector('canvas');
  const hero = site.querySelector('.pl-hero');
  if (!box || !canvas || !hero) return;
  let dead = false, raf = 0, ro = null, renderer = null, settled = false;
  const bag = [];
  ctx.onDispose?.(() => {
    dead = true;
    cancelAnimationFrame(raf);
    ro?.disconnect();
    bag.forEach((x) => x.dispose?.());
    if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
  });
  let THREE, Simplex = null;
  try { THREE = await import('three'); } catch (error) { return; }
  try { ({ SimplexNoise: Simplex } = await import('three/addons/math/SimplexNoise.js')); } catch (error) { Simplex = null; }
  if (dead || !site.isConnected) return;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (error) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
  cam.position.set(0, 1.8, 6.7);
  cam.lookAt(0, 0.92, 0);

  // a soft studio the nacre reflects: warm walls, a big softbox above, blush and mint panels, a plum strip for depth
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const add = (geo, color, pos, look = [0, 0, 0]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(...pos); mesh.lookAt(...look); env.add(mesh); bag.push(geo, m);
  };
  const room = new THREE.SphereGeometry(30, 32, 16);
  const roomM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.42, 0.39, 0.41), side: THREE.BackSide });
  env.add(new THREE.Mesh(room, roomM)); bag.push(room, roomM);
  add(new THREE.PlaneGeometry(7, 5), [14, 13.6, 13], [-3, 11, 6]);
  add(new THREE.PlaneGeometry(8, 12), [1.5, 1.12, 1.22], [-12, 3, 3]);
  add(new THREE.PlaneGeometry(8, 12), [1.0, 1.4, 1.25], [12, 2, 2]);
  add(new THREE.PlaneGeometry(10, 6), [1.3, 1.2, 1.75], [0, 2, -12]);
  add(new THREE.PlaneGeometry(20, 3), [0.1, 0.07, 0.09], [0, -3, 9]);
  const envMap = pm.fromScene(env, 0.035).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 1.15;
  bag.push(pm, envMap);

  // a faint nacre: soft bands of warm and cool, drawn once
  const NW = 512, NH = 256;
  const cv = document.createElement('canvas'); cv.width = NW; cv.height = NH;
  const g2 = cv.getContext('2d');
  const id = g2.createImageData(NW, NH);
  const sn = Simplex ? new Simplex() : null;
  for (let y = 0; y < NH; y++) {
    for (let x = 0; x < NW; x++) {
      const n = sn ? sn.noise(x / 90, y / 40) * 0.6 + sn.noise(x / 30, y / 14) * 0.25 : 0;
      const band = Math.sin((y / NH) * Math.PI * 7 + n * 2.2);
      const i = (y * NW + x) * 4;
      id.data[i] = 247 + band * 2; id.data[i + 1] = 245 - band * 1; id.data[i + 2] = 243 + n * 3; id.data[i + 3] = 255;
    }
  }
  g2.putImageData(id, 0, 0);
  const nacre = new THREE.CanvasTexture(cv);
  nacre.colorSpace = THREE.SRGBColorSpace;
  nacre.wrapS = THREE.RepeatWrapping;
  bag.push(nacre);

  const geo = new THREE.SphereGeometry(1, 128, 96);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xe9e3dd, map: nacre, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02,
    iridescence: 0.65, iridescenceIOR: 1.45, iridescenceThicknessRange: [240, 520],
  });
  const ball = new THREE.Mesh(geo, mat);
  ball.position.y = 1;
  ball.castShadow = true;
  const holder = new THREE.Group(); holder.add(ball); scene.add(holder);
  bag.push(geo, mat);

  // the light of the room (upper left, in front), a sky-soft fill, and the ground that only takes the shadow
  const key = new THREE.DirectionalLight(0xfff4ec, 1.25);
  key.position.set(-3.2, 6, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 8;
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -2.6, right: 2.6, top: 2.6, bottom: -2.6, near: 1, far: 20 });
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xf3eef2, 0xc9bcc4, 0.35));
  const gG = new THREE.PlaneGeometry(12, 12);
  const gM = new THREE.ShadowMaterial({ color: 0x3a2633, opacity: 0.2 });
  const ground = new THREE.Mesh(gG, gM); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  bag.push(gG, gM);

  const draw = () => { if (!dead) renderer.render(scene, cam); };
  function size() {
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    return true;
  }
  size();
  ro = new ResizeObserver(() => { if (!dead && size() && (settled || rm)) draw(); });
  ro.observe(box);

  // the roll: from the right, a quarter turn and a little more, onto its place (x and the turn tied, as rolling is)
  const FROM = 1.5;
  const pose = (k) => { const x = FROM * (1 - k); ball.position.x = x; ball.rotation.z = -x; };
  if (rm) { pose(1); draw(); settled = true; box.classList.add('is-on'); return; }
  pose(0);
  run.go = () => {
    if (dead || run.done) return;
    run.done = true;
    size();
    box.classList.add('is-on');
    const t0 = performance.now(), D = 1800;
    const frame = (now) => {
      if (dead) return;
      const x = Math.min(1, (now - t0) / D);
      pose(1 - Math.pow(1 - x, 3.2));
      draw();
      if (x < 1) raf = requestAnimationFrame(frame); else settled = true;
    };
    raf = requestAnimationFrame(frame);
  };
  if (run.queued) run.go();

  // with a mouse, the pearl turns a little toward the pointer: frames only while it moves, then it rests
  if (fine) {
    let tx = 0, ty = 0, cx = 0, cy = 0, spin = 0;
    const tick = () => {
      spin = 0;
      if (dead || !settled) return;
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      holder.rotation.y = cx; holder.rotation.x = cy;
      draw();
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) spin = requestAnimationFrame(tick);
    };
    hero.addEventListener('pointermove', (ev) => {
      const r = box.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width * 2))) * 0.5;
      ty = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (r.height * 2))) * 0.3;
      if (!spin && settled) spin = requestAnimationFrame(tick);
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!spin && settled) spin = requestAnimationFrame(tick); });
  }
}
