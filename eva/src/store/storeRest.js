export default {
  async rest(formData, searchFrom, restAuth, idDash) {
    const response = await fetch('/api/makejob', {
      // сперва нужно подать post запрос
      method: 'POST',
      body: formData,
      // mode: 'no-cors'
    }).catch((error) => {
      console.log(error);
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

            let timeOut = setTimeout(async function tick() {
              if (status === 'failed') {
                result.push('failed');
                clearTimeout(timeOut);
              }

              // отправляем get запрос с параметрами ИД

              responseGet = await fetch(
                `/api/checkjob?original_otl=${encodeURIComponent(
                  searchFrom.otl,
                )}&tws=${searchFrom.tws}&twf=${searchFrom.twf}&cache_ttl=${
                  searchFrom.cache_ttl
                }`,
                {
                  method: 'GET',
                  //  mode: 'no-cors'
                },
              )
                .then((data) => {
                  resEvents = data;
                  return data.status;
                })
                .catch((error) => {
                  console.log(error);
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
                  console.log(status);
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
                        const allDataLocal = [];

                        prom.text().then((dataitself) => {
                          if (shema === i) {
                            shema = dataitself;
                          }
                          // все это потому что там не совсем json,
                          // а строка состоящая из строка в json
                          dataitself.split('\n').forEach((dataPeace) => {
                            if (dataPeace !== '') {
                              try {
                                allDataLocal.push(JSON.parse(dataPeace));
                              } catch (error) {
                                console.log(error);
                              }
                            }
                          });
                          resultPromResolve(allDataLocal);
                        });
                      }));

                    resultProm = await Promise.all(dataProm);
                    let resolveData = [];

                    resultProm.forEach((item) => {
                      if (item.length !== 0) {
                        resolveData = [...item];
                      }
                    });

                    if (shema != null && shema !== '') {
                      const keys = shema.match(/`[^`.]+`/g).map((item) => item.replace(/`/g, ''));
                      const values = shema
                        .replace(/`[^`.]+`/g, '')
                        .replace(/\s*/g, '')
                        .split(',');
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
              if (idDash === 'papers') {
                resolveMain({ data: allData, sid: cycleResult.cid });
              } else {
                resolveMain(allData);
              }
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

    const response = await fetch('/api/load/svg', {
      // сперва нужно подать post запрос
      method: 'POST',
      body: svg,
      // mode: 'no-cors'
    }).catch((error) => {
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
  async loadPaper(paper, restAuth) {
    let data = [];

    const response = await fetch('/api/eva/reports/load', {
      // сперва нужно подать post запрос
      method: 'POST',
      body: paper,
      // mode: 'no-cors'
    }).catch((error) => {
      restAuth.putLog(
        `Загрузить отчет не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
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
          if (data.status === 'success') {
            restAuth.putLog(
              `Отчет загружен успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
            );
          } else {
            restAuth.putLog(
              `Загрузить отчет не удалось.&nbsp;&nbsp;status: ${data.status}&nbsp;&nbsp;error: ${data.description}`,
            );
          }
        })
        .catch((error) => {
          restAuth.putLog(
            `Загрузить отчет не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Загрузить отчет не удалось..&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getAllPaper(restAuth) {
    let data = [];
    const response = await fetch('/api/eva/reports/getAll').catch((error) => {
      restAuth.putLog(
        `Список отчетов получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
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
            `Список отчетов успешно получен.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Список отчетов получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Список отчетов получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return data;
  },
  async getPaper(restAuth, fileData) {
    let result = [];

    const response = await fetch('/api/eva/reports/get', {
      method: 'POST',
      body: fileData,
      // mode: 'no-cors'
    }).catch((error) => {
      restAuth.putLog(
        `Отчет получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
      );
      return response;
    });
    if (response.status === 200) {
      // если получилось
      await response
        .text()
        .then((res) => {
          // переводим полученные данные из json в нормальный объект
          result = JSON.parse(res);
          if (result.status === 'success') {
            restAuth.putLog(
              `Отчет успешно получен.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
            );
          } else {
            restAuth.putLog(
              `Отчет получить не удалось.&nbsp;&nbsp;status: ${result.status}&nbsp;&nbsp;error: ${result.description}`,
            );
          }
        })
        .catch((error) => {
          restAuth.putLog(
            `Отчет получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Отчет получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
      );
      return response;
    }

    return result;
  },
  async getPaperVis(restAuth, url) {
    let data = [];

    const response = await fetch(`${url}`).catch((error) => {
      restAuth.putLog(
        `Отчет для визуализации получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
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
            `Отчет для визуализации успешно получен.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`,
          );
        })
        .catch((error) => {
          restAuth.putLog(
            `Отчет для визуализации получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`,
          );
        });
    } else {
      restAuth.putLog(
        `Отчет для визуализации получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`,
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
};
