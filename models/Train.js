// =========================================== Lab5 version ===========================================
const { Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize('trainSys', "sa", "dbadminjs25", {
    dialect: "mssql",
    host: "localhost",
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB is connected");
    } catch (error) {
        console.error("DB error:", error);
    }
})();


// Defining models and their relations
const Train = sequelize.define(
    'Train',
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            // validate: {
            //     len: [0, 100]
            // }
        },
        Name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        departureTime: {
            type: DataTypes.STRING(60),
            // allowNull: true,
        },
    },
    {
        tableName: 'Trains',
        timestamps: false, // Because fields createdAt and updatedAt don't exist in table 'Trains'
    }
);
const Station = sequelize.define(
    'Station',
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            // validate: {
            //     len: [0, 150]
            // }
        },
        Status: {
            type: DataTypes.STRING(10),
            validate: {
                isIn: [['to', 'from']],
            }
        },
        TrainId: {
            type: DataTypes.INTEGER,
            references: {
            model: Train,
            key: 'Id'
          },
        }
    },
    {
        tableName: 'Stations',
        timestamps: false,
    }
);
Station.belongsTo(Train);
Train.hasMany(Station);


// Data operation logic
exports.getAll = async function(callback, page=1, limit=100){
    try {
        const trainsWithStations = await Train.findAll({include: Station});
        const fullres = trainsWithStations.map(({Id:id, Name:name, departureTime:departure, Stations}) => {
            const from = Stations.find(st => st.Status === "from").Name;
            const to = Stations.find(st => st.Status === "to").Name;
            return {id, name, departure, from, to}
        });

        const res = fullres.slice((page-1)*limit, page*limit);        
        callback(res);
    } catch (err) {
        console.error("ПОМИЛКА отримання даних:", err);
        callback([]);
    }
};
exports.getById = async function(Id, callback){
    try {   
        const trainWithStation = await Train.findByPk(Id, {include: Station});
        const {Id:id, Name:name, departureTime:departure, Stations} = trainWithStation;
        const from = Stations.find(st => st.Status === "from").Name;
        const to = Stations.find(st => st.Status === "to").Name;

        callback({id, name, departure, from, to});
    } catch (err) {
        callback([]);
    }
};
exports.addTrain = async (train) => {
    const t = await sequelize.transaction();
    try {
        newTrain = await Train.create({
            Name: train.name,
            departureTime: train.time,
            Stations:[
                {
                    Name: train.from,
                    Status: "from"
                },
                {
                    Name: train.to,
                    Status: "to"
                }
            ]
        },
        {
            include:[Station],
            transaction: t
        });
        t.commit();
        // return (newTrain.Id);

    } catch (err) {    
        t.rollback();            
        console.error('Помилка:', err);
        throw Error("Too long text");
    }
};
exports.updateTrain = async (IdOfUpd, updTrain) =>{
    const t = await sequelize.transaction();
    try {
        await Train.update({
            Name: updTrain.name,
            departureTime: updTrain.time,
        },
        {
            where: {
                Id: IdOfUpd,
            },
            transaction: t
        });
        await Station.update({
                Name: updTrain.from,
            },
            {
                where: {
                    TrainId: IdOfUpd,
                    Status: "from"
                },
                transaction: t
            }
        );
        await Station.update({
                Name: updTrain.to,
            },
            {
                where: {
                    TrainId: IdOfUpd,
                    Status: "to"
                },
                transaction: t
            }
        );
        await t.commit();
        // return true;
        // callback(true); //Sucess
    } catch (err) {
        await t.rollback();
        // callback(false);
        console.error('Помилка:', err); 
        throw Error("Too long text");
    }
};
exports.deleteTrain = async (id) => {
    const t = await sequelize.transaction();
    try {
        await Train.destroy({
            where: {
                Id: id,                
            },
            force: true,
            transaction: t,
        });
        await Station.destroy({
            where: {
                TrainId: id,                
            },
            force: true,
            transaction: t,
        });
        await t.commit();
        // return true;
    } catch (err) {    
        await t.rollback();  
        // callback(false);
        console.error("ПОМИЛКА видалення потяга:", err);         
        // return false;
        throw Error("Неможливо видалити");
    }
};
exports.search = async (from, to, callback) => {
    try {
        // const request = new sql.Request()
        // const result = await request.input('fromStName', sql.VarChar(150), from)
        //     .input('toStName', sql.VarChar(150), to)
        //     .query(`select tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
        //             from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
        //                 join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'
        //             where fromSt.Name = @fromStName and toSt.Name = @toStName
        //         `);
        //         console.log(result.recordset);
        const trainsWithStations = await Train.findAll({include: Station});
        const res = trainsWithStations.filter(({Stations}) => {
            const fromSt = Stations.find(st => st.Status === "from").Name;
            const toSt = Stations.find(st => st.Status === "to").Name;
            return fromSt === from && toSt === to;
        }).map(({Name:name, departureTime:departure, Stations}) => {
            const from = Stations.find(st => st.Status === "from").Name;
            const to = Stations.find(st => st.Status === "to").Name;
            return {name, departure, from, to}
        });
           
        callback(res);
    } catch (err) {
        console.error("ПОМИЛКА пошуку потяга:", err);
        callback([]);
    }
};

// =========================================== Lab4 version ===========================================
// const sql = require('mssql/msnodesqlv8');

// const config = {
//     server: "WIN-SNV0NG9VUDN",
//     database: "trainSys",
//     options: {
//       trustedConnection: true,
//       trustServerCertificate: true, 
//     },
//     driver: "msnodesqlv8"
// };
// let connect;
// sql.connect(config).then((res)=>{
//     console.log("Connected to DB");
//     connect = res;
// });

// exports.getAll = async function(callback){
//     try {
//         const request = new sql.Request();
//         const result = await request.query(`select tr.Id as id, tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
//                                             from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
//                                                 join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'`);        
//         callback(result.recordset);
//     } catch (err) {
//         console.error("ПОМИЛКА отримання даних:", err);
//         callback([]);
//     }
// };
// exports.getById = async function(Id, callback){
//     try {
//         const request = new sql.Request();
//         const result = await request.input("Id", sql.Int, Id)
//                                     .query(`select tr.Id as id, tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
//                                             from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
//                                                 join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'
//                                             where tr.Id = @Id`);        
//         callback(result.recordset[0]);
//     } catch (err) {
//         callback([]);
//     }
// };

// exports.addTrain = async (train) => {
//    const transaction = new sql.Transaction(connect);
//     try {
//         await transaction.begin();                
//         // Створення запитів
//         const request1 = new sql.Request(transaction);
//         request1.input('Name', sql.VarChar(110), train.name)
//                 .input('departureTime', sql.VarChar(60), train.time);
//         await request1.query(`insert into Trains (Name, departureTime) values (@Name, @departureTime)`);       
        
//         const requestId = new sql.Request(transaction);
//         requestId.input('Name', sql.VarChar(100), train.name)
//                 .input('departureTime', sql.VarChar(60), train.time);
//         const IdsOfCreated = await requestId.query(`select Id from Trains where Name = @Name and departureTime = @departureTime`);

//         const request2 = new sql.Request(transaction);
//         request2.input('NameFrom', sql.VarChar(160), train.from)
//                 .input('StatusFrom', sql.VarChar(10), 'from')
//                .input('NameTo', sql.VarChar(160), train.to)
//                .input('StatusTo', sql.VarChar(10), 'to')
//                .input('TrainId', sql.Int, IdsOfCreated.recordset[0].Id);
//         await request2.query(`insert into Stations (Name, Status, TrainId) values (@NameFrom, @StatusFrom, @TrainId), (@NameTo, @StatusTo, @TrainId)`);

//         await transaction.commit();
//     } catch (err) {                
//         await transaction.rollback();
//         console.error('Помилка:', err);
//         throw Error("Too long text");
//         // errCallback();
//     }
// };
// exports.updateTrain = async (IdOfUpd, updTrain) =>{
//     const transaction = new sql.Transaction(connect);
//     try {
//         await transaction.begin(); 
//         // Створення запитів
//         const request1 = new sql.Request(transaction);
//         request1.input('Id', sql.Int, IdOfUpd)
//                 .input('Name', sql.VarChar(110), updTrain.name)
//                 .input('departureTime', sql.VarChar(60), updTrain.time);
//         await request1.query(`update Trains set Name = @Name, departureTime = @departureTime where Id = @Id`);        

//         const request2 = new sql.Request(transaction);
//         request2.input('NameFrom', sql.VarChar(160), updTrain.from)               
//                .input('TrainId', sql.Int, IdOfUpd);
//         await request2.query(`update Stations set Name = @NameFrom where TrainId = @TrainId and Status = 'from'`);
//         const request3 = new sql.Request(transaction);
//         request3.input('NameTo', sql.VarChar(160), updTrain.to)               
//                .input('TrainId', sql.Int, IdOfUpd);
//         await request3.query(`update Stations set Name = @NameTo where TrainId = @TrainId and Status = 'to'`);

//         await transaction.commit();
//     } catch (err) {               
//         await transaction.rollback();
//         console.error('Помилка:', err); 
//         throw Error("Too long text");
//         // errCallback();
//     }
// }
// exports.deleteTrain = async (id) => {
//     const transaction = new sql.Transaction(connect); 
//     try {               
//         await transaction.begin();
//         const request1 = new sql.Request(transaction);
//         await request1.input('id', sql.Int, id)
//                 .query(`DELETE FROM Stations WHERE TrainId = @id`);

//         const request2 = new sql.Request(transaction);
//         await request2.input('id', sql.Int, id)
//             .query("DELETE FROM Trains WHERE id = @id");
//         await transaction.commit();
//         // return true;
//     } catch (err) {        
//         console.error("ПОМИЛКА видалення потяга:", err); 
//         await transaction.rollback();
//         throw Error("Неможливо видалити");
//         // return false;
//     }
// };

// exports.search = async (from, to, callback) => {
//     try {
//         const request = new sql.Request()
//         const result = await request.input('fromStName', sql.VarChar(150), from)
//             .input('toStName', sql.VarChar(150), to)
//             .query(`select tr.name as name, tr.departureTime as departure, fromSt.Name as 'from', toSt.Name as 'to'
//                     from (Trains as tr join Stations as fromSt on fromSt.TrainId = tr.Id  and fromSt.Status = 'from')
//                         join Stations as toSt on toSt.TrainId = tr.Id  and toSt.Status = 'to'
//                     where fromSt.Name = @fromStName and toSt.Name = @toStName
//                 `);
//                 console.log(result.recordset);
//         callback(result.recordset);
//     } catch (err) {
//         console.error("ПОМИЛКА пошуку потяга:", err);
//         callback([]);
//     }
// };