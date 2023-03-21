async function putLogIntoBack(text) {
  let textForBack = text.replace(/&nbsp;/g, ' ');
  textForBack = textForBack.replace(/<br>/g, '\n');
  const response = await fetch('/api/logs/save', {
    // сперва нужно подать post запрос
    method: 'POST',
    body: JSON.stringify({ log: textForBack }),
  });

  return response;
}

export default {
  async getEssenceList(role, create) {
    let data = [];
    let response = null;
    if (create) {
      response = await fetch(`/api/user/${role}?names_only=1`).catch(
        (error) => {
          this.putLog(
            `Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
          return response;
        },
      );
    } else {
      response = await fetch(`/api/${role}`).catch((error) => {
        this.putLog(
          `Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
        );
        // return response;
      });
    }
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res.data;
          this.putLog(
            `Список всех данных получен успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          this.putLog(
            `Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      this.putLog(
        `Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }
    return data;
  },
  async getEssence(essence, id) {
    let data = [];

    const response = await fetch(`/api/${essence}?id=${id}`).catch((error) => {
      this.putLog(
        `Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return data;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          this.putLog(
            `Данные для элемента получены успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          this.putLog(
            `Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      this.putLog(
        `Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }
    return data;
  },
  async setEssence(data) {
    // сперва нужно подать post запрос
    const response = await fetch(`/api/${data.essence}`, {
      method: data.method,
      body: data.formData,
    }).catch((error) => {
      this.putLog(
        `Сохранить элемент не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка:${error}`,
      );
      return response;
    });
    this.putLog(
      `Элемент сохранен успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
    );
    return response;
  },
  async deleteEssence(data) {
    // сперва нужно подать post запрос
    const response = await fetch(`/api/${data.essence}?id=${data.id}`, {
      method: 'DELETE',
    }).catch((error) => {
      this.putLog(
        `Удалить элемент не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });

    this.putLog(
      `Элемент удален успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
    );

    return response;
  },
  saveLogIntoBack(text) {
    return putLogIntoBack(text);
  },

  // функция которая кладет логи в локальную бд - IndexedDB
  // и на рест после определенной заполненности
  putLog(text, now = new Date()) {
    // возвращаем промис, потому что записи происходят асинхронно
    return new Promise((resolve) => {
      // переменная в которой будет лежать объект подключения к базе данных
      let db = null;

      // функция для оработки данных и правильной записи оных в бд
      function putTransaction(oldText, localText, logs) {
        // функция которая проверяет нужно число и преобразует его
        function checkZero(number) {
          // если число меньше 10
          if (number < 10) {
            // то присвоем ей ноль вначале
            return `0${number}`;
          }
          // а так просто вернем число
          return number;
        }

        // получаем дату и время
        // const now = new Date();
        // приводим дату и время в нормальный вид, по сути добовляя нули где надо
        const date = `${checkZero(now.getHours())}:${checkZero(
          now.getMinutes(),
        )}:${checkZero(now.getSeconds())} ${now.getDate()}-${checkZero(
          now.getMonth() + 1,
        )}-${checkZero(now.getFullYear())}`;
        // создаем наш лог в виде даты, текущего лога и всего того что у же там было
        const newText = `${date}&nbsp;&nbsp;${localText}<br>${oldText}`;

        // кладем этот лог по ключу front
        const front = logs.put(newText, 'front');

        // если не поулчилось, сообщим об этом
        front.onerror = () => {
          console.error('Ошибка', front.error);
        };

        // дальше получаем то что лежит по ключу back то есть тот лог что будем отдавать на бэк
        const back = logs.get('back');
        // если данные получены успешно
        back.onsuccess = () => {
          // составляем строку лога для back в виде даты,
          // текущего лога, и всего что там было до этого
          const newTextBack = `${date}&nbsp;&nbsp;${localText}<br>${back.result}`;

          // кладем этот лог в бд по ключу back
          const backPut = logs.put(newTextBack, 'back');

          // если не поулчилось, сразу сообщим об этом
          backPut.onerror = () => {
            console.error('Ошибка', backPut.error);
          };

          // а если положии успешно то идем дальше
          backPut.onsuccess = () => {
            // получаем  данные по ключу count он отвечает за счетчик сколько всего записей было
            // уже занесено после последнего обновления
            const count = logs.get('count');

            // если успешно получили данные
            count.onsuccess = () => {
              // смотрим если занесли уже больше 50 записей
              if (count.result > 50) {
                // то очищаем счетчик в бд
                logs.put(0, 'count');
                // и вызываем метод который положит сформировавшийся лог уже на рест
                putLogIntoBack(back.result);
                // так же очищаем логи по ключу back в бд
                logs.put('', 'back');
                // и на этом вся функция работы  с бд заканчивается
                resolve('success');
                // если логи еще не накопились
              } else {
                // то смотрим, если логи уже были какие то
                if (count.result > 0) {
                  // то увеличиваем существующий счетчик на единицу
                  logs.put(parseInt(count.result, 10) + 1, 'count');
                  // если запись первая
                } else {
                  // то присваиваем счетчику единицу
                  logs.put(1, 'count');
                }
                // это сделано для того, чтобы избежать оишбок на предсет того,
                // если бд вообще толко создалась, то что лежит по ключу count?

                // и на этом вся функция работы  с бд заканчивается
                resolve('success');
              }
            };

            count.onerror = () => {
              // а если счетчик получить не удалось то  сообщим об этом
              console.error('Ошибка', count.error);
            };
          };
        };

        // еслиданные по ключу back поулчить не удалось , сообщим об этом
        back.onerror = () => {
          console.error('Ошибка', back.error);
        };
      }

      // функция работы с базой данных
      function setTransaction(localDb, localText) {
        // открываем таблицу logs для записи и чтения
        const transaction = localDb.transaction('logs', 'readwrite');

        // получаем хранилище объектов для работы с ним
        const logs = transaction.objectStore('logs');

        // получаем данные лежащие по ключу front то есть те логи, что пишутся на фронте
        const query = logs.get('front');

        // если все успешно
        query.onsuccess = () => {
          // переменная в которой будут храниться данные из бд
          let oldText = '';
          // если данные существуют
          if (query.result) {
            // то заносим их в переменную
            oldText = query.result;
          }
          // и вызываем метод, который обработает данные и выполнит дальнейшие операции с бд
          putTransaction(oldText, localText, logs);
        };

        // если получить данные не удалось  - сообщим об этом
        query.onerror = () => {
          console.error('Ошибка', query.error);
        };
      }

      // октрываем базу данных  IndexedDB
      const request = indexedDB.open('EVA', 1);

      // сразу отлавливаем если есть ошибка при соеденении с бд
      request.onerror = (event) => {
        console.error('error:', event);
      };

      // если база только создалась
      request.onupgradeneeded = (event) => {
        // console.log('create');
        // собственно помещаем объект базы данных в переменную, что заготовили ранее
        db = event.target.result;
        // если там еще нет таблицы с логами (а по идее нет, но на всякий случай проверим)
        if (!db.objectStoreNames.contains('logs')) {
          // то создаем таблицу логов
          db.createObjectStore('logs');
          // и заодно создаем таблицу для серчей
          // чтобы потом избежать проблем с индексами базы данных
          db.createObjectStore('searches');
        }

        // если успешно соеденились с бд
        request.onsuccess = () => {
          // переопределям нашу переменную
          db = request.result;

          // вызываем специальный метод транзакции для работы с базой данных
          setTransaction(db, text);
        };
      };

      // тут немного дублируем, потому что в случае если только создалась бд
      // и в случае если уже есть она, все равно нужно с ней работать

      // если успешно соеденились с бд
      request.onsuccess = () => {
        // переопределям нашу переменную
        db = request.result;

        // вызываем специальный метод транзакции для работы с базой данных
        setTransaction(db, text);
      };

      // если успешно соеденились с бд
      request.onerror = () => {
        console.error('Ошибка', request.error);
      };
    });
  },
  getLog(side) {
    let db = null;

    const request = indexedDB.open('EVA', 1);

    request.onerror = (event) => {
      console.error('error: ', event);
    };

    request.onupgradeneeded = (event) => {
      // console.log('create');
      db = event.target.result;
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs');
      }

      request.onsuccess = () => {
        db = request.result;
        // console.log(`successEvent: ${db}`);
      };
    };

    return new Promise((resolve) => {
      request.onsuccess = () => {
        db = request.result;

        const transaction = db.transaction('logs'); // (1)

        // получить хранилище объектов для работы с ним
        const logs = transaction.objectStore('logs'); // (2)

        // (3) return
        const query = logs.get(side);

        // (4)
        query.onsuccess = () => {
          if (query.result) {
            resolve(query.result);
          }
        };
        query.onerror = () => {
          console.error('Ошибка', query.error);
        };
      };
    });
  },

  deleteLog() {
    return new Promise((resolve) => {
      let db = null;

      const request = indexedDB.open('EVA', 1);

      function setTransaction(localDb) {
        // (1)
        const transaction = localDb.transaction('logs', 'readwrite');

        // (2)
        // получить хранилище объектов для работы с ним
        const logs = transaction.objectStore('logs');

        logs.clear();
        resolve('clear');
      }

      request.onerror = (event) => {
        console.error('error:', event);
      };

      request.onupgradeneeded = (event) => {
        // console.log('create');
        db = event.target.result;
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs'); // create it
        }

        request.onsuccess = () => {
          db = request.result;
          setTransaction(db);
        };
      };

      request.onsuccess = () => {
        db = request.result;

        setTransaction(db);
      };
    });
  },
};
