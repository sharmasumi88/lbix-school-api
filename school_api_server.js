const mysql = require('mysql');
const express = require('express');
const logger = require('morgan');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const multer = require('multer');
const bodyParser = require('body-parser');
const { BlobServiceClient } = require('@azure/storage-blob');
const config = require('./config'); // keep your config file

var School = require('./school.js');

// Use environment variables for secrets and connection strings (set these in your env)
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '<PUT_AZURE_CONNECTION_STRING_IN_ENV>';
// If you still want to keep the old hard-coded string for testing, set it in env OR replace above temporarily.
// DO NOT commit secrets to source control.

// Create MySQL pool with safe defaults
const pool = mysql.createPool({
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database,
  timezone: 'Asia/Calcutta',
  waitForConnections: true,                   // queue queries when no free connections
  connectionLimit: config.mysql_connection_limit || 10, // default 10 if not set
  queueLimit: 0                               // unlimited queue (0 = no limit)
});

// quick DB smoke test with safe error handling
process.env.TZ = 'Asia/Calcutta';
pool.query('SELECT 1 + 1 AS solution', function (err, rows) {
  if (err) {
    console.error('MySQL pool test failed:', err.message || err);
    // don't throw here in production; handle startup accordingly
  } else {
    console.log('MySQL pool test OK — solution:', rows && rows[0] && rows[0].solution);
  }
});

// create express app
const app = express();
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));



app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));

// TLS/HTTPS setup (fallback to HTTP if keys missing)
let server;
try {
  const privateKey = fs.readFileSync(path.join(__dirname, 'keys/privkey.pem'));
  const certificate = fs.readFileSync(path.join(__dirname, 'keys/cert.pem'));
  const caf = fs.readFileSync(path.join(__dirname, 'keys/chain.pem'));
  const credentials = { key: privateKey, cert: certificate, ca: caf };
  const httpsServer = https.createServer(credentials, app);
  server = httpsServer.listen(config.port, () => {
    console.log(`${config.SITE_TITLE} (HTTPS) server listening on port ${config.port}`);
  });
} catch (err) {
  console.warn('TLS keys not found or failed to load — falling back to HTTP. Error:', err.message || err);
  server = app.listen(config.port, () => {
    console.log(`${config.SITE_TITLE} (HTTP) server listening on port ${config.port}`);
  });
}

// middleware to log request body and set headers
app.use((req, res, next) => {
  const userdata = req.body;
  if (config.DEBUG > 0) {
    console.log(`######### ${req.url} called with:`, userdata);
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ---- Multer upload setup ----

// allowed MIME types
const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, JPG, XLS, XLSX files are allowed.'), false);
  }
};

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    cb(null, `attachment-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage, fileFilter });

// ---- Upload route (Azure Blob) ----
app.post('/upload_file', upload.single('attachment'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({ status: false, msg: 'No file uploaded' });
    }

    // verify AZURE connection string available
    if (!AZURE_STORAGE_CONNECTION_STRING || AZURE_STORAGE_CONNECTION_STRING.startsWith('<')) {
      // If Azure not configured, return a helpful error. Optionally you could skip upload and keep local file.
      return res.status(500).send({ status: false, msg: 'Azure storage connection string not configured in environment.' });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = 'learningbixcom'; // ensure this is correct
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // create container if not exists (idempotent)
    await containerClient.createIfNotExists();

    const blobName = file.filename;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const filePath = path.join(uploadsDir, file.filename);

    console.log(`Uploading to Azure storage as blob: ${blobName}`);
    await blockBlobClient.uploadFile(filePath);
    console.log('Upload successful');

    // Optionally remove local file after upload:
    await fs.remove(filePath);

    return res.send({ status: true, msg: 'File uploaded successfully', name: file.filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).send({ status: false, msg: 'Error uploading file', error: (error && error.message) || error });
  }
});

// Export app and pool for use in other modules (if needed)
module.exports = { app, pool };


app.post('/login', function (req, res) {
    var userdata = req.body;
    School.login(userdata, pool, function (http_status_code, err, response) {
        
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2)
            console.log(response);
        res.status(http_status_code).send(response);
    });
});

// ---  School Panel API names ---

app.post('/change_password', function (req, res) {
    var userdata = req.body;
    School.change_password(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_view_chapter_lessons_info', function (req, res) {
    var userdata = req.body;
    School.student_view_chapter_lessons_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_project_submit', function (req, res) {
    var userdata = req.body;
    School.student_project_submit(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_quiz_submit', function (req, res) {
    var userdata = req.body;
    School.student_quiz_submit(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/teacher_projects_review_list', function (req, res) {
    var userdata = req.body;
    School.teacher_projects_review_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/teacher_project_review_submit', function (req, res) {
    var userdata = req.body;
    School.teacher_project_review_submit(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

// Admin-side: forgot_password is present in the School Panel API list (as `forgot_password`).
app.post('/forgot_password', function (req, res) {
    var userdata = req.body;
    School.forgot_password(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

// --- Cleaned routes from the latest block (only handlers that match the 70 School Panel APIs) ---

app.post('/add_user', function (req, res) {
    var userdata = req.body;
    School.add_user(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/update_user', function (req, res) {
    var userdata = req.body;
    School.update_user(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/user_list', function (req, res) {
    var userdata = req.body;
    School.user_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/user_details', function (req, res) {
    var userdata = req.body;
    School.user_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/update_user_status', function (req, res) {
    var userdata = req.body;
    School.update_user_status(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/update_user_verified_status', function (req, res) {
    var userdata = req.body;
    School.update_user_verified_status(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/faqs_list', function (req, res) {
    var userdata = req.body;
    School.faqs_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/courses_list', function (req, res) {
    var userdata = req.body;
    School.courses_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/create_school_batch', function (req, res) {
    var userdata = req.body;
    School.create_school_batch(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/project_details', function (req, res) {
    var userdata = req.body;
    School.project_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/assign_course_to_student', function (req, res) {
    var userdata = req.body;
    School.assign_course_to_student(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/assign_course_to_student_bulk', function (req, res) {
    var userdata = req.body;
    School.assign_course_to_student_bulk(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/create_group_post', function (req, res) {
    var userdata = req.body;
    School.create_group_post(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/update_course_status', function (req, res) {
    var userdata = req.body;
    School.update_course_status(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_view_course_info', function (req, res) {
    var userdata = req.body;
    School.student_view_course_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/self_page_courses_details', function (req, res) {
    var userdata = req.body;
    School.self_page_courses_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/assign_student_quiz', function (req, res) {
    var userdata = req.body;
    School.assign_student_quiz(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/generate_certificate', function (req, res) {
    var userdata = req.body;
    School.generate_certificate(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/assign_student_project', function (req, res) {
    var userdata = req.body;
    School.assign_student_project(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/user_project_details', function (req, res) {
    var userdata = req.body;
    School.user_project_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/view_quiz_info_audit', function (req, res) {
    var userdata = req.body;
    School.view_quiz_info_audit(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/teacher_projects_review_details', function (req, res) {
    var userdata = req.body;
    School.teacher_projects_review_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

// ----------------------------work coursse----------
app.post('/admin_school_details', function (req, res) {
    var userdata = req.body;
    School.admin_school_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/admin_school_generated_payout_list', function (req, res) {
    var userdata = req.body;
    School.admin_school_generated_payout_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});



app.post('/school_login', function (req, res) {
    var userdata = req.body;
    School.school_login(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_forgot_password', function (req, res) {
    var userdata = req.body;
    School.school_forgot_password(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_change_password', function (req, res) {
    var userdata = req.body;
    School.school_change_password(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_dashboard_info', function (req, res) {
    var userdata = req.body;
    School.school_dashboard_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/admin_assign_course_to_student_bulk', function (req, res) {
    var userdata = req.body;
    School.admin_assign_course_to_student_bulk(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/teacher_login', function (req, res) {
    var userdata = req.body;
    School.teacher_login(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});


app.post('/student_course_summary_points', function (req, res) {
    var userdata = req.body;
    School.student_course_summary_points(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_report_info', function (req, res) {
    var userdata = req.body;
    School.school_report_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_pending_user_list', function (req, res) {
    var userdata = req.body;
    School.school_pending_user_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

// Redis middleware (kept — not an API route)
const redis_schoolData = (req, res, next) => {
    client.get('schoolData', (err, redis_data) => {
        if (err) {
            throw err;
        } else if (redis_data) {
            res.send(JSON.parse(redis_data));
        } else {
            next();
        }
    });
};

// --- kept School Panel API routes from this block ---

app.post('/school_user_list', function (req, res) {
    var userdata = req.body;
    School.school_user_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(response);
            res.status(http_status_code).send(response);
        }
    });
});

app.post('/overall_leaderboard', function (req, res) {
    var userdata = req.body;
    School.overall_leaderboard(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/overall_leaderboard_weekly', function (req, res) {
    var userdata = req.body;
    School.overall_leaderboard_weekly(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/overall_leaderboard_teacher', function (req, res) {
    var userdata = req.body;
    School.overall_leaderboard_teacher(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/last_month_student_top_students', function (req, res) {
    var userdata = req.body;
    School.last_month_student_top_students(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_user_list_new', function (req, res) {
    var userdata = req.body;
    School.school_user_list_new(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/last_month_top_teacher', function (req, res) {
    var userdata = req.body;
    School.last_month_top_teacher(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});
// ----------------- Product APIs -----------------
app.post('/robotics_courses_list', function (req, res) {
    var userdata = req.body;
    School.robotics_courses_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_batches_list', function (req, res) {
    var userdata = req.body;
    School.school_batches_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_grade_courses_list', function (req, res) {
    var userdata = req.body;
    School.school_grade_courses_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_batches_student_list', function (req, res) {
    var userdata = req.body;
    School.school_batches_student_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/view_school_course_info', function (req, res) {
    var userdata = req.body;
    School.view_school_course_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/badges_list', function (req, res) {
    var userdata = req.body;
    School.badges_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/user_badges_point_list', function (req, res) {
    var userdata = req.body;
    School.user_badges_point_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/save_user_concept', function (req, res) {
    var userdata = req.body;
    School.save_user_concept(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/course_concepts_info', function (req, res) {
    var userdata = req.body;
    School.course_concepts_info(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/add_school_grade', function (req, res) {
    var userdata = req.body;
    School.add_school_grade(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/school_grades_list', function (req, res) {
    var userdata = req.body;
    School.school_grades_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/overall_details_teacher', function (req, res) {
    var userdata = req.body;
    School.overall_details_teacher(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/robotics_course_lesson_track', function (req, res) {
    var userdata = req.body;
    School.robotics_course_lesson_track(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/reviews_list', function (req, res) {
    var userdata = req.body;
    School.reviews_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/doubts_list', function (req, res) {
    var userdata = req.body;
    School.doubts_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/doubts_details', function (req, res) {
    var userdata = req.body;
    School.doubts_details(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/create_doubt', function (req, res) {
    var userdata = req.body;
    School.create_doubt(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/send_doubt_message', function (req, res) {
    var userdata = req.body;
    School.send_doubt_message(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_course_track', function (req, res) {
    var userdata = req.body;
    School.student_course_track(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/student_course_summary_track', function (req, res) {
    var userdata = req.body;
    School.student_course_summary_track(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/update_user_new', function (req, res) {
    var userdata = req.body;
    School.update_user_new(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

app.post('/admin_update_school', function (req, res) {
    var userdata = req.body;
    School.admin_update_school(userdata, pool, function (http_status_code, err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (config.DEBUG == 2) console.log(response);
        res.status(http_status_code).send(response);
    });
});

//LAST LINE

app.post('/grades_list', function (req, res) {
    var userdata = req.body;
    School.grades_list(userdata, pool, function (http_status_code, err, response) {
        if (err) {
			console.log(err);
            throw err;
        }
        if (config.DEBUG == 2)
            console.log(response);
            res.status(http_status_code).send(response);
    });
});


app.post('/courses_by_grade', function (req, res) {
    var userdata = req.body;
    School.courses_by_grade(userdata, pool, function (http_status_code, err, response) {
        if (err) {
			console.log(err);
            throw err;
        }
        if (config.DEBUG == 2)
            console.log(response);
            res.status(http_status_code).send(response);
    });
});


app.post('/robotics_courses_list', function (req, res) {
    var userdata = req.body;
    School.robotics_courses_list(userdata, pool, function (http_status_code, err, response) {
		
        if (err) {
			console.log(err);
            throw err;
        }
        if (config.DEBUG == 2)
            console.log(response);
        res.status(http_status_code).send(response);
    });
});


module.exports = app;