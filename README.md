# Lumera — Next.js

Сайт Lumera Studio на стеке **Next.js 16 · Tailwind v4 · React Three Fiber · GSAP · Lenis · next-intl**.
Это перенос `website-v2` один в один (те же блоки, тексты, эффекты, порядок) и одновременно основа
своей библиотеки эффектов, из которой собираются следующие сайты.

```bash
npm run dev          # http://localhost:3000 (UA), /ru, /lab — витрина эффектов
npm run build        # прод-сборка: / и /ru статически
npm run registry     # собрать реестр эффектов → public/r/*.json
```

## Структура

```
src/
  app/
    [locale]/layout.tsx    <html>, метаданные (canonical, hreflang, OG), прелоадер, переводы
    [locale]/page.tsx      страница = список блоков по порядку
    [locale]/lab/          витрина библиотеки (noindex)
    api/lead/route.ts      заявка с формы → webhook или Telegram (переменные окружения)
  i18n/                    маршруты: / — украинский, /ru — русский (next-intl)
  messages/uk.json, ru.json  все тексты; цены — ICU-аргументы из движка конфигуратора
  styles/
    tokens.css             ← единственный источник токенов: Tailwind @theme + CSS-имена
    base.css, fonts.css
  lib/                     gsap (регистрация плагинов), hooks, boot (сигналы загрузки), typeset, rich
  components/
    ui/                    кнопка, логотип, иконки — базовые элементы
    fx/                    БИБЛИОТЕКА ЭФФЕКТОВ (каждый — своя папка, не знает про контент)
    three/                 3D на R3F: hero (камень, орбита, пыль, осколки), stage-stone, lib (геометрия, материалы,
                           WebGLGate — без WebGL или при ошибке сцены страница работает без 3D)
    layout/                header, topbar, footer, page (оболочка страницы), lang-switch
    sections/              блоки страницы: hero, what, services, manifesto, why, approach, pricing, faq, contact
    lab/                   витрина
  content/                 данные без текста (навигация)
registry.json              реестр эффектов (shadcn)
```

### Слои (сверху вниз зависят только от нижних)

| Слой | Что это | Правило |
|---|---|---|
| `styles/tokens.css` | цвета, шрифты, кривые, радиусы, ритм | эффекты и секции читают **только токены** |
| `lib/` | GSAP, хуки, сигналы | без разметки |
| `components/ui` | кнопка, логотип | без контента сайта |
| `components/fx` | эффекты | принимают селекторы / props / children; тексты не знают |
| `components/three` | 3D | состояние сцены — в `state.ts`, анимирует его GSAP |
| `components/sections` | блоки сайта | собраны из ui + fx + three; тексты из `messages` |
| `app/[locale]/page.tsx` | порядок блоков | ничего, кроме порядка |

### Блок = папка

`sections/<block>/`: серверный компонент с разметкой и текстами (`Block.tsx`), клиентская часть
только там, где есть поведение (`BlockClient.tsx`), свой CSS рядом (`block.css`).
Большие императивные анимации — отдельным модулем без React (`*.js`): React владеет разметкой и
жизненным циклом, модуль — хореографией. Так они переносимы в любой проект.

«Острова» (перенесены как есть, работают, ждут переписывания в компоненты при необходимости):
`pricing/configurator/*` (конфигуратор с живым превью), `services/demos/timelines.js` (5 демо),
`why/why-orbit.js`, `why/why-phone.js`, `approach/stages.js`, `approach/approach-phone.js`,
`contact/lead-form.js`, `fx/splash-cursor/fluid.js`, `fx/chrome-wordmark/wordmark.js`.

### Стили

Tailwind v4 подключён **без preflight**: сброс сайта — `styles/base.css` (на нём сверстан v2), CSS
блоков разрезан из v2 по компонентам с сохранением порядка правил (разовые скрипты переноса удалены,
они есть в истории git).
Новый код и витрина — на утилитах Tailwind с токенами (`bg-bg`, `text-ink`, `text-lime`, `font-mono`,
`text-display`, `ease-out` …). Класс сайта `.container` исключён из генерации Tailwind (`globals.css`).
Новый сайт на библиотеке может включить preflight как обычно.

**Большие экраны.** Вёрстка в `rem`: до ~1680×1000 корень — обычные 16px, дальше он растёт вместе с
экраном по меньшей из сторон (`styles/base.css`), так что вся страница крупнеет пропорционально, а
закреплённые экраны всё равно помещаются по высоте. Линии в 1–2px остаются в `px`. Скриптам, которым
нужны пиксели, — `lib/css.ts` (`dpx(36)`, `topbarHeight()`). Колода «Підхід» на высоком экране ещё и
растёт в свободное место (`--deck-k` в `stages.js`), слайды «Послуги» на ультрашироком — по высоте.

## Библиотека эффектов

Эффекты из `components/fx` публикуются как **свой shadcn-реестр**: сайт сам раздаёт их по адресу
`/r/<name>.json`. В новом проекте:

```jsonc
// components.json
{ "registries": { "@lumera": "https://<домен lumera>/r/{name}.json" } }
```

```bash
npx shadcn add @lumera/hover-reveal @lumera/horizontal-ride @lumera/preloader
```

Код копируется в проект и правится под клиента — без версионной зависимости от пакета.
Список и описания — `registry.json`; живьём — `/lab`.

| Эффект | Что делает |
|---|---|
| preloader | 5 колонок, слова «что мы делаем», честный счётчик по этапам загрузки, выход колоннами в hero |
| invert-cursor | курсор — круг, инвертирующий всё под собой (на сайте — только в футере) |
| invert-fill | кнопка инвертируется кругом из точки входа курсора (вариант, на сайте не используется) |
| run-label | надпись кнопки бежит бегущей строкой при наведении (вариант) |
| (ui/button) | основные кнопки: поднимается «жидкость» с волной; контурные: заливка снизу |
| roll-text | буквы ссылки «перекатываются» по одной |
| magnetic | кнопка тянется к курсору, подпись отстаёт (на сайте не используется) |
| hover-reveal | над строкой списка за курсором едет картинка (техника Codrops, MIT) |
| text-fill | слова абзаца загораются по мере чтения |
| scroll-reveal | блоки и заголовки появляются при скролле |
| spotlight | карточки подсвечиваются под курсором |
| smooth-scroll | Lenis на одних часах с ScrollTrigger |
| horizontal-ride | один слайд на экран: жест колеса листает слайд, стрелки, «пропустить»; HUD с номером и названиями |
| splash-cursor | дым за мышью (GPU-жидкость) |
| chrome-wordmark | слово в жидком хроме с линзой у курсора |

**Добавить эффект:** папка `components/fx/<name>/` (компонент или хук + CSS), без текстов сайта,
с вариантом для reduced motion и тача → пример в `components/lab/FxLab.tsx` → запись в
`registry.json` → `npm run registry`.

## Переменные окружения

`NEXT_PUBLIC_SITE_URL` — адрес сайта для canonical/OG (по умолчанию текущий Vercel).
Заявки: `LEAD_WEBHOOK_URL` **или** `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Без них форма
честно говорит, что заявка не ушла (локально — имитирует отправку).
