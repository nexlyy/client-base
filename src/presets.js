// Пресеты «Клиентской базы»: справочники, тексты для заказчиков и стили демо-сайтов.
// Интерфейс на русском. Всё, что видит заказчик (КП, демо, фразы), на его языке: pl, ua, ru, en.
// В текстах от первого лица нет глаголов прошедшего времени: пол автора не угадываем.

const P = {};

P.STATUS = [
  {k: 'new', t: 'Новый'},
  {k: 'contact', t: 'Познакомились'},
  {k: 'talk', t: 'Обсуждаем'},
  {k: 'offer', t: 'КП передано'},
  {k: 'won', t: 'Клиент'},
  {k: 'lost', t: 'Отказ'}
];
P.RANK = {new: 0, contact: 1, talk: 2, offer: 3, won: 4, lost: -1};

P.SEG = {
  horeca: 'Рестораны и кафе',
  beauty: 'Салоны и барберы',
  services: 'Сервис и услуги',
  build: 'Ремонт и стройка',
  tgshop: 'Магазины в Telegram',
  b2b: 'B2B и производство',
  discord: 'Discord-сообщества',
  other: 'Другое'
};
P.SEG_CASE = {horeca: 'daon', beauty: 'daon', services: 'mipaco', build: 'mipaco', tgshop: 'katovape', b2b: 'mcr', discord: 'musicbot', other: 'daon'};
P.SEG_PK = {
  horeca: ['menu', 'booking', 'pickup'], beauty: ['card', 'appoint'], services: ['leads', 'appoint'], build: ['leads'],
  tgshop: ['tgshop'], b2b: ['export'], discord: ['discord'], other: ['card', 'tgbot']
};

P.PRI = {1: 'Горячий', 2: 'Тёплый', 3: 'Холодный'};
P.LANGS = {pl: 'PL', ua: 'UA', ru: 'RU', en: 'EN'};
P.LANG_NAME = {pl: 'польский', ua: 'украинский', ru: 'русский', en: 'английский'};

// Теги: вес в скоринге и строка «что не так» для КП. budget и chain видишь только ты.
P.TAGS = {
  nosite: {t: 'Нет сайта', w: 30, hint: 'поле «Witryna» пустое', d: {
    pl: 'Wizytówka w Google nie prowadzi do własnej strony, więc klient nie znajdzie w jednym miejscu oferty, cen, godzin i dojazdu.',
    en: 'The Google listing doesn’t link to a website of your own, so customers can’t find the offer, prices, hours and directions in one place.',
    ua: 'Профіль у Google не веде на власний сайт, тож клієнт не знайде в одному місці пропозицію, ціни, години роботи й дорогу.',
    ru: 'Профиль в Google не ведёт на собственный сайт, поэтому клиент не найдёт в одном месте предложение, цены, часы работы и дорогу.'}},
  insta: {t: 'Только Instagram', w: 25, hint: '«Witryna» ведёт в Instagram', d: {
    pl: 'Link „Witryna” w Google prowadzi na Instagram: oferta i ceny giną w postach, a klient musi przewijać profil, żeby je znaleźć.',
    en: 'The “Website” link on Google goes to Instagram: the offer and prices get lost among posts, and customers have to scroll to find them.',
    ua: 'Посилання «Witryna» у Google веде в Instagram: пропозиція й ціни губляться в постах, і клієнту доводиться гортати стрічку, щоб їх знайти.',
    ru: 'Ссылка «Witryna» в Google ведёт в Instagram: предложение и цены теряются в постах, и клиенту приходится листать ленту, чтобы их найти.'}},
  fb: {t: 'Только Facebook', w: 25, hint: '«Witryna» ведёт в Facebook', d: {
    pl: 'Link „Witryna” w Google prowadzi na Facebooka: oferta i ceny giną w postach, a klient musi przewijać stronę, żeby je znaleźć.',
    en: 'The “Website” link on Google goes to Facebook: the offer and prices get lost among posts, and customers have to scroll to find them.',
    ua: 'Посилання «Witryna» у Google веде у Facebook: пропозиція й ціни губляться в постах, і клієнту доводиться гортати стрічку, щоб їх знайти.',
    ru: 'Ссылка «Witryna» в Google ведёт в Facebook: предложение и цены теряются в постах, и клиенту приходится листать ленту, чтобы их найти.'}},
  aggregator: {t: 'Агрегатор вместо сайта', w: 25, hint: 'Pyszne, Glovo, Uber Eats, Wolt', d: {
    pl: 'Link w Google prowadzi do aplikacji z dostawą: gość zamawia przez pośrednika, który pobiera prowizję od każdego zamówienia, a kontakt z gościem zostaje u pośrednika.',
    en: 'The Google link leads to a delivery app: guests order through a middleman that takes a commission on every order and keeps the customer relationship.',
    ua: 'Посилання в Google веде в застосунок доставки: гість замовляє через посередника, який бере комісію з кожного замовлення, і контакт із гостем лишається в нього.',
    ru: 'Ссылка в Google ведёт в приложение доставки: гость заказывает через посредника, который берёт комиссию с каждого заказа, и контакт с гостем остаётся у него.'}},
  deaddomain: {t: 'Сайт не открывается', w: 25, hint: 'ссылка из Google ведёт на ошибку', d: {
    pl: 'Adres strony podany w Google nie działa: klient trafia na błąd zamiast na ofertę.',
    en: 'The website address on Google doesn’t work: customers land on an error instead of your offer.',
    ua: 'Адреса сайту в Google не працює: клієнт бачить помилку замість пропозиції.',
    ru: 'Адрес сайта в Google не работает: клиент видит ошибку вместо предложения.'}},
  rented: {t: 'Арендный конструктор', w: 15, hint: 'ChoiceQR, UpMenu, papu.io и т. п.', d: {
    pl: 'Strona działa na wynajętej platformie: abonament płaci się co miesiąc, a wygląd i funkcje zależą od dostawcy.',
    en: 'The site runs on a rented platform: you pay a monthly subscription, and the look and features depend on the provider.',
    ua: 'Сайт працює на орендованій платформі: підписку платите щомісяця, а вигляд і функції залежать від постачальника.',
    ru: 'Сайт работает на арендованной платформе: подписку платите каждый месяц, а вид и функции зависят от поставщика.'}},
  oldsite: {t: 'Устаревший сайт', w: 15, hint: 'неудобно с телефона', d: {
    pl: 'Obecna strona jest przestarzała: na telefonie trudno szybko znaleźć najważniejsze informacje.',
    en: 'The current site is outdated: on a phone it’s hard to find the key information quickly.',
    ua: 'Нинішній сайт застарів: на телефоні важко швидко знайти головне.',
    ru: 'Нынешний сайт устарел: с телефона трудно быстро найти главное.'}},
  nobooking: {t: 'Нет онлайн-брони', w: 10, hint: 'нет кнопки «Zarezerwuj»', d: {
    pl: 'Nie ma rezerwacji online: zarezerwować można tylko telefonicznie albo na miejscu.',
    en: 'There is no online booking: people can only book by phone or in person.',
    ua: 'Немає онлайн-бронювання: забронювати можна лише телефоном або на місці.',
    ru: 'Нет онлайн-брони: забронировать можно только по телефону или на месте.'}},
  noorder: {t: 'Нет своего заказа', w: 10, hint: 'нет кнопки «Zamów»', d: {
    pl: 'Nie ma własnego zamówienia online: na wynos zamawia się telefonicznie albo przez pośrednika.',
    en: 'There is no ordering of your own: takeaway goes through the phone or a middleman.',
    ua: 'Немає власного онлайн-замовлення: на виніс замовляють телефоном або через посередника.',
    ru: 'Нет своего онлайн-заказа: навынос заказывают по телефону или через посредника.'}},
  nolang: {t: 'Один язык', w: 5, hint: 'в отзывах гости из-за границы', d: {
    pl: 'Informacje są tylko w jednym języku, więc goście z zagranicy muszą zgadywać.',
    en: 'Information is available in one language only, so visitors from abroad have to guess.',
    ua: 'Інформація лише однією мовою, тож гостям з-за кордону доводиться вгадувати.',
    ru: 'Информация только на одном языке, и гостям из-за границы приходится угадывать.'}},
  budget: {t: 'Есть бюджет', w: 10, hint: 'свежий ремонт, полный зал, несколько точек', d: null},
  chain: {t: 'Сеть', w: -30, hint: 'решает центральный офис', d: null}
};
P.TAG_ORDER = ['nosite', 'insta', 'fb', 'aggregator', 'deaddomain', 'rented', 'oldsite', 'nobooking', 'noorder', 'nolang', 'budget', 'chain'];
P.AGG = [[/pyszne/, 'Pyszne.pl'], [/glovo/, 'Glovo'], [/ubereats|uber\.com/, 'Uber Eats'], [/wolt\./, 'Wolt']];

P.CASES = {
  daon: {name: 'DAON', url: 'https://daon.pl', d: {
    pl: 'Koreańska restauracja w Katowicach: menu PL/EN/KO, rezerwacja stolika na planie sali z powiadomieniem dla obsługi w Telegramie, panel do zmiany menu i godzin.',
    en: 'Korean restaurant in Katowice: menu in PL/EN/KO, table booking on a floor plan with Telegram alerts for staff, an admin panel for the menu and hours.',
    ua: 'Корейський ресторан у Катовіце: меню PL/EN/KO, бронювання столика на схемі залу зі сповіщенням персоналу в Telegram, адмінка для меню й годин.',
    ru: 'Корейский ресторан в Катовице: меню PL/EN/KO, бронь стола на схеме зала с уведомлением персоналу в Telegram, админка для меню и часов.'}},
  mipaco: {name: 'Mipaco Development', url: 'https://nexlyy.github.io/mipaco-development/', d: {
    pl: 'Strona firmy budowlanej w trzech językach (PL/UA/EN) z cennikiem i kalkulatorem kosztów.',
    en: 'Construction company website in three languages (PL/UA/EN) with prices and a cost calculator.',
    ua: 'Сайт будівельної компанії трьома мовами (PL/UA/EN) з цінами й калькулятором вартості.',
    ru: 'Сайт строительной компании на трёх языках (PL/UA/EN) с ценами и калькулятором стоимости.'}},
  katovape: {name: 'KatoVape', url: 'https://github.com/nexlyy/KatoVape', d: {
    pl: 'Sklep jako Mini App w Telegramie i strona: katalog ze stanami w miastach, koszyk otwiera czat z menedżerem z gotowym zamówieniem, rezerwacja towaru.',
    en: 'A shop as a Telegram Mini App plus a website: catalogue with stock per city, a cart that opens the manager’s chat with the order filled in, product reservations.',
    ua: 'Магазин як міні-апп у Telegram і сайт: каталог із залишками по містах, кошик відкриває чат менеджера з готовим замовленням, бронювання товару.',
    ru: 'Магазин как мини-апп в Telegram и сайт: каталог с остатками по городам, корзина открывает чат менеджера с готовым заказом, бронь товара.'}},
  mcr: {name: 'MCR Planet', url: 'https://mcrplanet.com', d: {
    pl: 'Katalog B2B w trzech językach ze stronami produktów pod Google; bot Telegram pilnuje działania strony i wdraża aktualizacje.',
    en: 'A B2B catalogue in three languages with product pages built for Google; a Telegram bot monitors the site and ships updates.',
    ua: 'B2B-каталог трьома мовами зі сторінками товарів для Google; Telegram-бот стежить за сайтом і викладає оновлення.',
    ru: 'B2B-каталог на трёх языках со страницами товаров для Google; Telegram-бот следит за сайтом и выкладывает обновления.'}},
  hourtrack: {name: 'HourTrack', url: '', d: {
    pl: 'Bot Telegram do ewidencji zmian i rozliczania godzin pracy.',
    en: 'A Telegram bot for logging shifts and hourly pay.',
    ua: 'Telegram-бот для обліку змін і погодинної оплати.',
    ru: 'Telegram-бот для учёта смен и почасовой оплаты.'}},
  musicbot: {name: 'Discord music bot', url: 'https://github.com/nexlyy/discord-music-bot', d: {
    pl: 'Muzyczny bot Discord na Lavalink z własnym odtwarzaczem.',
    en: 'A Discord music bot on Lavalink with its own player.',
    ua: 'Музичний Discord-бот на Lavalink із власним плеєром.',
    ru: 'Музыкальный Discord-бот на Lavalink со своим плеером.'}}
};

// Пакеты: цены «от–до» в злотых, правятся в настройках. unit: once | month.
P.PACKAGES = [
  {id: 'card', from: 800, to: 2500, unit: 'once', days: '5–7', cases: [],
    n: {ru: 'Сайт-визитка', pl: 'Strona wizytówka', en: 'Business card website', ua: 'Сайт-візитка'},
    d: {ru: 'Одна страница: чем вы занимаетесь, цены, часы, карта и контакты. Удобно с телефона и видно в Google.',
      pl: 'Jedna strona: czym się Państwo zajmują, ceny, godziny, mapa i kontakt. Wygodna na telefonie i widoczna w Google.',
      en: 'One page with what you do, prices, hours, a map and contacts. Phone-friendly and visible on Google.',
      ua: 'Одна сторінка: чим ви займаєтеся, ціни, години, мапа й контакти. Зручно з телефона і видно в Google.'}},
  {id: 'menu', from: 2500, to: 6000, unit: 'once', days: '10–14', cases: ['daon'],
    n: {ru: 'Сайт с меню', pl: 'Strona z menu', en: 'Website with a menu', ua: 'Сайт із меню'},
    d: {ru: 'Сайт на 2–3 языках: меню с фото, часы, карта. Меню, цены и фото владелец меняет сам в админке.',
      pl: 'Strona w 2–3 językach: menu ze zdjęciami, godziny i mapa. Menu, ceny i zdjęcia zmieniają Państwo sami w panelu.',
      en: 'A site in 2–3 languages: menu with photos, hours and a map. You change the menu, prices and photos yourself in the admin panel.',
      ua: 'Сайт 2–3 мовами: меню з фото, години, мапа. Меню, ціни й фото власник змінює сам в адмінці.'}},
  {id: 'booking', from: 3000, to: 8000, unit: 'once', days: '14–21', cases: ['daon'],
    n: {ru: 'Онлайн-бронь столов', pl: 'Rezerwacja stolików online', en: 'Online table booking', ua: 'Онлайн-бронювання столиків'},
    d: {ru: 'Гость выбирает стол на схеме зала, бронь сразу приходит персоналу в Telegram, перенести или отменить её можно по ссылке.',
      pl: 'Gość wybiera stolik na planie sali, rezerwacja od razu trafia do obsługi w Telegramie, a przesunąć lub odwołać ją można przez link.',
      en: 'Guests pick a table on the floor plan, the booking goes straight to staff in Telegram, and guests can move or cancel it via a link.',
      ua: 'Гість обирає столик на схемі залу, бронювання одразу приходить персоналу в Telegram, а перенести чи скасувати його можна за посиланням.'}},
  {id: 'pickup', from: 3000, to: 7000, unit: 'once', days: '14–21', cases: [],
    n: {ru: 'Заказ на самовывоз', pl: 'Zamówienia na wynos', en: 'Takeaway ordering', ua: 'Замовлення на виніс'},
    d: {ru: 'Меню с корзиной: гость собирает заказ и выбирает время, заказ приходит персоналу в Telegram. Оплата при получении, без комиссии с заказов.',
      pl: 'Menu z koszykiem: gość składa zamówienie i wybiera godzinę odbioru, a zamówienie trafia do obsługi w Telegramie. Płatność przy odbiorze, bez prowizji od zamówień.',
      en: 'A menu with a cart: guests build an order and pick a time, and the order goes to staff in Telegram. Pay on pickup, no commission on orders.',
      ua: 'Меню з кошиком: гість збирає замовлення й обирає час, замовлення приходить персоналу в Telegram. Оплата під час отримання, без комісії із замовлень.'}},
  {id: 'appoint', from: 2500, to: 6000, unit: 'once', days: '10–14', cases: [],
    n: {ru: 'Онлайн-запись', pl: 'Zapisy online', en: 'Online appointments', ua: 'Онлайн-запис'},
    d: {ru: 'Клиент выбирает услугу и удобное время, заявка сразу приходит в Telegram. Для салонов, барберов, мастерских и кабинетов.',
      pl: 'Klient wybiera usługę i dogodny termin, a zgłoszenie od razu trafia do Telegrama. Dla salonów, barberów, warsztatów i gabinetów.',
      en: 'Customers choose a service and a convenient time, and the request goes straight to Telegram. For salons, barbers, workshops and clinics.',
      ua: 'Клієнт обирає послугу й зручний час, заявка одразу приходить у Telegram. Для салонів, барберів, майстерень і кабінетів.'}},
  {id: 'leads', from: 2500, to: 6000, unit: 'once', days: '10–14', cases: ['mipaco'],
    n: {ru: 'Сайт с заявками', pl: 'Strona z formularzem zapytań', en: 'Website with an enquiry form', ua: 'Сайт із заявками'},
    d: {ru: 'Сайт для ремонта и услуг: цены, калькулятор, форма заявки. Заявки сразу приходят в Telegram.',
      pl: 'Strona dla firm remontowych i usługowych: cennik, kalkulator i formularz. Zapytania od razu trafiają do Telegrama.',
      en: 'A site for renovation and service companies: prices, a calculator and a form. Enquiries go straight to Telegram.',
      ua: 'Сайт для ремонту й послуг: ціни, калькулятор, форма заявки. Заявки одразу приходять у Telegram.'}},
  {id: 'tgshop', from: 3000, to: 8000, unit: 'once', days: '14–21', cases: ['katovape'],
    n: {ru: 'Витрина в Telegram', pl: 'Sklep w Telegramie', en: 'Telegram shop (Mini App)', ua: 'Вітрина в Telegram'},
    d: {ru: 'Мини-апп с каталогом и остатками по городам; корзина открывает чат менеджера с готовым заказом; бронь товара.',
      pl: 'Mini App z katalogiem i stanami w poszczególnych miastach; koszyk otwiera czat z menedżerem z gotowym zamówieniem; rezerwacja towaru.',
      en: 'A Mini App with a catalogue and stock per city; the cart opens a chat with the manager with the order filled in; product reservations.',
      ua: 'Міні-апп із каталогом і залишками по містах; кошик відкриває чат менеджера з готовим замовленням; бронювання товару.'}},
  {id: 'export', from: 5000, to: 15000, unit: 'once', days: '21–30', cases: ['mcr'],
    n: {ru: 'Каталог для экспорта', pl: 'Katalog eksportowy', en: 'Export catalogue', ua: 'Каталог для експорту'},
    d: {ru: 'Каталог на трёх языках со страницами товаров, которые находит Google, и Telegram-бот, который следит за сайтом.',
      pl: 'Katalog w trzech językach ze stronami produktów widocznymi w Google oraz bot Telegram, który pilnuje działania strony.',
      en: 'A catalogue in three languages with product pages that Google can find, plus a Telegram bot that keeps an eye on the site.',
      ua: 'Каталог трьома мовами зі сторінками товарів, які знаходить Google, і Telegram-бот, що стежить за сайтом.'}},
  {id: 'tgbot', from: 1000, to: 3000, unit: 'once', days: '7–14', cases: ['hourtrack'], note: 'сложный бот до 10 000 zł',
    n: {ru: 'Telegram-бот', pl: 'Bot Telegram', en: 'Telegram bot', ua: 'Telegram-бот'},
    d: {ru: 'Бот под задачу: учёт смен и часов, запись, уведомления команде, ответы на частые вопросы.',
      pl: 'Bot do konkretnego zadania: grafik i godziny pracy, zapisy, powiadomienia dla zespołu, odpowiedzi na częste pytania.',
      en: 'A bot for a specific job: shifts and hours, bookings, team notifications, answers to common questions.',
      ua: 'Бот під задачу: облік змін і годин, запис, сповіщення команді, відповіді на часті запитання.'}},
  {id: 'discord', from: 400, to: 3000, unit: 'once', days: '7–14', cases: ['musicbot'], note: 'на площадках обычно $100–800',
    n: {ru: 'Discord-бот', pl: 'Bot Discord', en: 'Discord bot', ua: 'Discord-бот'},
    d: {ru: 'Музыка со своим плеером, модерация, роли, тикеты, интеграции.',
      pl: 'Muzyka z własnym odtwarzaczem, moderacja, role, tickety, integracje.',
      en: 'Music with its own player, moderation, roles, tickets, integrations.',
      ua: 'Музика з власним плеєром, модерація, ролі, тікети, інтеграції.'}},
  {id: 'support', from: 100, to: 300, unit: 'month', days: '', cases: [],
    n: {ru: 'Поддержка', pl: 'Opieka techniczna', en: 'Maintenance', ua: 'Підтримка'},
    d: {ru: 'Слежу, чтобы сайт работал и обновлялся; мелкие правки, фото, цены и часы меняю по запросу.',
      pl: 'Dbam o działanie i aktualizacje strony; drobne poprawki, zdjęcia, ceny i godziny zmieniam na prośbę.',
      en: 'I keep the site running and updated, and change photos, prices and hours on request.',
      ua: 'Стежу, щоб сайт працював і оновлювався; дрібні правки, фото, ціни й години змінюю на запит.'}}
];

P.CITIES = [
  {id: 'katowice', n: 'Katowice', loc: 'w Katowicach'},
  {id: 'gliwice', n: 'Gliwice', loc: 'w Gliwicach'},
  {id: 'sosnowiec', n: 'Sosnowiec', loc: 'w Sosnowcu'},
  {id: 'chorzow', n: 'Chorzów', loc: 'w Chorzowie'},
  {id: 'bytom', n: 'Bytom', loc: 'w Bytomiu'},
  {id: 'tychy', n: 'Tychy', loc: 'w Tychach'},
  {id: 'zabrze', n: 'Zabrze', loc: 'w Zabrzu'},
  {id: 'ruda', n: 'Ruda Śląska', loc: 'w Rudzie Śląskiej'},
  {id: 'dabrowa', n: 'Dąbrowa Górnicza', loc: 'w Dąbrowie Górniczej'},
  {id: 'myslowice', n: 'Mysłowice', loc: 'w Mysłowicach'},
  {id: 'siemianowice', n: 'Siemianowice Śląskie', loc: 'w Siemianowicach Śląskich'}
];

// Категории для поиска в Google Maps: запрос, сегмент лида, стиль демо.
P.CATS = [
  {id: 'azja', q: 'restauracja azjatycka', t: 'Азиатская кухня', seg: 'horeca', style: 'asian'},
  {id: 'sushi', q: 'sushi', t: 'Суши и рамен', seg: 'horeca', style: 'japanese'},
  {id: 'pizza', q: 'pizzeria', t: 'Пиццерии', seg: 'horeca', style: 'italian'},
  {id: 'kebab', q: 'kebab', t: 'Кебаб и стритфуд', seg: 'horeca', style: 'street'},
  {id: 'kawiarnia', q: 'kawiarnia', t: 'Кофейни', seg: 'horeca', style: 'cafe'},
  {id: 'bistro', q: 'bistro', t: 'Бистро', seg: 'horeca', style: 'cafe'},
  {id: 'ukr', q: 'restauracja ukraińska', t: 'Украинская кухня', seg: 'horeca', style: 'ukrainian'},
  {id: 'gruz', q: 'restauracja gruzińska', t: 'Грузинская кухня', seg: 'horeca', style: 'georgian'},
  {id: 'fryzjer', q: 'salon fryzjerski', t: 'Парикмахерские', seg: 'beauty', style: 'beauty'},
  {id: 'barber', q: 'barber', t: 'Барберы', seg: 'beauty', style: 'barber'},
  {id: 'kosmetyka', q: 'salon kosmetyczny', t: 'Косметология', seg: 'beauty', style: 'beauty'},
  {id: 'remont', q: 'firma remontowa', t: 'Ремонт квартир', seg: 'build', style: 'build'},
  {id: 'auto', q: 'warsztat samochodowy', t: 'Автосервисы', seg: 'services', style: 'auto'},
  {id: 'fizjo', q: 'fizjoterapia', t: 'Физиотерапия', seg: 'services', style: 'clinic'},
  {id: 'jezyki', q: 'szkoła językowa', t: 'Языковые школы', seg: 'services', style: 'school'}
];

P.CHECK = [
  '«Witryna»: пусто — «Нет сайта»; Instagram или Facebook — «Только Instagram/Facebook»; Pyszne, Glovo, Uber Eats, Wolt — «Агрегатор»; ChoiceQR, UpMenu, papu.io — «Арендный конструктор».',
  'Отзывов больше сотни при рейтинге от 4,3: место живое, с таким стоит говорить.',
  'Меню только на фото в отзывах, ссылки на меню нет: повод предложить «Сайт с меню».',
  'В карточке нет кнопок «Zarezerwuj» или «Zamów»: отметь «Нет онлайн-брони» или «Нет своего заказа».',
  'Отзывы на английском, украинском, корейском: гостям нужен второй язык. Владелец из Украины или Беларуси — отметь «говорит по-украински или по-русски».',
  'То же название по нескольким адресам — это сеть, решает офис. Ставь холодный приоритет.'
];

P.STEPS = [
  'Возьми из «Базы» 4–5 мест рядом друг с другом и иди в будний день между 15:00 и 17:00.',
  'Спроси владельца или менеджера. Если его нет, узнай, когда бывает, и оставь карточку с QR-кодом на портфолио.',
  'Покажи на телефоне daon.pl или демо их собственного сайта из вкладки «Демо».',
  'Назови их проблему одной фразой. Например: «Google ведёт гостей в Instagram, а заказы идут через Pyszne с комиссией».',
  'Предложи через 2–3 дня показать черновик их главной страницы с настоящим меню. Результат отметь в «Выходе» сразу у двери.'
];

P.LOST = [
  {k: 'price', t: 'Дорого'},
  {k: 'contractor', t: 'Уже есть подрядчик'},
  {k: 'later', t: 'Не сейчас'},
  {k: 'chain', t: 'Не решает (сеть)'},
  {k: 'silent', t: 'Не отвечает'},
  {k: 'enough', t: 'Хватает Instagram или агрегатора'},
  {k: 'other', t: 'Другое'}
];

P.ACT = {visit: 'Визит', talk: 'Разговор', call: 'Звонок', msg: 'Сообщение', meeting: 'Встреча', offer: 'КП', status: 'Статус', note: 'Заметка'};
P.RESULT = {absent: 'Нет на месте', refused: 'Отказ', talked: 'Поговорили', interested: 'Интересно', reached: 'Дозвон', noanswer: 'Недозвон'};
P.CALL_FILTER = [['', 'Любые звонки'], ['reached', 'Дозвон'], ['noanswer', 'Недозвон'], ['none', 'Не звонили']];

P.EVENTS = [
  {date: '2026-12-02', time: '8:30–12:30', place: 'Face2Face Business Campus, Żelazna 4',
    t: 'Grant Thornton, «Przygotuj firmę na 2027 rok»', note: 'Бесплатно, нужна регистрация. Заполняй её полностью и с данными фирмы: анонимные и неполные заявки организатор может отклонить.',
    url: 'https://zapisy.grantthornton.pl/spotkanie-w-katowicach_przygotuj_firme_2027', link: 'Регистрация'},
  {date: '2026-12-10', time: '18:00–21:00', place: 'Arena Katowice, Nowa Bukowa 1',
    t: 'Gwiazdkowy Business Mixer', note: 'Предновогодний нетворкинг. 165 zł netto.',
    url: 'https://www.advantageaustria.org/pl/events/Gwiazdkowy_Business_Mixer_w_Katowicach_2026.pl.html', link: 'Страница встречи'}
];

// Фразы
// {cityLoc} есть только в польском; {platform}, {agg}, {real} подставляются по лиду.
P.PLATFORM = {pl: {insta: 'Instagramie', fb: 'Facebooku'}, ua: {insta: 'Instagram', fb: 'Facebook'}, ru: {insta: 'Instagram', fb: 'Facebook'}, en: {insta: 'Instagram', fb: 'Facebook'}};
P.AGG_DEFAULT = {pl: 'z dostawą', ua: 'доставки', ru: 'доставки', en: 'delivery'};
P.REAL = {
  r: {pl: 'z prawdziwym menu', ua: 'зі справжнім меню', ru: 'с настоящим меню', en: 'with your real menu'},
  s: {pl: 'z prawdziwym cennikiem', ua: 'зі справжніми цінами', ru: 'с настоящими ценами', en: 'with your real prices'}
};

P.OPENERS = {
  general: {t: 'Ресторан, без особой зацепки',
    pl: 'Dzień dobry! Tworzę strony internetowe i boty Telegram dla lokali {cityLoc}. Strona koreańskiej restauracji DAON przy Dworcowej w Katowicach to moja praca: menu w trzech językach i rezerwacja stolików online. Mogę w minutę pokazać, jak to działa?',
    ua: 'Добрий день! Роблю сайти й Telegram-ботів для закладів у Сілезії. Сайт корейського ресторану DAON на вулиці Dworcowa в Катовіце — моя робота: меню трьома мовами й онлайн-бронювання столиків. Можу за хвилину показати, як це працює?',
    ru: 'Здравствуйте! Делаю сайты и Telegram-ботов для заведений в Силезии. Сайт корейского ресторана DAON на улице Dworcowa в Катовице — моя работа: меню на трёх языках и онлайн-бронь столиков. Могу за минуту показать, как это работает?',
    en: 'Hi! I build websites and Telegram bots for restaurants in Silesia. The website of DAON, the Korean restaurant on Dworcowa Street in Katowice, is my work: a menu in three languages and online table booking. Can I show you how it works? It takes a minute.'},
  social: {t: 'В Google ведёт Instagram или Facebook',
    pl: 'Dzień dobry! Tworzę strony dla lokali {cityLoc}, na przykład stronę restauracji DAON przy Dworcowej: menu w trzech językach i rezerwacja online. Widzę, że Państwa wizytówka w Google prowadzi tylko do profilu na {platform}. Mogę w minutę pokazać, jak wyglądałaby Państwa własna strona z menu?',
    ua: 'Добрий день! Роблю сайти для закладів у Сілезії, наприклад сайт ресторану DAON на Dworcowa: меню трьома мовами й онлайн-бронювання. Бачу, що ваш профіль у Google веде тільки в {platform}. Можу за хвилину показати, який вигляд мав би ваш власний сайт із меню?',
    ru: 'Здравствуйте! Делаю сайты для заведений в Силезии, например сайт ресторана DAON на Dworcowa: меню на трёх языках и онлайн-бронь. Вижу, что ваш профиль в Google ведёт только в {platform}. Могу за минуту показать, как выглядел бы ваш собственный сайт с меню?',
    en: 'Hi! I build websites for restaurants in Silesia, like the DAON site on Dworcowa: a menu in three languages and online booking. I noticed your Google listing only links to {platform}. Can I show you what your own site with a menu could look like? It takes a minute.'},
  aggregator: {t: 'В Google ведёт агрегатор',
    pl: 'Dzień dobry! Tworzę strony dla lokali {cityLoc}, między innymi stronę restauracji DAON przy Dworcowej. Widzę, że link w Google prowadzi Państwa gości prosto do aplikacji {agg}. Własna strona z menu i zamówieniem na wynos to kanał dla stałych gości, bez prowizji od zamówień. Mogę w minutę pokazać przykład?',
    ua: 'Добрий день! Роблю сайти для закладів у Сілезії, зокрема сайт ресторану DAON на Dworcowa. Бачу, що посилання в Google веде ваших гостей просто в застосунок {agg}. Власний сайт із меню й замовленням на виніс — це канал для постійних гостей без комісії із замовлень. Можу за хвилину показати приклад?',
    ru: 'Здравствуйте! Делаю сайты для заведений в Силезии, в том числе сайт ресторана DAON на Dworcowa. Вижу, что ссылка в Google ведёт ваших гостей прямо в приложение {agg}. Свой сайт с меню и заказом навынос — это канал для постоянных гостей без комиссии с заказов. Могу за минуту показать пример?',
    en: 'Hi! I build websites for restaurants in Silesia, including the DAON site on Dworcowa. I noticed your Google link sends guests straight to the {agg} app. Your own site with a menu and takeaway ordering is a channel for regulars, with no commission on orders. Can I show you an example? It takes a minute.'},
  nosite: {t: 'Сайта нет совсем',
    pl: 'Dzień dobry! Tworzę strony dla lokali {cityLoc}, między innymi stronę restauracji DAON przy Dworcowej. W Google przy Państwa lokalu nie ma linku do strony, więc gość nie zobaczy menu przed wizytą. Mogę w minutę pokazać, jak to wygląda u DAON?',
    ua: 'Добрий день! Роблю сайти для закладів у Сілезії, зокрема сайт ресторану DAON на Dworcowa. У Google біля вашого закладу немає посилання на сайт, тож гість не побачить меню до візиту. Можу за хвилину показати, як це виглядає в DAON?',
    ru: 'Здравствуйте! Делаю сайты для заведений в Силезии, в том числе сайт ресторана DAON на Dworcowa. В Google у вашего заведения нет ссылки на сайт, поэтому гость не увидит меню до визита. Могу за минуту показать, как это выглядит у DAON?',
    en: 'Hi! I build websites for restaurants in Silesia, including the DAON site on Dworcowa. Your Google listing has no website link, so guests can’t see the menu before they come. Can I show you how DAON does it? It takes a minute.'},
  rented: {t: 'Сайт на арендном конструкторе',
    pl: 'Dzień dobry! Tworzę strony dla lokali {cityLoc}, między innymi stronę restauracji DAON przy Dworcowej. Widzę, że Państwa strona działa na wynajętej platformie z miesięcznym abonamentem. Własna strona to jednorazowy koszt, a menu i ceny zmieniają Państwo sami. Mogę w minutę pokazać przykład?',
    ua: 'Добрий день! Роблю сайти для закладів у Сілезії, зокрема сайт ресторану DAON на Dworcowa. Бачу, що ваш сайт працює на орендованій платформі з щомісячною підпискою. Власний сайт — це разовий платіж, а меню й ціни ви змінюєте самі. Можу за хвилину показати приклад?',
    ru: 'Здравствуйте! Делаю сайты для заведений в Силезии, в том числе сайт ресторана DAON на Dworcowa. Вижу, что ваш сайт работает на арендованной платформе с ежемесячной подпиской. Свой сайт — это разовый платёж, а меню и цены вы меняете сами. Могу за минуту показать пример?',
    en: 'Hi! I build websites for restaurants in Silesia, including the DAON site on Dworcowa. I noticed your site runs on a rented platform with a monthly subscription. Your own site is a one-time cost, and you change the menu and prices yourself. Can I show you an example? It takes a minute.'},
  service: {t: 'Салон, сервис, ремонт',
    pl: 'Dzień dobry! Tworzę strony internetowe i boty Telegram dla firm {cityLoc}. Moja praca to między innymi strona firmy budowlanej Mipaco w trzech językach, z cennikiem i kalkulatorem. Mogę w minutę pokazać, jak mogłaby wyglądać Państwa strona z cennikiem i zapisami online?',
    ua: 'Добрий день! Роблю сайти й Telegram-ботів для фірм у Сілезії. Серед моїх робіт — сайт будівельної компанії Mipaco трьома мовами, з цінами й калькулятором. Можу за хвилину показати, який вигляд мав би ваш сайт із цінами й онлайн-записом?',
    ru: 'Здравствуйте! Делаю сайты и Telegram-ботов для фирм в Силезии. Среди моих работ — сайт строительной компании Mipaco на трёх языках, с ценами и калькулятором. Могу за минуту показать, как мог бы выглядеть ваш сайт с ценами и онлайн-записью?',
    en: 'Hi! I build websites and Telegram bots for businesses in Silesia. One of my projects is the Mipaco construction company site in three languages, with prices and a cost calculator. Can I show you what your site with prices and online booking could look like? It takes a minute.'}
};

P.LINES = {
  absent: {t: 'Владельца нет на месте',
    pl: 'Rozumiem, nie chcę przeszkadzać. Kiedy najlepiej zastać właściciela albo menedżera? Zostawię wizytówkę z kodem QR do moich realizacji.',
    ua: 'Розумію, не хочу заважати. Коли краще застати власника чи менеджера? Залишу візитку з QR-кодом на мої роботи.',
    ru: 'Понимаю, не хочу мешать. Когда лучше застать владельца или менеджера? Оставлю визитку с QR-кодом на мои работы.',
    en: 'Of course, I don’t want to take your time. When is the best time to catch the owner or manager? I’ll leave my card with a QR code to my work.'},
  close: {t: 'Договориться о следующем шаге',
    pl: 'Za 2–3 dni mogę przyjść ze szkicem Państwa strony głównej {real}, bez zobowiązań. Kiedy będzie Państwu wygodnie?',
    ua: 'За 2–3 дні можу прийти з чернеткою вашої головної сторінки {real}, без зобов’язань. Коли вам буде зручно?',
    ru: 'Через 2–3 дня могу прийти с черновиком вашей главной страницы {real}, без обязательств. Когда вам будет удобно?',
    en: 'In 2–3 days I can come back with a draft of your home page {real}, no strings attached. When would suit you?'},
  consent: {t: 'Спросить согласие на связь',
    pl: 'Czy mogę przesłać Państwu krótki przykład i propozycję na WhatsApp albo e-mailem? Wyślę tylko to, o czym teraz rozmawiamy.',
    ua: 'Чи можу надіслати вам короткий приклад і пропозицію у WhatsApp або на пошту? Надішлю лише те, про що ми зараз говоримо.',
    ru: 'Могу прислать вам короткий пример и предложение в WhatsApp или на почту? Пришлю только то, о чём мы сейчас говорим.',
    en: 'May I send you a short example and an offer on WhatsApp or by email? Only what we’re talking about now.'}
};

P.OBJ = [
  {k: 'price', q: 'Дорого', tip: 'Цифра из тарифов UpMenu и Restimo: от 169 zł в месяц за точку. Ссылки в «Справке».',
    pl: 'Rozumiem. Dlatego zaczynamy od wersji podstawowej, a resztę można dodać później. Dla porównania: gotowe platformy do stron i zamówień to zwykle abonament od około 170 zł miesięcznie, a własna strona to płatność jednorazowa.',
    ua: 'Розумію. Тому починаємо з базової версії, а решту можна додати пізніше. Для порівняння: готові платформи для сайтів і замовлень — це зазвичай підписка приблизно від 170 zł на місяць, а власний сайт — разовий платіж.',
    ru: 'Понимаю. Поэтому начинаем с базовой версии, остальное можно добавить позже. Для сравнения: готовые платформы для сайтов и заказов — это обычно подписка примерно от 170 zł в месяц, а свой сайт — разовый платёж.',
    en: 'I understand. That’s why we start with a basic version and add the rest later. For comparison, ready-made website and ordering platforms usually charge a subscription from about 170 zł a month, while your own site is a one-time payment.'},
  {k: 'insta', q: 'Нам хватает Instagram',
    pl: 'Instagram jest świetny do zdjęć i niech zostanie. Strona go nie zastępuje: zbiera menu, godziny i rezerwację w jednym miejscu dla ludzi, którzy szukają w Google, a nie na Instagramie.',
    ua: 'Instagram чудовий для фото, хай лишається. Сайт його не замінює: збирає меню, години й бронювання в одному місці для людей, які шукають у Google, а не в Instagram.',
    ru: 'Instagram отлично подходит для фото, пусть остаётся. Сайт его не заменяет: он собирает меню, часы и бронь в одном месте для тех, кто ищет в Google, а не в Instagram.',
    en: 'Instagram is great for photos, keep it. A website doesn’t replace it: it puts the menu, hours and booking in one place for people who search on Google rather than Instagram.'},
  {k: 'pyszne', q: 'Pyszne и так приносит заказы', tip: 'Процент комиссии не называй: точной цифры у тебя нет. Если спросят, рестораторы в прессе называли 30% и больше (Antyweb).',
    pl: 'I niech dalej przynosi, to dobre źródło nowych gości. Własne zamówienia na wynos to kanał dla stałych gości: płacą Państwo raz za stronę, a nie prowizję od każdego zamówienia.',
    ua: 'І хай далі приносить, це добре джерело нових гостей. Власні замовлення на виніс — це канал для постійних гостей: ви платите один раз за сайт, а не комісію з кожного замовлення.',
    ru: 'И пусть приносит дальше, это хороший источник новых гостей. Свои заказы навынос — это канал для постоянных гостей: вы платите один раз за сайт, а не комиссию с каждого заказа.',
    en: 'And let it keep bringing them, it’s a good source of new guests. Your own takeaway ordering is a channel for regulars: you pay once for the site instead of a commission on every order.'},
  {k: 'time', q: 'Нет времени',
    pl: 'Rozumiem, to dosłownie minuta. Mogę też wrócić w spokojniejszej porze. Kiedy będzie lepiej?',
    ua: 'Розумію, це буквально хвилина. Можу також повернутися в спокійніший час. Коли буде краще?',
    ru: 'Понимаю, это буквально минута. Могу зайти и в более спокойное время. Когда будет удобнее?',
    en: 'I understand, it really is a minute. I can also come back at a quieter time. When would be better?'},
  {k: 'friend', q: 'Знакомый сделает',
    pl: 'Świetnie, że ktoś pomaga. Zostawię wizytówkę: jeśli coś się przeciągnie albo zabraknie rezerwacji czy panelu do menu, chętnie pomogę.',
    ua: 'Чудово, що хтось допомагає. Залишу візитку: якщо щось затягнеться або забракне бронювання чи адмінки для меню, охоче допоможу.',
    ru: 'Здорово, что кто-то помогает. Оставлю визитку: если что-то затянется или понадобится бронь или админка для меню, с удовольствием помогу.',
    en: 'Great that someone is helping. I’ll leave my card: if things drag on, or you need booking or a menu admin panel, I’m happy to help.'},
  {k: 'hadsite', q: 'Сайт уже был и не помог',
    pl: 'Często strona nie pomaga, bo jest tylko wizytówką. Ważne, żeby dało się na niej coś zrobić: zarezerwować stolik, zamówić na wynos, przeczytać menu we własnym języku. Mogę pokazać, jak to działa u DAON.',
    ua: 'Часто сайт не допомагає, бо це просто візитка. Важливо, щоб на ньому можна було щось зробити: забронювати столик, замовити на виніс, прочитати меню своєю мовою. Можу показати, як це працює в DAON.',
    ru: 'Часто сайт не помогает, потому что это просто визитка. Важно, чтобы на нём можно было что-то сделать: забронировать столик, заказать навынос, прочитать меню на своём языке. Могу показать, как это работает у DAON.',
    en: 'Often a site doesn’t help because it’s just a business card. What matters is that people can do something there: book a table, order takeaway, read the menu in their own language. I can show you how it works at DAON.'},
  {k: 'think', q: 'Подумаю',
    pl: 'Jasne. Za 2–3 dni mogę przyjść ze szkicem Państwa strony {real}, wtedy łatwiej zdecydować. Pasuje?',
    ua: 'Звісно. За 2–3 дні можу прийти з чернеткою вашого сайту {real}, тоді легше вирішити. Підходить?',
    ru: 'Конечно. Через 2–3 дня могу прийти с черновиком вашего сайта {real}, тогда проще решить. Подходит?',
    en: 'Sure. In 2–3 days I can bring a draft of your site {real}, which makes it easier to decide. Does that work?'},
  {k: 'email', q: 'Пришлите на почту', tip: 'Это и есть согласие на связь. Отметь его в карточке: дата и способ.',
    pl: 'Chętnie. Czy mogę w takim razie przesłać propozycję e-mailem albo na WhatsApp? Wyślę tylko ofertę, o której rozmawiamy.',
    ua: 'Охоче. Тоді можу надіслати пропозицію на пошту чи у WhatsApp? Надішлю лише пропозицію, про яку ми говоримо.',
    ru: 'С удовольствием. Тогда могу прислать предложение на почту или в WhatsApp? Пришлю только предложение, о котором мы говорим.',
    en: 'Gladly. So may I send the offer by email or WhatsApp? Only the offer we’re discussing.'},
  {k: 'chain', q: 'Решает сеть или офис', tip: 'Сети почти никогда не решают на месте. Больше одного визита на них не трать.',
    pl: 'Rozumiem. Kto w sieci decyduje o stronie i marketingu? Zostawię wizytówkę dla tej osoby.',
    ua: 'Розумію. Хто в мережі вирішує щодо сайту й маркетингу? Залишу візитку для цієї людини.',
    ru: 'Понимаю. Кто в сети решает вопросы сайта и маркетинга? Оставлю визитку для этого человека.',
    en: 'I see. Who in the chain decides on the website and marketing? I’ll leave my card for that person.'},
  {k: 'season', q: 'Сейчас не сезон',
    pl: 'Rozumiem. Właśnie w spokojniejszym okresie najłatwiej przygotować stronę, żeby była gotowa na sezon. Mogę wrócić za miesiąc?',
    ua: 'Розумію. Якраз у спокійніший період найлегше підготувати сайт, щоб він був готовий до сезону. Можу повернутися за місяць?',
    ru: 'Понимаю. Как раз в спокойный период проще всего подготовить сайт, чтобы он был готов к сезону. Могу вернуться через месяц?',
    en: 'I understand. A quieter period is exactly the easiest time to prepare a site so it’s ready for the season. Can I come back in a month?'}
];
P.TAG_OBJ = {insta: 'insta', fb: 'insta', aggregator: 'pyszne', rented: 'price', chain: 'chain', oldsite: 'hadsite'};

// Сообщения после визита: только тем, кто дал согласие на связь.
P.FOLLOW = [
  {k: 'after', t: 'После визита, в тот же день',
    pl: 'Dzień dobry, tu {brand}. Dziękuję za dzisiejszą rozmowę w {name}. Zgodnie z obietnicą przesyłam przykład: {case}. Za 2–3 dni mogę pokazać szkic Państwa strony. Portfolio: {portfolio}',
    ua: 'Добрий день, це {brand}. Дякую за сьогоднішню розмову в {name}. Як і обіцяно, надсилаю приклад: {case}. За 2–3 дні можу показати чернетку вашого сайту. Портфоліо: {portfolio}',
    ru: 'Здравствуйте, это {brand}. Спасибо за сегодняшний разговор в {name}. Как и договаривались, присылаю пример: {case}. Через 2–3 дня могу показать черновик вашего сайта. Портфолио: {portfolio}',
    en: 'Hello, this is {brand}. Thanks for today’s chat at {name}. As promised, here is an example: {case}. In 2–3 days I can show you a draft of your site. Portfolio: {portfolio}'},
  {k: 'offer', t: 'К коммерческому предложению',
    pl: 'Dzień dobry! W załączniku propozycja dla {name}: zakres prac, terminy i ceny. Oferta jest ważna 14 dni. Chętnie odpowiem na pytania. {brand}',
    ua: 'Добрий день! У вкладенні пропозиція для {name}: обсяг робіт, терміни й ціни. Пропозиція дійсна 14 днів. Охоче відповім на запитання. {brand}',
    ru: 'Здравствуйте! Во вложении предложение для {name}: объём работ, сроки и цены. Предложение действует 14 дней. С удовольствием отвечу на вопросы. {brand}',
    en: 'Hello! Attached is the proposal for {name}: scope, timeline and prices. It’s valid for 14 days. Happy to answer any questions. {brand}'},
  {k: 'remind', t: 'Напоминание через 3–5 дней',
    pl: 'Dzień dobry! Przypominam się w sprawie strony dla {name}. Czy udało się przejrzeć propozycję? Mogę wpaść na 10 minut w tym tygodniu. {brand}',
    ua: 'Добрий день! Нагадую про сайт для {name}. Чи вдалося переглянути пропозицію? Можу зайти на 10 хвилин цього тижня. {brand}',
    ru: 'Здравствуйте! Напоминаю про сайт для {name}. Удалось посмотреть предложение? Могу зайти на 10 минут на этой неделе. {brand}',
    en: 'Hello! A quick follow-up about the website for {name}. Have you had a chance to look at the proposal? I can drop by for 10 minutes this week. {brand}'},
  {k: 'review', t: 'Отзыв, когда сайт запущен',
    pl: 'Dzień dobry! Cieszę się, że strona już działa. Jeśli współpraca była udana, krótka opinia w Google bardzo mi pomoże. Dziękuję! {brand}',
    ua: 'Добрий день! Приємно, що сайт уже працює. Якщо співпраця була вдалою, короткий відгук у Google мені дуже допоможе. Дякую! {brand}',
    ru: 'Здравствуйте! Приятно, что сайт уже работает. Если сотрудничество было удачным, короткий отзыв в Google мне очень поможет. Спасибо! {brand}',
    en: 'Hello! Great to see the site live. If you were happy with the work, a short Google review would help me a lot. Thank you! {brand}'},
  {k: 'referral', t: 'Попросить рекомендацию',
    pl: 'Dzień dobry! Jeśli znają Państwo właściciela lokalu lub firmy, która potrzebuje strony albo bota, będzie mi miło, jeśli przekażą Państwo mój kontakt: {portfolio}. {brand}',
    ua: 'Добрий день! Якщо знаєте власника закладу чи фірми, яким потрібен сайт або бот, мені буде приємно, якщо передасте мій контакт: {portfolio}. {brand}',
    ru: 'Здравствуйте! Если знаете владельца заведения или фирмы, которым нужен сайт или бот, мне будет приятно, если передадите мой контакт: {portfolio}. {brand}',
    en: 'Hello! If you know a restaurant or business owner who needs a website or a bot, I’d appreciate it if you passed on my contact: {portfolio}. {brand}'}
];

// Коммерческое предложение
P.KP = {
  pl: {title: 'Propozycja współpracy', for: 'Dla', date: 'Data', valid: 'Ważna do', no: 'Nr', issues: 'Co warto poprawić',
    scope: 'Proponowany zakres', price: 'Cena', from: 'od', month: 'mies.', days: 'dni roboczych', total: 'Razem jednorazowo',
    monthly: 'Miesięcznie', time: 'Czas realizacji', cases: 'Realizacje', process: 'Jak pracuję', contact: 'Kontakt',
    note: 'Ceny orientacyjne, ostateczna wycena po rozmowie.', validNote: 'Oferta ważna 14 dni.', currency: 'zł',
    proc: ['Krótka rozmowa: cele, treści i zdjęcia.', 'Projekt i pierwszy szkic do akceptacji.', 'Wdrożenie, testy na telefonie i podpięcie domeny.', 'Start i krótkie szkolenie z panelu.']},
  en: {title: 'Proposal', for: 'For', date: 'Date', valid: 'Valid until', no: 'No.', issues: 'What could be better',
    scope: 'Proposed scope', price: 'Price', from: 'from', month: 'month', days: 'working days', total: 'One-time total',
    monthly: 'Monthly', time: 'Timeline', cases: 'Work examples', process: 'How I work', contact: 'Contact',
    note: 'Prices are indicative; the final quote follows our conversation.', validNote: 'This offer is valid for 14 days.', currency: 'zł',
    proc: ['A short call: goals, content and photos.', 'Design and a first draft for your approval.', 'Build, phone testing and connecting the domain.', 'Launch and a short admin panel walkthrough.']},
  ua: {title: 'Пропозиція співпраці', for: 'Для', date: 'Дата', valid: 'Дійсна до', no: '№', issues: 'Що варто покращити',
    scope: 'Що пропоную', price: 'Ціна', from: 'від', month: 'міс.', days: 'робочих днів', total: 'Разом одноразово',
    monthly: 'Щомісяця', time: 'Термін', cases: 'Приклади робіт', process: 'Як я працюю', contact: 'Контакти',
    note: 'Ціни орієнтовні, остаточна вартість — після розмови.', validNote: 'Пропозиція дійсна 14 днів.', currency: 'zł',
    proc: ['Коротка розмова: цілі, тексти й фото.', 'Дизайн і перша чернетка на погодження.', 'Запуск, тести на телефоні й підключення домену.', 'Старт і коротке навчання роботі з адмінкою.']},
  ru: {title: 'Предложение о сотрудничестве', for: 'Для', date: 'Дата', valid: 'Действует до', no: '№', issues: 'Что стоит улучшить',
    scope: 'Что предлагаю', price: 'Цена', from: 'от', month: 'мес.', days: 'рабочих дней', total: 'Итого разово',
    monthly: 'Ежемесячно', time: 'Срок', cases: 'Примеры работ', process: 'Как я работаю', contact: 'Контакты',
    note: 'Цены ориентировочные, окончательная стоимость — после разговора.', validNote: 'Предложение действует 14 дней.', currency: 'zł',
    proc: ['Короткий разговор: цели, тексты и фото.', 'Дизайн и первый черновик на согласование.', 'Запуск, тесты на телефоне и подключение домена.', 'Старт и короткое обучение работе с админкой.']}
};

// Демо-сайты
// layout: r — ресторан (меню и бронь), s — услуги (прайс и заявка). Цены в демо помечены как примерные.
P.DEMO = {
  pl: {menu: 'Menu', services: 'Usługi i ceny', book: 'Rezerwacja', ask: 'Zapytanie', contact: 'Kontakt',
    ctaBook: 'Zarezerwuj stolik', ctaMenu: 'Zobacz menu', ctaAsk: 'Zapytaj o termin', ctaPrices: 'Zobacz cennik',
    address: 'Adres', hours: 'Godziny', rating: 'Google', hoursR: 'pon–nd 12:00–22:00', hoursS: 'pon–pt 9:00–18:00',
    sampleR: 'Przykładowe pozycje i ceny. W pełnej wersji Państwa prawdziwe menu, które zmieniają Państwo sami w panelu.',
    sampleS: 'Przykładowe usługi i ceny. W pełnej wersji Państwa prawdziwy cennik, edytowany w panelu.',
    date: 'Data', time: 'Godzina', people: 'Liczba osób', name: 'Imię', phone: 'Telefon', service: 'Usługa', send: 'Wyślij',
    okR: 'To wersja demonstracyjna. W pełnej wersji rezerwacja od razu trafia do obsługi w Telegramie.',
    okS: 'To wersja demonstracyjna. W pełnej wersji zgłoszenie od razu trafia do Telegrama.',
    route: 'Wyznacz trasę', example: 'przykład', how: 'Jak to działa', from: 'od',
    steps: ['Wybierz usługę i termin', 'Zostaw imię i telefon', 'Oddzwonimy, żeby potwierdzić'],
    foot: 'Projekt demonstracyjny przygotowany przez'},
  en: {menu: 'Menu', services: 'Services & prices', book: 'Booking', ask: 'Enquiry', contact: 'Contact',
    ctaBook: 'Book a table', ctaMenu: 'See the menu', ctaAsk: 'Ask for a slot', ctaPrices: 'See prices',
    address: 'Address', hours: 'Hours', rating: 'Google', hoursR: 'Mon–Sun 12:00–22:00', hoursS: 'Mon–Fri 9:00–18:00',
    sampleR: 'Sample dishes and prices. The full version shows your real menu, which you edit yourself in the admin panel.',
    sampleS: 'Sample services and prices. The full version shows your real price list, edited in the admin panel.',
    date: 'Date', time: 'Time', people: 'Guests', name: 'Name', phone: 'Phone', service: 'Service', send: 'Send',
    okR: 'This is a demo. In the full version the booking goes straight to staff in Telegram.',
    okS: 'This is a demo. In the full version the request goes straight to Telegram.',
    route: 'Get directions', example: 'example', how: 'How it works', from: 'from',
    steps: ['Pick a service and a time', 'Leave your name and phone', 'We call back to confirm'],
    foot: 'Demo project prepared by'}
};

P.STYLES = [
  {id: 'korean', t: 'Корейская', kw: 'kore|korea|bibim|kimchi|bulgogi|корей', layout: 'r',
    font: 'Bricolage+Grotesque:wght@600;800&family=Manrope:wght@400;600', fd: 'Bricolage Grotesque', dw: 800, fb: 'Manrope',
    c: {bg: '#FBF8F3', card: '#FFFFFF', ink: '#1C1A17', muted: '#6B645B', line: '#E6DFD3', acc: '#C8372D', accInk: '#FFFFFF'},
    greet: '어서 오세요', gl: 'KO', tag: {pl: 'Kuchnia koreańska {loc}', en: 'Korean kitchen in {city}'},
    items: [['Bibimbap', 'Bibimbap', 39], ['Kimchi jjigae', 'Kimchi jjigae', 36], ['Bulgogi z ryżem', 'Bulgogi with rice', 45], ['Tteokbokki', 'Tteokbokki', 32], ['Kimbap', 'Kimbap', 28], ['Mandu, 6 szt.', 'Mandu, 6 pcs', 26]]},
  {id: 'chinese', t: 'Китайская', kw: 'chinsk|chinese|china|dim sum|syczu|китай', layout: 'r',
    font: 'DM+Serif+Display&family=Manrope:wght@400;600', fd: 'DM Serif Display', dw: 400, fb: 'Manrope',
    c: {bg: '#FFF8EF', card: '#FFFFFF', ink: '#2A1712', muted: '#75594D', line: '#EADCCB', acc: '#A61B1B', accInk: '#FFF6E8'},
    greet: '欢迎光临', gl: 'ZH', tag: {pl: 'Kuchnia chińska {loc}', en: 'Chinese kitchen in {city}'},
    items: [['Pierożki jiaozi', 'Jiaozi dumplings', 28], ['Kurczak kung pao', 'Kung pao chicken', 39], ['Makaron dan dan', 'Dan dan noodles', 34], ['Wieprzowina słodko-kwaśna', 'Sweet and sour pork', 38], ['Bakłażan po syczuańsku', 'Sichuan aubergine', 33]]},
  {id: 'vietnamese', t: 'Вьетнамская', kw: 'wietnam|viet|pho|phở|bún|banh|вьетнам', layout: 'r',
    font: 'Be+Vietnam+Pro:wght@400;600;800', fd: 'Be Vietnam Pro', dw: 800, fb: 'Be Vietnam Pro',
    c: {bg: '#F4F7F1', card: '#FFFFFF', ink: '#17251C', muted: '#56685B', line: '#D9E3D6', acc: '#2F7D4F', accInk: '#FFFFFF'},
    greet: 'Chào mừng quý khách', gl: 'VI', tag: {pl: 'Kuchnia wietnamska {loc}', en: 'Vietnamese kitchen in {city}'},
    items: [['Phở bò', 'Phở bò', 36], ['Bún chả', 'Bún chả', 38], ['Gỏi cuốn, sajgonki', 'Gỏi cuốn rolls', 24], ['Bánh mì', 'Bánh mì', 26], ['Cơm gà, ryż z kurczakiem', 'Cơm gà chicken rice', 34]]},
  {id: 'asian', t: 'Паназиатская', kw: 'azja|asia|azjat|thai|tajsk|wok|азиат', layout: 'r',
    font: 'Archivo:wght@400;800&family=Manrope:wght@400;600', fd: 'Archivo', dw: 800, fb: 'Manrope',
    c: {bg: '#F7F6F2', card: '#FFFFFF', ink: '#151515', muted: '#5F5D57', line: '#E2DFD6', acc: '#D9480F', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Kuchnia azjatycka {loc}', en: 'Asian kitchen in {city}'},
    items: [['Pad thai z kurczakiem', 'Chicken pad thai', 36], ['Wok z wołowiną', 'Beef wok', 39], ['Zupa tom yum', 'Tom yum soup', 32], ['Pierożki gyoza', 'Gyoza dumplings', 26], ['Ryż smażony z warzywami', 'Vegetable fried rice', 29]]},
  {id: 'japanese', t: 'Японская, суши, рамен', kw: 'japo|japan|sushi|ramen|izakaya|udon|япон|суши|рамен', layout: 'r',
    font: 'Instrument+Serif&family=Manrope:wght@400;600', fd: 'Instrument Serif', dw: 400, fb: 'Manrope',
    c: {bg: '#F7F5F0', card: '#FFFFFF', ink: '#111111', muted: '#5C5A55', line: '#E3DED4', acc: '#B3262E', accInk: '#FFFFFF'},
    greet: 'いらっしゃいませ', gl: 'JA', tag: {pl: 'Kuchnia japońska {loc}', en: 'Japanese kitchen in {city}'},
    items: [['Ramen tonkotsu', 'Tonkotsu ramen', 42], ['Zestaw sushi, 16 szt.', 'Sushi set, 16 pcs', 69], ['Gyoza', 'Gyoza', 26], ['Onigiri', 'Onigiri', 18], ['Matcha latte', 'Matcha latte', 19]]},
  {id: 'ukrainian', t: 'Украинская', kw: 'ukrai|ukrain|barszcz|warenyk|укра', layout: 'r',
    font: 'Playfair+Display:wght@400;700&family=Lora:wght@400;600', fd: 'Playfair Display', dw: 700, fb: 'Lora',
    c: {bg: '#FFFDF7', card: '#FFFFFF', ink: '#1E2430', muted: '#5B6270', line: '#E7E1D2', acc: '#A8322D', accInk: '#FFFFFF'},
    greet: 'Ласкаво просимо', gl: 'UA', tag: {pl: 'Kuchnia ukraińska {loc}', en: 'Ukrainian kitchen in {city}'},
    items: [['Barszcz ukraiński', 'Ukrainian borscht', 22], ['Warenyky z ziemniakami', 'Potato varenyky', 28], ['Hołubce', 'Holubtsi', 34], ['Deruny ze śmietaną', 'Deruny with sour cream', 27], ['Syrnyky', 'Syrnyky', 24]]},
  {id: 'georgian', t: 'Грузинская', kw: 'gruzi|georgia|chinkal|chaczap|khachap|грузин|хинкал', layout: 'r',
    font: 'Fraunces:wght@400;700&family=Lora:wght@400;600', fd: 'Fraunces', dw: 700, fb: 'Lora',
    c: {bg: '#FBF6EF', card: '#FFFFFF', ink: '#2B1D1A', muted: '#6E5A55', line: '#E8DCCF', acc: '#7E1F2E', accInk: '#FFFFFF'},
    greet: 'მოგესალმებით', gl: 'KA', tag: {pl: 'Kuchnia gruzińska {loc}', en: 'Georgian kitchen in {city}'},
    items: [['Chinkali, 5 szt.', 'Khinkali, 5 pcs', 32], ['Chaczapuri adżarskie', 'Adjarian khachapuri', 38], ['Pchali', 'Pkhali', 26], ['Mcwadi, szaszłyk', 'Mtsvadi skewers', 45], ['Lobio', 'Lobio', 27]]},
  {id: 'italian', t: 'Итальянская, пицца', kw: 'pizz|włos|wlos|ital|pasta|trattor|пицц|итал', layout: 'r',
    font: 'Playfair+Display:wght@400;700&family=Manrope:wght@400;600', fd: 'Playfair Display', dw: 700, fb: 'Manrope',
    c: {bg: '#FFFBF5', card: '#FFFFFF', ink: '#1F1A17', muted: '#6A615B', line: '#ECE2D6', acc: '#B5281C', accInk: '#FFFFFF'},
    greet: 'Benvenuti', gl: 'IT', tag: {pl: 'Pizza i kuchnia włoska {loc}', en: 'Pizza and Italian food in {city}'},
    items: [['Margherita', 'Margherita', 32], ['Diavola', 'Diavola', 38], ['Quattro formaggi', 'Quattro formaggi', 41], ['Spaghetti carbonara', 'Spaghetti carbonara', 36], ['Tiramisu', 'Tiramisu', 19]]},
  {id: 'cafe', t: 'Кофейня, бистро', kw: 'kawiar|cafe|café|kaw|coffee|bistro|piekar|cukier|кафе|кофе|бистро', layout: 'r',
    font: 'Fraunces:wght@400;600&family=Manrope:wght@400;600', fd: 'Fraunces', dw: 600, fb: 'Manrope',
    c: {bg: '#F6F1EA', card: '#FFFFFF', ink: '#2B2118', muted: '#6E6155', line: '#E5DACB', acc: '#8B5E3C', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Kawa i śniadania {loc}', en: 'Coffee and breakfast in {city}'},
    items: [['Flat white', 'Flat white', 14], ['Cappuccino', 'Cappuccino', 13], ['Croissant z masłem', 'Butter croissant', 12], ['Sernik baskijski', 'Basque cheesecake', 18], ['Owsianka z owocami', 'Porridge with fruit', 22]]},
  {id: 'street', t: 'Кебаб, стритфуд', kw: 'kebab|burger|street|fast|zapiek|falafel|кебаб|бургер|шаурм', layout: 'r',
    font: 'Oswald:wght@500;600&family=Rubik:wght@400;600', fd: 'Oswald', dw: 600, fb: 'Rubik',
    c: {bg: '#121212', card: '#1C1C1C', ink: '#F5F5F5', muted: '#B3B3B3', line: '#2E2E2E', acc: '#FFC21A', accInk: '#121212'},
    greet: '', gl: '', tag: {pl: 'Street food {loc}', en: 'Street food in {city}'},
    items: [['Kebab w bułce', 'Kebab in a bun', 26], ['Kebab na talerzu', 'Kebab plate', 32], ['Falafel wrap', 'Falafel wrap', 24], ['Frytki', 'Fries', 12], ['Lemoniada', 'Lemonade', 10]]},
  {id: 'build', t: 'Ремонт и стройка', kw: 'remont|budow|wykończ|wykoncz|łazien|elektr|hydraul|ремонт|строй', layout: 's',
    font: 'Archivo:wght@400;800&family=Manrope:wght@400;600', fd: 'Archivo', dw: 800, fb: 'Manrope',
    c: {bg: '#F3F4F6', card: '#FFFFFF', ink: '#111827', muted: '#4B5563', line: '#D9DDE3', acc: '#F2A900', accInk: '#111827'},
    greet: '', gl: '', tag: {pl: 'Remonty i wykończenia {loc}', en: 'Renovation and finishing in {city}'},
    items: [['Remont łazienki pod klucz', 'Turnkey bathroom renovation', 9000], ['Malowanie ścian', 'Wall painting', 18, '/m²'], ['Gładzie gipsowe', 'Plaster skim coat', 30, '/m²'], ['Układanie płytek', 'Tiling', 120, '/m²'], ['Montaż paneli podłogowych', 'Floor panel fitting', 35, '/m²']]},
  {id: 'beauty', t: 'Салон красоты', kw: 'salon|fryzj|kosmet|beauty|nail|paznok|brwi|rzęs|spa|парикмах|космет|салон', layout: 's',
    font: 'Instrument+Serif&family=Manrope:wght@400;600', fd: 'Instrument Serif', dw: 400, fb: 'Manrope',
    c: {bg: '#FBF7F5', card: '#FFFFFF', ink: '#2A2024', muted: '#6D5F65', line: '#EBDFDF', acc: '#9E4F5C', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Salon urody {loc}', en: 'Beauty salon in {city}'},
    items: [['Strzyżenie damskie', 'Women’s haircut', 90], ['Koloryzacja', 'Colouring', 220], ['Manicure hybrydowy', 'Gel manicure', 110], ['Stylizacja brwi', 'Brow styling', 60], ['Pielęgnacja twarzy', 'Facial treatment', 180]]},
  {id: 'barber', t: 'Барбершоп', kw: 'barber|męsk|mesk|golib|барбер', layout: 's',
    font: 'Oswald:wght@500;600&family=Manrope:wght@400;600', fd: 'Oswald', dw: 600, fb: 'Manrope',
    c: {bg: '#F2EFEA', card: '#FFFFFF', ink: '#16130F', muted: '#5E574E', line: '#DDD5C9', acc: '#1F3A5F', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Barber shop {loc}', en: 'Barber shop in {city}'},
    items: [['Strzyżenie męskie', 'Men’s haircut', 70], ['Broda', 'Beard trim', 50], ['Strzyżenie i broda', 'Haircut and beard', 110], ['Golenie brzytwą', 'Straight razor shave', 60], ['Strzyżenie dziecięce', 'Kids’ haircut', 50]]},
  {id: 'auto', t: 'Автосервис', kw: 'warszt|auto|mechan|samoch|opon|wulkan|автосерв|шиномонт', layout: 's',
    font: 'Archivo:wght@400;800&family=Rubik:wght@400;600', fd: 'Archivo', dw: 800, fb: 'Rubik',
    c: {bg: '#F2F4F7', card: '#FFFFFF', ink: '#0F172A', muted: '#475569', line: '#D6DCE4', acc: '#C62828', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Warsztat samochodowy {loc}', en: 'Car repair shop in {city}'},
    items: [['Diagnostyka komputerowa', 'Computer diagnostics', 100], ['Wymiana oleju i filtrów', 'Oil and filter change', 120], ['Wymiana opon', 'Tyre change', 100], ['Serwis klimatyzacji', 'Air-con service', 200], ['Przegląd przed zakupem auta', 'Pre-purchase inspection', 250]]},
  {id: 'clinic', t: 'Физиотерапия, кабинет', kw: 'fizjo|rehab|masaż|masaz|gabinet|dent|klinik|физио|массаж', layout: 's',
    font: 'Bricolage+Grotesque:wght@600;800&family=Manrope:wght@400;600', fd: 'Bricolage Grotesque', dw: 600, fb: 'Manrope',
    c: {bg: '#F4F8F8', card: '#FFFFFF', ink: '#0F2A2E', muted: '#4C6468', line: '#D5E3E4', acc: '#127C74', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Fizjoterapia {loc}', en: 'Physiotherapy in {city}'},
    items: [['Konsultacja fizjoterapeutyczna', 'Physio consultation', 150], ['Terapia manualna', 'Manual therapy', 180], ['Masaż leczniczy', 'Therapeutic massage', 140], ['Kinesiotaping', 'Kinesio taping', 60]]},
  {id: 'school', t: 'Языковая школа', kw: 'szkoł|szkol|język|jezyk|kurs|lekcj|korepet|школ|курс', layout: 's',
    font: 'Bricolage+Grotesque:wght@600;800&family=Manrope:wght@400;600', fd: 'Bricolage Grotesque', dw: 800, fb: 'Manrope',
    c: {bg: '#F7F7FB', card: '#FFFFFF', ink: '#1A1B2E', muted: '#565873', line: '#DEDFEB', acc: '#4C3FD1', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Szkoła językowa {loc}', en: 'Language school in {city}'},
    items: [['Angielski w grupie, semestr', 'Group English, one term', 1200], ['Lekcja indywidualna, 60 min', 'One-to-one lesson, 60 min', 90], ['Polski dla obcokrajowców, semestr', 'Polish for foreigners, one term', 1100], ['Przygotowanie do egzaminu', 'Exam preparation', 1400]]},
  {id: 'general', t: 'Универсальный', kw: '', layout: 's',
    font: 'Bricolage+Grotesque:wght@600;800&family=Manrope:wght@400;600', fd: 'Bricolage Grotesque', dw: 800, fb: 'Manrope',
    c: {bg: '#FFFFFF', card: '#F6F8FB', ink: '#0F172A', muted: '#475569', line: '#E2E8F0', acc: '#1E4FD6', accInk: '#FFFFFF'},
    greet: '', gl: '', tag: {pl: 'Usługi {loc}', en: 'Services in {city}'},
    items: [['Konsultacja', 'Consultation', 100], ['Usługa standard', 'Standard service', 200], ['Pakiet rozszerzony', 'Extended package', 450]]}
];
// Стиль по категории сегмента, если по названию не угадали.
P.SEG_STYLE = {horeca: 'asian', beauty: 'beauty', services: 'general', build: 'build', tgshop: 'general', b2b: 'general', discord: 'general', other: 'general'};

P.DEFAULTS = {
  profile: {brand: 'syncae', about: 'Strony internetowe i boty Telegram dla firm na Śląsku', portfolio: 'https://t.me/syncaeoff', phone: '', email: ''},
  goals: {outings: 2, visits: 8, offers: 1, month: 6000},
  prices: {},
  cases: {},
  hunt: {},
  aiEnabled: true
};
