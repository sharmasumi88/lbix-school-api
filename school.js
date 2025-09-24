var async = require("async");
var config = require('./config.js');
var FUNCTIONS = require("./functions.js");
var nodemailer = require('nodemailer');
const fs = require('fs');
var pdf = require('html-pdf');

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
	secure :false,
    auth: {
      user: 'hello@learningbix.com', // Your email id
      pass: 'Learningbix@123#$' // Your password 
    }
};

var transporter = nodemailer.createTransport(smtpConfig);

//AWS
var AWS = require('aws-sdk');
const { initParams } = require("request");
AWS.config.update({
    accessKeyId: "AKIAZNJI33ZWAGS5TKVX",
    secretAccessKey: "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",
    //"region": "s3-us-west-2" 
});
const s3 = new AWS.S3({   signatureVersion: 'v4',  })
var photoBucket = new AWS.S3({
	params: {
		Bucket: 'learningbix.com'
	}
})

var SAND_MERCHANT_KEY='L65Dbu'; //Unpfur7w  //IHr0pP
var SAND_MERCHANT_SALT='v3irXcow';//9oF3Hz5QaA  //YD5BIxBM
var PAYUMONEY_AUTHORIZATION_HEADER='dmPYPx2VM8cfSgTRLm/kPFfLf/Dt44jnAzpdp+bL/yU=';
//payuMoney
//var payUMoney = require('payumoney_nodejs');
var payUMoney = require('payumoney-node');
//payumoney.setProdKeys(MERCHANT_KEY, MERCHANT_SALT, PAYUMONEY_AUTHORIZATION_HEADER);
payUMoney.setKeys(SAND_MERCHANT_KEY, SAND_MERCHANT_SALT, PAYUMONEY_AUTHORIZATION_HEADER);
payUMoney.isProdMode(true);

// --- School Panel APIs only ---
module.exports.login = login;
module.exports.otp_generate_email = otp_generate_email;
module.exports.otp_verify_email = otp_verify_email;
module.exports.school_login = school_login;
module.exports.school_login_bypass = school_login_bypass;
module.exports.school_forgot_password = school_forgot_password;
module.exports.school_change_password = school_change_password;
module.exports.teacher_login = teacher_login;
module.exports.change_password = change_password;
module.exports.student_view_chapter_lessons_info = student_view_chapter_lessons_info;
module.exports.student_project_submit = student_project_submit;
module.exports.teacher_projects_review_list = teacher_projects_review_list;
module.exports.teacher_project_review_submit = teacher_project_review_submit;
module.exports.student_quiz_submit = student_quiz_submit;
module.exports.user_project_details = user_project_details;
module.exports.view_quiz_info_audit = view_quiz_info_audit;
module.exports.teacher_projects_review_details = teacher_projects_review_details;
module.exports.create_group_post = create_group_post;
module.exports.self_page_courses_details = self_page_courses_details;
module.exports.courses_by_grade = courses_by_grade;
module.exports.school_grades_list = school_grades_list;
module.exports.school_batches_student_list = school_batches_student_list;
module.exports.assign_course_to_student = assign_course_to_student;
module.exports.update_course_status = update_course_status;
module.exports.assign_student_project = assign_student_project;
module.exports.assign_student_quiz = assign_student_quiz;
module.exports.student_view_course_info = student_view_course_info;
module.exports.generate_certificate = generate_certificate;
module.exports.overall_details_teacher = overall_details_teacher;
module.exports.user_details = user_details;
module.exports.school_user_list = school_user_list;
module.exports.school_report_info = school_report_info;
module.exports.overall_leaderboard = overall_leaderboard;
module.exports.overall_leaderboard_weekly = overall_leaderboard_weekly;
module.exports.overall_leaderboard_teacher = overall_leaderboard_teacher;
module.exports.last_month_student_top_students = last_month_student_top_students;
module.exports.last_month_top_teacher = last_month_top_teacher;
module.exports.school_dashboard_info = school_dashboard_info;
module.exports.school_user_list_new = school_user_list_new;
module.exports.school_pending_user_list = school_pending_user_list;
module.exports.faqs_list = faqs_list;
module.exports.grades_list = grades_list;
module.exports.subjects_list = subjects_list;
module.exports.courses_list = courses_list;
module.exports.school_batches_list = school_batches_list;
module.exports.school_grade_courses_list = school_grade_courses_list;
module.exports.view_school_course_info = view_school_course_info;
module.exports.student_course_track = student_course_track;
module.exports.course_concepts_info = course_concepts_info;
module.exports.robotics_course_lesson_track = robotics_course_lesson_track;
module.exports.create_school_batch = create_school_batch;
module.exports.user_list = user_list;
module.exports.user_badges_point_list = user_badges_point_list;
module.exports.admin_school_details = admin_school_details;
module.exports.student_course_summary_track = student_course_summary_track;
module.exports.student_course_summary_points = student_course_summary_points;
module.exports.badges_list = badges_list;
module.exports.admin_update_school = admin_update_school;
module.exports.update_user_new = update_user_new;
module.exports.update_user_status = update_user_status;
module.exports.admin_assign_course_to_student_bulk = admin_assign_course_to_student_bulk;
module.exports.assign_course_to_student_bulk = assign_course_to_student_bulk;
module.exports.update_user_verified_status = update_user_verified_status;
module.exports.add_user = add_user;
module.exports.update_user = update_user;
module.exports.doubts_list = doubts_list;
module.exports.doubts_details = doubts_details;
module.exports.send_doubt_message = send_doubt_message;
module.exports.reviews_list = reviews_list;
module.exports.robotics_courses_list = robotics_courses_list;

module.exports.register_user_fun = register_user_fun;

module.exports.checkValidateStudent= checkValidateStudent;

module.exports.subscribe_course = subscribe_course;
module.exports.checkValidateEmailEmpProfile = checkValidateEmailEmpProfile;
// variables global
var secretSalt = config.secretSalt;

var SITE_TITLE = config.SITE_TITLE;
// new Date().toLocaleString('en-US', {
// 	timeZone: 'Asia/Calcutta'
// });
var weekday=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
var ToDate = new Date();
//var tday = weekday[ToDate.getDay()];
var Curdate =ToDate.getFullYear()+"-"+ parseInt(ToDate.getMonth()+1)+"-"+ ToDate.getDate();
var CurTime = ToDate.getHours() + ":" + ToDate.getMinutes() +":" + ToDate.getSeconds();

console.log('-CurTime-',CurTime);
console.log(Curdate+'-'+CurTime);

var dt = new Date();

dt.setMinutes( dt.getMinutes() - 15 );
var ButtonShowTime = dt.getHours() + ":" + dt.getMinutes()+":" + ToDate.getSeconds();
console.log('ButtonShowTime',ButtonShowTime);


function login(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var phone = '';
	var email = '';
	var role_id = '1';
	var password='';

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}

	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	
	console.log('userdata',userdata)
	pool.getConnection(function (err, connection) {
		var hash_password = sha1(secretSalt + userdata.password);
		
		squery ='SELECT users.*,age_group.title FROM users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id WHERE users.email="' + email + '" AND users.password="' + hash_password + '" AND users.email !="" AND users.role_id="'+role_id+'"';
		console.log('ss',squery)
		connection.query(squery, function (err, results) {
			if (!err)
			{
				if(results.length > 0){
					if(results[0].status != 1){
						resultJson = '{"replyCode":"error","replyMsg":"You are not Authorized","cmd":"login"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						var sid = hashids.encode(results[0].id);
						
						var dataResult = results[0];
						console.log('-------------------');
						console.log(dataResult);
						var dataResult = results[0];
						console.log('-------------------');
						console.log(dataResult);
						connection.query('SELECT deviceToken FROM users WHERE deviceToken="'+userdata.deviceToken+'"', function(errs, device){
							if(!errs){
								if(device.length > 0){
									connection.query('UPDATE users SET deviceToken=""  WHERE deviceToken="' + userdata.deviceToken +'"', function(errs, done){
										if(!errs){
											connection.query('UPDATE users SET deviceToken="' + userdata.deviceToken + '" WHERE id="' + dataResult.id + '" ');
										}
									});
								}else{
									connection.query('UPDATE users SET deviceToken="' + userdata.deviceToken + '" WHERE id="' + dataResult.id + '" ');
								}
							}
						});
					
						results[0].deviceToken=	userdata.deviceToken;
						resultJson = '{"replyCode":"success","replyMsg": "success", "data":'+ JSON.stringify(results[0]) +',"sid":"'+sid+'","cmd":"login"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;		
					}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Please check your login credentials.","cmd":"login"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"login"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

function change_password(userdata, pool, callback){
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var sid = '';
	var password = '';
	var current_password = '';
	
	if (typeof userdata.sid != 'undefined' && userdata.sid != '') {
		sid = userdata.sid;
	}
	
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.current_password != 'undefined' && userdata.current_password != '') {
		current_password = userdata.current_password;
	}
	console.log(userdata);
	pool.getConnection(function (err, connection) {
		var hash_newpassword = sha1(secretSalt + password);
		
		var hash_oldpassword = sha1(secretSalt + current_password);
		var uid = hashids.decode(sid);
		console.log('SELECT * FROM users WHERE id = "' + uid + '"');
		connection.query('SELECT * FROM users WHERE id = "'+uid+'"', function(err, user){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"changePassword"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}else{
				if(user.length > 0){
					console.log('old',user[0].password);
					console.log('new',hash_oldpassword);
					if(user[0].password == hash_oldpassword){
						connection.query('UPDATE users SET password = "'+hash_newpassword+'",password_text="'+password+'" WHERE id = "'+uid+'"', function(errs, done){
							if(errs){
								resultJson = '{"replyCode":"error","replyMsg":"' + errs.message + '","cmd":"changePassword"}\n';
								connection.release();
								callback(400, null, resultJson);
								return;
							}else{
								connection.query('SELECT * FROM email_templates WHERE email_type = "change_password"', function(err, resultTemplate){
									if(resultTemplate.length > 0){
										var nodemailer = require('nodemailer');
										var message = resultTemplate[0].message;
										var name =user[0].fullName;
										var email =user[0].email;
										message = message.replace("[fullname]", name);
										message = message.replace("[EMAIL]", email);
										message = message.replace("[sitename]", SITE_TITLE);

										// setup e-mail data with unicode symbols
										var mailOptions = {
											from: SITE_TITLE+' <info@learning-bix.com>', // sender address
											to: email, // list of receivers
											subject: resultTemplate[0].subject, // Subject line
											html: message // html body
										};
											//from: smtpMailUser,
										// resultJson = '{"replyCode":"success","replyMsg":"Password has been changed successfully."}\n';
										// connection.release();
										// callback(200, null, resultJson);
										// return;
										
										var transporter = nodemailer.createTransport(smtpConfig);

										// send mail with defined transport object
										transporter.sendMail(mailOptions, function (error, info) {
											if (error) {
												console.log('ERRPR-EAMIL',error);
												resultJson = '{"replyCode":"success","replyMsg":"Password has been changed successfully"}\n';
												connection.release();
												callback(200, null, resultJson);
												return;
											} else {
												
												resultJson = '{"replyCode":"success","replyMsg":"Password has been changed successfully."}\n';
												connection.release();
												callback(200, null, resultJson);
												return;
											
											}
										});
									}
								});
							}
						});
					}else{
						resultJson = '{"replyCode":"error","replyMsg":"Old Password is not correct","cmd":"changePassword"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Old Password is not correct","cmd":"changePassword"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}
		});
	});
}

// view class info
//student_booked_classes
/*course_chapters details*/
function student_view_chapter_lessons_info(userdata, pool, callback){
	var resultJson = '';
	var course_chapter_id ='';
	var student_id='';
	var type='';//0-live,1-bonus
	var Keyconditoin='';
	//var orderBy='ORDER BY CAST(chapter_lessons.day AS unsigned)';
	var orderBy='ORDER BY chapter_lessons.s_no ASC';

	if (typeof userdata.course_chapter_id != 'undefined' && userdata.course_chapter_id != '') {
		course_chapter_id = userdata.course_chapter_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.type != 'undefined' && userdata.type != '') {
		type = userdata.type;
	}
	
	console.log('----------');
	console.log(userdata);
	
	pool.getConnection(function (err, connection){
		var Catquery='SELECT course_chapters.*,(SELECT users.name from users where users.id="'+student_id+'") as student_name,(SELECT users.parents_name from users where users.id="'+student_id+'") as parents_name,(SELECT users.phone from users where users.id="'+student_id+'") as phone FROM course_chapters WHERE id="'+course_chapter_id+'" AND status="1" ORDER BY course_chapters.s_no ASC';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					if(type !=''){
						Keyconditoin =' AND  classes.type='+type+' AND (SELECT COUNT(classes.type) from classes WHERE classes.id =chapter_lessons.refrence_id AND classes.type="'+type+'" )>0';
					}
					

					var Detquery='SELECT chapter_lessons.*,classes.image as image, classes.type as class_type,(SELECT student_lessons_status.duration from student_lessons_status WHERE student_id ="'+student_id+'" AND lesson_id=chapter_lessons.id LIMIT 1) as duration,(SELECT student_lessons_status.percentage from student_lessons_status WHERE student_id ="'+student_id+'" AND lesson_id=chapter_lessons.id LIMIT 1) as percentage,(SELECT student_booked_classes.student_project_link from student_booked_classes WHERE student_id ="'+student_id+'" AND chapter_id=chapter_lessons.course_chapter_id LIMIT 1) as student_project_link FROM chapter_lessons LEFT JOIN classes as classes ON classes.id = chapter_lessons.refrence_id WHERE course_chapter_id="'+course_chapter_id+'" AND chapter_lessons.status="1" '+Keyconditoin+'  '+orderBy+'';
					console.log('qq',Detquery);
					connection.query(Detquery, function(errinsertDet, resProDet){
						if(!errinsertDet){
							resPro.lessons = resProDet;
							var i = 0;
							async.eachSeries(resProDet,function(rec2, loop2){
								var refrence_id = rec2.refrence_id;
								var type = rec2.type; //1-class,2-project,3-quiz
								console.log('refrence_id',refrence_id);
								if(type=="3"){
									lessonConQuery = 'SELECT quizzes.*,(SELECT percentage from student_quizzes where student_quizzes.quiz_id="'+refrence_id+'" AND student_quizzes.student_id="'+student_id+'") as percentage  from quizzes where quizzes.id="'+refrence_id+'"';
								}else if(type=="2"){
									lessonConQuery = 'SELECT projects.*,(SELECT percentage from student_projects where student_projects.project_id="'+refrence_id+'" AND student_projects.student_id="'+student_id+'") as percentage from projects where projects.id="'+refrence_id+'"';
								}else{
									lessonConQuery = 'SELECT classes.* from classes where classes.id="'+refrence_id+'"';
								}
							
								console.log('lessonConQuery',lessonConQuery);
								connection.query(lessonConQuery, function(errContent,resContent){
									if(errContent){
										console.log('errSelpiMG',errContent);
										
										loop2();
									}else{
										if(type=="1"){
											langQuery = 'SELECT class_languages.* from class_languages where class_languages.class_id="'+resContent[0].id+'"';
											connection.query(langQuery, function(errLang,resLang){
												if(errLang){
													console.log(errLang);
													loop2();
												}else{
													resProDet[i].languages=resLang;
													resProDet[i].content=resContent;
													loop2();
													i=i+1;
												}
											})	
										}else{
											resProDet[i].content=resContent;
											loop2();
											i=i+1;
										}
									}
									
								});
								
							},function(errSelPro){
								if(errSelPro){
									console.log('errSelPro',errSelPro)
									resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"view_chapter_lessons_info"}\n';
									connection.release();
									callback(200, null, resultJson);
									return;
								}else{

									var ActivityQuery='SELECT * FROM activities WHERE activities.chapter_id="'+course_chapter_id+'" AND status="1"';
									console.log('ActivityQuery',ActivityQuery);
									connection.query(ActivityQuery, function(errinsertDActivity, resActivity){
										if(!errinsertDActivity){
											var conceptQuery='SELECT * FROM chapter_concepts WHERE chapter_concepts.chapter_id="'+course_chapter_id+'"';
											console.log('conceptQuery',conceptQuery);
											connection.query(conceptQuery, function(errConcept, resConcept){
												if(!errConcept){
													console.log("resConcept");
													if(resActivity.length>0){
														resPro[0].activities=resActivity;
													}else{
														resPro[0].activities=[];
													}
													
													if(resConcept.length>0){
														resPro[0].concepts=resConcept;
													}else{
														resPro[0].concepts=[];
													}

													resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"lessons":'+JSON.stringify(resProDet)+',"cmd":"view_chapter_lessons_info"}\n';
													console.log('res-suceess',resultJson);
													connection.release();
													callback(200, null, resultJson);
													return;
												}else{
													resultJson = '{"replyCode":"error","replyMsg":"'+errinsertDActivity.message+'","cmd":"view_chapter_lessons_info"}\n';
													connection.release();
													callback(200, null, resultJson);
													return;	
												}
											})
										}else{
											resultJson = '{"replyCode":"error","replyMsg":"'+errinsertDActivity.message+'","cmd":"view_chapter_lessons_info"}\n';
											connection.release();
											callback(200, null, resultJson);
											return;	
										}
									})
								}
							});
						}else{
							resultJson = '{"replyCode":"error","replyMsg":"'+errinsertDet.message+'","cmd":"view_chapter_lessons_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					})
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_chapter_lessons_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_chapter_lessons_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

// project submit

function student_project_submit(userdata, pool, callback){
	var resultJson = '';
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var project_link = '';
	var student_project_id = '';
	var student_document= '';
	var percentage='100';
	var sid = '';
	
	if (typeof userdata.sid != 'undefined' && userdata.sid != '') {
		sid = userdata.sid;
	}
	if (typeof userdata.student_project_id != 'undefined' && userdata.student_project_id != '') {
		student_project_id = userdata.student_project_id;
	}
	if (typeof userdata.project_link != 'undefined' && userdata.project_link != '') {
		project_link = userdata.project_link;
	}
	if (typeof userdata.student_document != 'undefined' && userdata.student_document != '') {
		student_document = userdata.student_document;
	}
	if (typeof userdata.percentage != 'undefined' && userdata.percentage != '') {
		percentage = userdata.percentage;
	}
	var student_id=hashids.decode(sid);
	
	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var queryinsert ='UPDATE student_projects SET project_link="'+project_link+'",student_document="'+student_document+'",percentage="'+percentage+'",submit_date=NOW(),in_review="1" where student_projects.project_id="'+student_project_id+'" AND student_projects.student_id="'+student_id+'"';
	
		console.log(queryinsert);
		connection.query(queryinsert, function(errinsert, resultinsert){
			if(!errinsert){
				resultJson = '{"replyCode":"success","replyMsg":"Project submitted successfully","cmd":"project_submit"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"project_submit"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}
// teacher project review liat

function teacher_projects_review_list(userdata, pool, callback){
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var sid = '';
	var resultJson = '';
	var teacher_id='0';
	var in_review='1';	//1-in-review,2-review-complete,3-calnceled
	var Keyconditoin=' AND student_projects.status ="1"';
	
	if (typeof userdata.in_review != 'undefined' && userdata.in_review != '') {
		in_review = userdata.in_review;
	}
	if (typeof userdata.sid != 'undefined' && userdata.sid != '') {
		sid = userdata.sid;
		teacher_id=hashids.decode(sid);
	}

	if(in_review !=''){
		Keyconditoin +=' AND student_projects.in_review ="'+in_review+'"';
	}
	
	pool.getConnection(function (err, connection) {
		
		//chapter_lessons
		if(teacher_id =='0'){
			detailsquery = 'SELECT student_projects.*,(SELECT chapter_lessons.refrence_id from chapter_lessons WHERE chapter_lessons.course_chapter_id = student_projects.chapter_id LIMIT 1) as refrence_id,projects.project_title,projects.earn_points,projects.description as project_description,course_chapters.chapter_title,course_chapters.chapter_description,teacher.name as teacher_name,teacher.id as teacher_id,student.name as student_name,student.id as student_id,student.phone as student_phone,student.parents_name,student.parents_name as school_name from student_projects as student_projects LEFT JOIN users as student ON student.id = student_projects.student_id LEFT JOIN users as teacher ON teacher.id = student_projects.teacher_id  LEFT JOIN course_chapters as course_chapters ON course_chapters.id = student_projects.chapter_id LEFT JOIN projects as projects ON projects.id = student_projects.project_id  where student_projects.status ="1" AND student_projects.in_review ="'+in_review+'" order by submit_date DESC';
		}else{
			detailsquery = 'SELECT student_projects.*,(SELECT chapter_lessons.refrence_id from chapter_lessons WHERE chapter_lessons.course_chapter_id = student_projects.chapter_id LIMIT 1) as refrence_id,projects.project_title,projects.earn_points,projects.description as project_description,course_chapters.chapter_title,course_chapters.chapter_description,teacher.name as teacher_name,teacher.id as teacher_id,student.name as student_name,student.id as student_id,student.phone as student_phone,student.parents_name,student.parents_name as school_name from student_projects as student_projects LEFT JOIN users as student ON student.id = student_projects.student_id LEFT JOIN users as teacher ON teacher.id = student_projects.teacher_id  LEFT JOIN course_chapters as course_chapters ON course_chapters.id = student_projects.chapter_id LEFT JOIN projects as projects ON projects.id = student_projects.project_id  where student_projects.teacher_id ="'+teacher_id+'" '+Keyconditoin+' order by submit_date DESC';
		}
		
		console.log('detailsquery',detailsquery);
		connection.query(detailsquery, function(errSelDetails,resSelDetails){
			if(errSelDetails){
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelDetails.message+'","cmd":"teacher_projects_review_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resSelDetails)+',"cmd":"teacher_projects_review_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function teacher_projects_review_details(userdata, pool, callback){
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var sid = '';
	var resultJson = '';
	var student_project_id='1';	//1-in-review,2-review-complete,3-calnceled
	var Keyconditoin=' AND student_projects.status ="1"';
	if (typeof userdata.student_project_id != 'undefined' && userdata.student_project_id != '') {
		student_project_id = userdata.student_project_id;
	}
	pool.getConnection(function (err, connection) {
		var teacher_id=hashids.decode(sid);
		//chapter_lessons
		detailsquery = 'SELECT student_projects.*,(SELECT chapter_lessons.refrence_id from chapter_lessons WHERE chapter_lessons.course_chapter_id = student_projects.chapter_id LIMIT 1) as refrence_id,projects.project_title,projects.earn_points,projects.description as project_description,course_chapters.chapter_title,course_chapters.chapter_description,teacher.name as teacher_name,teacher.id as teacher_id,student.name as student_name,student.id as student_id,student.phone as student_phone,student.parents_name,student.parents_name as school_name from student_projects as student_projects LEFT JOIN users as student ON student.id = student_projects.student_id LEFT JOIN users as teacher ON teacher.id = student_projects.teacher_id  LEFT JOIN course_chapters as course_chapters ON course_chapters.id = student_projects.chapter_id LEFT JOIN projects as projects ON projects.id = student_projects.project_id  where student_projects.id ="'+student_project_id+'" '+Keyconditoin+'';
		console.log('detailsquery',detailsquery);
		connection.query(detailsquery, function(errSelDetails,resSelDetails){
			if(errSelDetails){
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelDetails.message+'","cmd":"teacher_projects_review_details"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resSelDetails)+',"cmd":"teacher_projects_review_details"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}
// teacher project review submit

function teacher_project_review_submit(userdata, pool, callback){
	var resultJson = '';
	var teacher_comment = '';
	var points_earned = '0';
	var rating = '2';
	var student_project_id = "";

	if (typeof userdata.student_project_id != 'undefined' && userdata.student_project_id != '') {
		student_project_id = userdata.student_project_id;
	}
	if (typeof userdata.teacher_comment != 'undefined' && userdata.teacher_comment != '') {
		teacher_comment = userdata.teacher_comment;
	}
	
	if (typeof userdata.points_earned != 'undefined' && userdata.points_earned != '') {
		points_earned = userdata.points_earned;
	}
	if (typeof userdata.rating != 'undefined' && userdata.rating != '') {
		rating = userdata.rating;
	}
	
	
	var myDate = new Date();
	console.log('myDate>>>>>>>',myDate)
	// myDate.setDate(myDate.getDate() +7);
	NewSchDate =myDate.getFullYear()+"-"+ parseInt(myDate.getMonth()+1)+"-"+ myDate.getDate();
	console.log('NewSchDate>>>>>>>',NewSchDate)

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var queryinsert ='UPDATE student_projects SET teacher_comment="'+teacher_comment+'",points_earned="'+points_earned+'",rating="'+rating+'",completion_date="'+NewSchDate+'",in_review="2" where student_projects.id='+student_project_id+'';
	
		console.log(queryinsert);
		connection.query(queryinsert, function(errinsert, resultinsert){
			if(!errinsert){
				resultJson = '{"replyCode":"success","replyMsg":"Project review submitted successfully","cmd":"teacher_project_review_submit"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"teacher_project_review_submit"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

// student quiz submition

function student_quiz_submit(userdata, pool, callback){
	var resultJson = '';
	var student_quiz_id ='';
	var quiz_id ='';
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var sid = '';
	var questions ='';
	var total_points="0";
	var percentage='0';
	
	if (typeof userdata.sid != 'undefined' && userdata.sid != '') {
		sid = userdata.sid;
	}
	if (typeof userdata.student_quiz_id != 'undefined' && userdata.student_quiz_id != '') {
		student_quiz_id = userdata.student_quiz_id;
	}
	if (typeof userdata.quiz_id != 'undefined' && userdata.quiz_id != '') {
		quiz_id = userdata.quiz_id;
	}
	
	if (typeof userdata.questions != 'undefined' && userdata.questions != '') {
		questions = userdata.questions;
	}
	if (typeof userdata.percentage != 'undefined' && userdata.percentage != '') {
		percentage = userdata.percentage;
	}

	console.log('----------');
	console.log(userdata);
	
	pool.getConnection(function (err, connection){
		student_id=hashids.decode(sid);
		Catquery ='UPDATE student_quizzes SET in_review = "2",percentage="'+percentage+'" WHERE id = "'+student_quiz_id+'"';
	
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				var i = 0;
				async.eachSeries(questions,function(rec2, loop2){
					
					var quizzes_question_id = rec2.id;
					var user_answer=rec2.user_answer;
					var points_earned = "0";
					var Detquery='SELECT quizzes_questions.answer,quizzes_questions.points FROM quizzes_questions WHERE quizzes_questions.id="'+quizzes_question_id+'"';
					console.log('qq',Detquery);
					connection.query(Detquery, function(errinsertDet, resProDet){
						if(!errinsertDet){
							var Sysanswer=resProDet[0].answer;
							var points=resProDet[0].points;
							console.log('Sysanswer',Sysanswer);
							console.log('points',points);
							if(Sysanswer===user_answer){
								points_earned=points;
								total_points = parseInt(total_points)+parseInt(points_earned);
							}else{
								points_earned="0";
								total_points = parseInt(total_points)+parseInt(points_earned);
							}
							squery ='INSERT INTO student_quizzes_answer SET student_id = "'+student_id+'",quiz_id="'+quiz_id+'",quizzes_question_id="'+quizzes_question_id+'",user_answer="'+user_answer+'",points="'+points_earned+'",status="1",created=NOW()';
							console.log('squery',squery);
							connection.query(squery, function(errContent,resContent){
								if(errContent){
									console.log('errSelpiMG',errContent);
									
									loop2();
								}else{
									
									loop2();
								}
								i=i+1;
							});
						}else{
							console.log(errinsertDet);
							loop2();
						}
					});
					
				},function(errinsertDet){
					if(errinsertDet){
						resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"student_quiz_submit"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						var Pointsquery ='UPDATE student_quizzes SET points_earned = "'+total_points+'" WHERE id = "'+student_quiz_id+'"';
						console.log(Pointsquery);
						connection.query(Pointsquery);
						resultJson = '{"replyCode":"success","replyMsg":"Quiz submitted successfully","cmd":"student_quiz_submit"}\n';
						console.log('res-suceess');
						connection.release();
						callback(200, null, resultJson);
						return;	
						
					}
				});
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"student_quiz_submit"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

// create group post

function create_group_post(userdata, pool, callback){
	var resultJson = '';
	
	var post_title = '';
	var post_description='';
	var post_image='';
	var video='';
	var featured='';
	var user_id='';
	var group_id='';
	var project_id='';
	var status='1';
	var id='';
	var learning="0";
	if (typeof userdata.learning != 'undefined' && userdata.learning != '') {
		learning = userdata.learning;
	}
	
	if (typeof userdata.post_title != 'undefined' && userdata.post_title != '') {
		post_title = userdata.post_title;
	}
	
	
	if (typeof userdata.post_description != 'undefined' && userdata.post_description != '') {
		post_description = userdata.post_description;
	}
	
	if (typeof userdata.post_image != 'undefined' && userdata.post_image != '') {
		post_image = userdata.post_image;
	}
	
	
	if (typeof userdata.group_id != 'undefined' && userdata.group_id != '') {
		group_id = userdata.group_id;
	}
	
	if (typeof userdata.user_id != 'undefined' && userdata.user_id != '') {
		user_id = userdata.user_id;
	}
	if (typeof userdata.project_id != 'undefined' && userdata.project_id != '') {
		project_id = userdata.project_id;
	}
	
	if (typeof userdata.video != 'undefined' && userdata.video != '') {
		video = userdata.video;
	}
	if (typeof userdata.featured != 'undefined' && userdata.featured != '') {
		featured = userdata.featured;
	}

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	
	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {

		if(id !=''){
			var queryinsert ='UPDATE group_posts SET post_title="'+post_title+'",post_description="'+post_description+'",post_image="'+post_image+'",group_id="'+group_id+'",user_id="'+user_id+'",project_id="'+project_id+'",video="'+video+'",featured="'+featured+'",learning="'+learning+'" where id="'+id+'"';
		}else{
			var queryinsert ='INSERT INTO group_posts SET post_title="'+post_title+'",post_description="'+post_description+'",post_image="'+post_image+'",group_id="'+group_id+'",user_id="'+user_id+'",project_id="'+project_id+'",video="'+video+'",featured="'+featured+'",status="'+status+'",learning="'+learning+'",created=NOW()';
		}
		console.log(queryinsert);
		connection.query(queryinsert, function(errinsert, resultinsert){
			if(!errinsert){
				resultJson = '{"replyCode":"success","replyMsg":"Post created successfully","cmd":"Group"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"Group"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

function update_course_status(userdata, pool, callback){
	var resultJson = '';
	var strJson = '';
	var student_id = "";
	var lesson_id = "";
	var chapter_id = "";
	var percentage = "0";
	var duration = "0";

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	
	if (typeof userdata.lesson_id != 'undefined' && userdata.lesson_id != '') {
		lesson_id = userdata.lesson_id;
	}
	if (typeof userdata.chapter_id != 'undefined' && userdata.chapter_id != '') {
		chapter_id = userdata.chapter_id;
	}

	if (typeof userdata.percentage != 'undefined' && userdata.percentage != '') {
		percentage = userdata.percentage;
	}

	if (typeof userdata.duration != 'undefined' && userdata.duration != '') {
		duration = userdata.duration;
	}
	console.log('---');
	pool.getConnection(function (err, connection) {
		
		Query='SELECT id FROM student_lessons_status WHERE student_id ="'+student_id+'" AND lesson_id="'+lesson_id+'"';
		
		//console.log(Query);
		connection.query(Query, function(err, checkRate){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"lesson status"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				if(checkRate.length && checkRate[0].id != '' && checkRate[0].id != 0){
					Query = 'UPDATE student_lessons_status SET student_id="' + student_id + '",lesson_id="' + lesson_id + '",chapter_id="'+chapter_id+'",percentage="' + percentage + '", duration="'+duration+'",status="1",created=NOW() WHERE id = "'+checkRate[0].id+'" '
				}else{
					Query='INSERT INTO student_lessons_status set student_id="' + student_id + '",lesson_id="' + lesson_id + '",chapter_id="'+chapter_id+'",percentage="' + percentage + '", duration="'+duration+'",status="1",created=NOW() ';
				}	
				//console.log(Query);
				connection.query(Query, function(err, rate){
					if(err){
						resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"update_course_status"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						connection.query('SELECT * from student_lessons_status WHERE student_id ="'+student_id+'" AND lesson_id="'+lesson_id+'" ', function(err, rateData){
							if(err){
								resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"update_course_status"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							}else{
								resultJson = '{"replyCode":"success","replyMsg":"status succefull", "data":'+JSON.stringify(rateData[0])+',"cmd":"update_course_status"}\n';
								//console.log('res-suceess');
								connection.release();
								callback(200, null, resultJson);
								return;	
							}
						})
					}
				})		
			}
		});	
	});
}

/*classes details*/
function student_view_course_info(userdata, pool, callback){
	var resultJson = '';
	var id ='';
	var student_id ='';
	
	if (typeof userdata.id != 'undefined' && userdata.id != ''){
		id = userdata.id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != ''){
		student_id = userdata.student_id;
	}
	
	console.log('----------');
	console.log(userdata);
	pool.getConnection(function (err, connection){
		var Catquery='SELECT courses.*,(SELECT student_course_subscription.certificate_name from student_course_subscription WHERE student_course_subscription.course_id=courses.id AND student_course_subscription.student_id="'+student_id+'" LIMIT 1) as certificate FROM courses WHERE id="'+id+'" AND status="1"';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					var i = 0;
					async.eachSeries(resPro,function(rec2, loop2){
						var course_id = rec2.id;
						console.log('course_id',course_id);
						proiMGquery = 'SELECT course_chapters.*,(SELECT count(*) from chapter_lessons WHERE chapter_lessons.course_chapter_id=course_chapters.id AND chapter_lessons.status="1") as total_lessons,(SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") + (SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") +(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as complete_lessons from course_chapters where course_chapters.course_id="'+course_id+'" AND course_chapters.status="1" ORDER BY course_chapters.s_no ASC';
						console.log('proiMGquery',proiMGquery);
						connection.query(proiMGquery, function(errSelpiMG,respROiMG){
							if(errSelpiMG){
								console.log('errSelpiMG',errSelpiMG);
								
								loop2();
							}else{
								resPro[i].chapters=respROiMG;
								loop2();
							}
							i=i+1;
						});
						
					},function(errSelPro){
						if(errSelPro){
							console.log('errSelPro',errSelPro)
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"view_classes_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"view_classes_info"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_classes_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

function self_page_courses_details(userdata, pool, callback){
	var resultJson = '';
	var course_id='';
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}
	pool.getConnection(function (err, connection) {
		
		var Catquery='SELECT * FROM courses WHERE status ="1" AND id="'+course_id+'" ORDER BY created ASC';
		
		connection.query(Catquery, function(err, res){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"self_page_courses_details"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				
				if(res.length >0){
					var rec_course_id = res[0].recommended_course_id;
					userquery = 'SELECT course_info.* from course_info where course_info.course_id="'+course_id+'" AND course_info.status="1"';
					console.log('userquery',userquery);
					connection.query(userquery, function(errSel,resSel){
						if(errSel){
							resultJson = '{"replyCode":"error","replyMsg":"'+errSel.message+'","cmd":"self_page_courses_details"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{

							faqQuery = 'SELECT course_faq.* from course_faq where course_faq.course_id="'+course_id+'" AND course_faq.status="1"';
							console.log('faqQuery',faqQuery);
							connection.query(faqQuery, function(errSelFaq,resSelFaq){
								if(errSelFaq){
									resultJson = '{"replyCode":"error","replyMsg":"'+errSelFaq.message+'","cmd":"self_page_courses_details"}\n';
									console.log('res-suceess');
									connection.release();
									callback(200, null, resultJson);
									return;
								}else{
									RecQuery = 'SELECT courses.* from courses where courses.id="'+rec_course_id+'" ';
									console.log('RecQuery',RecQuery);
									connection.query(RecQuery, function(errSelRec,resSelRec){
										if(errSelRec){
											resultJson = '{"replyCode":"error","replyMsg":"'+errSelRec.message+'","cmd":"self_page_courses_details"}\n';
											console.log('res-suceess');
											connection.release();
											callback(200, null, resultJson);
											return;
										}else{
											if(resSelFaq.length>0){
												res[0].faq=resSelFaq;
											}else{
												res[0].faq=[];
											}
											if(resSel.length>0){
												res[0].info=resSel;
											}else{
												res[0].info=[];
											}
											if(resSelRec.length>0){
												res[0].recommended_course=resSelRec[0];
											}else{
												res[0].recommended_course=[];
											}
										
											resultJson = '{"replyCode":"success","replyMsg":"course details found", "data":'+JSON.stringify(res)+',"cmd":"self_page_courses_details"}\n';
											console.log('res-suceess');
											connection.release();
											callback(200, null, resultJson);
											return;	
										}
										
									});
								}
								
							});
						}
						
					});
					
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.", "cmd":"web_document_checklist_details"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}	
				
			}
		});	
	});
}

// assign student quiz
function assign_student_quiz(userdata, pool, callback){
	var resultJson = '';
	var student_id = '';
	var quiz_id = '';
	var chapter_id= '';

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.quiz_id != 'undefined' && userdata.quiz_id != '') {
		quiz_id = userdata.quiz_id;
	}
	if (typeof userdata.chapter_id != 'undefined' && userdata.chapter_id != '') {
		chapter_id = userdata.chapter_id;
	}
	
	
	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		Cquery='SELECT student_quizzes.* from student_quizzes where student_id="'+student_id+'" AND  quiz_id="'+quiz_id+'" AND in_review !="3"';
		console.log(Cquery);
		connection.query(Cquery, function(errSel, resultSel){
			if(!errSel){
				if(resultSel.length>0){
					resultJson = '{"replyCode":"success","replyMsg":"already assigned","cmd":"assign_student_quiz","student_quiz_id":"'+resultSel[0].id+'"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}else{
					
					queryinsert ='INSERT INTO student_quizzes SET teacher_id = "0",student_id="'+student_id+'",quiz_id="'+quiz_id+'",chapter_id="'+chapter_id+'",status="1",points_earned="0",in_review="0",created=NOW()';
					
					console.log(queryinsert);
					connection.query(queryinsert, function(errinsert, resultinsert){
						if(!errinsert){
							resultJson = '{"replyCode":"success","replyMsg":"QUIZ ASSIGNED successfully","student_quiz_id":"'+resultinsert.insertId+'","cmd":"assign_student_quiz"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"assign_student_quiz"}\n';
							console.log('res-suceess');
							connection.release();
							callback(400, null, resultJson);
							return;
						}
					});
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"'+errSel.message+'","cmd":"assign_student_quiz"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		})	
		
	});
}


function generate_certificate(userdata, pool, callback) {
	var html = fs.readFileSync('./certificates/certificate.html', 'utf8');
	var student_id = "";
	var course_id = "";
	var name = "Learning";
	var course_name = "Learning";
	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
		pdfname = name.replaceAll(/\s/g,'');
	}
	
	if (typeof userdata.course_name != 'undefined' && userdata.course_name != '') {
		course_name = userdata.course_name;
	}
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}
	
	html = html.replace("{STUDENT_NAME}", name);
	html = html.replace("{COURSE_NAME}", course_name);
	var options = { format: 'Letter' };
	pool.getConnection(function (err, connection) {
		pdf.create(html, options).toFile('./certificates/'+pdfname+'.pdf', function(err, res) {
			if (err){
				console.log(err);
			}else{
				console.log(res); 
				queryinsert ='UPDATE student_course_subscription SET certificate_name = "'+pdfname+'.pdf" where course_id="'+course_id+'" AND student_id="'+student_id+'"';
				
				console.log(queryinsert);
				connection.query(queryinsert, function(errinsert, resultinsert){
					if(!errinsert){
						var cType = 'application/pdf';
						var params = {
							Bucket: 'learningbix.com',
							Key:pdfname+'.pdf', 
							Body: fs.createReadStream(config.CERTIFICATE_URL_UPLOAD+'/'+pdfname+'.pdf'),
							ContentType: cType,
							ACL: "public-read"
						};
						photoBucket.upload(params, function(err, data){
							if (err) 
							  { 
								  console.log('Error uploading data: ', err); 
								  resultJson = '{"replyCode":"error","replyMsg":"'+err+'","cmd":"generate_certificate"}\n';
								   connection.release();
								   callback(200, null, resultJson);
							  }else{
								resultJson = '{"replyCode":"success","replyMsg":"Certificate generated successfully","cmd":"generate_certificate"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							  }
						  });
						
					}else{
						resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"generate_certificate"}\n';
						console.log('res-suceess');
						connection.release();
						callback(400, null, resultJson);
						return;
					}
				});
			} 
			
		});	
	})

}

// assign student Project
function assign_student_project(userdata, pool, callback){
	var resultJson = '';
	var student_id = '';
	var project_id = '';
	var chapter_id= '';
	var created_by= '';

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.project_id != 'undefined' && userdata.project_id != '') {
		project_id = userdata.project_id;
	}
	if (typeof userdata.chapter_id != 'undefined' && userdata.chapter_id != '') {
		chapter_id = userdata.chapter_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	
	
	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		Cquery='SELECT student_projects.* from student_projects where student_id="'+student_id+'" AND  project_id="'+project_id+'" AND in_review !="3"';
		console.log(Cquery);
		connection.query(Cquery, function(errSel, resultSel){
			if(!errSel){
				if(resultSel.length>0){
					resultJson = '{"replyCode":"success","replyMsg":"already assigned","cmd":"assign_student_project","student_project_id":"'+resultSel[0].id+'"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}else{
					var myDate = new Date();
					myDate.setDate(myDate.getDate() +7);
					NewSchDate =myDate.getFullYear()+"-"+ parseInt(myDate.getMonth()+1)+"-"+ myDate.getDate();
					
					queryinsert ='INSERT INTO student_projects SET teacher_id = "'+created_by+'",student_id="'+student_id+'",project_id="'+project_id+'",chapter_id="'+chapter_id+'",completion_date="'+NewSchDate+'",status="1",points_earned="0",in_review="0",created=NOW()';
					
					console.log(queryinsert);
					connection.query(queryinsert, function(errinsert, resultinsert){
						if(!errinsert){
							resultJson = '{"replyCode":"success","replyMsg":"Project assigned successfully","cmd":"assign_student_project"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"assign_student_project","student_project_id":"'+resultinsert.insertId+'"}\n';
							console.log('res-suceess');
							connection.release();
							callback(400, null, resultJson);
							return;
						}
					});
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"'+errSel.message+'","cmd":"assign_student_project"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		})	
		
	});
}

/*projects details*/
function user_project_details(userdata, pool, callback){
	var resultJson = '';
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var sid = '';
	var id ='';
	var refrence_id='0';
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	
	if (typeof userdata.refrence_id != 'undefined' && userdata.refrence_id != '') {
		refrence_id = userdata.refrence_id;
	}
	if (typeof userdata.sid != 'undefined' && userdata.sid != '') {
		sid = userdata.sid;
	}
	
	console.log('----------');
	console.log(userdata);
	
	pool.getConnection(function (err, connection){
		var student_id=hashids.decode(sid);
		var Catquery='SELECT projects.*,student_projects.teacher_id,student_projects.class_id,student_projects.project_link,student_projects.teacher_comment,student_projects.completion_date,student_projects.in_review,student_projects.rating,student_projects.completion_date,student_projects.student_document,(SELECT users.name from users where users.id=student_projects.teacher_id) as teacher_name,(SELECT classes.class_summary_pdf from classes where classes.id=student_projects.class_id) as class_summary_pdf FROM projects LEFT JOIN student_projects as student_projects ON student_projects.project_id = projects.id AND student_projects.student_id="'+student_id+'" WHERE projects.id="'+id+'" LIMIT 1';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resultinsert){
			if(!errinsert){
				
				resultJson = '{"replyCode":"success","replyMsg":"Project details","data":'+JSON.stringify(resultinsert)+'}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"projectss"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

//user quiz verify

function view_quiz_info_audit(userdata, pool, callback){
	var resultJson = '';
	var quiz_id ='';
	var student_id ='';
	
	if (typeof userdata.quiz_id != 'undefined' && userdata.quiz_id != '') {
		quiz_id = userdata.quiz_id;
	}
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	
	console.log('----------');
	console.log(userdata);
	
	pool.getConnection(function (err, connection){
		var Catquery='SELECT quizzes.*,student_quizzes.in_review FROM quizzes LEFT JOIN student_quizzes as student_quizzes ON student_quizzes.quiz_id = quizzes.id WHERE quizzes.id="'+quiz_id+'" AND student_quizzes.student_id="'+student_id+'" GROUP BY quizzes.id';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					proiMGquery = 'SELECT quizzes_questions.id,quizzes_questions.question_title,quizzes_questions.question_description,quizzes_questions.answer,quizzes_questions.answer_description,quizzes_questions.option1,quizzes_questions.option2,quizzes_questions.option3,quizzes_questions.option4,quizzes_questions.points,quizzes_questions.question_image,quizzes_questions.option1_image,quizzes_questions.option2_image,quizzes_questions.option3_image,quizzes_questions.option4_image,student_quizzes_answer.user_answer,student_quizzes_answer.user_answer as user_answer1,student_quizzes_answer.points as user_points from quizzes_questions LEFT JOIN student_quizzes_answer as student_quizzes_answer ON student_quizzes_answer.quizzes_question_id = quizzes_questions.id AND student_quizzes_answer.student_id="'+student_id+'" where quizzes_questions.quizz_id="'+quiz_id+'"  GROUP BY quizzes_questions.id';
					console.log('proiMGquery',proiMGquery);
					connection.query(proiMGquery, function(errSelpiMG,respROiMG){
						if(errSelpiMG){
							resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_quiz_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							if(respROiMG.length>0){
								resPro[0].questions=respROiMG;
								
							}else{
								resPro[0].questions=[];

							}
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"view_quiz_info"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
					
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_quiz_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_quiz_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

//school login
function school_login(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var phone = '';
	var type = '0';
	var email = '';
	var password='';

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.type != 'undefined' && userdata.type != '') {
		type = userdata.type;
	}
	
	console.log('userdata',userdata)
	pool.getConnection(function (err, connection) {
		var hash_password = sha1(secretSalt + userdata.password);
		
		squery ='SELECT schools.* from schools WHERE type="'+type+'" AND (contact_email="' + email + '" AND password="' + hash_password + '" AND contact_email !="") OR (contact_phone="' + email + '" AND password="' + hash_password + '" AND contact_phone !="")';
		console.log('ss',squery)
		connection.query(squery, function (err, results) {
			if (!err)
			{
				if(results.length>0){
					var dataResult = results[0];
					console.log('-------------------');
					console.log(dataResult);
					var sid = hashids.encode(results[0].id);
					resultJson = '{"replyCode":"success","replyMsg": "success", "data":'+ JSON.stringify(results[0]) +',"sid":"'+sid+'","cmd":"login"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;		
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Please check login credentials","cmd":"login"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
				
			}else{
				
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"login"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}


function school_login_bypass(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var phone = '';

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	
	console.log('userdata',userdata)
	pool.getConnection(function (err, connection) {
		
		squery ='SELECT schools.* from schools WHERE contact_phone="' + phone + '" AND contact_phone !=""';
		console.log('ss',squery)
		connection.query(squery, function (err, results) {
			if (!err)
			{
				var dataResult = results[0];
				console.log('-------------------');
				console.log(dataResult);
				var sid = hashids.encode(results[0].id);
				resultJson = '{"replyCode":"success","sid":"'+sid+'","replyMsg": "success", "data":'+ JSON.stringify(results[0]) +',"cmd":"login"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;		
			}else{
				
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"login"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}
//school
function school_forgot_password(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var email = '';
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	
	pool.getConnection(function (err, connection) {
		
		//console.log('Query : SELECT * from users where email="' + email + '"');
		squery ='SELECT schools.* from schools WHERE schools.contact_email="'+email+'"';
		console.log('squery',squery)
		connection.query(squery, function (err, results) {
			if (!err)
			{
				if(results.length > 0){
						if(results[0].status == '1'){
							var secureCode = Math.floor(10000000 + Math.random() * 99999999);
							secureCode = secureCode.toString().substring(0,4);
							secureCode =  parseInt(secureCode);
							//secureCode =  123456;
							console.log(secureCode);
							var reset_code  = secureCode;
							var hash_newpassword = sha1(secretSalt + reset_code);
						   
							var message = '';
							message += "Please use this temporary key(" + secureCode + ") for login , Please change password for future use. \n\n";	
							
							connection.query('UPDATE schools SET  password = "'+hash_newpassword+'",password_text="'+secureCode+'"  WHERE contact_email = "'+email+'"', function(errs, updated){
								if(errs){
									resultJson = '{"replyCode":"error","replyMsg":"' + errs.message + '","cmd":"forgotPassword"}\n';
									connection.release();
									callback(400, null, resultJson);
									return;
								}else{
									connection.query('SELECT * FROM email_templates WHERE email_type = "forgot_password"', function(err, resultTemplate){
										if(resultTemplate.length > 0){
											var nodemailer = require('nodemailer');
											var message = resultTemplate[0].message;
											var name =results[0].name;
											var email =results[0].contact_email;
											message = message.replace("[fullname]", name);
											message = message.replace("[EMAIL]", email);
											message = message.replace("[PASSWORD]", reset_code);
											message = message.replace("[sitename]", SITE_TITLE);

											// setup e-mail data with unicode symbols
											var mailOptions = {
												from: SITE_TITLE+' <info@learning-bix.com>', // sender address
												to: email, // list of receivers
												subject: resultTemplate[0].subject, // Subject line
												html: message // html body
											};
												//from: smtpMailUser,
												
											var transporter = nodemailer.createTransport(smtpConfig);

											// send mail with defined transport object
											transporter.sendMail(mailOptions, function (error, info) {
												if (error) {
													console.log('ERRPR-EAMIL',error);
													var id = hashids.encode(results[0].id);
													resultJson = '{"replyCode":"success","resetCode":"'+reset_code+'","replyMsg":"You will get temporary password on your mail inbox, Please check."}\n';
													connection.release();
													callback(200, null, resultJson);
													return;
												} else {
													resultJson = '{"replyCode":"success","resetCode":"'+reset_code+'","replyMsg":"You will get temporary password on your mail inbox, Please check."}\n';
													connection.release();
													callback(200, null, resultJson);
													return;
												}
											});
										
										
										}
									});
								}
							});
							
						}else{
							resultJson = '{"replyCode":"error","replyMsg":"Your are not authorized .","cmd":"forgotPassword"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Not a registered Phone, Please check.","cmd":"forgotPassword"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"forgotPassword"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

/*
 * function name :- changePassword
 * Description :- This will come in use when user want to change his password 
 * Created :- 17052017
*/

function school_change_password(userdata, pool, callback){
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	var id = '';
	var password = '';
	var current_password = '';
	
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.current_password != 'undefined' && userdata.current_password != '') {
		current_password = userdata.current_password;
	}
	console.log(userdata);
	console.log('SELECT * FROM schools WHERE id = "'+id+'"');
	pool.getConnection(function (err, connection) {
		var hash_newpassword = sha1(secretSalt + password);
		
		var hash_oldpassword = sha1(secretSalt + current_password);
		var uid = id;
		connection.query('SELECT * FROM schools WHERE id = "'+id+'"', function(err, user){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"changePassword"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}else{
				console.log('aa',user)
				if(user.length > 0){
					console.log('user[0].password',user[0].password)
					console.log('hash_oldpassword',hash_oldpassword)
					if(user[0].password == hash_oldpassword){
						connection.query('UPDATE schools SET password = "'+hash_newpassword+'",password_text="'+password+'" WHERE id = "'+uid+'"', function(errs, done){
							if(errs){
								resultJson = '{"replyCode":"error","replyMsg":"' + errs.message + '","cmd":"changePassword"}\n';
								connection.release();
								callback(400, null, resultJson);
								return;
							}else{
								connection.query('SELECT * FROM email_templates WHERE email_type = "change_password"', function(err, resultTemplate){
									if(resultTemplate.length > 0){
										var nodemailer = require('nodemailer');
										var message = resultTemplate[0].message;
										var name =user[0].fullName;
										var email =user[0].email;
										message = message.replace("[fullname]", name);
										message = message.replace("[EMAIL]", email);
										message = message.replace("[sitename]", SITE_TITLE);

										// setup e-mail data with unicode symbols
										var mailOptions = {
											from: SITE_TITLE+' <info@learning-bix.com>', // sender address
											to: email, // list of receivers
											subject: resultTemplate[0].subject, // Subject line
											html: message // html body
										};
											//from: smtpMailUser,
											
										// var transporter = nodemailer.createTransport(smtpConfig);

										// // send mail with defined transport object
										// transporter.sendMail(mailOptions, function (error, info) {
										// 	if (error) {
										// 		console.log('ERRPR-EAMIL',error);
										// 		resultJson = '{"replyCode":"success","replyMsg":"Password has been changed successfully"}\n';
										// 		connection.release();
										// 		callback(200, null, resultJson);
										// 		return;
										// 	} else {
											
										// 	}
										// });
										
										resultJson = '{"replyCode":"success","replyMsg":"Password has been changed successfully."}\n';
										connection.release();
										callback(200, null, resultJson);
										return;
									
									}
								});
							}
						});
					}else{
						resultJson = '{"replyCode":"error","replyMsg":"Old Password is not correct","cmd":"changePassword"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Old Password is not correct","cmd":"changePassword"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}
		});
	});
}

//teacher login
function teacher_login(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var phone = '';
	var password='';

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	
	
	console.log('userdata',userdata)
	pool.getConnection(function (err, connection) {
		var hash_password = sha1(secretSalt + userdata.password);
		
		squery ='SELECT users.*,schools.id as school_id FROM users LEFT JOIN schools as schools on schools.code=users.school_code WHERE users.phone="' + phone + '" AND users.password="' + hash_password + '" AND users.role_id="3" AND users.school_code IS NOT NULL';
		console.log('ss',squery)
		connection.query(squery, function (err, results) {
			if (!err)
			{
				if(results.length > 0){
					if(results[0].status != 1){
						resultJson = '{"replyCode":"error","replyMsg":"You are not Authorized","cmd":"login"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						var sid = hashids.encode(results[0].id);
						
						var dataResult = results[0];
						console.log('-------------------');
						console.log(dataResult);
					
						results[0].deviceToken=	userdata.deviceToken;
						resultJson = '{"replyCode":"success","replyMsg": "success", "data":'+ JSON.stringify(results[0]) +',"sid":"'+sid+'","cmd":"login"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;		
					}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Please check your login credentials.","cmd":"login"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"login"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

/* OTP generate*/
function otp_generate_email(userdata, pool, callback){
	var resultJson = '';
	var email = '';
	var role_id = '2';
	var Keyconditoin='';
	if (typeof userdata.email != 'undefined' && userdata.email != ''){
		email = userdata.email;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != ''){
		role_id = userdata.role_id;
	}

	if(role_id =='2'){
		Keyconditoin =' AND users.role_id ="2"';
	}

	pool.getConnection(function (err, connection) {
		connection.query('SELECT users.* FROM users WHERE email="'+email+'" '+Keyconditoin+'', function(err, users){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"otp_generate"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{	
				if(users.length > 0){
					if(users[0].status != 1){
						resultJson = '{"replyCode":"error","replyMsg":"You are not Authorized, Please contact Support","cmd":"otp_generate"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						var secureCode = Math.floor(100000 + Math.random() * 900000);
						secureCode = secureCode.toString().substring(0,4);
						var message = '';
						secureCode =  parseInt(secureCode);
						
						message += "Your Learning-Bix OTP code is  " + secureCode + "\n\n";
						
						var nodemailer = require('nodemailer');
						
						// setup e-mail data with unicode symbols
						var mailOptions = {
							from: SITE_TITLE+' <info@learning-bix.com>', // sender address
							to: email, // list of receivers
							subject: "Learning-Bix login credentials", // Subject line
							html: message // html body
						};
							//from: smtpMailUser,
							
						var transporter = nodemailer.createTransport(smtpConfig);

						// send mail with defined transport object
						connection.query('UPDATE users SET otp = "'+secureCode+'" WHERE id ="'+users[0].id+'"');
						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log('ERRPR-EAMIL',error);
								
								resultJson = '{"replyCode":"success","replyMsg":"You will get OTP on your mail inbox, Please check."}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							} else {
								console.log('email sent',info);
								resultJson = '{"replyCode":"success","replyMsg":"You will get OTP on your mail inbox, Please check."}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							
							}
						});
					}
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Email not registered","cmd":"otp_generate"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				}	
			}
		});	
	 	
	}); 
}

/* OTP verify*/
function otp_verify_email(userdata, pool, callback){
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);
	
	var email = '';
	var otp = '';
	
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	if (typeof userdata.otp != 'undefined' && userdata.otp != '') {
		otp = userdata.otp;
	}
	
	pool.getConnection(function (err, connection) {
		///email =email.replace(/^0+/, '');
		connection.query('SELECT users.* FROM users WHERE email="'+email+'" AND otp="'+otp+'"', function(err, users){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"otp_verify"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{		
				console.log(users)
				if(users.length > 0){
					var user_id = users[0].id;
					var Que = 'UPDATE users SET verified = "1" WHERE email ="'+email+'"';
					connection.query(Que, function(errUpdate, updated){
						if(errUpdate){
							resultJson = '{"replyCode":"error","replyMsg":"'+errUpdate.message+'","cmd":"otp_verify"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							var sid = hashids.encode(users[0].id);
							resultJson = '{"replyCode":"success","replyMsg":"OTP verified","sid":"'+sid+'","data":'+ JSON.stringify(users[0])+', "cmd":"otp_verify"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});			
				}else{
					resultJson = '{"replyCode":"error","replyMsg":"Credentials are not valid , Please check ","cmd":"otp_verify"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;	
				}
			}
		});	
	});
}

/* grades list */
function grades_list(userdata, pool, callback) {
	var resultJson = '';

	var keyword = '';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin = ' AND grades.grade_name LIKE  "%' + keyword + '%"';
		}
		detailsquery = 'SELECT grades.* from grades where grades.status !="2"';
		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, resSelDetails) {
			if (errSelDetails) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"grades"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
					JSON.stringify(resSelDetails) +
					',"cmd":"grades"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* subjects list */
function subjects_list(userdata, pool, callback) {
	var resultJson = '';

	var keyword = '';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin = ' AND subjects.subject_name LIKE  "%' + keyword + '%"';
		}
		detailsquery = 'SELECT subjects.* from subjects where subjects.status !="2"';
		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, resSelDetails) {
			if (errSelDetails) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"subjects"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
					JSON.stringify(resSelDetails) +
					',"cmd":"subjects"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


/* courses by grade list */
function courses_by_grade(userdata, pool, callback) {
	var resultJson = '';
	var resPro=[];
	var class_name = '';
	var class_type = '1';
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.class_type != 'undefined' && userdata.class_type != '') {
		class_type = userdata.class_type;
	}

	pool.getConnection(function (err, connection) {
		
		var i = 0;
		async.eachSeries(class_name,function(rec2, loop2){
			var clss = rec2;
			detailsquery = 'SELECT class_duration_template.id as template_id,courses.id as course_id,course_lesson_detail_count.class_count,course_lesson_detail_count.project_count,course_lesson_detail_count.quiz_count,courses.* from class_duration_template LEFT JOIN courses as courses on courses.id=class_duration_template.course_id LEFT JOIN course_lesson_detail_count as course_lesson_detail_count on course_lesson_detail_count.id=class_duration_template.course_id where class_duration_template.class_name ="'+clss+'" AND class_duration_template.ctype ="'+class_type+'"';
			console.log('detailsquery',detailsquery);
			connection.query(detailsquery, function(errSelpiMG,respROiMG){
				if(errSelpiMG){
					console.log('errSelpiMG',errSelpiMG);
					loop2();
				}else{
					console.log('respROiMG',respROiMG)
					resPro=resPro.concat(respROiMG);
					loop2();
				}
				i=i+1;
			});
		},function(errSelPro){
			if(errSelPro){
				console.log('errSelPro',errSelPro);
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"courses_by_grade"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				console.log('resPro',resPro);
				const ids = resPro.map(o => o.id)
				const filtered = resPro.filter(({id}, index) => !ids.includes(id, index + 1))

				console.log(filtered)
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(filtered)+',"cmd":"courses_by_grade"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	
	});
}


/* user List */
function school_user_list(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var role_id = '2';
	var class_name = '';
	var school_code='';
	var Keyconditoin = ' ';
	var resPro=[];
	var start = '0';
	var limit = '20';
	var subscribed ='';
	var learning ='';
	var filtered ="";
	var limitStr ='';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	if (typeof userdata.start != 'undefined' && userdata.start != '') {
		start = userdata.start;
	}
	if (typeof userdata.limit != 'undefined' && userdata.limit != '') {
		limit = userdata.limit;
	}
	
	if (typeof userdata.subscribed  != 'undefined' && userdata.subscribed  != '') {
		subscribed  = userdata.subscribed ;
	}
	if (typeof userdata.learning  != 'undefined' && userdata.learning  != '') {
		learning  = userdata.learning ;
	}

	if(limit !=''){
		limitStr='LIMIT '+start+', '+limit+'';
	}
	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin += ' AND users.name LIKE  "%' + keyword + '%"';
		}

		if (role_id != '') {
			Keyconditoin += ' AND users.role_id ="' + role_id + '"';
		}

		if (learning != '') {
			Keyconditoin += ' AND users.learning ="' + learning + '"';
		}
		if (school_code != '') {
			Keyconditoin += ' AND users.school_code ="' + school_code + '"';
		}
		var countREs=0;
		var i = 0;
		console.log('class_name',class_name);
		async.eachSeries(class_name,function(rec2, loop2){
			var clss = rec2;
			//LEFT JOIN (Select student_id,SUM(total_points) from student_course_summary_points) ON school_user_list.student_id=student_course_summary_points.student_id
			//(SELECT SUM(total_points) from student_course_summary_points where student_course_summary_points.student_id =users.id ) as total_points 
			//var countquery = 'SELECT COUNT(users.id) as count from users LEFT JOIN student_lesson_count slc on users.id=slc.student_id  LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE users.class_name ="'+clss+'"  ' + Keyconditoin + ' ORDER BY users.id DESC';
			var countquery = 'SELECT COUNT(users.id) as count from users  WHERE users.status !="2"  ' + Keyconditoin + ' ORDER BY users.id DESC';
			console.log('countquery',countquery);
			connection.query(countquery, function (errC, responsecount) {
				if (errC) {
					resultJson = '{"replyCode":"error","replyMsg":"' + errC.message + '","cmd":"user_list"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				} else {
					//(SELECT SUM(total_points) from student_course_summary_points where student_course_summary_points.student_id =users.id ) as total_points
					countREs=countREs+responsecount[0].count;
					//var Catquery='Select users.*,"0" as total_points,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") as subscribed,age_group.title,slc.lesson_count,slc.completed_lessons,(Select SUM(lesson_count) total_lessons from (Select scs.course_id,clc.lesson_count from student_course_subscription scs LEFT JOIN course_lesson_count clc on scs.course_id =clc.course_id where student_id=users.id) main_data) total_lessons from users LEFT JOIN student_lesson_count slc on users.id=slc.student_id  LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE users.class_name ="'+clss+'"  ' + Keyconditoin + ' ORDER BY users.id DESC LIMIT ' + start + ', ' + limit + '';
					
					//var Catquery='Select users.*,(SELECT leaderboard.total_points from leaderboard where leaderboard.id=users.id) as total_points,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") as subscribed,age_group.title,"0" as lesson_count,"0" as completed_lessons,"0" as total_lessons from users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE users.class_name ="'+clss+'"  ' + Keyconditoin + ' ORDER BY users.id DESC ';
					
					var Catquery='Select users.*,age_group.title from users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE users.class_name ="'+clss+'"  ' + Keyconditoin + ' ORDER BY users.id DESC '+limitStr+' ';

					console.log('Catquery',Catquery);
					connection.query(Catquery, function(errSelpiMG,respROiMG){
						if(errSelpiMG){
							console.log('errSelpiMG',errSelpiMG);
							loop2();
						}else{
							console.log('respROiMG',respROiMG)
							resPro=resPro.concat(respROiMG);
							loop2();
						}
						i=i+1;
					});
				}
			})
		},function(errSelPro){
			if(errSelPro){
				console.log('errSelPro',errSelPro);
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				console.log('resPro',resPro);
				var ids = resPro.map(o => o.id)
				filtered = resPro.filter(({id}, index) => !ids.includes(id, index + 1));
				
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully ","data":'+JSON.stringify(filtered)+',"totalCount":'+countREs+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
				
			}
		});
		
	});
}

/* user List */
function school_user_list_new(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var role_id = '2';
	var class_name = '';
	var school_code='';
	var Keyconditoin = ' ';
	var start = '0';
	var limit = '2000';
	var subscribed ='';
	var learning ='';
	var filtered ="";
	var limitStr ='';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	if (typeof userdata.start != 'undefined' && userdata.start != '') {
		start = userdata.start;
	}
	if (typeof userdata.limit != 'undefined' && userdata.limit != '') {
		limit = userdata.limit;
	}
	
	if (typeof userdata.subscribed  != 'undefined' && userdata.subscribed  != '') {
		subscribed  = userdata.subscribed ;
	}
	if (typeof userdata.learning  != 'undefined' && userdata.learning  != '') {
		learning  = userdata.learning ;
	}

	if(limit !=''){
		limitStr='LIMIT '+start+', '+limit+'';
	}
	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin += ' AND users.name LIKE  "%' + keyword + '%"';
		}

		if (role_id != '') {
			Keyconditoin += ' AND users.role_id ="' + role_id + '"';
		}

		if (learning != '') {
			Keyconditoin += ' AND users.learning ="' + learning + '"';
		}
		if (school_code != '') {
			Keyconditoin += ' AND users.school_code ="' + school_code + '"';
		}
		
		if (class_name != '') {
			Keyconditoin += ' AND users.class_name ="' + class_name + '"';
		}

		var countREs=0;
		var i = 0;
		
		var countquery = 'SELECT COUNT(users.id) as count from users  WHERE users.status !="2" ' + Keyconditoin + ' ORDER BY users.id DESC';
		console.log('countquery',countquery);
		connection.query(countquery, function (errC, responsecount) {
			if (errC) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errC.message + '","cmd":"user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				countREs=countREs+responsecount[0].count;
				//(SELECT leaderboard.total_points from leaderboard where leaderboard.id=users.id) as total_points
				var Catquery='Select users.*,age_group.title from users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE users.status !="2"  ' + Keyconditoin + ' ORDER BY users.id DESC '+limitStr+' ';

				console.log('Catquery',Catquery);
				connection.query(Catquery, function(errSelpiMG,respROiMG){
					if(errSelpiMG){
						resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"user_list"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}else{
						
						resultJson = '{"replyCode":"success","replyMsg":"Details found successfully ","data":'+JSON.stringify(respROiMG)+',"totalCount":'+countREs+',"cmd":"school_user_list"}\n';
						console.log('res-suceess');
						connection.release();
						callback(200, null, resultJson);
						return;
					}
					i=i+1;
				});
			}
		})	
		
	});
}

/* user List */
function overall_leaderboard(userdata, pool, callback) {
	var resultJson = '';
	var school_code='';
	var Keyconditoin=' AND role_id="2"';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		
		var Catquery='Select * from overall_leaderboard where name !="" '+Keyconditoin+' LIMIT 0,20';
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* user List */
function last_month_student_top_students(userdata, pool, callback) {
	var resultJson = '';
	var school_code='';
	var Keyconditoin=' ';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		
		var Catquery='Select * from last_month_student_top_students WHERE role_id="2" '+Keyconditoin+' order by total_points DESC LIMIT 3';
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"last_month_student_top_students"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"last_month_student_top_students"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


/* user List */
function overall_leaderboard_weekly(userdata, pool, callback) {
	var resultJson = '';
	var school_code='';
	var Keyconditoin=' AND role_id="2"';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		
		var Catquery='Select * from overall_leaderboard_weekly where name !="" '+Keyconditoin+' GROUP BY id order by total_points DESC LIMIT 0,20';
		console.log('Catquery',Catquery);
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* user List */
function overall_leaderboard_teacher(userdata, pool, callback) {
	var resultJson = '';
	var school_code=' ';
	var Keyconditoin='';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		
		var Catquery='Select users.id,users.name,(Select SUM(total_points) from overall_leaderboard_weekly where school_code=users.school_code and class_name IN(Select grade_name from teachers_grades tg LEFT JOIN gradeName gn on tg.grade_id =gn.grade_id where teacher_id=users.id)) all_points from users where role_id=3 '+Keyconditoin+' order by all_points desc LIMIT 0,20';
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* user List */
function last_month_top_teacher(userdata, pool, callback) {
	var resultJson = '';
	var school_code='';
	var Keyconditoin='';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			//Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		
		var Catquery='Select users.id,users.name,users.school_name,users.school_code,(Select SUM(total_points) from last_month_student_top_students where school_code=users.school_code and class_name IN(Select grade_name from teachers_grades tg LEFT JOIN gradeName gn on tg.grade_id =gn.grade_id where teacher_id=users.id)) all_points from users where role_id=3 '+Keyconditoin+' order by all_points desc LIMIT 0,3';
		console.log('Catquery------11',Catquery);
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* user List */
function student_course_summary_points(userdata, pool, callback) {
	var resultJson = '';
	var school_code='';
	var student_id='';
	var Keyconditoin=' where student_id !="0"';
	if (typeof userdata.school_code  != 'undefined' && userdata.school_code  != '') {
		school_code  = userdata.school_code ;
	}
	if (typeof userdata.student_id  != 'undefined' && userdata.student_id  != '') {
		student_id  = userdata.student_id ;
	}
	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			Keyconditoin += ' AND school_code ="' + school_code + '"';
		}
		if (student_id != '') {
			Keyconditoin += ' AND student_id ="' + student_id + '"';
		}
		
		var Catquery='Select * from student_course_summary_points'+ Keyconditoin;
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/* school report*/
function school_report_info(userdata, pool, callback){
	var resultJson = '';
	var school_code = '';
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	pool.getConnection(function (err, connection) {
		
		var Catquery='SELECT users.id,(SELECT COUNT(*) from users where users.status="1" AND users.school_code="'+school_code+'" AND role_id="2") as total_students,(SELECT COUNT(*) from users where users.status="1" AND users.school_code="'+school_code+'" AND role_id="3") as total_teachers,(SELECT COUNT(DISTINCT student_id) from student_course_subscription where student_course_subscription.status="1" AND student_course_subscription.student_id IN (SELECT users.id from users where users.status="1" AND users.school_code="'+school_code+'" AND role_id="2")) as enrolled_student FROM users  ORDER BY users.id DESC LIMIT 1';
		console.log('Catquery',Catquery);
		connection.query(Catquery, function(err, result){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"users"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;

			}else{
				resultJson = '{"replyCode":"success","replyMsg":"users list","data":'+JSON.stringify(result[0])+', "cmd":"users"}\n';
				console.log(resultJson);
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

/* user List */
function school_pending_user_list(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var role_id = '2';
	var class_name = '';
	var school_code='';
	var Keyconditoin = ' ';
	var resPro=[];
	var start = '0';
	var limit = '40';
	var subscribed ='';
	var learning ='';
	
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	if (typeof userdata.start != 'undefined' && userdata.start != '') {
		start = userdata.start;
	}
	if (typeof userdata.limit != 'undefined' && userdata.limit != '') {
		limit = userdata.limit;
	}
	
	if (typeof userdata.subscribed  != 'undefined' && userdata.subscribed  != '') {
		subscribed  = userdata.subscribed ;
	}
	if (typeof userdata.learning  != 'undefined' && userdata.learning  != '') {
		learning  = userdata.learning ;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin += ' AND users.name LIKE  "%' + keyword + '%"';
		}

		if (role_id != '') {
			Keyconditoin += ' AND users.role_id ="' + role_id + '"';
		}

		if (learning != '') {
			Keyconditoin += ' AND users.learning ="' + learning + '"';
		}
		if (school_code != '') {
			Keyconditoin += ' AND users.school_code ="' + school_code + '"';
		}
		var countREs=0;
		var countquery = 'SELECT COUNT(users.id) as count,(SELECT SUM(total_points) from student_course_summary_points where student_course_summary_points.student_id =users.id ) as total_points from users LEFT JOIN student_lesson_count slc on users.id=slc.student_id  LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE (SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id)=0  ' + Keyconditoin + ' ORDER BY users.id DESC';
			console.log('countquery',countquery);
			connection.query(countquery, function (errC, responsecount) {
				if (errC) {
					resultJson = '{"replyCode":"error","replyMsg":"' + errC.message + '","cmd":"user_list"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				} else {
					
					countREs=responsecount[0].count;
					var Catquery='Select users.*,(SELECT SUM(total_points) from student_course_summary_points where student_course_summary_points.student_id =users.id ) as total_points,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") as subscribed,age_group.title,slc.lesson_count completed_lessons,(Select SUM(lesson_count) total_lessons from (Select scs.course_id,clc.lesson_count from student_course_subscription scs LEFT JOIN course_lesson_count clc on scs.course_id =clc.course_id where student_id=users.id) main_data) total_lessons from users LEFT JOIN student_lesson_count slc on users.id=slc.student_id  LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE (SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id)=0  ' + Keyconditoin + ' ORDER BY users.id DESC LIMIT ' + start + ', ' + limit + '';

					console.log('Catquery',Catquery);
					connection.query(Catquery, function(errSelpiMG,respROiMG){
						if(errSelpiMG){
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully ","data":'+JSON.stringify(respROiMG)+',"totalCount":'+countREs+',"cmd":"school_user_list"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}
			})
		
	});
}

/* user List */
function overall_details_teacher(userdata, pool, callback) {
	var resultJson = '';
	var teacher_id=' ';
	var Keyconditoin='';
	if (typeof userdata.teacher_id  != 'undefined' && userdata.teacher_id  != '') {
		teacher_id  = userdata.teacher_id ;
	}
	pool.getConnection(function (err, connection) {
		
		
		var Catquery='Select users.id,users.name,(Select SUM(total_points) from overall_leaderboard where school_code=users.school_code and class_name IN(Select grade_name from teachers_grades tg LEFT JOIN gradeName gn on tg.grade_id =gn.grade_id where teacher_id=users.id)) all_points from users where users.id ="' + teacher_id + '" ';

		console.log('Catquery',Catquery)
		connection.query(Catquery, function(errSelpiMG,respROiMG){
			if(errSelpiMG){
				
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"school_user_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(respROiMG)+',"cmd":"school_user_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

function robotics_course_lesson_track(userdata, pool, callback){
	var resultJson = '';
	var id ='';
	var student_id ='';
	var course_id ='';
	
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != ''){
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != ''){
		student_id = userdata.student_id;
	}
	
	console.log('----------');
	console.log(userdata);
	pool.getConnection(function (err, connection){
		var Catquery='SELECT courses.id,courses.course_name FROM courses WHERE id IN ('+course_id+')';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					var i = 0;
					async.eachSeries(resPro,function(rec2, loop2){
						var course_id = rec2.id;
						console.log('course_id',course_id);
						proiMGquery = 'SELECT course_chapters.*,(SELECT count(*) from chapter_lessons WHERE chapter_lessons.course_chapter_id=course_chapters.id AND chapter_lessons.status="1") as total_lessons,(SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") as complete_lessons from course_chapters where course_chapters.course_id="'+course_id+'" AND course_chapters.status="1" ORDER BY course_chapters.s_no ASC';
						console.log('proiMGquery',proiMGquery);
						connection.query(proiMGquery, function(errSelpiMG,respROiMG){
							if(errSelpiMG){
								console.log('errSelpiMG',errSelpiMG);
								
								loop2();
							}else{
								resPro[i].chapters=respROiMG;
								loop2();
							}
							i=i+1;
						});
						
					},function(errSelPro){
						if(errSelPro){
							console.log('errSelPro',errSelPro)
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"robotics_course_lesson_track"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"robotics_course_lesson_track"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"robotics_course_lesson_track"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"robotics_course_lesson_track"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

/* reviews list */
function reviews_list(userdata, pool, callback) {
	var resultJson = '';

	var Keyconditoin = ' reviews.status !="2"';
	var teacher_id = '';
	var student_id = '';
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}

	pool.getConnection(function (err, connection) {
		if (teacher_id != '') {
			Keyconditoin += ' AND reviews.teacher_id = "' + teacher_id + '"';
		}
		
		if (student_id != '') {
			Keyconditoin += ' AND reviews.student_id = "' + student_id + '"';
		}

		detailsquery = 'SELECT reviews.*,users.name as student_name,users.image as student_image,teacher.name as teacher_name,teacher.image as teacher_image from reviews LEFT JOIN users as users ON users.id = reviews.student_id LEFT JOIN users as teacher ON teacher.id = reviews.teacher_id where '+Keyconditoin+'';
		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, resSelDetails) {
			if (errSelDetails) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"grades"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
					JSON.stringify(resSelDetails) +
					',"cmd":"grades"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

//Doubts

function doubts_list(userdata, pool, callback) {
	var resultJson = "";
	var user_id = "";
  
	if (typeof userdata.user_id != "undefined" && userdata.user_id != "") {
	  user_id = userdata.user_id;
	}
	
	console.log("----------");
	console.log(userdata);
  
	pool.getConnection(function (err, connection) {
		if(user_id=='0'){
			var Catquery = 'SELECT user_doubts.*,"67986" as teacher_id,courses.course_name,teacher.name as teacher_name,teacher.image as teacher_image,student.name as student_name,student.image as student_image FROM user_doubts LEFT JOIN users as teacher ON teacher.id = "67986" LEFT JOIN users as student ON student.id = user_doubts.student_id LEFT JOIN courses as courses ON courses.id = user_doubts.course_id WHERE user_doubts.status !="2" AND user_doubts.teacher_id="' + user_id + '"  ';	
		}else{
			var Catquery = 'SELECT user_doubts.*,courses.course_name,teacher.name as teacher_name,teacher.image as teacher_image,student.name as student_name,student.image as student_image FROM user_doubts LEFT JOIN users as teacher ON teacher.id = user_doubts.teacher_id LEFT JOIN users as student ON student.id = user_doubts.student_id LEFT JOIN courses as courses ON courses.id = user_doubts.course_id WHERE user_doubts.status !="2" AND (user_doubts.teacher_id="' + user_id + '" OR user_doubts.student_id="' + user_id + '") ';	
		}
		
		console.log("qq", Catquery);
		connection.query(Catquery, function (errinsert, resPro) {
			if (!errinsert) {
				if(resPro.length >0){
					var i = 0;
					async.eachSeries(resPro,function(rec2, loop2){
						var user_doubts_id = rec2.id;
						console.log('user_doubts_id',user_doubts_id);
						Cquery='SELECT doubts_chat.* from doubts_chat WHERE  doubts_chat.doubts_id="'+user_doubts_id+'" ORDER BY id DESC LIMIT 1';
						console.log('Cquery',Cquery);
						connection.query(Cquery, function(errSelpiMG,respROiMG){
							if(errSelpiMG){
								console.log('errSelpiMG',errSelpiMG);
								loop2();
							}else{
								resPro[i].chats=respROiMG;
								loop2();
							}
							i=i+1;
						});
					},function(errSelPro){
						if(errSelPro){
							console.log('errSelPro',errSelPro);
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"doubts_list"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"doubts_list"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"doubts_list"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			} else {
				resultJson='{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"chat group"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

function doubts_details(userdata, pool, callback) {
	var resultJson = "";
	var doubts_id = "";
  
	if (typeof userdata.doubts_id != "undefined" && userdata.doubts_id != "") {
	  doubts_id = userdata.doubts_id;
	}
	
	console.log("----------");
	console.log(userdata);
  
	pool.getConnection(function (err, connection) {
		var Catquery = 'SELECT user_doubts.*,teacher.name as teacher_name,courses.course_name,teacher.image as teacher_image,student.name as student_name,student.image as student_image FROM user_doubts LEFT JOIN users as teacher ON teacher.id = user_doubts.teacher_id LEFT JOIN users as student ON student.id = user_doubts.student_id LEFT JOIN courses as courses ON courses.id = user_doubts.course_id WHERE user_doubts.status !="2" AND user_doubts.id="'+doubts_id+'" ';	
		console.log("qq", Catquery);
		connection.query(Catquery, function (errinsert, resPro) {
			if (!errinsert) {
				if(resPro.length >0){
					
					Cquery='SELECT doubts_chat.*,from_user.name as from_name,from_user.image as from_image,to_user.name as to_name,to_user.image as to_image from doubts_chat LEFT JOIN users as from_user ON from_user.id = doubts_chat.from_id LEFT JOIN users as to_user ON to_user.id = doubts_chat.to_id WHERE doubts_chat.doubts_id="'+doubts_id+'"';

					console.log('Cquery',Cquery);
					connection.query(Cquery, function(errSelpiMG,respROiMG){
						if(errSelpiMG){
							console.log('errSelpiMG',errSelpiMG);
							resultJson='{"replyCode":"error","replyMsg":"'+errSelpiMG.message+'","cmd":"chat group"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resPro[0].chat=respROiMG;
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"chat_group_list"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
							
						}
					
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"chat_group_details"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			} else {
				resultJson='{"replyCode":"error","replyMsg":"'+errinsert.message+'","cmd":"chat group"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

/*Create doubt message*/
function send_doubt_message(userdata, pool, callback){
	var resultJson = '';
	var Query='';
	var doubts_id='';
	var from_id = '';
	var to_id = '';
	var message = '';
	
	if (typeof userdata.doubts_id != 'undefined' && userdata.doubts_id != '') {
		doubts_id = userdata.doubts_id;
	}
	if (typeof userdata.from_id != 'undefined' && userdata.from_id != '') {
		from_id = userdata.from_id;
	}
	if (typeof userdata.to_id != 'undefined' && userdata.to_id != '') {
		to_id = userdata.to_id;
	}
	if (typeof userdata.message != 'undefined' && userdata.message != '') {
		message = userdata.message;
	}
	

	pool.getConnection(function (err, connection) {
			
		Query='INSERT INTO doubts_chat SET doubts_id="' + doubts_id + '",from_id="' + from_id + '",to_id="'+to_id+'",message="'+message+'",created=NOW()';
		console.log(Query);
		connection.query(Query, function(err, rate){
			if(err){
				resultJson = '{"replyCode":"error","replyMsg":"'+err.message+'","cmd":"doubt message"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				
				resultJson = '{"replyCode":"success","replyMsg":" doubt message sent succefully","cmd":"invitation"}\n';
				console.log(resultJson);
				connection.release();
				callback(200, null, resultJson);
				return;	
			}
		})
	});
}

function student_course_track(userdata, pool, callback){
	var resultJson = '';
	var student_id ='';
	
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != ''){
		student_id = userdata.student_id;
	}
	
	console.log('----------');
	console.log(userdata);
	pool.getConnection(function (err, connection){
		var Catquery='SELECT student_course_subscription.course_id  from student_course_subscription WHERE  student_course_subscription.student_id="'+student_id+'"';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					var i = 0;
					async.eachSeries(resPro,function(rec2, loop2){
						var course_id = rec2.course_id;
						console.log('course_id',course_id);
						proiMGquery = 'SELECT course_chapters.*,(SELECT count(*) from chapter_lessons WHERE chapter_lessons.course_chapter_id=course_chapters.id AND chapter_lessons.status="1") as total_lessons,(SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") + (SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") +(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as complete_lessons,(SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") as completed_quizzes,(SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id ) as total_quizzes,(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as completed_projects,(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as total_projects from course_chapters where course_chapters.course_id="'+course_id+'" AND course_chapters.status="1" ORDER BY course_chapters.s_no ASC';
						console.log('proiMGquery',proiMGquery);
						connection.query(proiMGquery, function(errSelpiMG,respROiMG){
							if(errSelpiMG){
								console.log('errSelpiMG',errSelpiMG);
								
								loop2();
							}else{
								resPro[i].info=respROiMG;
								loop2();
							}
							i=i+1;
						});
						
					},function(errSelPro){
						if(errSelPro){
							console.log('errSelPro',errSelPro)
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"view_classes_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"view_classes_info"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_classes_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}

function student_course_summary_track(userdata, pool, callback){
	var resultJson = '';
	var student_id ='';
	
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != ''){
		student_id = userdata.student_id;
	}
	
	console.log('----------');
	console.log(userdata);
	pool.getConnection(function (err, connection){
		var Catquery='SELECT student_course_subscription.course_id,student_course_subscription.course_start_date,student_course_subscription.certificate_name,courses.course_name,courses.description,courses.image,courses.course_ppt,(SELECT SUM(total_points) from student_course_summary_points where student_course_summary_points.student_id ="'+student_id+'") as total_points  from student_course_subscription LEFT JOIN courses as courses ON courses.id = student_course_subscription.course_id WHERE  student_course_subscription.student_id="'+student_id+'"';
		console.log('qq',Catquery)
		connection.query(Catquery, function(errinsert, resPro){
			if(!errinsert){
				if(resPro.length >0){
					var i = 0;
					async.eachSeries(resPro,function(rec2, loop2){
						var course_id = rec2.course_id;
						console.log('course_id',course_id);
						proiMGquery = 'SELECT course_chapters.*,(SELECT count(*) from chapter_lessons WHERE chapter_lessons.course_chapter_id=course_chapters.id AND chapter_lessons.status="1") as total_lessons,(SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") + (SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") +(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as complete_lessons,(SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") as completed_quizzes,(SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id ) as total_quizzes,(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as completed_projects,(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") as total_projects, round((((SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") + (SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") +(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") * 100) / (SELECT count(*) from chapter_lessons WHERE chapter_lessons.course_chapter_id=course_chapters.id AND chapter_lessons.status="1")), 0) AS percent,((((SELECT count(*) from student_lessons_status WHERE student_lessons_status.student_id="'+student_id+'" AND student_lessons_status.chapter_id=course_chapters.id AND student_lessons_status.percentage >"90") + (SELECT count(*) from student_quizzes WHERE student_quizzes.student_id="'+student_id+'" AND student_quizzes.chapter_id=course_chapters.id AND student_quizzes.in_review ="2") +(SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") * (select points_settings.class_points from points_settings)) + ((SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") * (select points_settings.project_points from points_settings points_settings))) + ((SELECT count(*) from student_projects WHERE student_projects.student_id="'+student_id+'" AND student_projects.chapter_id=course_chapters.id AND student_projects.in_review ="1") * (select points_settings.quiz_points from points_settings points_settings))) AS total_points from course_chapters where course_chapters.course_id="'+course_id+'" AND course_chapters.status="1" ORDER BY course_chapters.s_no ASC';
						console.log('proiMGquery',proiMGquery);
						connection.query(proiMGquery, function(errSelpiMG,respROiMG){
							if(errSelpiMG){
								console.log('errSelpiMG',errSelpiMG);
								
								loop2();
							}else{
								resPro[i].info=respROiMG;
								loop2();
							}
							i=i+1;
						});
						
					},function(errSelPro){
						if(errSelPro){
							console.log('errSelPro',errSelPro)
							resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"view_classes_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}else{
							resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(resPro)+',"cmd":"view_classes_info"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}else{
					resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}else{
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_classes_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});	
	});
}


function school_grades_list(userdata, pool, callback) {
	var resultJson = '';
	var school_id = '';

	if (typeof userdata.school_id != 'undefined' && userdata.school_id != '') {
		school_id = userdata.school_id;
	}
	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		var Catquery = 'SELECT school_grades.* from school_grades WHERE school_grades.school_id="' + school_id + '" ';
		console.log('Catquery', Catquery);
		connection.query(Catquery, function (errContent, resContent) {
			if (errContent) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errContent.message + '","cmd":"school_grades_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"success","replyMsg":"school grades fetched successfully","cmd":"school_grades_list","data":' + JSON.stringify(resContent) + '}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;

			}

		});
	});
}


function school_batches_student_list(userdata, pool, callback) {
	var resultJson = '';

	var school_id = '';
	var batch_id = '';
	var school_code = '';
	var Keyconditoin = '';
	
	if (typeof userdata.school_id != 'undefined' && userdata.school_id != '') {
		school_id = userdata.school_id;
	}
	if (typeof userdata.batch_id != 'undefined' && userdata.batch_id != '') {
		batch_id = userdata.batch_id;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	pool.getConnection(function (err, connection) {
		if (batch_id != '') {
			Keyconditoin += ' AND school_batches.batch_id ="' + batch_id + '"';
		}
		if (school_code != '') {
			Keyconditoin += ' AND school_batches.school_code ="' + school_code + '"';
		}
		if (school_id != '') {
			Keyconditoin += 'AND school_batches.school_id ="' + school_id + '"';
		}

		detailsquery = 'SELECT school_batches.*,student.name,student.gender,student.password_text,student.email,student.image,student.phone,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=student.id) as course_taken from school_batches LEFT JOIN users as student ON student.id = school_batches.student_id where school_batches.id !="0" ' + Keyconditoin + ' order by school_batches.id ';

		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, result) {
			if (errSelDetails) {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"school_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				if (result.length > 0) {
					var i = 0;
					async.eachSeries(
						result,
						function (rec2, loop2) {
							var batch_id = rec2.batch_id;
							var school_idn = rec2.school_id;
							console.log('school_id', school_idn);
							proiMGquery = 'SELECT COUNT(school_batches.id) as student_count from school_batches where school_batches.batch_id="' + batch_id + '" AND school_batches.school_id ="' + school_idn + '"';
							console.log('proiMGquery', proiMGquery);
							connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
								if (errSelpiMG) {
									console.log('errSelpiMG', errSelpiMG);

									loop2();
								} else {
									if (respROiMG.length > 0) {
										result[i].count = respROiMG;
									} else {
										result[i].count = [];
									}
									loop2();
								}
								i = i + 1;
							});
						},
						function (errSelpiMG) {
							if (errSelpiMG) {
								console.log('errSelpiMG', errSelpiMG);
								resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_classes_info"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							} else {
								resultJson = '{"replyCode":"success","replyMsg":"school batches list","data":' + JSON.stringify(result) + ', "cmd":"user_list"}\n';
								console.log('res-suceess');
								connection.release();
								callback(200, null, resultJson);
								return;
							}
						}
					);
				} else {
					resultJson =
						'{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}
		});
	});
}


// assign course to atudent

function assign_course_to_student(userdata, pool, callback) {
	var resultJson = '';
	var course_id = '';
	var student_id = '';
	var teacher_id = '1';
	var price = '0';
	var created_by = '';
	var id = '';

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	if (typeof userdata.price != 'undefined' && userdata.price != '') {
		price = userdata.price;
	}

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		if (id != '') {
			var queryinsert = 'UPDATE student_course_subscription SET course_id="' + course_id + '",student_id="' + student_id + '",teacher_id="' + teacher_id + '",price="' + price + '",created_by="' + created_by + '" where student_course_subscription.id="' + id + '"';
		} else {
			var queryinsert = 'INSERT INTO student_course_subscription SET course_id="' + course_id + '",student_id="' + student_id + '",teacher_id="' + teacher_id + '",price="' + price + '",created_by="' + created_by + '",created= NOW()';
		}
		console.log(queryinsert);
		connection.query(queryinsert, function (errinsert, resultinsert) {
			if (!errinsert) {
				resultJson = '{"replyCode":"success","replyMsg":"courses updated successfully","cmd":"student_course_subscription"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"student_course_subscription"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}

function assign_course_to_student_bulk(userdata, pool, callback) {
	var resultJson = '';
	var student_id = '';
	var teacher_id = '0';
	var created_by = '';
	var course_id = '';
	var price = '0';
	var students = '';
	var new_account = '0';
	var start_date = '';
	var errArray = [];
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	if (typeof userdata.price != 'undefined' && userdata.price != '') {
		price = userdata.price;
	}
	if (typeof userdata.students != 'undefined' && userdata.students != '') {
		students = userdata.students;
	}

	if (typeof userdata.new_account != 'undefined' && userdata.new_account != '') {
		new_account = userdata.new_account;
	}

	if (typeof userdata.start_date != 'undefined' && userdata.start_date != '') {
		start_date = userdata.start_date;
	}

	console.log('userData', userdata);

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		if (student_id != '') {

			subscribe_course(userdata, pool, function (ResSub, responseSubscribe) {
				if (ResSub == false) {
					resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
				} else {
					resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
				}
			})
		} else {
			var i = 0;
			async.eachSeries(students, function (rec2, loop2) {
				console.log('Student--', rec2);
				checkValidateStudent(rec2, pool, function (ResStatus, responseResult) {
					console.log(typeof responseResult);
					console.log(ResStatus);
					console.log(responseResult);

					if (ResStatus == false) {
						if (new_account == '1') {
							console.log('123467');
							register_user_fun(rec2, pool, function (resSub, responseSubscribe) {
								if (resSub == false) {
									resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"register_user_fun"}\n';
									console.log('res-suceess');
									loop2();
								} else {
									console.log('responseSubscribe', responseSubscribe);
									var querySelectCourse = 'SELECT class_duration_template.* from class_duration_template WHERE class_name="' + rec2.class_name + '" AND status="1"';
									console.log('querySelectCourse--1', querySelectCourse);
									connection.query(querySelectCourse, function (errSel, resSel) {
										console.log('querySelectCourse--1::::resSel', resSel);
										if (errSel) {
											resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"subscribe_course"}\n';
											connection.release();
											callback(false, resultJson);
											return;
										} else {
											console.log(resSel);
											if (resSel.length > 0) {
												var i = 0;
												var myDate = new Date(start_date);
												console.log('myDate', myDate);
												var courseDays = "0";
												async.eachSeries(resSel, function (rec3, loop3) {
													var course_id = rec3.course_id;
													if (courseDays != "0") {
														myDate.setDate(myDate.getDate() + courseDays);
													}

													NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
													console.log('NewSchDate---', NewSchDate);
													var dataSUb = { "course_id": course_id, "student_id": responseSubscribe, "teacher_id": "0", "price": price, "start_date": NewSchDate, "transaction_id": "0" };
													subscribe_course(dataSUb, pool, function (resNew, responseNew) {
														if (resNew == false) {
															courseDays = rec3.days;
															resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course-register_user_fun"}\n';
															console.log('res-suceess');
															loop3();
														} else {
															courseDays = rec3.days;
															resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course-register_user_fun"}\n';
															loop3();
														}
													})
												}, function (errSelPro) {
													if (errSelPro) {
														console.log('errSelPro', errSelPro);
														resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
														loop2();
													} else {
														resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","cmd":"teacher_schedule_days_list"}\n';
														console.log('res-suceess');
														loop2();
													}
												});
											} else {

												console.log('res-err',);
												loop2();
											}
										}
									})

								}
							})
						} else {
							if (new_account == '0') {
								if (responseResult.length > 0) {
									var student = responseResult[0].id;
									var myDate = new Date(start_date);
									NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
									console.log('NewSchDate---', NewSchDate);
									var dataSUb = { "course_id": course_id, "student_id": student, "teacher_id": "0", "price": price, "transaction_id": "0", "start_date": NewSchDate };
									// assign new course
									subscribe_course(dataSUb, pool, function (resN, responseSubscribe) {
										if (resN == false) {
											resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
											console.log('res-suceess');
											errArray.push(i + 1);

											loop2();
										} else {
											resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
											console.log('res-suceess');
											loop2();
										}
									})

								} else {
									errArray.push(i + 1);
									loop2();
								}
							} else {
								errArray.push(i + 1);
								loop2();
							}

						}
					} else {

						console.log('fas gaya', responseResult.length);
						if (responseResult.length > 0 && new_account == '0') {
							var myDate = new Date(start_date);
							NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
							console.log('NewSchDate---', NewSchDate);
							var dataSUb = { "course_id": course_id, "student_id": responseResult[0].id, "teacher_id": "0", "price": price, "transaction_id": "0", "start_date": NewSchDate };
							// assign new course
							subscribe_course(dataSUb, pool, function (resN, responseSubscribe) {
								if (resN == false) {
									resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
									console.log('res-suceess');
									errArray.push(i + 1);
									loop2();
								} else {
									resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
									console.log('res-suceess');
									loop2();
								}
							})
						} else {
							errArray.push(i + 1);
							console.log('fas gaya');
							loop2();
						}
					}
					i = i + 1;
				});
			}, function (errSelPro) {
				if (errSelPro) {
					console.log('errSelPro', errSelPro);
					resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				} else {
					resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":"' + errArray + '","cmd":"teacher_schedule_days_list"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			});
		}

	});
}


/* User details */
function user_details(userdata, pool, callback) {
	var Hashids = require("hashids"), hashids = new Hashids(secretSalt);

	var resultJson = '';
	var Cquery = '';
	var id = '';

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}

	pool.getConnection(function (err, connection) {
		Cquery = 'SELECT users.* FROM users WHERE users.id = ' + id + '';

		console.log(Cquery);
		connection.query(Cquery, function (err, ordData) {
			if (err) {
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"subadmin_details"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				connection.query('SELECT teachers_grades.*,grades.grade_name FROM teachers_grades LEFT JOIN grades as grades ON grades.id = teachers_grades.grade_id WHERE teachers_grades.teacher_id = ' + id + '', function (errD, TData) {
					if (errD) {
						resultJson = '{"replyCode":"error","replyMsg":"' + errD.message + '","cmd":"subadmin_details"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					} else {
						if (TData.length > 0) {
							ordData[0].grades = TData;
						} else {
							ordData[0].grades = [];
						}

						var sid = hashids.encode(ordData[0].id);
						resultJson = '{"replyCode":"success","replyMsg":"Sub admin Details","data":' + JSON.stringify(ordData[0]) + ',"sid":"' + sid + '","cmd":"subadmin_details"}\n';
						console.log('res-suceess');
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				})


			}
		});
	});
}


/* important links list */
function school_dashboard_info(userdata, pool, callback) {
	var resultJson = '';
	var school_code = '';
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	pool.getConnection(function (err, connection) {

		var Catquery = 'SELECT users.id,(SELECT COUNT(*) from users where users.status="1" AND users.school_code="' + school_code + '" and role_id="2") as total_students,(SELECT COUNT(*) from school_payouts where school_payouts.paid="1") as paid_students,(SELECT COUNT(*) from school_payouts where school_payouts.paid="0") as unpaid_students,(SELECT SUM(net_payable) from school_payouts where school_payouts.paid="0") as payout_pending,(SELECT SUM(net_payable) from school_payouts where school_payouts.paid="1") as payout_received FROM users  ORDER BY users.id DESC LIMIT 1';
		console.log('Catquery----', Catquery);
		connection.query(Catquery, function (err, result) {
			if (err) {
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"users"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;

			} else {
				resultJson = '{"replyCode":"success","replyMsg":"users list","data":' + JSON.stringify(result[0]) + ', "cmd":"users"}\n';
				console.log(resultJson);
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}

// faqs

function faqs_list(userdata, pool, callback) {
	var resultJson = '';
	var type = '1'; //type 1-teacher,2-student,3-schoo;
	var keyword = '';
	var isAdmin = '1';
	var Keyconditoin = '';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.type != 'undefined' && userdata.type != '') {
		type = userdata.type;
	}
	if (typeof userdata.isAdmin != 'undefined' && userdata.isAdmin != '') {
		isAdmin = userdata.isAdmin;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin = ' AND faqs.question LIKE  "%' + keyword + '%"';
		}
		if (isAdmin == '0') {
			detailsquery = 'SELECT faqs.* from faqs where faqs.status ="1" AND type="' + type + '" ' + Keyconditoin + '';
		} else {
			detailsquery = 'SELECT faqs.* from faqs where faqs.status !="2" AND type="' + type + '" ' + Keyconditoin + '';
		}

		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, resSelDetails) {
			if (errSelDetails) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"faqs_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
					JSON.stringify(resSelDetails) +
					',"cmd":"faqs_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


//courses

function courses_list(userdata, pool, callback) {
	var resultJson = '';
	var learning = '';
	var keyword = '';
	var Keyconditoin = '';
	var start = '0';
	var limit = '';

	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}

	if (typeof userdata.learning != 'undefined' && userdata.learning != '') {
		learning = userdata.learning;
	}
	if (typeof userdata.start != 'undefined' && userdata.start != '') {
		start = userdata.start;
	}
	if (typeof userdata.limit != 'undefined' && userdata.limit != '') {
		limit = userdata.limit;
	}


	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin += ' AND courses.course_name LIKE  "%' + keyword + '%"';
		}
		if (learning != '') {
			Keyconditoin += ' AND courses.learning ="' + learning + '"';
		}

		if (limit != '') {
			detailsquery =
				'SELECT courses.*,rec_courses.course_name as rec_course_name,age_group.title as age_group_title from courses as courses LEFT JOIN age_group as age_group ON age_group.id = courses.age_group_id LEFT JOIN courses as rec_courses ON rec_courses.id = courses.recommended_course_id where courses.status !="2" ' +
				Keyconditoin +
				' LIMIT ' + start + ', ' + limit + '';
		} else {
			detailsquery =
				'SELECT courses.*,rec_courses.course_name as rec_course_name,age_group.title as age_group_title from courses as courses LEFT JOIN age_group as age_group ON age_group.id = courses.age_group_id LEFT JOIN courses as rec_courses ON rec_courses.id = courses.recommended_course_id where courses.status !="2" ' +
				Keyconditoin +
				'';
		}
		var countquery = 'SELECT count(*) as count from courses WHERE courses.status !="2" ' +
			Keyconditoin +
			'';


		console.log('detailsquery', detailsquery);

		connection.query(countquery, function (err, responsecount) {
			if (responsecount[0].count > 0) {
				connection.query(detailsquery, function (errSelDetails, resSelDetails) {
					if (errSelDetails) {
						resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"courses_list"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					} else {
						resultJson =
							'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
							JSON.stringify(resSelDetails) +
							',"totalCount":' + responsecount[0].count + ',"cmd":"courses_list"}\n';
						console.log('res-suceess');
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				});
			} else {
				resultJson = '{"replyCode":"success","replyMsg":"courses_list","data":[], "cmd":"courses_list"}\n';
				console.log(resultJson);
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});


	});
}



function school_batches_list(userdata, pool, callback) {
	var resultJson = '';

	var school_id = '';
	var school_code = '';
	var Keyconditoin = '';

	if (typeof userdata.school_id != 'undefined' && userdata.school_id != '') {
		school_id = userdata.school_id;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	if (school_id != '') {
		Keyconditoin += ' AND school_batches.school_id ="' + school_id + '"';
	}
	if (school_code != '') {
		Keyconditoin += ' AND school_batches.school_code ="' + school_code + '"';
	}
	pool.getConnection(function (err, connection) {

		detailsquery = 'SELECT school_batches.* from school_batches where school_batches.id !="0" ' + Keyconditoin + ' group by school_batches.batch_id ';

		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, result) {
			if (errSelDetails) {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"school_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				if (result.length > 0) {
					var i = 0;
					async.eachSeries(
						result,
						function (rec2, loop2) {
							var batch_id = rec2.batch_id;
							var school_idn = rec2.school_id;
							console.log('school_id', school_id);
							proiMGquery = 'SELECT COUNT(school_batches.id) as student_count from school_batches where school_batches.batch_id="' + batch_id + '" AND school_id="' + school_idn + '"';
							console.log('proiMGquery', proiMGquery);
							connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
								if (errSelpiMG) {
									console.log('errSelpiMG', errSelpiMG);

									loop2();
								} else {
									if (respROiMG.length > 0) {
										result[i].count = respROiMG;
									} else {
										result[i].count = [];
									}
									loop2();
								}
								i = i + 1;
							});
						},
						function (errSelpiMG) {
							if (errSelpiMG) {
								console.log('errSelpiMG', errSelpiMG);
								resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_classes_info"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							} else {
								resultJson = '{"replyCode":"success","replyMsg":"school batches list","data":' + JSON.stringify(result) + ', "cmd":"user_list"}\n';
								console.log('res-suceess');
								connection.release();
								callback(200, null, resultJson);
								return;
							}
						}
					);
				} else {
					resultJson =
						'{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}

			}
		});


	});
}

function school_grade_courses_list(userdata, pool, callback) {
	var resultJson = '';

	var class_name = '';
	var ctype = '1';
	var Keyconditoin = '';

	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.ctype != 'undefined' && userdata.ctype != '') {
		ctype = userdata.ctype;
	}

	if (ctype != '') {
		Keyconditoin += ' AND class_duration_template.ctype ="' + ctype + '"';
	}
	pool.getConnection(function (err, connection) {

		var querySelectCourse = 'SELECT class_duration_template.* from class_duration_template WHERE class_name="' + class_name + '" AND status="1" ' + Keyconditoin + '';
		console.log('querySelectCourse--1', querySelectCourse);
		connection.query(querySelectCourse, function (errSel, result) {
			console.log('querySelectCourse--1::::result', result);
			if (errSel) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"school_grade_courses_list"}\n';
				connection.release();
				callback(false, resultJson);
				return;
			} else {

				if (result.length > 0) {
					var i = 0;
					async.eachSeries(
						result,
						function (rec2, loop2) {
							var course_id = rec2.course_id;
							console.log('result', result);
							proiMGquery = 'SELECT * from courses where courses.id="' + course_id + '"';
							console.log('proiMGquery', proiMGquery);
							connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
								if (errSelpiMG) {
									console.log('errSelpiMG', errSelpiMG);

									loop2();
								} else {
									if (respROiMG.length > 0) {
										result[i].courses = respROiMG;
									} else {
										result[i].courses = [];
									}
									loop2();
								}
								i = i + 1;
							});
						},
						function (errSelpiMG) {
							if (errSelpiMG) {
								console.log('errSelpiMG', errSelpiMG);
								resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"school_grade_courses_list"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							} else {
								resultJson = '{"replyCode":"success","replyMsg":"school batches list","data":' + JSON.stringify(result) + ', "cmd":"school_grade_courses_list"}\n';
								console.log('res-suceess');
								connection.release();
								callback(200, null, resultJson);
								return;
							}
						}
					);
				} else {
					resultJson =
						'{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"school_grade_courses_list"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			}
		})


	});
}


/*classes details*/
function view_school_course_info(userdata, pool, callback) {
	var resultJson = '';
	var course_id = '';

	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		var Catquery = 'SELECT * FROM courses WHERE id="' + course_id + '"';
		console.log('qq', Catquery);
		connection.query(Catquery, function (errinsert, resPro) {
			if (!errinsert) {
				if (resPro.length > 0) {
					var i = 0;
					async.eachSeries(
						resPro,
						function (rec2, loop2) {
							var course_id = rec2.id;
							console.log('course_id', course_id);
							proiMGquery = 'SELECT course_chapters.* from course_chapters where course_chapters.course_id="' + course_id + '" AND course_chapters.status="1"';
							console.log('proiMGquery', proiMGquery);
							connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
								if (errSelpiMG) {
									console.log('errSelpiMG', errSelpiMG);

									loop2();
								} else {
									courseInfo = 'SELECT course_info.* from course_info where course_info.course_id="' + course_id + '" AND course_info.status="1"';
									console.log('courseInfo', courseInfo);
									connection.query(courseInfo, function (errcourseInfo, CInfo) {
										if (errcourseInfo) {
											console.log('errcourseInfo', errcourseInfo);

											loop2();
										} else {
											resPro[i].chapters = respROiMG;
											resPro[i].course_info = CInfo;
											loop2();
										}
										i = i + 1;
									});

								}

							});
						},
						function (errSelPro) {
							if (errSelPro) {
								console.log('errSelPro', errSelPro);
								resultJson =
									'{"replyCode":"error","replyMsg":"' +
									errSelPro.message +
									'","cmd":"view_classes_info"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							} else {
								resultJson =
									'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
									JSON.stringify(resPro) +
									',"cmd":"view_classes_info"}\n';
								console.log('res-suceess');
								connection.release();
								callback(200, null, resultJson);
								return;
							}
						}
					);
				} else {
					resultJson =
						'{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_classes_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function course_concepts_info(userdata, pool, callback) {
	var resultJson = '';

	var student_id = '';
	var course_id = '';

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}

	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	console.log('----------');
	console.log(userdata);
	pool.getConnection(function (err, connection) {

		proiMGquery = 'SELECT course_chapters.*,chapter_concepts.concept_name,chapter_concepts.concept_id from course_chapters LEFT JOIN chapter_concepts as chapter_concepts ON chapter_concepts.chapter_id = course_chapters.id where course_chapters.course_id IN (' + course_id + ') GROUP BY concept_id';
		console.log('proiMGquery', proiMGquery);
		connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
			if (errSelpiMG) {
				console.log('errSelpiMG', errSelpiMG)
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_classes_info"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				var i = 0;
				async.eachSeries(
					respROiMG,
					function (rec2, loop2) {
						var concept_id = rec2.concept_id;
						var chapter_id = rec2.id;
						console.log('concept_id', concept_id);
						proiMGquery = 'SELECT user_concepts.*,users.name as user_name,(SELECT COUNT(id) from user_concepts WHERE  user_concepts.chapter_id="' + chapter_id + '" AND user_concepts.user_id=users.id) as total_count FROM user_concepts LEFT JOIN users as users ON users.id = user_concepts.user_id WHERE user_concepts.concept_id = ' + concept_id + '';
						console.log('proiMGquery', proiMGquery);
						connection.query(proiMGquery, function (errSelpiMG, resUser) {
							if (errSelpiMG) {
								console.log('errSelpiMG', errSelpiMG);

								loop2();
							} else {
								if (respROiMG.length > 0) {
									respROiMG[i].users = resUser;
								} else {
									respROiMG[i].users = [];
								}
								loop2();
							}
							i = i + 1;
						});
					},
					function (errSelpiMG) {
						if (errSelpiMG) {
							console.log('errSelpiMG', errSelpiMG);
							resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_classes_info"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						} else {
							resultJson = '{"replyCode":"success","replyMsg":"User concepts list","data":' + JSON.stringify(respROiMG) + ', "cmd":"user_list"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					}
				);
			}
		});
	});
}


//create new batch

function create_school_batch(userdata, pool, callback) {
	var resultJson = '';
	var school_id = '';
	var school_code = '';
	var batch_id = '';
	var batch_name = '';
	var class_type = '1';
	var students = '';
	var start_date = '';

	if (typeof userdata.school_id != 'undefined' && userdata.school_id != '') {
		school_id = userdata.school_id;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}
	if (typeof userdata.batch_id != 'undefined' && userdata.batch_id != '') {
		batch_id = userdata.batch_id;
	}
	if (typeof userdata.batch_name != 'undefined' && userdata.batch_name != '') {
		batch_name = userdata.batch_name;
	}
	if (typeof userdata.class_type != 'undefined' && userdata.class_type != '') {
		class_type = userdata.class_type;
	}
	if (typeof userdata.students != 'undefined' && userdata.students != '') {
		students = userdata.students;
	}
	if (typeof userdata.start_date != 'undefined' && userdata.start_date != '') {
		start_date = userdata.start_date;
	}

	console.log('userData', userdata);

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var i = 0;
		var queryStudentSchool = 'SELECT schools.student_limit,(SELECT COUNT(id) from school_batches where school_id ="' + school_id + '") as total_student from schools WHERE id="' + school_id + '" ';
		console.log('ss', queryStudentSchool)
		connection.query(queryStudentSchool, function (errSelStu, StData) {
			if (errSelStu) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelStu.message + '","cmd":"create_school_batch"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				console.log('queryStudentSchool--1::::resStudSchool', StData);
				var newStudents = students.length;
				var student_limit = StData[0].student_limit;
				var total_student = StData[0].total_student;
				var totalCount = newStudents + total_student;
				console.log('newStudents', newStudents);
				console.log('total_student', total_student);
				console.log('totalCount', totalCount);
				console.log('student_limit', student_limit);
				if (student_limit < totalCount) {

					resultJson = '{"replyCode":"error","replyMsg":"Your Student limit has been finished , Please contact Admin Staff ","cmd":"create_school_batch"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				} else {
					console.log('its in , ready to register')

					async.eachSeries(students, function (rec2, loop2) {
						console.log('student--', rec2);

						register_user_fun(rec2, pool, function (resSub, responseSubscribe) {
							console.log('resSub', resSub)
							if (resSub == false) {
								resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"register_user_fun"}\n';
								console.log('res-suceess');
								loop2();
							} else {
								console.log('responseSubscribe', responseSubscribe);
								Uquery = 'INSERT into school_batches SET school_id="' + school_id + '",school_code="' + school_code + '",batch_id="' + batch_id + '",batch_name="' + batch_name + '",student_id="' + responseSubscribe + '" ';
								connection.query(Uquery, function (errinsert) {
									if (!errinsert) {
										console.log('responseSubscribe', responseSubscribe);
										var querySelectCourse = 'SELECT class_duration_template.* from class_duration_template WHERE class_name="' + batch_name + '" AND ctype="' + class_type + '" AND status="1"';
										console.log('querySelectCourse--1', querySelectCourse);
										connection.query(querySelectCourse, function (errSel, resSel) {
											console.log('querySelectCourse--1::::resSel', resSel);
											if (errSel) {
												resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"subscribe_course"}\n';
												connection.release();
												callback(false, resultJson);
												return;
											} else {
												console.log(resSel);
												if (resSel.length > 0) {
													var i = 0;
													var myDate = new Date(start_date);
													console.log('myDate', myDate);
													var courseDays = "0";
													async.eachSeries(resSel, function (rec3, loop3) {
														var course_id = rec3.course_id;
														if (courseDays != "0") {
															myDate.setDate(myDate.getDate() + courseDays);
														}

														NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
														console.log('NewSchDate---', NewSchDate);

														var selectTeacherId = 'SELECT users.id as teacher_id ,tg.grade_id,g.grade_name  from users LEFT JOIN teachers_grades tg on users.id=tg.teacher_id LEFT JOIN grades g on tg.grade_id =g.id  where school_code ="' + school_code + '" AND role_id =3 AND grade_name="' + batch_name + '"';
														console.log('selectTeacherId--1', selectTeacherId);
														var teacher_id = '0';
														connection.query(selectTeacherId, function (errTS, ResTecher) {
															if (errTS) {
																resultJson = '{"replyCode":"error","replyMsg":"' + errTS.message + '","cmd":"subscribe_course"}\n';
																connection.release();
																callback(false, resultJson);
																return;
															} else {
																console.log('ResTecher[0].length',ResTecher.length)
																console.log('ResTecher[0]',ResTecher[0])
																if (ResTecher.length >0) {
																	teacher_id = ResTecher[0].teacher_id;
																} else {
																	teacher_id = '0';
																}
																var dataSUb = { "course_id": course_id, "student_id": responseSubscribe, "teacher_id": teacher_id, "price": "0", "start_date": NewSchDate, "transaction_id": "0", "school_code": school_code };
																console.log('dataSUb--------',dataSUb)
																subscribe_course(dataSUb, pool, function (resNew, responseNew) {
																	if (resNew == false) {
																		courseDays = rec3.days;
																		resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course-register_user_fun"}\n';
																		console.log('res-suceess');
																		loop3();
																	} else {
																		courseDays = rec3.days;
																		resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course-register_user_fun"}\n';
																		loop3();
																	}
																})

															}
														})
													}, function (errSelPro) {
														if (errSelPro) {
															console.log('errSelPro', errSelPro);
															resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
															loop2();
														} else {
															resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","cmd":"teacher_schedule_days_list"}\n';
															console.log('res-suceess');
															loop2();
														}
													});
												} else {

													console.log('res-err',);
													loop2();
												}
											}
										})
									} else {
										console.log('errinsert', errinsert);
										loop2();
									}
								});


							}
						})

					}, function (errSelPro) {
						if (errSelPro) {
							console.log('errSelPro', errSelPro);
							resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"create student batch"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						} else {
							resultJson = '{"replyCode":"success","replyMsg":"Batch created successfully .","cmd":"create student batch"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					});
				}
			}
		})
	});
}


/* user List */
function user_list(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var role_id = '3';
	var learning = '';
	var school_code = '';
	var Keyconditoin = ' users.status !="2" ';
	var result = [];
	var start = '0';
	var limit = '';
	var subscribed = '';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.learning != 'undefined' && userdata.learning != '') {
		learning = userdata.learning;
	}

	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	if (typeof userdata.start != 'undefined' && userdata.start != '') {
		start = userdata.start;
	}
	if (typeof userdata.limit != 'undefined' && userdata.limit != '') {
		limit = userdata.limit;
	}

	if (typeof userdata.subscribed != 'undefined' && userdata.subscribed != '') {
		subscribed = userdata.subscribed;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin += ' AND users.name LIKE  "%' + keyword + '%"';
		}

		if (role_id != '') {
			Keyconditoin += ' AND users.role_id ="' + role_id + '"';
		}

		if (learning != '') {
			Keyconditoin += ' AND users.learning ="' + learning + '"';
		}
		if (school_code != '') {
			Keyconditoin += ' AND users.school_code ="' + school_code + '"';
		}
		if (subscribed != '') {
			if (subscribed == '0') {
				Keyconditoin += ' AND (SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") =0';
			} else {
				Keyconditoin += ' AND (SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") >=1';

			}
		}

		if (limit != '') {
			var Catquery = 'SELECT users.*,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") as subscribed,age_group.title FROM users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE  ' + Keyconditoin + ' ORDER BY users.id DESC LIMIT ' + start + ', ' + limit + '';
		} else {
			var Catquery = 'SELECT users.*,(SELECT COUNT(id) from student_course_subscription where student_course_subscription.student_id=users.id AND student_course_subscription.status="1") as subscribed,age_group.title FROM users LEFT JOIN age_group as age_group ON age_group.id = users.age_group_id  WHERE  ' + Keyconditoin + ' ORDER BY users.id DESC';
		}

		console.log('Catquery', Catquery);

		var countquery = 'SELECT count(*) as count from users WHERE ' + Keyconditoin + '';
		// console.log('countquery::::::::::::::::----------',countquery)
		connection.query(countquery, function (err, responsecount) {
			// console.log('responsecount::::::::::::::::----------',responsecount)
			if (responsecount && responsecount[0].count > 0) {
				connection.query(Catquery, function (err, result) {
					if (err) {
						resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"user_list"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					} else {

						if (result.length > 0) {
							var i = 0;
							async.eachSeries(
								result,
								function (rec2, loop2) {
									var teacher_id = rec2.id;
									console.log('teacher_id', teacher_id);
									proiMGquery = 'SELECT teachers_grades.*,grades.grade_name FROM teachers_grades LEFT JOIN grades as grades ON grades.id = teachers_grades.grade_id WHERE teachers_grades.teacher_id = ' + teacher_id + '';
									console.log('proiMGquery', proiMGquery);
									connection.query(proiMGquery, function (errSelpiMG, respROiMG) {
										if (errSelpiMG) {
											console.log('errSelpiMG', errSelpiMG);

											loop2();
										} else {
											if (respROiMG.length > 0) {
												result[i].grades = respROiMG;
											} else {
												result[i].grades = [];
											}
											loop2();
										}
										i = i + 1;
									});
								},
								function (errSelpiMG) {
									if (errSelpiMG) {
										console.log('errSelpiMG', errSelpiMG);
										resultJson = '{"replyCode":"error","replyMsg":"' + errSelpiMG.message + '","cmd":"view_classes_info"}\n';
										connection.release();
										callback(200, null, resultJson);
										return;
									} else {
										resultJson = '{"replyCode":"success","replyMsg":"User list","data":' + JSON.stringify(result) + ',"totalCount":' + responsecount[0].count + ', "cmd":"user_list"}\n';
										console.log('res-suceess');
										connection.release();
										callback(200, null, resultJson);
										return;
									}
								}
							);
						} else {
							resultJson =
								'{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
							console.log('res-suceess');
							connection.release();
							callback(200, null, resultJson);
							return;
						}
					}
				});
			} else {
				resultJson = '{"replyCode":"success","replyMsg":"user_list","data":[], "cmd":"user_list"}\n';
				console.log(resultJson);
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


/* user points  list */
function user_badges_point_list(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var student_id = '';

	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}

	pool.getConnection(function (err, connection) {
		var Catquery = 'SELECT user_points.*,(SELECT SUM(points) from user_points where user_points.type="0") as type0,(SELECT SUM(points) from user_points where user_points.type="1") as type1,(SELECT SUM(points) from user_points where user_points.type="2") as type2,(SELECT SUM(points) from user_points where user_points.type="3") as type3,(SELECT SUM(points) from user_points where user_points.type="4") as type4 FROM user_points WHERE user_points.user_id ="' + student_id + '" ORDER BY user_points.id DESC';

		connection.query(Catquery, function (err, result) {
			if (err) {
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"user_badges_point_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"badge list","data":' + JSON.stringify(result) +
					', "cmd":"user_badges_point_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function admin_school_details(userdata, pool, callback) {
	var resultJson = '';
	var id = '';
	var school_code = '';

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		if (school_code != '') {
			var Catquery = 'SELECT * FROM schools WHERE code="' + school_code + '"';
		} else {
			var Catquery = 'SELECT * FROM schools WHERE id="' + id + '"';
		}

		console.log('qq', Catquery);
		connection.query(Catquery, function (errinsert, resultinsert) {
			if (!errinsert) {
				resultJson = '{"replyCode":"success","replyMsg":"schools details","data":' + JSON.stringify(resultinsert) + '}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"schools"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


/* badge list */
function badges_list(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var keyword = '';
	var is_admin = '1';

	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}
	if (typeof userdata.is_admin != 'undefined' && userdata.is_admin != '') {
		is_admin = userdata.is_admin;
	}

	pool.getConnection(function (err, connection) {
		if (is_admin == '0') {
			var Catquery = 'SELECT badges.* FROM badges WHERE badges.status ="1" ORDER BY badges.id DESC';

		} else {
			var Catquery = 'SELECT badges.* FROM badges WHERE badges.status !="2" ORDER BY badges.id DESC';

		}

		connection.query(Catquery, function (err, result) {
			if (err) {
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"sub_admin_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"badge list","data":' + JSON.stringify(result) +
					', "cmd":"sub_admin_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function admin_update_school_status(userdata, pool, callback) {
	var resultJson = '';
	var id = '';
	var status = '0'; //0-inactive , 1-active , 2- delete
	var Uquery = '';

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}

	if (typeof userdata.status != 'undefined' && userdata.status != '') {
		status = userdata.status;
	}

	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		Uquery = 'UPDATE schools SET status="' + status + '" WHERE id = ' + id + '';
		connection.query(Uquery, function (errinsert) {
			if (!errinsert) {
				resultJson = '{"replyCode":"success","replyMsg":"Status chenged Successfully","cmd":"schools"}';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"schools"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function admin_update_school(userdata, pool, callback) {
	var sha1 = require('sha1');
	var Hashids = require('hashids'),
		hashids = new Hashids(secretSalt);

	var resultJson = '';
	var course_id = '';

	var id = '';
	var code = '';
	var description = '';
	var name = '';
	var address = '';
	var district = '';
	var city = '';
	var state = '';
	var contact_person = '';
	var contact_phone = '';
	var contact_alternate_number = '';
	var contact_email = '';
	var image = '';
	var bank_name = '';
	var bank_account_no = '';
	var bank_account_name = '';
	var bank_ifsc = '';
	var gstin = '';
	var pan = '';
	var is_gst = '';
	var is_specified_person = '';
	var password = '';
	var payout = '0';
	var robotics = '0';
	var coding = '0';
	var robotics_aiot = '0';
	var robotics_atl = '0';
	var robotics_curriculam = '0';

	var student_limit = '0';


	if (typeof userdata.robotics_aiot != 'undefined' && userdata.robotics_aiot != '') {
		robotics_aiot = userdata.robotics_aiot;
	}
	if (typeof userdata.robotics_atl != 'undefined' && userdata.robotics_atl != '') {
		robotics_atl = userdata.robotics_atl;
	}
	if (typeof userdata.robotics_curriculam != 'undefined' && userdata.robotics_curriculam != '') {
		robotics_curriculam = userdata.robotics_curriculam;
	}
	if (typeof userdata.robotics != 'undefined' && userdata.robotics != '') {
		robotics = userdata.robotics;
	}
	if (typeof userdata.coding != 'undefined' && userdata.coding != '') {
		coding = userdata.coding;
	}
	if (typeof userdata.gstin != 'undefined' && userdata.gstin != '') {
		gstin = userdata.gstin;
	}
	if (typeof userdata.pan != 'undefined' && userdata.pan != '') {
		pan = userdata.pan;
	}
	if (typeof userdata.is_gst != 'undefined' && userdata.is_gst != '') {
		is_gst = userdata.is_gst;
	}
	if (typeof userdata.is_specified_person != 'undefined' && userdata.is_specified_person != '') {
		is_specified_person = userdata.is_specified_person;
	}
	if (typeof userdata.address != 'undefined' && userdata.address != '') {
		address = userdata.address;
	}
	if (typeof userdata.district != 'undefined' && userdata.district != '') {
		district = userdata.district;
	}
	if (typeof userdata.city != 'undefined' && userdata.city != '') {
		city = userdata.city;
	}
	if (typeof userdata.state != 'undefined' && userdata.state != '') {
		state = userdata.state;
	}
	if (typeof userdata.contact_person != 'undefined' && userdata.contact_person != '') {
		contact_person = userdata.contact_person;
	}
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}

	if (typeof userdata.code != 'undefined' && userdata.code != '') {
		code = userdata.code;
	}

	if (typeof userdata.description != 'undefined' && userdata.description != '') {
		description = userdata.description;
	}

	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
	}

	if (typeof userdata.contact_phone != 'undefined' && userdata.contact_phone != '') {
		contact_phone = userdata.contact_phone;
	}

	if (typeof userdata.contact_alternate_number != 'undefined' && userdata.contact_alternate_number != '') {
		contact_alternate_number = userdata.contact_alternate_number;
	}

	if (typeof userdata.contact_email != 'undefined' && userdata.contact_email != '') {
		contact_email = userdata.contact_email;
	}
	if (typeof userdata.bank_name != 'undefined' && userdata.bank_name != '') {
		bank_name = userdata.bank_name;
	}
	if (typeof userdata.bank_account_no != 'undefined' && userdata.bank_account_no != '') {
		bank_account_no = userdata.bank_account_no;
	}
	if (typeof userdata.bank_account_name != 'undefined' && userdata.bank_account_name != '') {
		bank_account_name = userdata.bank_account_name;
	}
	if (typeof userdata.bank_ifsc != 'undefined' && userdata.bank_ifsc != '') {
		bank_ifsc = userdata.bank_ifsc;
	}

	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.image != 'undefined' && userdata.image != '') {
		image = userdata.image;
	}

	if (typeof userdata.payout != 'undefined' && userdata.payout != '') {
		payout = userdata.payout;
	}
	if (typeof userdata.student_limit != 'undefined' && userdata.student_limit != '') {
		student_limit = userdata.student_limit;
	}


	var hash_password = sha1(secretSalt + password);
	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var queryinsert = 'UPDATE schools SET description="' + description + '",name="' + name + '",address="' + address + '",district="' + district + '",city="' + city + '",state="' + state + '",contact_person="' + contact_person + '",contact_phone="' + contact_phone + '",contact_alternate_number="' + contact_alternate_number + '",bank_name="' + bank_name + '",bank_account_no="' + bank_account_no + '",bank_account_name="' + bank_account_name + '",bank_ifsc="' + bank_ifsc + '",gstin="' + gstin + '",pan="' + pan + '",image="' + image + '" where schools.id="' + id + '"';

		console.log(queryinsert);
		connection.query(queryinsert, function (errinsert, resultinsert) {
			if (!errinsert) {
				resultJson = '{"replyCode":"success","replyMsg":"school updated successfully","cmd":"school"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"school"}\n';
				console.log('res-suceess');
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}


function update_user_new(userdata, pool, callback) {
	var sha1 = require('sha1');
	var resultJson = '';
	var strJson = '';

	var name = '';
	var email = '';
	var role_id = '3'; //1-admin,2-student,3-teacher,4-subadmin
	var phone = '';
	var gender = ''; //	1-male,2-female,3-other
	var age = '';
	var time_zone = '';
	var job_type = '';
	var dob = '';
	var image = '';
	var work_experience = '';
	var parents_name = '';
	var school_name = '';
	var subscription_type = '0'; //0-trail,1-paid
	var age_group_id = '';
	var class_name = '';
	var grades = '';
	var city = '';
	var address = '';
	var id = '';

	if (typeof userdata.city != 'undefined' && userdata.city != '') {
		city = userdata.city;
	}
	if (typeof userdata.address != 'undefined' && userdata.address != '') {
		address = userdata.address;
	}
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
	}

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	if (typeof userdata.gender != 'undefined' && userdata.gender != '') {
		gender = userdata.gender;
	}

	if (typeof userdata.age != 'undefined' && userdata.age != '') {
		age = userdata.age;
	}

	if (typeof userdata.time_zone != 'undefined' && userdata.time_zone != '') {
		time_zone = userdata.time_zone;
	}

	if (typeof userdata.job_type != 'undefined' && userdata.job_type != '') {
		job_type = userdata.job_type;
	}
	if (typeof userdata.dob != 'undefined' && userdata.dob != '') {
		dob = userdata.dob;
	}
	if (typeof userdata.work_experience != 'undefined' && userdata.work_experience != '') {
		work_experience = userdata.work_experience;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.image != 'undefined' && userdata.image != '') {
		image = userdata.image;
	}

	if (typeof userdata.parents_name != 'undefined' && userdata.parents_name != '') {
		parents_name = userdata.parents_name;
	}
	if (typeof userdata.school_name != 'undefined' && userdata.school_name != '') {
		school_name = userdata.school_name;
	}
	if (typeof userdata.subscription_type != 'undefined' && userdata.subscription_type != '') {
		subscription_type = userdata.subscription_type;
	}
	if (typeof userdata.age_group_id != 'undefined' && userdata.age_group_id != '') {
		age_group_id = userdata.age_group_id;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.grades != 'undefined' && userdata.grades != '') {
		grades = userdata.grades;
	}

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	} else {
		resultJson = '{"replyCode":"error","replyMsg":"Your uid is not Correct","cmd":"update_subadmin"}\n';
		callback(200, null, resultJson);
		return;
	}

	var Uquery = '';

	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		Uquery = 'UPDATE users SET email="' + email + '",name = "' + name + '",phone = "' + phone + '",role_id="' + role_id + '"  WHERE id = ' + id;
		console.log('Uquery', Uquery)
		connection.query(Uquery, function (errinsert, resultinsert) {
			if (!errinsert) {
				resultJson = '{"replyCode":"success","replyMsg":"Profile Updated Successfully"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;

			} else {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"Update_profile"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


//user status
function update_user_status(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';

	var Cquery = '';
	var id = '';
	var status = ''; //0-inactive,1-active,2-delete

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}

	if (typeof userdata.status != 'undefined' && userdata.status != '') {
		status = userdata.status;
	}
	pool.getConnection(function (err, connection) {
		squery = 'UPDATE users SET status = "' + status + '" WHERE id = "' + id + '"';
		connection.query(squery, function (errselect, resultselect) {
			if (!errselect) {
				console.log(resultselect);
				resultJson =
					'{"replyCode":"success","replyMsg":"Record status updated successfully","cmd":"update_subadmin_status"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + errselect.message + '","cmd":"update_subadmin_status"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


function admin_assign_course_to_student_bulk(userdata, pool, callback) {
	var resultJson = '';
	var student_id = '';
	var teacher_id = '';
	var created_by = '';
	var course_id = '';
	var price = '0';
	var students = '';
	var new_account = '0';
	var errArray = [];
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	if (typeof userdata.price != 'undefined' && userdata.price != '') {
		price = userdata.price;
	}
	if (typeof userdata.students != 'undefined' && userdata.students != '') {
		students = userdata.students;
	}

	if (typeof userdata.new_account != 'undefined' && userdata.new_account != '') {
		new_account = userdata.new_account;
	}
	if (typeof userdata.transaction_id != 'undefined' && userdata.transaction_id != '') {
		transaction_id = userdata.transaction_id;
	}

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var i = 0;
		async.eachSeries(students, function (rec2, loop2) {
			console.log('Student--', rec2);
			var dataSUb = { "course_id": course_id, "student_id": rec2, "teacher_id": "0", "price": price, "start_date": "", "transaction_id": transaction_id };
			subscribe_course(dataSUb, pool, function (resNew, responseNew) {
				if (resNew == false) {
					resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course-register_user_fun"}\n';
					console.log('res-suceess');
					loop2();
				} else {
					resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course-register_user_fun"}\n';
					loop2();
				}
			})
		}, function (errSelPro) {
			if (errSelPro) {
				console.log('errSelPro', errSelPro);
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":"' + errArray + '","cmd":"teacher_schedule_days_list"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});

	});
}


function assign_course_to_student_bulk(userdata, pool, callback) {
	var resultJson = '';
	var student_id = '';
	var teacher_id = '0';
	var created_by = '';
	var course_id = '';
	var price = '0';
	var students = '';
	var new_account = '0';
	var start_date = '';
	var errArray = [];
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	if (typeof userdata.price != 'undefined' && userdata.price != '') {
		price = userdata.price;
	}
	if (typeof userdata.students != 'undefined' && userdata.students != '') {
		students = userdata.students;
	}

	if (typeof userdata.new_account != 'undefined' && userdata.new_account != '') {
		new_account = userdata.new_account;
	}

	if (typeof userdata.start_date != 'undefined' && userdata.start_date != '') {
		start_date = userdata.start_date;
	}

	console.log('userData', userdata);

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		if (student_id != '') {

			subscribe_course(userdata, pool, function (ResSub, responseSubscribe) {
				if (ResSub == false) {
					resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
				} else {
					resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
				}
			})
		} else {
			var i = 0;
			async.eachSeries(students, function (rec2, loop2) {
				console.log('Student--', rec2);
				checkValidateStudent(rec2, pool, function (ResStatus, responseResult) {
					console.log(typeof responseResult);
					console.log(ResStatus);
					console.log(responseResult);

					if (ResStatus == false) {
						if (new_account == '1') {
							console.log('123467');
							register_user_fun(rec2, pool, function (resSub, responseSubscribe) {
								if (resSub == false) {
									resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"register_user_fun"}\n';
									console.log('res-suceess');
									loop2();
								} else {
									console.log('responseSubscribe', responseSubscribe);
									var querySelectCourse = 'SELECT class_duration_template.* from class_duration_template WHERE class_name="' + rec2.class_name + '" AND status="1"';
									console.log('querySelectCourse--1', querySelectCourse);
									connection.query(querySelectCourse, function (errSel, resSel) {
										console.log('querySelectCourse--1::::resSel', resSel);
										if (errSel) {
											resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"subscribe_course"}\n';
											connection.release();
											callback(false, resultJson);
											return;
										} else {
											console.log(resSel);
											if (resSel.length > 0) {
												var i = 0;
												var myDate = new Date(start_date);
												console.log('myDate', myDate);
												var courseDays = "0";
												async.eachSeries(resSel, function (rec3, loop3) {
													var course_id = rec3.course_id;
													if (courseDays != "0") {
														myDate.setDate(myDate.getDate() + courseDays);
													}

													NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
													console.log('NewSchDate---', NewSchDate);
													var dataSUb = { "course_id": course_id, "student_id": responseSubscribe, "teacher_id": "0", "price": price, "start_date": NewSchDate, "transaction_id": "0" };
													subscribe_course(dataSUb, pool, function (resNew, responseNew) {
														if (resNew == false) {
															courseDays = rec3.days;
															resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course-register_user_fun"}\n';
															console.log('res-suceess');
															loop3();
														} else {
															courseDays = rec3.days;
															resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course-register_user_fun"}\n';
															loop3();
														}
													})
												}, function (errSelPro) {
													if (errSelPro) {
														console.log('errSelPro', errSelPro);
														resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
														loop2();
													} else {
														resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","cmd":"teacher_schedule_days_list"}\n';
														console.log('res-suceess');
														loop2();
													}
												});
											} else {

												console.log('res-err',);
												loop2();
											}
										}
									})

								}
							})
						} else {
							if (new_account == '0') {
								if (responseResult.length > 0) {
									var student = responseResult[0].id;
									var myDate = new Date(start_date);
									NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
									console.log('NewSchDate---', NewSchDate);
									var dataSUb = { "course_id": course_id, "student_id": student, "teacher_id": "0", "price": price, "transaction_id": "0", "start_date": NewSchDate };
									// assign new course
									subscribe_course(dataSUb, pool, function (resN, responseSubscribe) {
										if (resN == false) {
											resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
											console.log('res-suceess');
											errArray.push(i + 1);

											loop2();
										} else {
											resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
											console.log('res-suceess');
											loop2();
										}
									})

								} else {
									errArray.push(i + 1);
									loop2();
								}
							} else {
								errArray.push(i + 1);
								loop2();
							}

						}
					} else {

						console.log('fas gaya', responseResult.length);
						if (responseResult.length > 0 && new_account == '0') {
							var myDate = new Date(start_date);
							NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();
							console.log('NewSchDate---', NewSchDate);
							var dataSUb = { "course_id": course_id, "student_id": responseResult[0].id, "teacher_id": "0", "price": price, "transaction_id": "0", "start_date": NewSchDate };
							// assign new course
							subscribe_course(dataSUb, pool, function (resN, responseSubscribe) {
								if (resN == false) {
									resultJson = '{"replyCode":"error","replyMsg":"Something went wrong ","cmd":"subscribe_course"}\n';
									console.log('res-suceess');
									errArray.push(i + 1);
									loop2();
								} else {
									resultJson = '{"replyCode":"success","replyMsg":"Course subscribed successfully","cmd":"subscribe_course"}\n';
									console.log('res-suceess');
									loop2();
								}
							})
						} else {
							errArray.push(i + 1);
							console.log('fas gaya');
							loop2();
						}
					}
					i = i + 1;
				});
			}, function (errSelPro) {
				if (errSelPro) {
					console.log('errSelPro', errSelPro);
					resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"teacher_schedule_days_list"}\n';
					connection.release();
					callback(200, null, resultJson);
					return;
				} else {
					resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":"' + errArray + '","cmd":"teacher_schedule_days_list"}\n';
					console.log('res-suceess');
					connection.release();
					callback(200, null, resultJson);
					return;
				}
			});
		}

	});
}


//user status
function update_user_verified_status(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';

	var Cquery = '';
	var id = '';
	var verified = ''; //0-inactive,1-active,2-delete

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}

	if (typeof userdata.verified != 'undefined' && userdata.verified != '') {
		verified = userdata.verified;
	}
	pool.getConnection(function (err, connection) {
		squery = 'UPDATE users SET verified = "' + verified + '" WHERE id = "' + id + '"';
		connection.query(squery, function (errselect, resultselect) {
			if (!errselect) {
				console.log(resultselect);
				resultJson =
					'{"replyCode":"success","replyMsg":"Record status updated successfully","cmd":"update_subadmin_status"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + errselect.message + '","cmd":"update_subadmin_status"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


// Teacher
// add teacher
function add_user(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require('hashids'),
		hashids = new Hashids(secretSalt);

	var name = '';
	var email = '';
	var image = '';
	var password = '';
	var role_id = '3'; //1-admin,2-student,3-teacher,4-subadmin
	var phone = '';
	var gender = '1'; //	1-male,2-female,3-other
	var age = '';
	var time_zone = '';
	var job_type = '1'; //1-fulltime,2-parttime
	var dob = '0000-00-00';
	var work_experience = '0';
	var parents_name = '';
	var school_name = '';
	var subscription_type = '0'; //0-trail,1-paid
	var school_code = '';
	var age_group_id = '';
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
	}

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	if (typeof userdata.gender != 'undefined' && userdata.gender != '') {
		gender = userdata.gender;
	}

	if (typeof userdata.age != 'undefined' && userdata.age != '') {
		age = userdata.age;
	}

	if (typeof userdata.time_zone != 'undefined' && userdata.time_zone != '') {
		time_zone = userdata.time_zone;
	}

	if (typeof userdata.job_type != 'undefined' && userdata.job_type != '') {
		job_type = userdata.job_type;
	}
	if (typeof userdata.dob != 'undefined' && userdata.dob != '') {
		dob = userdata.dob;
	}
	if (typeof userdata.work_experience != 'undefined' && userdata.work_experience != '') {
		work_experience = userdata.work_experience;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}

	if (typeof userdata.image != 'undefined' && userdata.image != '') {
		image = userdata.image;
	}
	if (typeof userdata.parents_name != 'undefined' && userdata.parents_name != '') {
		parents_name = userdata.parents_name;
	}
	if (typeof userdata.school_name != 'undefined' && userdata.school_name != '') {
		school_name = userdata.school_name;
	}
	if (typeof userdata.subscription_type != 'undefined' && userdata.subscription_type != '') {
		subscription_type = userdata.subscription_type;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}
	if (typeof userdata.age_group_id != 'undefined' && userdata.age_group_id != '') {
		age_group_id = userdata.age_group_id;
	}

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var hash_password = sha1(secretSalt + userdata.password);

		connection.query('SELECT * from users where email = "' + email + '" AND email != ""', function (
			erremail,
			resultsemail
		) {
			if (!erremail) {
				var pagingCount1 = resultsemail.length;
				console.log(userdata);
				console.log(pagingCount1);
				if (pagingCount1 > 0) {
					var user_id = resultsemail[0].id;
					if (resultsemail[0].status == '1') {
						resultJson =
							'{"replyCode":"error","replyMsg":"Email already Registered, please try with different email address","cmd":"sign_up"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					} else {
						resultJson =
							'{"replyCode":"error","replyMsg":"Your account not Verified or Deativiated.","cmd":"sign_up"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				} else {
					var queryinsert = 'INSERT INTO users SET email="' + email + '",name = "' + name + '", password = "' + hash_password + '",phone = "' + phone + '",role_id="' + role_id + '",gender="' + gender + '",age="' + age + '",age_group_id="' + age_group_id + '",time_zone="' + time_zone + '",job_type="' + job_type + '",dob="' + dob + '",work_experience="' + work_experience + '",image="' + image + '",subscription_type="' + subscription_type + '",parents_name="' + parents_name + '",school_name="' + school_name + '",school_code="' + school_code + '",status="1",verified="1",created= NOW()';

					console.log(queryinsert);
					connection.query(queryinsert, function (errinsert, resultinsert) {
						if (!errinsert) {
							if ((role_id == '3')) {
								var user_id = resultinsert.insertId;

								var checkShecduleDate = 'SELECT * from demo_class_settings where id = "2" ';
								console.log(checkShecduleDate);
								connection.query(checkShecduleDate, function (errSchedule, resultsSchedule) {
									if (errSchedule) {
										resultJson =
											'{"replyCode":"error","replyMsg":"' +
											errSchedule.message +
											'","cmd":"sign_up"}\n';
										connection.release();
										callback(200, null, resultJson);
										return;
									} else {
										console.log('resultsSchedule', resultsSchedule[0]);
										console.log('Curdate', Curdate);
										var teacher_id = user_id;
										var NewSchDate = '';
										for (var i = 0; i <= 29; i++) {
											//repeating code here:
											var myDate = new Date();
											myDate.setDate(myDate.getDate() + i);
											NewSchDate = myDate.getFullYear() + "-" + parseInt(myDate.getMonth() + 1) + "-" + myDate.getDate();

											var tday = weekday[myDate.getDay()];
											tday = tday.toLowerCase();
											tday = tday.toString(); //console.log(tday);
											console.log(NewSchDate);
											if (resultsSchedule[0][tday] == '1') {
												console.log('yes');
												var datequery = 'INSERT INTO user_time_schedule SET teacher_id="' + teacher_id + '",schedule_date = "' + NewSchDate + '", available = "1",holiday = "0",status="1",created= NOW()';
											} else {
												console.log('no');
												var datequery = 'INSERT INTO user_time_schedule SET teacher_id="' + teacher_id + '",schedule_date = "' + NewSchDate + '", available = "0",holiday = "1",status="1",created= NOW()';
											}
											connection.query(datequery, function (errinsertDAte, resultinsertDate) {
												if (!errinsertDAte) {
													var dateId = resultinsertDate.insertId;
													// console.log('--time_from---',resultsSchedule[0].time_from);
													// console.log('--time_to---',resultsSchedule[0].time_to);
													// console.log('--class_duration---',resultsSchedule[0].class_duration);
													var startTime = resultsSchedule[0].time_from;
													var endTime = resultsSchedule[0].time_to;
													var interval = resultsSchedule[0].class_duration;
													while (startTime <= endTime) {
														startTimeTo = startTime;
														startTime = addMinutes(startTime, interval);
														endTimeTo = addMinutes(startTimeTo, interval);
														console.log('Time-slot-startTimeTo', startTimeTo);
														console.log('Time-slot-endTimeTo', endTimeTo);

														console.log('Tdate', NewSchDate);
														var TimeInsertquery =
															'INSERT INTO user_time_schedule_slots SET schedule_id="' +
															dateId +
															'",teacher_id="' +
															teacher_id +
															'",time_from="' +
															startTimeTo +
															'",time_to="' +
															endTimeTo +
															'",available = "0",holiday = "0",status="1",created= NOW()';
														connection.query(TimeInsertquery);
													}
												} else {
													resultJson =
														'{"replyCode":"error","replyMsg":"' +
														errinsertDAte.message +
														'","cmd":"sign_up"}\n';
													connection.release();
													callback(200, null, resultJson);
													return;
												}
											});
										}
										resultJson = '{"replyCode":"success","replyMsg":"Registered successfully"}\n';
										connection.release();
										callback(200, null, resultJson);
										return;
									}
								});
							} else {
								resultJson = '{"replyCode":"success","replyMsg":"Registered successfully"}\n';
								connection.release();
								callback(200, null, resultJson);
								return;
							}
						} else {
							resultJson =
								'{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"sign_up"}\n';
							console.log('res-suceess');
							connection.release();
							callback(400, null, resultJson);
							return;
						}
					});
				}
			} else {
				resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"sign_up"}\n';
				connection.release();
				callback(400, null, resultJson);
				return;
			}
		});
	});
}


function addMinutes(time, minsToAdd) {
	function D(J) { return (J < 10 ? '0' : '') + J; };
	var piece = time.split(':');
	var mins = piece[0] * 60 + +piece[1] + +minsToAdd;

	return D(mins % (24 * 60) / 60 | 0) + ':' + D(mins % 60);
}  //this is work

function update_user(userdata, pool, callback) {
	var sha1 = require('sha1');
	var resultJson = '';
	var strJson = '';

	var name = '';
	var email = '';
	var password = '';
	var role_id = '3'; //1-admin,2-student,3-teacher,4-subadmin
	var phone = '';
	var gender = ''; //	1-male,2-female,3-other
	var age = '';
	var time_zone = '';
	var job_type = '';
	var dob = '';
	var image = '';
	var work_experience = '';
	var parents_name = '';
	var school_name = '';
	var subscription_type = '0'; //0-trail,1-paid
	var age_group_id = '';
	var class_name = '';
	var grades = '';
	var city = '';
	var address = '';
	var grades = '';
	var id = '';

	if (typeof userdata.city != 'undefined' && userdata.city != '') {
		city = userdata.city;
	}
	if (typeof userdata.address != 'undefined' && userdata.address != '') {
		address = userdata.address;
	}
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	if (typeof userdata.password != 'undefined' && userdata.password != '') {
		password = userdata.password;
	}
	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
	}

	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}
	if (typeof userdata.gender != 'undefined' && userdata.gender != '') {
		gender = userdata.gender;
	}

	if (typeof userdata.age != 'undefined' && userdata.age != '') {
		age = userdata.age;
	}

	if (typeof userdata.time_zone != 'undefined' && userdata.time_zone != '') {
		time_zone = userdata.time_zone;
	}

	if (typeof userdata.job_type != 'undefined' && userdata.job_type != '') {
		job_type = userdata.job_type;
	}
	if (typeof userdata.dob != 'undefined' && userdata.dob != '') {
		dob = userdata.dob;
	}
	if (typeof userdata.work_experience != 'undefined' && userdata.work_experience != '') {
		work_experience = userdata.work_experience;
	}
	if (typeof userdata.role_id != 'undefined' && userdata.role_id != '') {
		role_id = userdata.role_id;
	}
	if (typeof userdata.image != 'undefined' && userdata.image != '') {
		image = userdata.image;
	}

	if (typeof userdata.parents_name != 'undefined' && userdata.parents_name != '') {
		parents_name = userdata.parents_name;
	}
	if (typeof userdata.school_name != 'undefined' && userdata.school_name != '') {
		school_name = userdata.school_name;
	}
	if (typeof userdata.subscription_type != 'undefined' && userdata.subscription_type != '') {
		subscription_type = userdata.subscription_type;
	}
	if (typeof userdata.age_group_id != 'undefined' && userdata.age_group_id != '') {
		age_group_id = userdata.age_group_id;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.grades != 'undefined' && userdata.grades != '') {
		grades = userdata.grades;
	}

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	} else {
		resultJson = '{"replyCode":"error","replyMsg":"Your uid is not Correct","cmd":"update_subadmin"}\n';
		callback(200, null, resultJson);
		return;
	}

	var Uquery = '';

	console.log('----------');
	console.log(userdata);

	pool.getConnection(function (err, connection) {
		checkValidateEmailEmpProfile(userdata, pool, function (responseEmail) {
			console.log(responseEmail);
			if (responseEmail == false) {
				if (password != '') {
					var hash_password = sha1(secretSalt + password);

					Uquery = 'UPDATE users SET email="' + email + '",name = "' + name + '", password = "' + hash_password + '",phone = "' + phone + '",role_id="' + role_id + '",gender="' + gender + '",age="' + age + '",age_group_id="' + age_group_id + '",time_zone="' + time_zone + '",job_type="' + job_type + '",dob="' + dob + '",work_experience="' + work_experience + '",image="' + image + '",subscription_type="' + subscription_type + '",parents_name="' + parents_name + '",class_name="' + class_name + '",school_name="' + school_name + '",address="' + address + '",city="' + city + '"  WHERE id = ' + id;
				} else {
					Uquery = 'UPDATE users SET email="' + email + '",name = "' + name + '",phone = "' + phone + '",role_id="' + role_id + '",gender="' + gender + '",age="' + age + '",age_group_id="' + age_group_id + '",time_zone="' + time_zone + '",job_type="' + job_type + '",dob="' + dob + '",image="' + image + '",work_experience="' + work_experience + '",subscription_type="' + subscription_type + '",parents_name="' + parents_name + '",school_name="' + school_name + '",class_name="' + class_name + '",address="' + address + '",city="' + city + '"  WHERE id = ' + id;
				}

				connection.query(Uquery, function (errinsert, resultinsert) {
					if (!errinsert) {
						var teacher_id = id;
						if (grades != "") {

							DeleteQuery = 'DELETE FROM teachers_grades WHERE teacher_id="' + teacher_id + '"';
							console.log('DeleteQuery', DeleteQuery);
							connection.query(DeleteQuery);

							async.eachSeries(grades, function (rec2, loop2) {
								console.log("in user result array");

								console.log('assesment-id', rec2);
								Uquery = 'INSERT INTO teachers_grades SET teacher_id="' + teacher_id + '",grade_id="' + rec2 + '"';

								console.log('Uquery', Uquery);
								connection.query(Uquery, function (errPre, Predetails) {
									if (errPre) {
										console.log('errPre.message', errPre.message)
										loop2();
									} else {
										loop2();
									}
								})

							}, function (errInsert) {
								if (errInsert) {
									resultJson = '{"replyCode":"error","replyMsg":"' + errInsert.message + '", "cmd":"send"}';
									console.log(resultJson);
									connection.release();
									callback(200, null, resultJson);
									return;
								} else {

									resultJson = '{"replyCode":"success","replyMsg":"Profile Updated Successfully"}\n';
									connection.release();
									callback(200, null, resultJson);
									return;
								}
							})

						} else {
							resultJson = '{"replyCode":"success","replyMsg":"Teacher registered successfully","cmd":"sign_up"}\n';
							connection.release();
							callback(200, null, resultJson);
							return;
						}

					} else {
						resultJson =
							'{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"Update_profile"}\n';
						connection.release();
						callback(200, null, resultJson);
						return;
					}
				});
			} else {
				resultJson =
					'{"replyCode":"error","replyMsg":"Email already Taken, please try with different email address ","cmd":"Update_profile"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
			}
		});
	});
}


function checkValidateEmailEmpProfile(userdata, pool, callback) {
	var resultJson = '';
	var Hashids = require('hashids');

	var email = '';
	var id = '';
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	pool.getConnection(function (err, connection) {
		Query = 'SELECT * FROM users WHERE email="' + email + '" AND email !=" " AND id != "' + id + '" ';
		console.log('s', Query);
		connection.query(Query, function (err, usersEmail) {
			if (err) {
				resultJson =
					'{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"checkValidateEmailEmpProfile"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				if (usersEmail.length > 0) {
					callback(true);
				} else {
					callback(false);
				}
			}
		});
	});
}



/* grades list */
function grades_list(userdata, pool, callback) {
	var resultJson = '';

	var keyword = '';
	if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
		keyword = userdata.keyword;
	}

	pool.getConnection(function (err, connection) {
		if (keyword != '') {
			Keyconditoin = ' AND grades.grade_name LIKE  "%' + keyword + '%"';
		}
		detailsquery = 'SELECT grades.* from grades where grades.status !="2"';
		console.log('detailsquery', detailsquery);
		connection.query(detailsquery, function (errSelDetails, resSelDetails) {
			if (errSelDetails) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSelDetails.message + '","cmd":"grades"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			} else {
				resultJson =
					'{"replyCode":"success","replyMsg":"Details found successfully .","data":' +
					JSON.stringify(resSelDetails) +
					',"cmd":"grades"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	});
}


/* courses by grade list */
function courses_by_grade(userdata, pool, callback) {
	var resultJson = '';
	var resPro=[];
	var class_name = '';
	var class_type = '1';
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.class_type != 'undefined' && userdata.class_type != '') {
		class_type = userdata.class_type;
	}

	pool.getConnection(function (err, connection) {
		
		var i = 0;
		async.eachSeries(class_name,function(rec2, loop2){
			var clss = rec2;
			detailsquery = 'SELECT class_duration_template.id as template_id,courses.id as course_id,course_lesson_detail_count.class_count,course_lesson_detail_count.project_count,course_lesson_detail_count.quiz_count,courses.* from class_duration_template LEFT JOIN courses as courses on courses.id=class_duration_template.course_id LEFT JOIN course_lesson_detail_count as course_lesson_detail_count on course_lesson_detail_count.id=class_duration_template.course_id where class_duration_template.class_name ="'+clss+'" AND class_duration_template.ctype ="'+class_type+'"';
			console.log('detailsquery',detailsquery);
			connection.query(detailsquery, function(errSelpiMG,respROiMG){
				if(errSelpiMG){
					console.log('errSelpiMG',errSelpiMG);
					loop2();
				}else{
					console.log('respROiMG',respROiMG)
					resPro=resPro.concat(respROiMG);
					loop2();
				}
				i=i+1;
			});
		},function(errSelPro){
			if(errSelPro){
				console.log('errSelPro',errSelPro);
				resultJson = '{"replyCode":"error","replyMsg":"'+errSelPro.message+'","cmd":"courses_by_grade"}\n';
				connection.release();
				callback(200, null, resultJson);
				return;
			}else{
				console.log('resPro',resPro);
				const ids = resPro.map(o => o.id)
				const filtered = resPro.filter(({id}, index) => !ids.includes(id, index + 1))

				console.log(filtered)
				resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":'+JSON.stringify(filtered)+',"cmd":"courses_by_grade"}\n';
				console.log('res-suceess');
				connection.release();
				callback(200, null, resultJson);
				return;
			}
		});
	
	});
}


function robotics_courses_list(userdata, pool, callback) {
    var resultJson = '';
    var res = '';
    var keyword = '';
    var age_group_id = '';
    var robotics_type = '1';
    var Keyconditoin = '';
    var featured = '0';
    var learning = "0";
    var course_type = "3";

    if (typeof userdata.learning != 'undefined' && userdata.learning != '') {
        learning = userdata.learning;
    }
    if (typeof userdata.keyword != 'undefined' && userdata.keyword != '') {
        keyword = userdata.keyword;
    }
    if (typeof userdata.age_group_id != 'undefined' && userdata.age_group_id != '') {
        age_group_id = userdata.age_group_id;
    }
    if (typeof userdata.featured != 'undefined' && userdata.featured != '') {
        featured = userdata.featured;
    }
    if (typeof userdata.robotics_type != 'undefined' && userdata.robotics_type != '') {
        robotics_type = userdata.robotics_type;
    }
    if (typeof userdata.course_type != 'undefined' && userdata.course_type != '') {
        course_type = userdata.course_type;
    }

    pool.getConnection(function(err, connection) {
        if (keyword != '') {
            Keyconditoin += ' AND courses.course_name LIKE  "%' + keyword + '%"';
        }
        if (age_group_id != '') {
            Keyconditoin += ' AND courses.age_group_id ="' + age_group_id + '"';
        }
        
        if (robotics_type != '') {
            Keyconditoin += ' AND courses.robotics_type ="' + robotics_type + '"';
        }
        if (course_type != '') {
            Keyconditoin += ' AND courses.course_type ="' + course_type + '"';
        }

        // if(featured !=''){
        // 	Keyconditoin +=' AND courses.featured ="1"';
        // }

        // if(learning !=''){
        // 	Keyconditoin +=' AND courses.learning = "'+learning+'"';
        // }

        Catquery = 'SELECT courses.*,rec_courses.course_name as rec_course_name,age_group.title as age_group_title from courses as courses LEFT JOIN age_group as age_group ON age_group.id = courses.age_group_id LEFT JOIN courses as rec_courses ON rec_courses.id = courses.recommended_course_id where courses.status ="1"' + Keyconditoin + ' ORDER BY courses.priority ASC';

        console.log('qq', Catquery);
        connection.query(Catquery, function(errinsert, resPro) {
            if (!errinsert) {
                if (resPro.length > 0) {
                    var i = 0;
                    async.eachSeries(resPro, function(rec2, loop2) {
                        var course_id = rec2.id;
                        var rec_course_id = rec2.recommended_course_id;
                        console.log('course_id', course_id);
                        proiMGquery = 'SELECT course_chapters.* from course_chapters where course_chapters.course_id="' + course_id + '" AND course_chapters.status="1"';
                        console.log('proiMGquery', proiMGquery);
                        connection.query(proiMGquery, function(errSelpiMG, respROiMG) {
                            if (errSelpiMG) {
                                console.log('errSelpiMG', errSelpiMG);

                                loop2();
                            } else {
                                userquery = 'SELECT course_info.* from course_info where course_info.course_id="' + course_id + '" AND course_info.status="1"';
                                console.log('userquery', userquery);
                                connection.query(userquery, function(errSel, resSel) {
                                    if (errSel) {
                                        resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"self_page_courses_details"}\n';
                                        console.log('res-suceess');
                                        connection.release();
                                        callback(200, null, resultJson);
                                        return;
                                    } else {

                                        faqQuery = 'SELECT course_faq.* from course_faq where course_faq.course_id="' + course_id + '" AND course_faq.status="1"';
                                        console.log('faqQuery', faqQuery);
                                        connection.query(faqQuery, function(errSelFaq, resSelFaq) {
                                            if (errSelFaq) {
                                                resultJson = '{"replyCode":"error","replyMsg":"' + errSelFaq.message + '","cmd":"self_page_courses_details"}\n';
                                                console.log('res-suceess');
                                                connection.release();
                                                callback(200, null, resultJson);
                                                return;
                                            } else {
                                                RecQuery = 'SELECT courses.* from courses where courses.id="' + rec_course_id + '" ';
                                                console.log('RecQuery', RecQuery);
                                                connection.query(RecQuery, function(errSelRec, resSelRec) {
                                                    if (errSelRec) {
                                                        resultJson = '{"replyCode":"error","replyMsg":"' + errSelRec.message + '","cmd":"self_page_courses_details"}\n';
                                                        console.log('res-suceess');
                                                        connection.release();
                                                        callback(200, null, resultJson);
                                                        return;
                                                    } else {
                                                        AchQuery = 'SELECT course_achievement.* from course_achievement where course_achievement.course_id="' + course_id + '" ';
                                                        console.log('AchQuery', AchQuery);
                                                        connection.query(AchQuery, function(errSelAch, resSelAch) {
                                                            if (errSelAch) {
                                                                resultJson = '{"replyCode":"error","replyMsg":"' + errSelAch.message + '","cmd":"self_page_courses_details"}\n';
                                                                console.log('res-suceess');
                                                                connection.release();
                                                                callback(200, null, resultJson);
                                                                return;
                                                            } else {
                                                                if (resSelFaq.length > 0) {
                                                                    resPro[i].faq = resSelFaq;
                                                                } else {
                                                                    resPro[i].faq = [];
                                                                }
                                                                if (resSel.length > 0) {
                                                                    resPro[i].info = resSel;
                                                                } else {
                                                                    resPro[i].info = [];
                                                                }

                                                                if (resSelAch.length > 0) {
                                                                    resPro[i].achievement = resSelAch;
                                                                } else {
                                                                    resPro[i].achievement = [];
                                                                }

                                                                if (resSelRec.length > 0) {
                                                                    resPro[i].recommended_course = resSelRec[0];
                                                                } else {
                                                                    resPro[i].recommended_course = [];
                                                                }
                                                                if (respROiMG.length > 0) {
                                                                    resPro[i].chapters = respROiMG[0];
                                                                } else {
                                                                    resPro[i].chapters = [];
                                                                }
                                                                i = i + 1;
                                                                loop2();
                                                            }

                                                        });
                                                    }

                                                });
                                            }

                                        });
                                    }

                                });
                            }

                        });

                    }, function(errSelPro) {
                        if (errSelPro) {
                            console.log('errSelPro', errSelPro)
                            resultJson = '{"replyCode":"error","replyMsg":"' + errSelPro.message + '","cmd":"view_classes_info"}\n';
                            connection.release();
                            callback(200, null, resultJson);
                            return;
                        } else {
                            resultJson = '{"replyCode":"success","replyMsg":"Details found successfully .","data":' + JSON.stringify(resPro) + ',"cmd":"view_classes_info"}\n';
                            console.log('res-suceess');
                            connection.release();
                            callback(200, null, resultJson);
                            return;
                        }
                    });
                } else {
                    resultJson = '{"replyCode":"success","replyMsg":"No Record found.","data":[], "cmd":"view_classes_info"}\n';
                    console.log('res-suceess');
                    connection.release();
                    callback(200, null, resultJson);
                    return;
                }
            } else {
                resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"view_classes_info"}\n';
                connection.release();
                callback(200, null, resultJson);
                return;
            }
        });
    });
}


function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}


function checkValidateStudent(userdata, pool, callback) {
	var resultJson = '';
	var Hashids = require('hashids');

	var email = '';
	var mobile = '';
	var id = '';
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}

	if (typeof userdata.mobile != 'undefined' && userdata.mobile != '') {
		mobile = userdata.mobile;
	}

	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	pool.getConnection(function (err, connection) {
		if (email != '') {
			Query = 'SELECT * FROM users WHERE email="' + email + '"';

		} else {
			Query = 'SELECT * FROM users WHERE id="' + id + '"';

		}
		console.log('s', Query);
		connection.query(Query, function (err, usersEmail) {
			if (err) {
				console.log(err.message);
				connection.release();
				callback(false, usersEmail);
			} else {
				if (usersEmail.length > 0) {
					connection.release();
					callback(true, usersEmail);
				} else {
					connection.release();
					callback(false, usersEmail);
				}

			}
		});
	});
}

function register_user_fun(userdata, pool, callback) {
	var resultJson = '';
	var strJson = '';
	var sha1 = require('sha1');
	var Hashids = require('hashids'),
		hashids = new Hashids(secretSalt);

	var name = '';
	var email = '';
	var phone = '';
	var dob = '0000-00-00';
	var parents_name = '';
	var mother_name = '';
	var school_name = '';
	var father_name = '';
	var school_code = '';
	var class_name = '';
	var age_group_id = '';
	var gender = '';


	var password = '123456';
	if (typeof userdata.email != 'undefined' && userdata.email != '') {
		email = userdata.email;
	}

	if (typeof userdata.name != 'undefined' && userdata.name != '') {
		name = userdata.name;
	}

	if (typeof userdata.mobile != 'undefined' && userdata.mobile != '') {
		phone = userdata.mobile;
	}
	if (typeof userdata.phone != 'undefined' && userdata.phone != '') {
		phone = userdata.phone;
	}

	if (typeof userdata.dob != 'undefined' && userdata.dob != '') {
		dob = userdata.dob;
	}

	if (typeof userdata.parent != 'undefined' && userdata.parent != '') {
		parents_name = userdata.parent;
	}
	if (typeof userdata.school != 'undefined' && userdata.school != '') {
		school_name = userdata.school;
	}
	if (typeof userdata.father_name != 'undefined' && userdata.father_name != '') {
		father_name = userdata.father_name;
	}
	if (typeof userdata.mother_name != 'undefined' && userdata.mother_name != '') {
		mother_name = userdata.mother_name;
	}
	if (typeof userdata.class_name != 'undefined' && userdata.class_name != '') {
		class_name = userdata.class_name;
	}
	if (typeof userdata.age_group_id != 'undefined' && userdata.age_group_id != '') {
		age_group_id = userdata.age_group_id;
	}
	if (typeof userdata.gender != 'undefined' && userdata.gender != '') {
		gender = userdata.gender;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	/* ESTABLISH CONNECTION TO DATABASE */
	pool.getConnection(function (err, connection) {
		var hash_password = sha1(secretSalt + password);
		if (validateEmail(email)) {
			console.log(email + " is valid :)");
			checkValidateStudent(userdata, pool, function (responseEmail,dataU) {
				console.log('dataU',dataU);
				if (responseEmail == true) {
					resultJson = '{"replyCode":"error","replyMsg":"user already reg","cmd":"sign_up"}\n';
					console.log('res-suceess',dataU);
					connection.release();
					callback(true, dataU[0].id);
					return;
				} else {
					var queryinsert = 'INSERT INTO users SET email="' + email + '",name = "' + name + '", password = "' + hash_password + '",phone = "' + phone + '",role_id="2",dob="' + dob + '",parents_name="' + parents_name + '",school_name="' + school_name + '",father_name="' + father_name + '",mother_name="' + mother_name + '",class_name="' + class_name + '",age_group_id="' + age_group_id + '",gender="' + gender + '",school_code="' + school_code + '",status="1",verified="1",created= NOW()';

					console.log(queryinsert);
					connection.query(queryinsert, function (errinsert, resultinsert) {
						if (!errinsert) {
							var user_id = resultinsert.insertId;
							connection.release();
							callback(true, user_id);
							return;
						} else {
							resultJson = '{"replyCode":"error","replyMsg":"' + errinsert.message + '","cmd":"sign_up"}\n';
							console.log('res-suceess');
							connection.release();
							callback(false, resultJson);
							return;
						}
					})

				}
			})

		} else {
			console.log(email + " is not valid :(");

			resultJson = '{"replyCode":"error","replyMsg":"Email is not valid","cmd":"sign_up"}\n';
			console.log('res-suceess');
			connection.release();
			callback(false, resultJson);
			return;
		}

	});
}


// subscribe_course

function subscribe_course(userdata, pool, callback) {
	var resultJson = '';
	var course_id = '';
	var student_id = '';
	var teacher_id = '';
	var price = '0';
	var created_by = '1';
	var start_date = '';
	var transaction_id = '0';
	var school_code = '';
	var id = '';
	var ToDate = new Date();
	//var tday = weekday[ToDate.getDay()];
	var Curdate =ToDate.getFullYear()+"-"+ parseInt(ToDate.getMonth()+1)+"-"+ ToDate.getDate();
	if (typeof userdata.id != 'undefined' && userdata.id != '') {
		id = userdata.id;
	}
	if (typeof userdata.course_id != 'undefined' && userdata.course_id != '') {
		course_id = userdata.course_id;
	}

	if (typeof userdata.student_id != 'undefined' && userdata.student_id != '') {
		student_id = userdata.student_id;
	}
	if (typeof userdata.teacher_id != 'undefined' && userdata.teacher_id != '') {
		teacher_id = userdata.teacher_id;
	}
	if (typeof userdata.created_by != 'undefined' && userdata.created_by != '') {
		created_by = userdata.created_by;
	}
	if (typeof userdata.price != 'undefined' && userdata.price != '') {
		price = userdata.price;
	}

	if (typeof userdata.start_date != 'undefined' && userdata.start_date != '') {
		start_date = userdata.start_date;
	}else{
		
		start_date =Curdate;
	}
	if (typeof userdata.transaction_id != 'undefined' && userdata.transaction_id != '') {
		transaction_id = userdata.transaction_id;
	}
	if (typeof userdata.school_code != 'undefined' && userdata.school_code != '') {
		school_code = userdata.school_code;
	}

	console.log('userdata-subscribe', userdata);
	console.log('userdata-subscribe----123');
	pool.getConnection(function (err, connection) {
		var querySelect = 'SELECT student_course_subscription.* from student_course_subscription WHERE course_id="' + course_id + '" AND student_id="' + student_id + '" AND status="1"';
		console.log('querySelect--1', querySelect);
		connection.query(querySelect, function (errSel, resSel) {
			console.log('querySelect--1::::resSel', resSel);
			if (errSel) {
				resultJson = '{"replyCode":"error","replyMsg":"' + errSel.message + '","cmd":"subscribe_course"}\n';
				connection.release();
				callback(false, resultJson);
				return;
			} else {
				if (resSel.length > 0) {
					resultJson = '{"replyCode":"error","replyMsg":"Already subscribed","cmd":"subscribe_course"}\n';
					connection.release();
					callback(false, resultJson);
					return;
				} else {
					var queryinsert = 'INSERT INTO student_course_subscription SET course_id="' + course_id + '",student_id="' + student_id + '",teacher_id="' + teacher_id + '",price="' + price + '",created_by="' + created_by + '",course_start_date="' + start_date + '",transaction_id="' + transaction_id + '",created="' + Curdate + '"';
					console.log('queryinsert--1', queryinsert);
					connection.query(queryinsert, function (err, resultIns) {
						if (err) {
							resultJson = '{"replyCode":"error","replyMsg":"' + err.message + '","cmd":"subscribe_course"}\n';
							connection.release();
							callback(false, resultJson);
							return;
						} else {
							console.log('resultIns', resultIns);
							connection.release();
							callback(true, resultIns);
						}
					});
				}

			}
		})

	});
}
