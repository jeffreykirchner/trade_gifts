echo "setup trade_gifts"
sudo service postgresql restart
echo "drop template db: enter db password"
dropdb trade_gifts -U dbadmin -h localhost -i -p 5433
echo "create database: enter db password"
createdb -h localhost -p 5433 -U dbadmin -O dbadmin trade_gifts
echo "restore database: enter db password"
pg_restore -v --no-owner --role=dbowner --host=localhost --port=5433 --username=dbadmin --dbname=trade_gifts database_dumps/trade_gifts.sql