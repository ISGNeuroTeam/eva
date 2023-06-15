// eslint-disable-next-line consistent-return
onmessage = async (event) => {
  const { searchFrom } = event.data;
  // console.log('[run] worker: %s', searchFrom.sid/*, event.data*/);
  const formData = new FormData();
  Object.keys(event.data.formData).forEach((key) => {
    formData.append(key, event.data.formData[key]);
  });

  const response = await fetch('/api/makejob', {
    method: 'POST',
    body: formData,
  });
  const answer = await response.json();
  const { sid } = searchFrom;
  const { url, statusText } = response;
  let { status } = response;

  if (response.status !== 200) {
    return postMessage({
      url,
      status,
      statusText,
      answer,
      error: `Запрос ${sid} выполнить не удалось.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;url: ${url}`,
    });
  }

  if (answer.status !== 'success') {
    return postMessage({
      url,
      status,
      statusText,
      answer,
      error: `Запрос ${sid} запустился с ошибкой.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;url: ${url}&nbsp;&nbsp;Ошибка: ${answer.error}`,
    });
  }

  const log = [];
  const notifications = [];
  log.push([
    new Date(),
    `Запрос ${sid} запустился успешно.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;url: ${url}`,
  ]);

  let responseGet = ''; // ответ от сервера после запроса в виде статуса
  let resEvents = {}; // данные полученные от RESTа
  let result = []; // собственно сам результат всех манипуляций

  const cycle = new Promise((resolve) => {
    let timeOut = null;
    // eslint-disable-next-line func-names
    const tick = async function () {
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
          log.push([
            new Date(),
            `Запрос выполнить не удалось.&nbsp;&nbsp;Ошибка: ${error}`,
          ]);
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
          log.push([
            new Date(),
            `Запрос ${
              searchFrom.sid
            } в процессе выполнения.&nbsp;&nbsp;status: ${
              res.status
            }&nbsp;&nbsp;url: ${decodeURIComponent(resEvents.url)}`,
          ]);
          status = res.status;
          if (res?.notifications) {
            notifications.push(...res.notifications);
          }
          return res;
        });
      }
      if (
        status === 'success'
        || status === 'failed'
      ) {
        clearTimeout(timeOut);
        resolve(result);
      } else {
        timeOut = setTimeout(tick, 500);
      }
    };
    tick();
  });

  cycle.then(async (cycleResult) => {
    let errorMsg = '';
    if (['failed', 'notfound', 'nocache'].includes(status)) {
      return postMessage({
        url,
        status,
        statusText,
        answer,
        error: `Запрос ${searchFrom.sid} выполнился с ошибкой.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${cycleResult.error};`,
        log,
      });
    }
    log.push([
      new Date(),
      `Запрос ${searchFrom.sid} выполнился успешно.&nbsp;&nbsp;status: ${status}`,
    ]);

    const dataResponse = await fetch(`/api/getresult?cid=${cycleResult.cid}`, {
      cache: 'no-store',
    }).catch((error) => {
      errorMsg = error;
    });
    if (errorMsg) {
      return postMessage({
        url,
        status,
        statusText,
        answer,
        log,
        notifications,
        error: `Получить данные из запроса ${searchFrom.sid} не удалось.&nbsp;&nbsp;status: ${status}&nbsp;&nbsp;Ошибка: ${errorMsg};`,
      });
    }

    log.push([
      new Date(),
      `Данные из запроса ${searchFrom.sid} получены успешно.&nbsp;&nbsp;status: ${dataResponse.status}&nbsp;&nbsp;url: ${dataResponse.url}`,
    ]);
    let schema = null;
    const allData = new Promise((resolve) => {
      dataResponse.json().then(async (res) => {
        if (res.status === 'success') {
          log.push([
            new Date(),
            `Данные из запроса ${
              searchFrom.sid
            }:&nbsp;&nbsp;${res.data_urls.join(' ; ')}`,
          ]);

          const promise = res.data_urls.map((item, i) => {
            if (item.indexOf('SCHEMA') !== -1) {
              schema = i;
            }
            return fetch(`/${item}`, { cache: 'no-store' });
          });

          let resultProm = await Promise.all(promise);

          const dataProm = resultProm
            .map((prom, i) => new Promise((resultPromResolve) => {
              prom.text().then((dataitself) => {
                if (schema === i) {
                  schema = dataitself;
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
          const resolveData = resultProm.reduce((data, item) => {
            data = data.concat(item);
            return data;
          }, []);

          if (schema != null && schema !== '') {
            const keys = [];
            const values = [];
            try {
              schema
                .replace('``', '＂')
                .match(/`([^`]+)`\s(\w+(\([\d,]+)?)[^,]/g)
                .forEach((str) => {
                  const [, key, value] = str.match(/^`(.*)`\s(.*)$/);
                  keys.push(key.replace('＂', '`'));
                  values.push(value);
                });
            } catch (err) {
              console.warn(`%cНе удалось прочитать схему данных! _SCHEMA: %c${schema}`, 'font-weight: bold', 'font-weight: normal');
              console.error(err);
              notifications.push({
                id: 'schema-error-reading',
                message: 'Не удалось прочитать схему данных',
                read: false,
                type: 'error',
              });
            }

            schema = {};
            keys.forEach((item, i) => {
              schema[item] = values[i];
            });

            resolveData.forEach((item, i) => {
              const resolveDataItemKeys = Object.keys(item);
              Object.keys(schema).forEach((itemSchem) => {
                if (!resolveDataItemKeys.includes(itemSchem)) {
                  resolveData[i][itemSchem] = null;
                }
              });
            });
          }

          log.push([
            new Date(),
            `Все данные из запроса ${searchFrom.sid} обработаны  успешно.&nbsp;&nbsp;status: ${res.status}`,
          ]);
          resolve(resolveData);
        } else {
          log.push([
            new Date(),
            `Обработать данные из запроса ${searchFrom.sid} не удалось.&nbsp;&nbsp;status: ${res.status}&nbsp;&nbsp;Ошибка: ${res.error};`,
          ]);
          resolve([]);
        }
      });
    });
    delete answer.data;
    return postMessage({
      url,
      status,
      statusText,
      answer,
      data: await allData,
      log,
      notifications,
      schema,
    });
  });
};
