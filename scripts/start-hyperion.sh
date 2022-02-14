#run with abi scan on (1st run) 
pm2 start --only voice-indexer --update-env -s
pm2 save
pm2 start --only voice-api --update-env -s
pm2 save

pm2 logs 
