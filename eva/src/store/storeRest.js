import { mdiNetwork } from '@mdi/js';
import Vue from 'vue';

export default {
  store: null,
  setStore(store) {
    this.store = store;
  },
  async rest(formData, searchFrom, restAuth, idDash) {
    const jwt = Vue.$jwt.decode();
    formData.set('username', jwt.username);
    const response = await fetch('/api/makejob', {
      // сперва нужно подать post запрос
      method: 'POST',
      body: formData,
      // mode: 'no-cors'
    }).catch((error) => {
      console.error(error);
      restAuth.putLog(
        `Запрос выполнить не удалось.&nbsp;&nbsp;Ошибка: ${error}`,
      );
    });
    if (response && response.status === 200) {
      // если получилось

      return response.json().then((answer) => {
        if (answer.status !== 'success') {
          restAuth.putLog(
            `Запрос ${searchFrom.sid} запустился с ошибкой.&nbsp;&nbsp;status: ${answer.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${answer.error}`,
          );
          return [];
        }
        return new Promise((resolveMain) => {
          restAuth.putLog(
            `Запрос ${searchFrom.sid} запустился успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );

          let responseGet = ''; // ответ от сервера после запроса в виде статуса
          let resEvents = {}; // данные полученные от RESTа
          let status = ''; // стату операции перевода данных из json в нормальный вид
          let result = []; // собственно сам результат всех манипуляций

          let countNoCache = 0; // УДАЛИТЬ

          const cycle = new Promise((resolve) => {
            // let i = 0;

            const { store } = this;

            let timeOut = setTimeout(async function tick() {
              if (status === 'failed') {
                result.push('failed');
                clearTimeout(timeOut);
              }

              // отправляем get запрос с параметрами ИД

              responseGet = await fetch(
                '/api/checkjob',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    original_otl: searchFrom.otl,
                    tws: searchFrom.tws,
                    twf: searchFrom.twf,
                    cache_ttl: searchFrom.cache_ttl,
                  }),
                  //  mode: 'no-cors'
                },
              )
                .then((data) => {
                  resEvents = data;
                  return data.status;
                })
                .catch((error) => {
                  console.error(error);
                  restAuth.putLog(
                    `Запрос выполнить не удалось.&nbsp;&nbsp;Ошибка: ${error}`,
                  );
                  status = 'failed';
                  result = [];
                  clearTimeout(timeOut);
                });
              // если запрос не прошел то вернем ответ с ошибкой
              if (responseGet !== 200 && responseGet !== 0) {
                status = 'failed';
                result.push('failed');
                clearTimeout(timeOut);
                // если прошёл
              } else {
                result = await resEvents.json().then((res) => {
                  // переводим полученные данные из json в нормальный объект
                  restAuth.putLog(
                    `Запрос ${
                      searchFrom.sid
                    } в процессе выполнения.&nbsp;&nbsp;status: ${
                      res.status
                    }&nbsp;&nbsp;url: ${decodeURIComponent(resEvents.url)}`,
                  );
                  status = res.status;
                  if (store && res?.notifications) {
                    store.commit('notify/addNotifications', res?.notifications);
                  }
                  // console.log(status);
                  return res;
                });
              }
              if (status === 'nocache' || status === 'notfound') {
                // УДАЛИТЬ
                countNoCache += 1;
              }
              if (
                status === 'success'
                  || status === 'failed'
                  || countNoCache > 10
              ) {
                clearTimeout(timeOut);
                resolve(result);
              } else {
                timeOut = setTimeout(tick, 2000);
              }
            }, 0);
          });

          cycle.then(async (cycleResult) => {
            if (status === 'failed') {
              restAuth.putLog(
                `Запрос ${searchFrom.sid} выполнился с ошибкой.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${cycleResult.error};`,
              );
              resolveMain([]);
            } else if (status === 'notfound') {
              restAuth.putLog(
                `Запрос ${searchFrom.sid} выполнился с ошибкой.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${cycleResult.error};`,
              );
              resolveMain([]);
            } else if (status === 'nocache') {
              restAuth.putLog(
                `Запрос ${searchFrom.sid} выполнился с ошибкой.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${cycleResult.error};`,
              );
              resolveMain([]);
            } else {
              restAuth.putLog(
                `Запрос ${searchFrom.sid} выполнился успешно.&nbsp;&nbsp;status: ${status}`,
              );

              const dataResponse = await fetch(
                `/api/getresult?cid=${cycleResult.cid}`,
              ).catch((error) => {
                restAuth.putLog(
                  `Получить данные из запроса ${searchFrom.sid} не удалось.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${error};`,
                );
                resolveMain([]);
              });

              restAuth.putLog(
                `Данные из запроса ${searchFrom.sid} получены успешно.&nbsp;&nbsp;status: ${dataResponse.status}&nbsp;&nbsp;url: ${dataResponse.url}`,
              );

              const allData = new Promise((resolve) => {
                dataResponse.json().then(async (res) => {
                  if (res.status === 'success') {
                    restAuth.putLog(
                      `Данные из запроса ${
                        searchFrom.sid
                      }:&nbsp;&nbsp;${res.data_urls.join(' ; ')}`,
                    );

                    let shema = null;
                    const promise = res.data_urls.map((item, i) => {
                      if (item.indexOf('SCHEMA') !== -1) {
                        shema = i;
                      }
                      return fetch(`/${item}`);
                    });

                    let resultProm = await Promise.all(promise);

                    const dataProm = resultProm
                      .map((prom, i) => new Promise((resultPromResolve) => {
                        prom.text().then((dataitself) => {
                          if (shema === i) {
                            shema = dataitself;
                          }
                          const resultData = [];
                          // все это потому что там не совсем json,
                          // а строка состоящая из строка в json
                          dataitself.split('\n').forEach((dataPeace) => {
                            if (dataPeace[0] === '{') {
                              try {
                                resultData.push(JSON.parse(dataPeace));
                              } catch (error) {
                                console.error(error);
                              }
                            }
                          });
                          resultPromResolve(resultData);
                        });
                      }));

                    resultProm = await Promise.all(dataProm);
                    const resolveData = [];

                    resultProm.forEach((item) => {
                      if (item.length !== 0) {
                        resolveData.push(...item);
                      }
                    });

                    if (shema != null && shema !== '') {
                      const keys = [];
                      const values = [];
                      try {
                        shema
                          .replace('``', '＂')
                          .match(/`([^`]+)`\s(\w+(\([\d,]+)?)[^,]/g)
                          .forEach((str) => {
                            const [, key, value] = str.match(/^`(.*)`\s(.*)$/);
                            keys.push(key.replace('＂', '`'));
                            values.push(value);
                          });
                      } catch (err) {
                        console.warn(`%cНе удалось прочитать схему данных! _SCHEMA: %c${shema}`, 'font-weight: bold', 'font-weight: normal');
                        console.error(err);
                        // eslint-disable-next-line no-alert
                        this.store.commit('notify/addNotification', {
                          id: 'schema-error-reading',
                          icon: mdiNetwork,
                          message: 'Не удалось прочитать схему данных',
                          read: false,
                          type: 'error',
                        });
                      }

                      shema = {};
                      keys.forEach((item, i) => {
                        shema[item] = values[i];
                      });

                      resolveData.forEach((item, i) => {
                        const resolveDataItemKeys = Object.keys(item);
                        Object.keys(shema).forEach((itemSchem) => {
                          if (!resolveDataItemKeys.includes(itemSchem)) {
                            resolveData[i][itemSchem] = null;
                          }
                        });
                      });
                    }

                    restAuth.putLog(
                      `Все данные из запроса ${searchFrom.sid} обработаны  успешно.&nbsp;&nbsp;status: ${res.status}`,
                    );
                    if (idDash === 'reports') {
                      resolve({ data: resolveData, shema, cid: result.cid });
                    } else {
                      resolve(resolveData);
                    }
                  } else {
                    restAuth.putLog(
                      `Обработать данные из запроса ${searchFrom.sid} не удалось.&nbsp;&nbsp;status: ${res.status}&nbsp;&nbsp;Ошибка: ${res.error};`,
                    );
                    resolve([]);
                  }
                });
              });
              resolveMain(allData);
            }
          });
        });
      });
    }
    restAuth.putLog(
      `Запрос ${searchFrom.sid} выполнить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
    );
    return [];
  },
  async getGroups(restAuth) {
    let data = [];
    const response = await fetch('/api/user/groups').catch((error) => {
      restAuth.putLog(
        `Получить группы не удалось.&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return [];
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res.data;
          restAuth.putLog(
            `Группы получены.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Получить группы не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Получить группы не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
      );
      return response;
    }
    return data;
  },
  async getDashs(id, restAuth) {
    let data = [];
    const response = await fetch(`/api/group/dashs?id=${id}`).catch((error) => {
      restAuth.putLog(
        `Получить дашборды не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return [];
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res.data;
          restAuth.putLog(
            `Дашборды получены.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Получить дашборды не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Получить дашборды не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
      );
      return response;
    }
    return data;
  },
  async getState(id, restAuth) {
    let data = [];
    const response = await fetch(`/api/dash?id=${id}`).catch((error) => {
      restAuth.putLog(
        `Состояние приложения получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });

    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res.data;
          restAuth.putLog(
            `Состояние приложения успешно получено.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Состояние приложения получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Состояние приложения получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }
    return data;
  },
  async getSvg(svg, restAuth) {
    let data = [];
    const response = await fetch(`/svg/${svg}`).catch((error) => {
      restAuth.putLog(
        `Изображение получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Изображение успешно получено.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Изображение получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Изображение получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async setSvg(svg, restAuth) {
    let data = [];

    const response = await fetch(`/svg/${svg}`).catch((error) => {
      restAuth.putLog(
        `Изображение отправить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });

    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Изображение успешно отправлено.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Изображение отправить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Изображение отправить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async exportDash(dash, restAuth) {
    let data = [];

    const response = await fetch(
      `/api/${dash.element}/export?ids=${dash.ids}`,
    ).catch((error) => {
      restAuth.putLog(
        `Экспортировать не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Экспорт прошел успешно успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Экспортировать  не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Экспортировать  не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async importDash(dash, restAuth) {
    let data = [];

    const response = await fetch(`/api/${dash.element}/import`, {
      // сперва нужно подать post запрос
      method: 'POST',
      body: dash.formData,
      // mode: 'no-cors'
    }).catch((error) => {
      restAuth.putLog(
        `Импортировать дашборд ${dash.idDash} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Дашборд ${dash.idDash} импортирован успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Импортировать дашборд ${dash.idDash} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Импортировать дашборд ${dash.idDash} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getThemeBack(restAuth) {
    let data = [];
    const response = await fetch('/api/user/setting').catch((error) => {
      restAuth.putLog(
        `Настройки пользователя получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Настройки пользователя получены успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Настройки пользователя получить не удалось&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Настройки пользователя получить не удалось&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }
    return data;
  },
  async setThemeBack(theme, restAuth) {
    let data = [];

    const response = await fetch('/api/user/setting', {
      // сперва нужно подать post запрос
      method: 'PUT',
      body: theme,
      // mode: 'no-cors'
    }).catch((error) => {
      restAuth.putLog(
        `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Настройки пользователя обновились успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getDashByName(param, restAuth) {
    let data = [];
    const response = await fetch(
      `/api/dashByName?name="${param.name}"&idgroup=${param.idgroup}`,
    ).catch((error) => {
      restAuth.putLog(
        `Получить дашборд ${param.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return [];
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res.data;
          restAuth.putLog(
            `Дашборд ${param.name} получен.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Получить дашборд ${param.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Получить дашборд ${param.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
      );
      return response;
    }
    return data;
  },
  async setLoadingSvg(param, restAuth) {
    let data = [];

    const response = await fetch('/api/load/svg', {
      // сперва нужно подать post запрос
      method: 'POST',
      body: param.formData,
    }).catch((error) => {
      restAuth.putLog(
        `Загрузить файл ${param.file.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Загрузка файла ${param.file.name} прошла успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Загрузить файл ${param.file.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Загрузить файл ${param.file.name} не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getUserSettings(restAuth, id) {
    let data = [];
    const response = await fetch(`/api/user/setting?user_id=${id}`).catch((error) => {
      restAuth.putLog(
        `Настройки пользователя получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .json()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Настройки пользователя получены успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Настройки пользователя получить не удалось&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Настройки пользователя получить не удалось&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }
    return data;
  },
  async setUserSettings(settings, restAuth) {
    let data = [];

    const response = await fetch('/api/user/setting', {
      // сперва нужно подать post запрос
      method: 'PUT',
      body: settings,
      // mode: 'no-cors'
    }).catch((error) => {
      restAuth.putLog(
        `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          data = res;
          restAuth.putLog(
            `Настройки пользователя обновились успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Настройки пользователя обновить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getSettings() {
    return fetch('/api/settings')
      .then((res) => {
        if (res.status === 409) {
          // ответ 409 когда нет сохраненных настроек
          return Promise.resolve({ settings: [] });
        }
        if (res.status !== 200) {
          throw new Error(`Bad response from GET /api/settings, status: ${res.status} (${res.statusText})`);
        }
        return res.json();
      })
      .then((res) => res?.settings
        .map(({ id, name, body }) => ({ id, name, items: JSON.parse(body) })));
  },
  async saveSettings(settings, restAuth) {
    return Promise.all(settings.map((item) => {
      const { id, name, body } = item;
      return fetch('/api/settings', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ id, name, body: JSON.stringify(body) }),
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return {
          id,
          name,
          body,
          response,
        };
      }).catch((err) => {
        restAuth.putLog(
          `Общие настройки сохранить не удалось.&nbsp;&nbsp;status: ${err.status}&nbsp;&nbsp;url: ${err.url}&nbsp;&nbsp;statusText: ${err.statusText}`,
        );
        return Promise.reject(err);
      });
    }));
  },
};
