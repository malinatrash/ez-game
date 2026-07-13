# Своя игра — база знаний проекта

> Этот файл — моя (Codex) рабочая память по проекту. Загружается автоматически в каждой сессии.
> **Правило: любое структурное изменение (новый файл/стор/роут/пакет, удаление чего-либо, смена архитектурного решения) — сразу отражать здесь, в том же тёрне, что и сам код.** Не откладывать "потом задокументирую".

## Что это за проект

Десктоп-стайл веб-приложение для проведения викторин в стиле «Своя игра» (Jeopardy-клон). Для ведущего: редактор игр (категории/вопросы с медиа) + режим проведения игры (доска, вопросы, счёт, игроки).

Полное ТЗ огромное (см. историю чата/issue) — сейчас реализован **MVP**, первый рабочий срез. План MVP лежал в `/Users/malinatrash/.Codex/plans/optimized-inventing-eagle.md` (вне репозитория).

## Ключевые архитектурные решения (не пересматривать без явного запроса пользователя)

- **Чистый клиент, без бэкенда вообще.** Никакого Node/Express — просто SPA на Vite dev server / статическая сборка.
- **Хранилище:** IndexedDB через `idb-keyval` (см. `src/services/idb.ts`). Три стора: `games`, `assets`, `settings`, все три создаются в одном `onupgradeneeded` при открытии `svo-game-db` (версия зафиксирована в `DB_VERSION` в `idb.ts`) — **не заводить сторы через отдельные независимые `createStore()`**: `indexedDB.open(dbName)` без версии триггерит upgrade только у того вызова, что первым реально откроет ещё не существующую БД, остальные сторы молча не создаются (ловили `NotFoundError` из-за этого). При добавлении нового именованного стора — добавлять его имя в `STORE_NAMES` и бампать `DB_VERSION`.
  - **Reactive-объекты нельзя класть в IndexedDB напрямую.** Pinia state — это Vue reactive Proxy; `IDBObjectStore.put()` кидает `DataCloneError`, если ему передать Proxy как есть (structured clone не умеет его клонировать). `idb.setGame`/`idb.setSetting` прогоняют значение через `toPlain()` (`JSON.parse(JSON.stringify(value))`) перед записью — если добавляешь новый метод записи в `idb.ts`, делай так же. Именно из-за отсутствия этого раньше автосохранение молча падало (unhandled promise rejection), и правки (включая обои/музыку в `GameMeta`) никогда не долетали до диска.
- **Формат файла игры:** `.sog` — это zip (JSZip), см. раздел "Формат .sog" ниже.
- **Автосохранение** в редакторе игры — debounce 800ms (см. `useAutosave`), плюс явная кнопка «Сохранить» + статус («Сохранено»/«Есть несохранённые изменения», на `store.dirty`) в `GameEditorPage`/`QuestionEditorPage` — по явному запросу пользователя добавлена видимая точка контроля поверх автосейва. Переходы «Начать игру» и «← К игре» дожидаются `store.persist()` перед навигацией, чтобы не терять несохранённый 800ms-хвост.
- **Стиль кода:** маленькие файлы (~100 строк, мягкий лимит), тонкие `views/*Page.vue` + мелкие компоненты в `components/<feature>/`. Не создавать общие абстракции "на будущее" без необходимости.
- **Дизайн-токены** — разделены на структурные (`src/styles/tokens.css`: spacing/radius/font-size/z-index/durations, тема-независимые) и цветовые (`src/styles/themes.css`: `--color-*`/`--shadow-*`/`--color-scheme`, определены на `[data-theme="..."]`). Хардкодить значения в компонентах нельзя.
- **Темы оформления** — 5 встроенных (`dark`/`light`/`neon`/`tv`/`minimal`, см. `themes.css` + `src/types/theme.ts`) + пользовательские кастомные темы. Активная тема и кастомные темы — в `useThemeStore` (`src/stores/theme.ts`), персист через `idb.getSetting/setSetting`. Применение — атрибут `data-theme` на `<html>` для встроенных, инлайн CSS-переменные на `<html>` (через `src/services/themeColors.ts`) поверх для кастомных.
- **Анимации** — через `@vueuse/motion` (директива `v-motion`, плагин `MotionPlugin` в `main.ts`) + CSS-переходы на токенах длительности/easing. Точечно на переходах страниц, карточках, бейджах игроков, таблице результатов, ячейках доски.
- **Canvas-редактор вопроса** — на `vue-konva`/`konva` (drag/resize/rotate через `Transformer`, snap-guides — свой рецепт в `useSnapGuides`). Один `CanvasEditor` на сторону вопроса (контент/ответ).
- **ID** — только `crypto.randomUUID()` (обёртка `src/services/id.ts`), без доп. библиотек.

## Технологический стек и назначение пакетов

| Пакет | Назначение |
|---|---|
| `vue` (3.x, Composition API, `<script setup>`) | UI-фреймворк |
| `pinia` | Стейт-менеджмент, каждый стор — своя ответственность (см. ниже) |
| `vue-router` | Роутинг между экранами (history mode) |
| `jszip` | Сборка/чтение `.sog`-архивов на клиенте (экспорт/импорт игры) |
| `idb-keyval` | Тонкая обёртка над IndexedDB, три именованных стора (games/assets/settings) |
| `vite` + `@vitejs/plugin-vue` | Дев-сервер и сборка |
| `typescript` + `vue-tsc` | Типы и тайпчек при сборке (`npm run build` = `vue-tsc -b && vite build`) |
| `@vueuse/motion` | Directive-based анимации (`v-motion`), переходы страниц/карточек/бейджей |
| `konva` + `vue-konva` | Canvas-редактор вопроса: drag/resize/rotate/layers через Konva.Transformer |

Осознанно НЕ используются: UI-кит/Tailwind (стили руками из токенов), i18n-библиотека, Dexie, любой бэкенд-фреймворк.

## Структура проекта

```
src/
  main.ts              # createApp + pinia + router + MotionPlugin + VueKonva + импорт styles/tokens.css, styles/themes.css, styles/base.css
  App.vue              # <RouterView> в <Transition name="page">, вызывает themeStore.load() в onMounted
  router/index.ts       # все 9 роутов (см. ниже)

  styles/
    tokens.css          # структурные (тема-независимые) токены: spacing/radius/font-size/z-index/durations/easing
    themes.css           # цветовые токены (--color-*/--shadow-*/--color-scheme) на [data-theme="dark|light|neon|tv|minimal"]
    base.css              # ресеты, базовые стили html/body/#app, color-scheme: var(--color-scheme)

  types/                # чистые TS-типы, без логики
    game.ts             # Game, GameMeta (title/wallpaperAssetId/backgroundMusicAssetId/resultsMusicAssetId — трек, который включается на экране результатов вместо фоновой музыки), Category, Question (включая `musicAssetId?` — трек, который играет непрерывно на протяжении всего вопроса, и на экране вопроса, и на экране ответа, без перезапуска при переключении между ними, см. `questionMusic.ts`), QuestionSettings (включая `catInTheBag` — флаг «Кот в мешке», см. игровой флоу), CanvasElement (discriminated union: 'text' | 'image' | 'video' | 'audio' | 'shape', все с ElementTransform x/y/w/h/rotation/zIndex; 'shape' — `ShapeType` ('rectangle'|'circle') + `fill`)
    theme.ts              # BuiltInThemeId, ThemeColors, CustomTheme, BUILT_IN_THEMES, BUILT_IN_THEME_PREVIEWS
    player.ts           # Player { id, name, color, avatarAssetId?, score, streak }
    session.ts           # GameSession, TurnState, ScoreHistoryEntry
    sog.ts                # SogManifest, AssetIndexEntry, SOG_FORMAT_VERSION (сейчас = 2)

  services/             # чистые функции и IO-обёртки, без Vue/Pinia-зависимостей (кроме sog*)
    id.ts                 # createId() = crypto.randomUUID()
    idb.ts                 # единственная точка доступа к IndexedDB: getGame/setGame/deleteGame/getAllGames/getAsset/setAsset/deleteAsset/getSetting/setSetting
    themeColors.ts          # THEME_COLOR_VARS (маппинг ThemeColors ↔ CSS-переменные), readCurrentThemeColors/applyInlineThemeColors/clearInlineThemeColors
    canvasElements.ts       # CRUD над CanvasElement[]: createTextElement/createImageElement/createVideoElement/createAudioElement/createShapeElement (тип `shape`: `shapeType: 'rectangle'|'circle'` + `fill`, дефолт белый `#ffffff`, дефолтный размер 160×160 — `DEFAULT_SHAPE_SIZE`), addElement/removeElement/updateElement/duplicateElement/bringToFront/sendToBack/orderedByZIndex, fitMediaBox(dims, maxSize=360) — вписывает бокс в квадрат maxSize с сохранением aspect ratio исходника, используется как overrides при создании image/video-элементов
    mediaDimensions.ts       # readImageDimensions/readVideoDimensions(file) → {w,h} | null — читает натуральные размеры файла через временный `Image()`/`<video>` + `URL.createObjectURL` (сразу revoke после onload/onloadedmetadata), используется в `CanvasToolbar` перед созданием image/video-элемента, чтобы дефолтный бокс на холсте сразу был в пропорциях исходника, а не фиксированные 320×120
    textMeasure.ts            # computeTextBlockHeight(text, fontSize, width) — меряет текст на офскрин-`<canvas>` (word-wrap по пробелам, тот же `Arial`, что и дефолт Konva v-text) и считает нужную высоту блока по количеству строк (в т.ч. с учётом переносов по ширине), вызывается из `ElementPropertiesPanel` на каждый ввод текста/изменение fontSize — высота text-элемента подстраивается автоматически, руками растягивать блок не нужно
    konvaTransform.ts        # readTransformEnd/readDragEnd — нормализация scaleX/scaleY→w/h после Konva Transformer
    legacyMigration.ts        # ensureV2Elements/migrateGameToV2 — миграция старого (v1, без x/y/w/h) формата элементов в новый позиционированный, общая для sogImport.ts и gameEditor.loadGame
    sogAssets.ts             # collectAssetIds(game) — собирает все assetId игры (обои, фоновая музыка, музыка результатов, картинки/видео/аудио вопросов/ответов, `question.musicAssetId`) — при добавлении нового *AssetId-поля в GameMeta/Question обязательно добавлять его сюда, иначе .sog-экспорт молча не включит файл
    sogExport.ts              # exportGameToSog(gameId) — строит zip, триггерит скачивание
    sogImport.ts               # importSogFile(file) — распаковывает zip, при formatVersion===1 гоняет migrateGameToV2, пишет в IndexedDB
    resultsAnalytics.ts        # analyzeSession(players, historyEntries, game) — чистая функция для ResultsPage: ranked-список, StatTile[] (отвечено/верно/неверно/длительность) и большой FunFact[] (~30 фактов: чемпион, огненная серия, крупнейший куш/провал, точность, самый активный, камбэк дня, кража вопроса после чужого промаха, "заклятые соперники" — пара игроков, чаще всего сталкивавшихся на одних вопросах, точность по ценовым терциям вопросов, эффективность очки/попытка, "однолюб" по одной категории, развязка в последнем вопросе, финальный аккорд игры и др.), считает по ScoreHistoryEntry[] из historyStore (группирует записи по questionId через `byQuestion`, т.к. на один вопрос может быть несколько `incorrect` от разных игроков + один `correct`), ничего не мутирует

  stores/               # Pinia, каждый стор — одна ответственность
    gameLibrary.ts        # useGameLibraryStore: список игр (метаданные), createGame/deleteGame/exportGame/importGame. НЕ хранит редактируемую игру целиком.
    gameEditor.ts          # useGameEditorStore: текущая редактируемая Game целиком + CRUD категорий/вопросов + persist() (автосохранение). loadGame() прогоняет migrateGameToV2 на случай legacy-данных в IndexedDB.
    theme.ts                # useThemeStore: activeThemeId + customThemes[], setActiveTheme/createCustomTheme/updateCustomTheme/deleteCustomTheme, load()/persist() через idb settings-стор, applyTheme() пишет data-theme/инлайн CSS-переменные на <html>
    players.ts              # usePlayersStore: игроки текущей игровой сессии (setup + во время игры), addPlayer/removePlayer/movePlayer. Во время партии удаление запускается из PlayerSidebar: единственного оставшегося игрока удалить нельзя. `setupGameId` + `ensureForGame(gameId)` — сброс списка игроков только при реальной смене игры в `PlaySetupPage`, а не при каждом ремаунте страницы (раньше сравнивали с `sessionStore.gameId`, который выставляется лишь при старте партии — из-за этого повторный вход на `/play/:gameId/setup` до нажатия «Начать игру» стирал уже введённых игроков). Палитра DEFAULT_COLORS расширена (18 цветов) — не сокращать без причины.
    session.ts               # useSessionStore: раннтайм активной партии — gameId, answeredQuestionIds, TurnState, isOver. start/openQuestion/resolveQuestion/endGame/setActivePlayer (последний — принудительно назначить активного игрока в обход round-robin, используется механикой «Кот в мешке»); removePlayer переводит ход к следующему по исходному порядку, если удалён активный игрок
    history.ts                # useHistoryStore: undo/redo стек ScoreHistoryEntry. record() мутирует player.score/streak напрямую через usePlayersStore(); removePlayerEntries() очищает оба стека от записей удаляемого во время партии игрока
    settings.ts               # useSettingsStore: пока только autosaveEnabled/autosaveIntervalMs — задел под будущий полноценный экран настроек
    backgroundMusic.ts          # useBackgroundMusicStore: держит один module-level singleton `Audio()` (не Vue-компонент — иначе музыка перезапускалась бы при каждой смене роута /play/:gameId/board ↔ /question ↔ /results). `audio.loop = true` — играет полный трек на повторе всю партию. syncForGame(gameId) грузит meta.backgroundMusicAssetId только при смене id, toggle() — на случай если браузер заблокировал autoplay, setVolume()/loadVolume() — громкость персистится в settings-сторе idb (ключ backgroundMusicVolume), общая для всех игр. Драйвится из App.vue через watch(route.path) + loadVolume() в onMounted. Не останавливается автоматически при переходе на /play/:gameId/results, т.к. gameId роута не меняется — `ResultsPage` останавливает её явно (`backgroundMusic.stop()`) в onMounted перед запуском музыки результатов. `pauseForMedia()`/`resumeFromMedia()` — отдельная от `toggle()` пара действий с флагом `duckedForMedia`: `PlayQuestionPage` приглушает фоновую музыку, если у вопроса есть video/audio-элемент в content ИЛИ answer (`hasPlayableMedia` в `canvasElements.ts`), и возвращает её в `onUnmounted`. `duckedForMedia` выставляется только если музыка реально играла на момент приглушения — если ведущий сам поставил её на паузу через `toggle()` до открытия вопроса, авто-возврат её не включит
    resultsMusic.ts               # useResultsMusicStore: отдельный module-level singleton `Audio()` (не loop) для отдельного трека `meta.resultsMusicAssetId`, который проигрывается только на экране результатов. play(assetId)/stop() — `ResultsPage` вызывает play() в onMounted (после backgroundMusic.stop()) и stop() в onUnmounted. Намеренно отдельный стор/Audio от backgroundMusic, а не переиспользование того же — разная логика (loop, момент запуска/остановки, независимость от gameId маршрута)
    questionMusic.ts               # useQuestionMusicStore: ещё один отдельный module-level singleton `Audio()` (`loop = true`) для `question.musicAssetId` — трека, который должен играть непрерывно на протяжении всего вопроса. play(questionId, assetId) — no-op, если questionId совпадает с уже играющим (`currentQuestionId`), поэтому переключение `side` между 'content'/'answer' в `PlayQuestionPage` (просто локальный ref, без ремаунта компонента) не перезапускает трек; вызов с новым questionId сначала останавливает предыдущий. `PlayQuestionPage` вызывает play() в `watch(question, ..., { immediate: true })` и stop() в onUnmounted; фоновая музыка приглушается через `backgroundMusic.pauseForMedia()`, если задан `musicAssetId` ИЛИ есть playable-медиа в content/answer (см. `hasPlayableMedia`)

  composables/
    useAssetUpload.ts     # uploadAsset(file) → assetId, с мягким предупреждением при файле >15MB
    useAssetUrl.ts         # useAssetUrl(() => assetId) → reactive object URL, сам делает revoke при смене/анмаунте
    useAutosave.ts          # watch(store.game, deep) → debounce 800ms → store.persist()
    useCanvasSelection.ts    # selectedId + select/clear — состояние выделения одного Konva-редактора (не Pinia-стор, т.к. на странице их два независимых)
    useSnapGuides.ts          # smart-guides: снап к краям/центрам других элементов и центру канваса на dragmove, отрисовка временных линий
    useFitScale.ts             # useFitScale(containerRef, contentW, contentH) → reactive scale через ResizeObserver — вписывает канвас 640×400 в доступное место с сохранением пропорций (transform: scale), используется в QuestionView на play-экране
    useConfirm.ts               # confirmDialog(message) → Promise<boolean> + module-level reactive-состояние (не Pinia-стор, тот же паттерн синглтона, что и backgroundMusic). Заменяет нативный window.confirm() — в вебвью (VSCode preview и т.п.) пользователь может один раз нажать «не показывать больше» в браузерном диалоге, и после этого confirm()/alert() молча возвращают falsy без показа окна вообще, из-за чего все кнопки удаления (категория/вопрос/игра из библиотеки/предупреждение о большом ассете) выглядели нажатыми, но ничего не делали. Рендерится один раз — `ConfirmDialog.vue`, подключён в `App.vue` рядом с `Breadcrumbs`.
  components/
    common/               # переиспользуемые мелкие блоки
      ImageUploader.vue      # v-model на assetId, превью через useAssetUrl
      ConfirmDialog.vue        # оверлей поверх всего приложения (токены --z-modal/--z-overlay), читает состояние из useConfirm.ts, подключён один раз в App.vue — использовать confirmDialog(message) вместо window.confirm() везде в проекте
      AudioUploader.vue       # v-model на assetId, <audio controls>
      VideoUploader.vue        # v-model на assetId + filename, <video controls>
      EmptyState.vue             # message + ссылка "К библиотеке игр" — для состояний loading/not-found
      WallpaperBackground.vue     # `:asset-id` → `position: fixed; inset:0; z-index:-1` слой с `background-size: cover` (не растягивает, кропает с сохранением пропорций). Не стилизует контейнер страницы напрямую — иначе обои перекрывали/сливались с сайдбаром, который должен оставаться непрозрачной панелью поверх (см. `.sidebar` в `PlayerSidebar.vue`, `background: var(--color-surface)` + `z-index: 1`). Используется на всех `/play/*` страницах.
      Breadcrumbs.vue              # единственный источник хлебных крошек — подключён один раз в `App.vue` над `<RouterView>`, НЕ дублировать per-page. Строит цепочку по `route.path`/`route.params` + названию игры из `useGameEditorStore`/`useGameLibraryStore` (fallback «Игра»); скрыт на `/`. Клик по некорневой крошке дожидается `gameStore.persist()` (если `dirty`), как и остальная навигация в редакторе. Фиксированная высота — токен `--size-breadcrumbs-height` (`tokens.css`); страницы с `100vh`/`height:100vh` (`PlaySetupPage`, `PlayBoardPage`, `PlayQuestionPage`, `ResultsPage`) используют `calc(100vh - var(--size-breadcrumbs-height))`, иначе съезжает full-screen раскладка. Из-за этого же убраны дублирующие ссылки-«назад» на `SettingsPage`/`AboutPage` и кнопка «← К игре» на `QuestionEditorPage` — та же навигация уже есть в крошках.
      UiButton.vue / UiSwitch.vue / UiSelect.vue / UiFileButton.vue  # общие стилизованные примитивы (кнопка с вариантами primary/ghost/danger, toggle вместо чекбокса, `<select>` с кастомной стрелкой, файловый инпут как стилизованная кнопка) — использовать вместо голых `<button>`/`<input type="checkbox">`/`<select>`/`<input type="file">`, чтобы не плодить разномастные "сырые" элементы по компонентам редактора вопроса.
    settings/              # ThemeGallery (сетка тем), ThemeSwatch (превью-карточка), ThemeEditor (создание кастомной темы цветовыми пикерами)
    library/               # GameCard, LibraryList, NewGameForm, ImportButton
    editor/
      game/                   # GameMetaForm (название, обои, фоновая музыка, музыка результатов — все три AssetId-поля GameMeta), CategoryList, CategoryEditorRow (название+вопросы+move/remove)
      question/                # QuestionForm (cost/hostNotes/settings/musicAssetId — AudioUploader на трек, который играет весь вопрос целиком, см. `questionMusic.ts` — + два <CanvasEditor> на content/answer)
      canvas/                   # Konva-редактор вопроса:
        CanvasEditor.vue          #   оркестратор одного холста: toolbar + stage + properties panel, владеет useCanvasSelection
        CanvasToolbar.vue          #   кнопки добавления текста/картинки/видео/аудио
        CanvasStage.vue             #   <v-stage>/<v-layer>/<v-transformer>, рендер нод по типу, drag/transform-end → patch, snap-guides
        ElementPropertiesPanel.vue   #   контекстные поля по типу элемента (x/y/w/h/rotation, текст/цвет/размер, replace-file, autoplay/loop/muted)
        nodes/                         # KonvaTextNode, KonvaImageNode (useImage из vue-konva), KonvaShapeNode (`v-rect` для 'rectangle' / `v-ellipse` для 'circle' внутри `v-group` с явными x/y/width/height — тот же паттерн-контракт, что у KonvaMediaPlaceholderNode, чтобы `readTransformEnd` из `konvaTransform.ts` корректно читал box после Transformer), KonvaMediaPlaceholderNode (общий для video/audio — рамка+иконка, живое видео в Konva не рендерим)
    play/
      setup/                    # PlayerForm, PlayerRow (имя/цвет/аватар/move/remove)
      board/                     # BoardGrid (колонки-категории), BoardCell (кнопка стоимости/answered — намеренно НЕ показывает, что вопрос «Кот в мешке»: `catInTheBag` не палится игрокам на доске, иначе теряется смысл механики), CatInBagSpinner (оверлей-колесо выбора случайного игрока для механики «Кот в мешке», см. игровой флоу; переиспользует `results/PlayerAvatar.vue`)
      question/                   # QuestionView (принимает `side: 'content' | 'answer'`, рендерит один экран за раз через CanvasElementView по orderedByZIndex, масштабируется на всё доступное место через useFitScale), CanvasElementView (один CanvasElement → абсолютно позиционированный div/img/video/audio), ScoreJudgeControls
      sidebar/                     # PlayerSidebar (заголовок+счётчик игроков, список PlayerBadge отсортирован по исходному порядку хода — не по очкам, чтобы не путать round-robin; ранг для медалей считается отдельно по очкам через computed Map; подтверждаемое удаление игрока во время партии с очисткой его истории; музыка/undo-redo/журнал переведены на UiButton), PlayerBadge (аватар из useAssetUrl с fallback-инициалом на цвете игрока, ранг/медаль 🥇🥈🥉, кнопка удаления, явный активный статус — пульсирующая точка на аватаре + текст «🎯 Выбирает вопрос» вместо просто рамки-подсветки, 🔥 серия показывается только когда бейдж неактивен, чтобы не спорить местом с turn-label)
    results/
      PlayerAvatar.vue          # переиспользуемый круглый аватар игрока (img из useAssetUrl либо буква-заглушка на цвете игрока), :size в px — общий для WinnerSpotlight и ResultsTable
      WinnerSpotlight.vue        # большая карточка победителя: корона, вращающееся кольцо-градиент под цвет игрока, CSS-конфетti (без библиотек, чистые div+keyframes), заглавные очки
      ResultsTable.vue            # список остальных участников (без победителя — тот в WinnerSpotlight) по убыванию очков, с аватарами и медалями, построчная анимация появления
      StatsGrid.vue                 # сетка статистических плиток (иконка+значение+подпись) из StatTile[]
      FunFactsList.vue               # список «забавных фактов» (иконка+текст) из FunFact[], стаггер-анимация появления

  components/menu/
    MenuCard.vue           # карточка пункта меню (иконка+заголовок+описание), рендерится как RouterLink (есть `to`) либо как button (есть `@click`) — используется на главной

  views/                 # тонкие роут-компоненты, вся логика — делегирована в stores/composables
    MainMenuPage.vue        # / — хаб с карточками: Библиотека игр, Новая игра (быстрое создание), Импорт .sog (быстрый импорт), Настройки и темы, О программе
    SettingsPage.vue          # /settings — ThemeGallery + ThemeEditor
    AboutPage.vue               # /about — краткая справка по флоу и возможностям, версия
    LibraryPage.vue            # /library — список игр, у каждой карточки: Играть (сразу в /play/:id/setup) / Редактировать / Экспорт / Удалить
    GameEditorPage.vue          # /editor/:gameId
    QuestionEditorPage.vue       # /editor/:gameId/question/:questionId
    PlaySetupPage.vue             # /play/:gameId/setup
    PlayBoardPage.vue              # /play/:gameId/board
    PlayQuestionPage.vue            # /play/:gameId/question/:questionId
    ResultsPage.vue                  # /play/:gameId/results — WinnerSpotlight + ResultsTable + StatsGrid + FunFactsList (см. resultsAnalytics.ts), останавливает backgroundMusic и запускает meta.resultsMusicAssetId через resultsMusic-стор в onMounted
```

## Формат `.sog`

Zip-архив:
```
game.sog
├── game.json          # SogManifest = { formatVersion, game: Game, assets: AssetIndexEntry[] }
└── assets/<assetId>.<ext>
```
Ассеты никогда не инлайнятся base64 в JSON — только по id, файлы лежат рядом в архиве. `formatVersion` сейчас `2` — при breaking-изменении структуры `Game`/`SogManifest` обязательно бампать `SOG_FORMAT_VERSION` в `src/types/sog.ts` и продумать миграцию/обратную совместимость в `sogImport.ts`.

**v1 → v2**: в v1 `CanvasElement` не имел позиции (x/y/w/h/rotation/zIndex были optional и не использовались) и было ограничение «один текст + одна картинка» на сторону вопроса. v2 — позиционированные элементы (обязательные `ElementTransform`), произвольное количество элементов, плюс типы `video`/`audio`. Миграция v1→v2 — `migrateGameToV2`/`ensureV2Elements` в `src/services/legacyMigration.ts` (duck-typing по наличию поля `x`), вызывается и из `sogImport.ts` (при `formatVersion === 1`), и из `gameEditor.loadGame()` (для игр, уже лежащих в IndexedDB без версии вообще).

## Игровой флоу (как это работает)

1. `MainMenuPage` (хаб) или `LibraryPage` → создать/импортировать игру → `GameEditorPage` (`gameId`)
2. В редакторе: категории → вопросы (canvas-редактор content/answer), автосейв в IndexedDB
3. «Начать игру» из `GameEditorPage`, либо кнопка «▶ Играть» прямо на карточке в `LibraryPage` (минуя редактор) → `PlaySetupPage` → добавление игроков → `sessionStore.start(gameId, firstPlayerId)` + `historyStore.reset()` → `PlayBoardPage`
4. Клик по вопросу на доске → если у вопроса `settings.catInTheBag` (флаг «Кот в мешке» из редактора), сначала показывается `CatInBagSpinner` (оверлей поверх доски, крутящееся колесо аватарок игроков, ~3.4с) — по завершении выбранный случайный игрок становится активным через `sessionStore.setActivePlayer(playerId)` (переопределяет того, кто реально выбрал вопрос), и только потом открывается вопрос; иначе сразу → `sessionStore.openQuestion(id)` → `PlayQuestionPage`, экран вопроса (`QuestionView :side="'content'"`, контент масштабируется на всё свободное место — см. `useFitScale`) → «Открыть ответ» переключает на отдельный экран ответа (`:side="'answer'"`) с кнопкой «← Вернуться к вопросу» (можно листать туда-обратно, `revealed` не сбрасывается) и `ScoreJudgeControls` (виден только на экране ответа)
5. Ведущий жмёт «Верно»/«Неверно»/ручная правка/«Никто не ответил» → `historyStore.record(...)` (мутирует счёт/streak игрока) → `sessionStore.resolveQuestion(questionId, winnerId, playerOrder)`:
   - winnerId задан → он становится активным игроком
   - иначе → ход переходит следующему по списку игроков (round-robin)
6. Возврат на доску, вопрос помечен отвеченным
7. Ведущий вручную жмёт «Завершить игру» (НЕ авто-триггер) → `ResultsPage`: фоновая музыка останавливается, вместо неё (если задана в редакторе игры) включается `meta.resultsMusicAssetId`, экран показывает победителя (WinnerSpotlight), остальных игроков (ResultsTable), статистику и автосгенерированные забавные факты по истории партии (`resultsAnalytics.ts`)

Undo/redo и журнал изменений — в `PlayerSidebar`, доступны на протяжении всей партии (доска + экран вопроса).
Там же игрока можно удалить с подтверждением: его записи убираются из history/redo, а если он был активным, ход переходит к следующему игроку по исходному порядку. Единственного оставшегося игрока удалить нельзя.

## Что НЕ реализовано (сознательно вне MVP, см. план)

- Группировка/множественное выделение элементов в canvas-редакторе — сейчас только одиночное выделение (`Transformer` на один элемент за раз); группировка возможна позже без слома формата данных
- Живое воспроизведение видео прямо на Konva-холсте редактора — в редакторе video/audio показаны статичной рамкой-плейсхолдером (`KonvaMediaPlaceholderNode`), реальное воспроизведение — только в play-режиме (`QuestionView`/`CanvasElementView`)
- GIF отдельным типом элемента не заведён — обрабатывается как обычный `image` (браузер сам анимирует)
- Спецмеханики: «Аукцион», «Финал» со скрытыми ставками («Кот в мешке» реализован — см. игровой флоу, `catInTheBag` в `QuestionSettings`)
- Визуальные эффекты: конфетти, огненная серия помимо текущего 🔥-бейджа, библиотека звуков
- Полноценный экран настроек (язык, масштаб UI, hotkeys, второй монитор и т.д.) — `SettingsPage` пока только про темы; `useSettingsStore` — только два поля автосохранения
- Второй монитор / вывод на ТВ (архитектурно не блокируется: `useSessionStore` можно позже зеркалить через `BroadcastChannel`, но сейчас этого нет)
- Кастомизация горячих клавиш
- i18n (весь текст на русском, хардкод прямо в компонентах — НЕ вынесен в отдельный файл лейблов, хотя план это предлагал; если будет много компонентов с текстом — стоит вынести)
- Каскадное удаление ассетов при удалении игры из библиотеки (`deleteGame` в `gameLibrary.ts` не чистит связанные blob’ы в assets-сторе IndexedDB — известный маленький технический долг, не критично для MVP)
- Точное восстановление streak при undo/redo — best-effort, не идеально консистентно при сложных последовательностях

## Известные ограничения / на что обращать внимание при доработке

- **У каждого `views/*Page.vue` должен быть ровно один корневой узел в `<template>`.** `App.vue` оборачивает `<RouterView>` в `<Transition name="page" mode="out-in">`, а `Transition`/`BaseTransition` не умеет анимировать компонент с несколькими корневыми нодами (Vue тихо кидает `[Vue warn]: Component inside <Transition> renders non-element root node...` в консоль, БЕЗ падения приложения) — на деле это приводило к тому, что после навигации на `/play/*`-страницы (и на `GameEditorPage`) реальный контент вообще не рендерился (пустой `<!--v-if-->` в DOM), и помогала только ручная перезагрузка страницы. Причина — паттерн `<WallpaperBackground /><main>...</main>` (два соседних корня) и/или цепочка `v-if/v-else-if/v-else` из нескольких элементов на верхнем уровне шаблона (тоже даёт Fragment из нескольких корней). Исправлено оборачиванием всего содержимого `<template>` в один `<div>` в `PlaySetupPage`, `PlayBoardPage`, `PlayQuestionPage`, `ResultsPage`, `GameEditorPage`. При добавлении нового `views/*Page.vue` — всегда делать один корневой элемент, не полагаться на то, что Vue 3 разрешает multi-root fragments в принципе (это верно только вне `<Transition>`).
- Побочный эффект того же расследования: `usePlayersStore` терял список игроков при повторном заходе на `/play/:gameId/setup` до нажатия «Начать игру» (например, после ухода по хлебной крошке назад), т.к. сброс был завязан на `sessionStore.gameId`, который выставляется только в момент старта партии. Исправлено через `playersStore.setupGameId` + `ensureForGame(gameId)` — см. запись про `players.ts` в структуре проекта.

- `crypto.randomUUID()` требует evergreen-браузер (ok для Chrome/Edge/Firefox/Safari с ~2022), полифилл сознательно не добавлен
- Лимит на аплоад ассета — мягкое предупреждение при >15MB (`useAssetUpload.ts`), не жёсткий блок, нет учёта общей квоты IndexedDB
- В `PlayQuestionPage`/`PlayBoardPage` нет `router beforeEnter`-гвардов — вместо этого локальный `loading`-ref + `EmptyState` при отсутствии игры/вопроса (проще, чем гварды, для MVP хватает)
- Тесты отсутствуют — только `npm run build` (vue-tsc + vite build) как проверка типов на каждом шаге. Браузерное E2E-тестирование через Playwright/chromium-cli пользователь просил не делать в текущей сессии (не проводить самостоятельно, если явно не попросит)
- Canvas вопроса имеет фиксированный размер 640×400 (`CanvasEditor`/`QuestionView` берут это как дефолт) — координаты x/y/w/h элементов привязаны к этому размеру, при желании сделать холст резиновым потребуется пересчёт координат
- Вращение элементов: Konva применяет `Translate(x,y) → Rotate(rotation)` без `offset` — т.е. локальная точка `(0,0)` (верхний левый угол до поворота) всегда остаётся в мировых координатах `(x,y)`, поворот идёт вокруг НЕЁ, а не вокруг центра бокса. Поэтому в play-режиме (`CanvasElementView.vue`) CSS обязан использовать `transform-origin: 0 0` (не `center`!) вместе с `transform: translate(x,y) rotate(rotation)`, чтобы буквально повторить ту же матрицу — раньше там стоял `transform-origin: center`, что при ненулевом повороте давало другую точку вращения и визуально «съезжающие»/перекрывающиеся элементы между редактором и игрой (пофикшено). При добавлении новых типов узлов в Konva-редактор не забывать использовать общий `useKonvaTransformEnd`-паттерн (`src/services/konvaTransform.ts`) для нормализации `scaleX/scaleY` после Transformer, а в play-рендерере — не менять `transform-origin` с `0 0`
- Шрифт текстового элемента: Konva `v-text` без явного `fontFamily` рисует `Arial` (дефолт самого Konva), а НЕ шрифт приложения (`--font-sans` = `system-ui, Segoe UI, Roboto` из `tokens.css`). Поэтому `KonvaTextNode.vue` явно ставит `fontFamily: 'Arial'`, `CanvasElementView.vue` (play-режим) явно ставит `fontFamily: 'Arial, sans-serif'` на `<span>` (иначе унаследовал бы `--font-sans` из `base.css`), и `textMeasure.ts` меряет тем же `Arial` — все три обязаны совпадать, иначе перенос строк и итоговая высота текстового блока (см. `computeTextBlockHeight`) в редакторе и в игре разъезжаются.
  То же самое с межстрочным интервалом: у Konva `Text` дефолтный `lineHeight` — **1** (без доп. интерлиньяжа) и без `padding`, а у обычного HTML/CSS текста line-height по умолчанию `normal` (обычно заметно больше 1, зависит от шрифта) — на многострочном тексте эта разница накапливается по строкам, и текст в play-режиме визуально «крупнее»/не помещается в тот же блок, что в редакторе. Поэтому `KonvaTextNode.vue` и `CanvasElementView.vue` оба явно ставят `lineHeight: 1`, а `textMeasure.ts` считает высоту с тем же множителем (`LINE_HEIGHT_RATIO = 1`, `VERTICAL_PADDING` — минимальный технический буфер, не компенсация паддинга Konva, которого нет)

## Команды

- `npm run dev` — дев-сервер (Vite, порт по умолчанию 5173)
- `npm run build` — тайпчек (`vue-tsc -b`) + продакшн-сборка (`vite build`). Гонять после каждого значимого изменения.
- `npm run preview` — предпросмотр собранного билда

## Как продолжать работу

1. Перед новой фичей — свериться с этим файлом и с разделом «Что НЕ реализовано» выше.
2. Новый стор/сервис/компонент — сразу добавить строку в соответствующий раздел структуры выше.
3. Новое архитектурное решение, меняющее что-то из раздела "Ключевые архитектурные решения" — обновить и этот раздел, и явно спросить пользователя, если решение спорное.
4. После каждого значимого блока изменений — `npm run build`, чтобы поймать тайпчек-ошибки сразу.
5. Если меняется формат `.sog` (структура `Game`/`SogManifest`) — бампнуть `SOG_FORMAT_VERSION` и обновить раздел "Формат .sog".
