// Вымышленные лиды для локальной проверки и скриншотов. Совпадения с настоящими заведениями случайны.
(function () {
  const T = '2026-11-14T12:00:00.000Z';
  const L = (id, name, kind, segment, city, address, rating, tags, now, pitch, extra) => Object.assign({
    id, name, kind, segment, city, address, rating, tags, now, pitch,
    site: '', maps: '', priority: 2, status: 'new', lang: false, source: 'Демо-данные',
    notes: '', next: '', created: T, updated: T
  }, extra || {});
  window.__SEED = [
    L('banh-mi-corner', 'Bánh Mì Corner', 'Вьетнамская кухня', 'horeca', 'Katowice', 'Mariacka 7', '4,6 · 412', ['fb', 'noorder'],
      'В Google стоит страница Facebook, навынос заказывают через агрегаторы.', 'Сайт с меню и заказом на самовывоз без комиссии.', {priority: 1}),
    L('kimchi-story', 'Kimchi Story', 'Корейская кухня', 'horeca', 'Katowice', 'Staromiejska 21', '4,8 · 655', ['insta', 'nobooking', 'noorder'],
      'Только Instagram, ни брони, ни заказа из карточки.', 'Сайт с меню на трёх языках и онлайн-бронь столиков.', {priority: 1}),
    L('hinkali-dom', 'Hinkali Dom', 'Грузинская кухня', 'horeca', 'Gliwice', 'Rynek 9', '4,5 · 287', ['nosite'],
      'Своего сайта нет, в карточке только телефон.', 'Простой сайт с меню и картой.'),
    L('ramen-kumo', 'Ramen Kumo', 'Рамен', 'horeca', 'Katowice', 'Pocztowa 3', '4,7 · 1380', ['rented'],
      'Меню живёт на арендованном конструкторе с подпиской.', 'Свой домен и сайт с листом ожидания на вечер.'),
    L('smak-kyjowa', 'Smak Kyjowa', 'Украинская кухня', 'horeca', 'Sosnowiec', 'Modrzejowska 14', '4,8 · 190', ['nosite', 'noorder'],
      'Ни сайта, ни онлайн-заказа.', 'Сайт на польском, украинском и английском с заказом на самовывоз.', {lang: true}),
    L('wok-and-roll', 'Wok & Roll Bar', 'Азиатская кухня', 'horeca', 'Sosnowiec', 'Warszawska 30', '4,2 · 830', ['aggregator'],
      'Ссылка в Google ведёт в приложение доставки.', 'Свой сайт с заказом и замена ссылки в карточке.'),
    L('forno-nero', 'Pizzeria Forno Nero', 'Пиццерия', 'horeca', 'Gliwice', 'Zwycięstwa 18', '4,4 · 520', ['fb', 'nobooking'],
      'Facebook вместо сайта, бронь только по телефону.', 'Сайт с меню и бронью столиков.'),
    L('ziarenko', 'Kawiarnia Ziarenko', 'Кофейня', 'horeca', 'Katowice', '3 Maja 11', '4,9 · 210', ['insta'],
      'Только Instagram, меню в сторис.', 'Сайт-визитка с меню и часами работы.', {priority: 3}),
    L('lumi-nails', 'Studio Paznokci Lumi', 'Маникюр', 'beauty', 'Katowice', 'Wawelska 4', '5,0 · 96', ['insta', 'nobooking'],
      'Запись через директ в Instagram.', 'Онлайн-запись с выбором мастера и времени.'),
    L('barber-kotwica', 'Barber Kotwica', 'Барбершоп', 'beauty', 'Gliwice', 'Dworcowa 25', '4,9 · 143', ['fb'],
      'Страница Facebook вместо сайта.', 'Сайт с ценами и онлайн-записью.'),
    L('kowal-bud', 'Remonty Kowal-Bud', 'Ремонт квартир', 'build', 'Sosnowiec', '3 Maja 40', '5,0 · 12', ['nosite'],
      'Сайта нет, в Google только карточка.', 'Сайт с ценами, калькулятором и заявками в Telegram.'),
    L('auto-tarnica', 'Auto Serwis Tarnica', 'Автосервис', 'services', 'Gliwice', 'Toszecka 60', '4,6 · 77', ['nosite'],
      'Сайта нет, запись по телефону.', 'Сайт с услугами и записью на время.', {priority: 3}),
    L('fizjo-ruch', 'Fizjo Ruch', 'Физиотерапия', 'services', 'Katowice', 'Kościuszki 52', '4,8 · 64', ['oldsite'],
      'Старый сайт, на телефоне не читается.', 'Новый сайт с онлайн-записью.'),
    L('sushi-matsu', 'Sushi Matsu', 'Суши', 'horeca', 'Katowice', 'Chorzowska 8', '4,3 · 340', ['rented', 'nobooking'],
      'Сайт на арендной платформе, брони нет.', 'Свой сайт с меню и бронью.'),
    L('burger-station', 'Burger Station', 'Бургерная', 'horeca', 'Katowice', 'Dworcowa 2', '4,1 · 2100', ['chain'],
      'Сеть, решения принимает центральный офис.', 'Сначала узнать, решает ли управляющий что-то сам.', {priority: 3})
  ];
})();
