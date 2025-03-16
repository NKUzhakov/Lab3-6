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

exports.getAll = async function(callback){
    try {
        const request = new sql.Request();
        const result = await request.query(`select tr.Id as id, tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
                                            from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
                                                join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'`);        
        callback(result.recordset);
    } catch (err) {
        console.error("ПОМИЛКА отримання даних:", err);
        callback([]);
    }
};
exports.getById = async function(Id, callback){
    try {
        const request = new sql.Request();
        const result = await request.input("Id", sql.Int, Id)
                                    .query(`select tr.Id as id, tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
                                            from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
                                                join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'
                                            where tr.Id = @Id`);        
        callback(result.recordset[0]);
    } catch (err) {
        callback([]);
    }
};

exports.addTrain = async (train) => {
   const transaction = new sql.Transaction(connect);
    try {
        await transaction.begin();                
        // Створення запитів
        const request1 = new sql.Request(transaction);
        request1.input('Name', sql.VarChar(110), train.name)
                .input('departureTime', sql.VarChar(60), train.time);
        await request1.query(`insert into Trains (Name, departureTime) values (@Name, @departureTime)`);       
        
        const requestId = new sql.Request(transaction);
        requestId.input('Name', sql.VarChar(100), train.name)
                .input('departureTime', sql.VarChar(60), train.time);
        const IdsOfCreated = await requestId.query(`select Id from Trains where Name = @Name and departureTime = @departureTime`);

        const request2 = new sql.Request(transaction);
        request2.input('NameFrom', sql.VarChar(160), train.from)
                .input('StatusFrom', sql.VarChar(10), 'from')
               .input('NameTo', sql.VarChar(160), train.to)
               .input('StatusTo', sql.VarChar(10), 'to')
               .input('TrainId', sql.Int, IdsOfCreated.recordset[0].Id);
        await request2.query(`insert into Stations (Name, Status, TrainId) values (@NameFrom, @StatusFrom, @TrainId), (@NameTo, @StatusTo, @TrainId)`);

        await transaction.commit();
    } catch (err) {
        console.error('Помилка:', err);        
        await transaction.rollback();
    }
};
exports.updateTrain = async (IdOfUpd, updTrain) =>{
    const transaction = new sql.Transaction(connect);
    try {
        await transaction.begin(); 
        // Створення запитів
        const request1 = new sql.Request(transaction);
        request1.input('Id', sql.Int, IdOfUpd)
                .input('Name', sql.VarChar(110), updTrain.name)
                .input('departureTime', sql.VarChar(60), updTrain.time);
        await request1.query(`update Trains set Name = @Name, departureTime = @departureTime where Id = @Id`);        

        const request2 = new sql.Request(transaction);
        request2.input('NameFrom', sql.VarChar(160), updTrain.from)               
               .input('TrainId', sql.Int, IdOfUpd);
        await request2.query(`update Stations set Name = @NameFrom where TrainId = @TrainId and Status = 'from'`);
        const request3 = new sql.Request(transaction);
        request3.input('NameTo', sql.VarChar(160), updTrain.to)               
               .input('TrainId', sql.Int, IdOfUpd);
        await request3.query(`update Stations set Name = @NameTo where TrainId = @TrainId and Status = 'to'`);

        await transaction.commit();
    } catch (err) {
        console.error('Помилка:', err);        
        await transaction.rollback();
    }
}
exports.deleteTrain = async (id) => {
    const transaction = new sql.Transaction(connect); 
    try {               
        await transaction.begin();
        const request1 = new sql.Request(transaction);
        await request1.input('id', sql.Int, id)
                .query(`DELETE FROM Stations WHERE TrainId = @id`);

        const request2 = new sql.Request(transaction);
        await request2.input('id', sql.Int, id)
            .query("DELETE FROM Trains WHERE id = @id");
        await transaction.commit();
        return true;
    } catch (err) {        
        console.error("ПОМИЛКА видалення потяга:", err); 
        await transaction.rollback();
        return false;
    }
};

exports.search = async (from, to, callback) => {
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
        console.error("ПОМИЛКА пошуку потяга:", err);
        callback([]);
    }
};