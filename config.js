var config = {}

config.port				 = 8116;
/*config.mysql_host		 = 'backup-db.cibglm5ffeqb.ap-south-1.rds.amazonaws.com';
config.mysql_user		 = 'root';
config.mysql_password	 = 'LBix.com';
config.mysql_database	 = 'learning_bix';
*/

config.mysql_host        = 'learningbixnew.mysql.database.azure.com';//backup-db.mysql.database.azure.com'
config.mysql_user        = 'learningbixroot';
config.mysql_password    = 'LBix.com';
config.mysql_database    = 'learning_bix_development';


config.CERTIFICATE_URL_UPLOAD = '/var/www/html/api.learningbix.com/public_html/certificates';
config.URL_UPLOAD		 = '/var/www/html/api.learningbix.com/public_html/uploads';
config.FCMKEY            = 'AAAAYjjbBm0:APA91bE8hjBtmMQm8ccBH35v9261_yXW352Tjl_SeuQA9doJta4YJhxegOrKtjN5sjVAoTfZKIZvkdZ2G5aO3AxucFpW1k7pVbNwbHLFG81dWqRkkofI2Tx2nvScLrOmf-gZJ_IhRzmP';
config.appUrl	 	 	 = 'http://localhost:'+config.port;
config.SiteUrl	 	 	 = 'http://localhost:8116/';
config.REFFERAMOUNT      =  '100';
config.imageFilePath 	 = 'uploads/';

config.secretSalt 		 = 'DYhG93b0qyJfIxfs2guVoUubWwvniR2G0FgaC9mi12apc123';
config.DEBUG		     = 1;
config.rootUrl  	     = process.env.ROOT_URL  || 'https://localhost:'+config.port+'/';
config.SITE_TITLE        = 'Learning Bix School API';
module.exports 			 = config;
