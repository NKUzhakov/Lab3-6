const sql = require('mssql/msnodesqlv8');

const config = {
    server: "WIN-SNV0NG9VUDN",
    database: "trainSys",
    options: {
      trustedConnection: true,
      trustServerCertificate: true, 
    },
    driver: "msnodesqlv8"
};
let connect;
sql.connect(config).then((res)=>{
    console.log("Connected to DB");
    connect = res;
});
// const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log("✅ Підключено до MSSQL");
//         return pool;
//     })
//     .catch(err => {
//         console.error("❌ ПОМИЛКА підключення до MSSQL:", err);
//     });

exports.getAll = async function(callback){
    console.log("📢 Викликано getAll()");
    try {
        const request = new sql.Request();
        const result = await request.query(`select tr.Id as id, tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
                                            from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
                                                join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'`);
        // console.log(result.recordset);
        
        callback(result.recordset);
    } catch (err) {
        console.error("❌ ПОМИЛКА отримання даних:", err);
        callback([]);
    }
};

exports.addTrain = async (train) => {
    console.log(train);
    
    // console.log("📢 Викликано addTrain() з даними:", train);
    // try {
    //     const pool = await poolPromise;
    //     await pool.request()
    //         .input('from', sql.NVarChar, train.from)
    //         .input('to', sql.NVarChar, train.to)
    //         .input('departure', sql.DateTime, train.departure)
    //         .query("INSERT INTO Trains (fromStation, toStation, departureTime) VALUES (@from, @to, @departure)");

            
    //     console.log("✅ Потяг успішно додано!");
    // } catch (err) {
    //     console.error("❌ ПОМИЛКА додавання потяга:", err);
    // }
    //=================================
    // const transaction = new sql.Transaction(/* [pool] */)
    // transaction.begin(err => {
    // // ... error checks

    //     const request = new sql.Request(transaction)
    //     request.input('Name', sql.VarChar(100), train.Name)
    //             .input('departureTime', sql.VarChar(60), train.departureTime)
    //             .input('NameFrom', sql.VarChar(100), train.from)
    //             .input('StatusFrom', sql.VarChar(10), 'from')
    //             .input('NameTo', sql.VarChar(100), train.to)
    //             .input('StatusTo', sql.VarChar(10), 'to')
    //     request.query(`insert into Trains (Name, departureTime) values (@Name, @departureTime);
    //                    insert into Stations (Name, Status) values (@NameFrom, @StatusFrom), (@NameTo, @StatusTo)`, (err, result) => {
    //         transaction.commit(err => {

    //             console.log("Transaction committed.")
    //         })
    //     })
    // })

    try {
        // Створення транзакції
        const transaction = new sql.Transaction(connect);
        
        await transaction.begin(); // Початок транзакції

        // Створення запитів
        const request1 = new sql.Request(transaction);
        request1.input('Name', sql.VarChar(100), train.name)
                .input('departureTime', sql.VarChar(60), train.time);
        await request1.query(`insert into Trains (Name, departureTime) values (@Name, @departureTime)`);
        // console.log("Transaction");
        
        
        const requestId = new sql.Request(transaction);
        requestId.input('Name', sql.VarChar(100), train.name)
                .input('departureTime', sql.VarChar(60), train.time);
        const IdsOfCreated = await requestId.query(`select Id from Trains where Name = @Name and departureTime = @departureTime`);
        console.log(IdsOfCreated.recordset[0].Id);
        

        const request2 = new sql.Request(transaction);
        request2.input('NameFrom', sql.VarChar(100), train.from)
                .input('StatusFrom', sql.VarChar(10), 'from')
               .input('NameTo', sql.VarChar(100), train.to)
               .input('StatusTo', sql.VarChar(10), 'to')
               .input('TrainId', sql.Int, IdsOfCreated.recordset[0].Id);
        await request2.query(`insert into Stations (Name, Status, TrainId) values (@NameFrom, @StatusFrom, @TrainId), (@NameTo, @StatusTo, @TrainId)`);

        // Підтвердження транзакції
        await transaction.commit();
        console.log('Транзакція успішно виконана');
    } catch (err) {
        console.error('Помилка:', err);
        
        // Відкат змін у разі помилки
        if (connect) {
            const transaction = new sql.Transaction(connect);
            await transaction.rollback();
        }
    }
};

exports.deleteTrain = async (id) => {
    console.log(`📢 Видалення потяга ID: ${id}`);
    try {
        const request1 = new sql.Request();
        request1.input('id', sql.Int, id)
            .query("DELETE FROM Trains WHERE id = @id");
          
        console.log("✅ Потяг успішно видалено!");
        return true;
    } catch (err) {
        console.error("❌ ПОМИЛКА видалення потяга:", err);
        return false;
    }
};

exports.search = async (from, to, callback) => {
    console.log(`📢 Викликано пошук потягів: з ${from} до ${to}`);
    try {
        const request = new sql.Request()
        const result = await request.input('fromStName', sql.VarChar(150), from)
            .input('toStName', sql.VarChar(150), to)
            .query(`select tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
                    from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
                        join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'
                    where fromSt.Name = @fromStName and toSt.Name = @toStName
                `);
                console.log(result.recordset);
        callback(result.recordset);
    } catch (err) {
        console.error("❌ ПОМИЛКА пошуку потяга:", err);
        callback([]);
    }
};










// const fs = require('fs');
// const path = require('path');
// const sql = require('mssql/msnodesqlv8');
// const filePath = path.join(__dirname, '../data/trains.json'); // Оновлений шлях


// // console.log(`📌 Шлях до trains.json: ${filePath}`);

// // Функція для читання потягів з JSON
// const loadTrains = () => {
//     try {
//         const data = fs.readFileSync(filePath, 'utf8');
//         console.log("📖 Дані з файлу:", data);
//         return JSON.parse(data);
//     } catch (err) {
//         console.error("❌ ПОМИЛКА читання файлу!", err);
//         return [];
//     }
// };

// // Функція для збереження потягів у JSON
// const saveTrains = (trains) => {
//     try {
//         fs.writeFileSync(filePath, JSON.stringify(trains, null, 2));
//         console.log("✅ Потяги успішно збережено!");
//     } catch (err) {
//         console.error("❌ ПОМИЛКА збереження файлу!", err);
//     }
// };

// exports.getAll = () => {
//     console.log("📢 Викликано getAll()");
//     return loadTrains();
// };

// exports.addTrain = (train) => {
//     console.log("📢 Викликано addTrain() з даними:", train);
//     const trains = loadTrains();
//     train.id = trains.length ? trains[trains.length - 1].id + 1 : 1;
//     trains.push(train);
//     saveTrains(trains);
// };

// exports.deleteTrain = (id) => {
//     console.log(`📢 Видалення потяга ID: ${id}`);
//     let trains = loadTrains();

//     id = Number(id);  

//     const initialLength = trains.length;
//     trains = trains.filter(train => train.id !== id);

//     if (trains.length === initialLength) {
//         console.error("❌ ПОМИЛКА: Потяг з таким ID не знайдено!");
//         return false;
//     }

//     saveTrains(trains);
//     console.log("✅ Потяг успішно видалено!");
//     return true;
// };


// exports.search = (from, to) => {
//     console.log(`📢 Викликано пошук потягів: з ${from} до ${to}`);
//     const trains = loadTrains();

//     return trains.filter(train => 
//         train.from.toLowerCase() === from.toLowerCase() &&
//         train.to.toLowerCase() === to.toLowerCase()
//     );
// };
