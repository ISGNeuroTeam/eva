export default {

  async getEssenceList(role,create) {
    
    let data = [];
    let response = null;
    if (create) {
      response =  await fetch(`/api/user/${role}?names_only=1`)
        .catch (error => {
          this.putLog(`Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
          return response
        }) 
    } else {
      response =  await fetch(`/api/${role}`)
        .catch (error => {
          this.putLog(`Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
          return response
        }) 
    } 
    if (response.status == 200) {  // если получилось
      await response.json().then( res => {  // переводим полученные данные из json в нормальный объект
        data = res.data;
        this.putLog(`Список всех данных получен успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`);
      }).catch( error => {
        this.putLog(`Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
      })
    }  else {
      this.putLog(`Список всех данных получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`);
      return response
    }
    return data

  },
  async getEssence(essence,id) {
    let data = [];
    
    let response = await fetch(`/api/${essence}?id=${id}`)
      .catch (error => {
        this.putLog(`Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
        return data
      }) 
    if (response.status == 200) {  // если получилось
      await response.json().then( res => {  // переводим полученные данные из json в нормальный объект
        data = res; 
        this.putLog(`Данные для элемента получены успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`);
      }).catch( error => {
        this.putLog(`Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
      }) 
    }  else {
      this.putLog(`Данные для элемента получить не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`);
      return response
    }
    return data
  },
  async setEssence(data) {

    
    let response = await fetch(`/api/${data.essence}`, {  // сперва нужно подать post запрос
      method: data.method,
      // headers: {
      //     'Content-Type': 'application/json;charset=utf-8'
      // },
      body: data.formData,
    // mode: 'no-cors'
    })
      .catch (error => {
        this.putLog(`Сохранить элемент не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка:${error}`);
        return response
      })   
    this.putLog(`Элемент сохранен успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`);
    return response
  },
  async deleteEssence(data) {

    let response = await fetch(`/api/${data.essence}?id=${data.id}`, {  // сперва нужно подать post запрос
      method: 'DELETE',
    })
      .catch (error => {
        this.putLog(`Удалить элемент не удалось.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;Ошибка: ${error}`);
        return response
      })   

    this.putLog(`Элемент удален успешно.&nbsp;&nbsp;status: ${response.status}&nbsp;&nbsp;url: ${response.url}`);

    return response
  },
  saveLogIntoBack(text) {
    console.log(text)
    return putLogIntoBack(text)
  },

  putLog(text) {  // функция которая кладет логи в локальную бд - IndexedDB и на рест после определенной заполненности


    return new Promise((resolve, reject) => { // возвращаем промис, потому что записи происходят асинхронно

      let db = null;  // переменная в которой будет лежать объект подключения к базе данных

      let request = indexedDB.open("EVA",1); // октрываем базу данных  IndexedDB

      request.onerror = function(event) { // сразу отлавливаем если есть ошибка при соеденении с бд
        console.log('error:', event);
      };

    

      request.onupgradeneeded = event => { // если база только создалась
        console.log('create');
        db = event.target.result; // собственно помещаем объект базы данных в переменную, что заготовили ранее
        if (!db.objectStoreNames.contains("logs")) {   // если там еще нет таблицы с логами (а по идее нет, но на всякий случай проверим)
          db.createObjectStore("logs"); // то создаем таблицу логов
          db.createObjectStore('searches'); // и заодно создаем таблицу для серчей чтобы потом избежать проблем с индексами базы данных
        }

        request.onsuccess = event => { // если успешно соеденились с бд
          db = request.result; // переопределям нашу переменную 

          setTransaction(db,text); // вызываем специальный метод транзакции для работы с базой данных

        };

      }

      // тут немного дублируем, потому что в случае если только создалась бд и в случае если уже есть она, все равно нужно с ней работать

      request.onsuccess = event => { // если успешно соеденились с бд

        db = request.result;   // переопределям нашу переменную 

        setTransaction(db,text); // вызываем специальный метод транзакции для работы с базой данных

      };


      request.onerror = () => { // если успешно соеденились с бд

        console.log("Ошибка", request.error);

      };


      function setTransaction(db,text) {  // функция работы с базой данных
            

        let transaction = db.transaction("logs", "readwrite"); // открываем таблицу logs для записи и чтения

        let logs = transaction.objectStore("logs"); // получаем хранилище объектов для работы с ним

        let query = logs.get('front');   // получаем данные лежащие по ключу front то есть те логи, что пишутся на фронте

        query.onsuccess = event => {   // если все успешно
          let oldText = ''; // переменная в которой будут храниться данные из бд
          if (query.result) {  // если данные существуют
            oldText = query.result // то заносим их в переменную
          } 
          putTransaction(oldText,text,logs)  // и вызываем метод, который обработает данные и выполнит дальнейшие операции с бд   
        };

        query.onerror = function() {  // если получить данные не удалось  - сообщим об этом
          console.log("Ошибка", query.error);
        };

      }

      function putTransaction(oldText,text,logs)  {  // функция для оработки данных и правильной записи оных в бд

        let now = new Date();  // получаем дату и время
        // приводим дату и время в нормальный вид, по сути добовляя нули где надо
        let date = `${checkZero(now.getHours())}:${checkZero(now.getMinutes())}:${checkZero(now.getSeconds())} ${now.getDate()}-${checkZero(now.getMonth()+1)}-${checkZero(now.getFullYear())}`;
        let newText = `${date}&nbsp;&nbsp;${text}<br>${oldText}`;  // создаем наш лог в виде даты, текущего лога и всего того что у же там было
            
        let front = logs.put(newText,'front');  // кладем этот лог по ключу front

        front.onerror = function() {  // если не поулчилось, сообщим об этом
          console.log("Ошибка", front.error);
        };

        let back = logs.get('back');  // дальше получаем то что лежит по ключу back то есть тот лог что будем отдавать на бэк
        back.onsuccess = event =>  {   // если данные получены успешно
          let newTextBack = `${date}&nbsp;&nbsp;${text}<br>${back.result}`;  // составляем строку лога для back в виде даты, 
                                                                                // текущего лога, и всего что там было до этого

          let backPut = logs.put(newTextBack,'back');  // кладем этот лог в бд по ключу back

          backPut.onerror = function() {  // если не поулчилось, сразу сообщим об этом
            console.log("Ошибка", backPut.error);
          };


          backPut.onsuccess = function() {   // а если положии успешно то идем дальше

            let count = logs.get('count'); // получаем  данные по ключу count он отвечает за счетчик сколько всего записей было
                                            // уже занесено после последнего обновления

            count.onsuccess = event => { // если успешно получили данные 
              if (count.result > 50) { // смотрим если занесли уже больше 50 записей
                logs.put(0,'count'); // то очищаем счетчик в бд
                putLogIntoBack(back.result);  // и вызываем метод который положит сформировавшийся лог уже на рест
                logs.put('','back');  // так же очищаем логи по ключу back в бд
                resolve("success");  // и на этом вся функция работы  с бд заканчивается
              } else {  // если логи еще не накопились
                if (count.result > 0) {  // то смотрим, если логи уже были какие то
                  logs.put(parseInt(count.result)+1,'count');   // то увеличиваем существующий счетчик на единицу
                } else {  // если запись первая
                  logs.put(1,'count');  // то присваиваем счетчику единицу
                }
                // это сделано для того, чтобы избежать оишбок на предсет того, если бд вообще толко создалась, то что лежит по ключу count?

                resolve("success");  // и на этом вся функция работы  с бд заканчивается
              }

            };

            count.onerror = function() { // а если счетчик получить не удалось то  сообщим об этом
              console.log("Ошибка", count.error);
            };
                               
          };

        };

        back.onerror = function() {  // еслиданные по ключу back поулчить не удалось , сообщим об этом
          console.log("Ошибка", back.error);
        };

      }

      function checkZero(number) {  // функция которая проверяет нужно число и преобразует его
        if (number < 10) {  // если число меньше 10
          return `0${number}`  // то присвоем ей ноль вначале
        }  
        return number // а так просто вернем число
      }

    });
  },
  getLog(side) {

    let db = null;

    let request = indexedDB.open("EVA",1);  


    request.onerror = function(event) {
      console.log("error: ",event);
    };

    request.onupgradeneeded = event => {
      console.log('create');
      db = event.target.result;
      if (!db.objectStoreNames.contains('logs')) { // if there's no "books" store
        db.createObjectStore('logs'); // create it
      }

      request.onsuccess = event => {
        db = request.result;
        console.log("successEvent: " + db);
      };

    }

    let promise = new Promise((resolve, reject) => {



      request.onsuccess =  event => {

        db = request.result;
                    
        let transaction = db.transaction("logs"); // (1)

        // получить хранилище объектов для работы с ним
        let logs = transaction.objectStore("logs"); // (2)


                
        let query = logs.get(side); // (3) return 

        query.onsuccess = event => { // (4)
          if (query.result) {
            resolve(query.result);
          }
        };
        query.onerror = function() {
          console.log("Ошибка", query.error);
        };
                                
      };    
            
    });

    return promise
  },
  deleteLog() {

    return new Promise((resolve, reject) => {

      let db = null;

      let request = indexedDB.open("EVA",1);  

      request.onerror = function(event) {
        console.log('error:', event);
      };

      request.onupgradeneeded = event => {
        console.log('create');
        db = event.target.result;
        if (!db.objectStoreNames.contains("logs")) { 
          db.createObjectStore("logs"); // create it
        }

        request.onsuccess = event => {
          db = request.result;
          setTransaction(db);
        };
      }


      request.onsuccess = event => {

        db = request.result;

        setTransaction(db);

      };


      function setTransaction(db) {
        

        let transaction = db.transaction("logs", "readwrite"); // (1)

        // получить хранилище объектов для работы с ним
        let logs = transaction.objectStore("logs"); // (2)

        logs.clear();
        resolve("clear");

      }

    });

  }
};


async function putLogIntoBack(text) {
  let textForBack = text.replace( /&nbsp;/g, " " );
  textForBack = textForBack.replace( /<br>/g, "\n" );
  let response = await fetch(`/api/logs/save`, {  // сперва нужно подать post запрос
    method: 'POST',
    body: JSON.stringify({log: textForBack})
  })

  return response
}