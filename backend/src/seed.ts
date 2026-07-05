/**
 * DRS Education — MongoDB Seed File
 * Run: npm run seed
 */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({ name:String, email:{type:String,unique:true}, phone:String, passwordHash:String, role:{type:String,default:'STUDENT'}, isActive:{type:Boolean,default:true} }, { timestamps:true });
const TeacherSchema = new mongoose.Schema({ employeeId:{type:String,unique:true}, qualification:String, specialization:String, joinDate:Date, userId:{type:mongoose.Types.ObjectId,ref:'User',unique:true} }, { timestamps:true });
const ClassSchema = new mongoose.Schema({ name:String, section:String, academicYear:String, description:String, isActive:{type:Boolean,default:true} }, { timestamps:true });
const SubjectSchema = new mongoose.Schema({ name:String, code:String, description:String, color:{type:String,default:'#4e73df'}, isActive:{type:Boolean,default:true}, classId:{type:mongoose.Types.ObjectId,ref:'ClassEntity'}, teacherId:{type:mongoose.Types.ObjectId,ref:'Teacher'} }, { timestamps:true });
const StudentSchema = new mongoose.Schema({ rollNumber:{type:String,unique:true}, parentName:String, parentPhone:String, enrollmentDate:{type:Date,default:Date.now}, userId:{type:mongoose.Types.ObjectId,ref:'User',unique:true}, classId:{type:mongoose.Types.ObjectId,ref:'ClassEntity'} }, { timestamps:true });
const VideoSchema = new mongoose.Schema({ title:String, description:String, videoUrl:String, thumbnailUrl:String, duration:{type:Number,default:0}, fileSize:{type:Number,default:0}, chapter:String, topic:String, tags:[String], status:{type:String,default:'DRAFT'}, isFeatured:{type:Boolean,default:false}, viewCount:{type:Number,default:0}, subjectId:{type:mongoose.Types.ObjectId,ref:'Subject'}, teacherId:{type:mongoose.Types.ObjectId,ref:'Teacher'} }, { timestamps:true });
const PdfSchema = new mongoose.Schema({ title:String, description:String, fileUrl:String, fileSize:{type:Number,default:0}, pageCount:{type:Number,default:0}, type:{type:String,default:'NOTES'}, chapter:String, tags:[String], status:{type:String,default:'DRAFT'}, subjectId:{type:mongoose.Types.ObjectId,ref:'Subject'}, teacherId:{type:mongoose.Types.ObjectId,ref:'Teacher'} }, { timestamps:true });

const QuizQuestionSchema = new mongoose.Schema({ question:String, type:{type:String,default:'mcq'}, options:[String], correctAnswer:Number, explanation:String, marks:{type:Number,default:1}, difficulty:{type:String,default:'medium'}, order:{type:Number,default:0} });
const QuizSchema = new mongoose.Schema({ title:String, description:String, totalMarks:Number, passingMarks:Number, duration:Number, status:{type:String,default:'DRAFT'}, questions:[QuizQuestionSchema], subjectId:{type:mongoose.Types.ObjectId,ref:'Subject'} }, { timestamps:true });
const AnnouncementSchema = new mongoose.Schema({ title:String, content:String, type:{type:String,default:'GENERAL'}, audience:{type:String,default:'ALL'}, isPinned:{type:Boolean,default:false}, isPublished:{type:Boolean,default:false}, publishedAt:Date, createdById:{type:mongoose.Types.ObjectId,ref:'User'} }, { timestamps:true });
const VideoWatchSchema = new mongoose.Schema({ studentId:{type:mongoose.Types.ObjectId,ref:'Student'}, videoId:{type:mongoose.Types.ObjectId,ref:'Video'}, watchedDuration:{type:Number,default:0}, isCompleted:{type:Boolean,default:false} }, { timestamps:true });
const QuizAttemptSchema = new mongoose.Schema({ studentId:{type:mongoose.Types.ObjectId,ref:'Student'}, quizId:{type:mongoose.Types.ObjectId,ref:'Quiz'}, score:{type:Number,default:0}, totalMarks:Number, answers:Object, timeTaken:{type:Number,default:0}, isPassed:{type:Boolean,default:false} }, { timestamps:true });

// ─── Models ───────────────────────────────────────────────────────────────────
const User        = mongoose.model('User',        UserSchema);
const Teacher     = mongoose.model('Teacher',     TeacherSchema);
const ClassEntity = mongoose.model('ClassEntity', ClassSchema);
const Subject     = mongoose.model('Subject',     SubjectSchema);
const Student     = mongoose.model('Student',     StudentSchema);
const Video       = mongoose.model('Video',       VideoSchema);
const Pdf         = mongoose.model('Pdf',         PdfSchema);
const Quiz        = mongoose.model('Quiz',        QuizSchema);
const Announcement= mongoose.model('Announcement',AnnouncementSchema);
const VideoWatch  = mongoose.model('VideoWatch',  VideoWatchSchema);
const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drs_education';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB:', uri);

  // ─── Clean ───────────────────────────────────────────────────────────────
  await Promise.all([
    QuizAttempt.deleteMany({}), VideoWatch.deleteMany({}), Announcement.deleteMany({}),
    Quiz.deleteMany({}), Pdf.deleteMany({}), Video.deleteMany({}),
    Subject.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
    ClassEntity.deleteMany({}), User.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ─── Admin ────────────────────────────────────────────────────────────────
  const admin = await User.create({ name:'DRS Admin', email:'admin@drseducation.in', passwordHash: await bcrypt.hash('Admin@123',10), role:'ADMIN', isActive:true });
  console.log('✅ Admin created');

  // ─── Classes ──────────────────────────────────────────────────────────────
  const classRecords = await ClassEntity.insertMany([
    { name:'Class 6',  section:'A',       academicYear:'2024-25' },
    { name:'Class 7',  section:'A',       academicYear:'2024-25' },
    { name:'Class 8',  section:'A',       academicYear:'2024-25' },
    { name:'Class 9',  section:'A',       academicYear:'2024-25' },
    { name:'Class 10', section:'A',       academicYear:'2024-25' },
    { name:'Class 11', section:'Science', academicYear:'2024-25' },
    { name:'Class 12', section:'Science', academicYear:'2024-25' },
  ]);
  const [,,, c9, c10, c11, c12] = classRecords;
  console.log(`✅ ${classRecords.length} classes created`);

  // ─── Teachers ─────────────────────────────────────────────────────────────
  const teacherDefs = [
    { name:'Mr. Rajesh Patel',  email:'rajesh.patel@drseducation.in', empId:'EMP001', qual:'M.Sc + B.Ed', spec:'Mathematics',       join:'2020-06-01' },
    { name:'Mr. Amit Sharma',   email:'amit.sharma@drseducation.in',  empId:'EMP002', qual:'M.Sc + B.Ed', spec:'Physics',           join:'2019-04-01' },
    { name:'Ms. Priti Gupta',   email:'priti.gupta@drseducation.in',  empId:'EMP003', qual:'Ph.D',        spec:'Chemistry',         join:'2021-07-01' },
    { name:'Mrs. Sunita Singh', email:'sunita.singh@drseducation.in', empId:'EMP004', qual:'M.Sc + B.Ed', spec:'Biology',           join:'2018-03-01' },
    { name:'Ms. Kavya Verma',   email:'kavya.verma@drseducation.in',  empId:'EMP005', qual:'M.Ed',        spec:'English Language',  join:'2022-01-01' },
  ];
  const teachers: any[] = [];
  for (const t of teacherDefs) {
    const user = await User.create({ name:t.name, email:t.email, passwordHash: await bcrypt.hash('Teacher@123',10), role:'TEACHER', isActive:true });
    const teacher = await Teacher.create({ userId:user._id, employeeId:t.empId, qualification:t.qual, specialization:t.spec, joinDate:new Date(t.join) });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} teachers created`);

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjects = await Subject.insertMany([
    { name:'Mathematics',      code:'MATH10', classId:c10._id, teacherId:teachers[0]._id, color:'#4e73df' },
    { name:'Physics',          code:'PHY10',  classId:c10._id, teacherId:teachers[1]._id, color:'#f1416c' },
    { name:'Chemistry',        code:'CHEM10', classId:c10._id, teacherId:teachers[2]._id, color:'#1cc88a' },
    { name:'Biology',          code:'BIO10',  classId:c10._id, teacherId:teachers[3]._id, color:'#fd7e14' },
    { name:'English',          code:'ENG10',  classId:c10._id, teacherId:teachers[4]._id, color:'#36b9cc' },
    { name:'Mathematics',      code:'MATH11', classId:c11._id, teacherId:teachers[0]._id, color:'#4e73df' },
    { name:'Mathematics',      code:'MATH12', classId:c12._id, teacherId:teachers[0]._id, color:'#4e73df' },
    { name:'Physics',          code:'PHY12',  classId:c12._id, teacherId:teachers[1]._id, color:'#f1416c' },
    { name:'Computer Science', code:'CS12',   classId:c12._id, teacherId:teachers[0]._id, color:'#6e56cf' },
  ]);
  const [math10, phy10, chem10] = subjects;
  console.log(`✅ ${subjects.length} subjects created`);

  // ─── Videos ───────────────────────────────────────────────────────────────
  const videos = await Video.insertMany([
    { title:'Introduction to Calculus',     description:'Limits and derivatives fundamentals.', subjectId:math10._id, teacherId:teachers[0]._id, chapter:'Chapter 5', topic:'Limits',      duration:2520, fileSize:245000000, status:'PUBLISHED', isFeatured:true,  viewCount:1240, tags:['calculus','limits'],   videoUrl:'https://example.com/v1.mp4' },
    { title:"Newton's Laws of Motion",      description:'Three fundamental laws explained.',    subjectId:phy10._id,  teacherId:teachers[1]._id, chapter:'Chapter 3', topic:'Mechanics',   duration:2100, fileSize:198000000, status:'PUBLISHED', isFeatured:true,  viewCount:980,  tags:['newton','motion'],     videoUrl:'https://example.com/v2.mp4' },
    { title:'Organic Chemistry Basics',     description:'Carbon compounds introduction.',       subjectId:chem10._id, teacherId:teachers[2]._id, chapter:'Chapter 7', topic:'Organic',     duration:3000, fileSize:312000000, status:'PUBLISHED', isFeatured:true,  viewCount:875,  tags:['organic','chemistry'], videoUrl:'https://example.com/v3.mp4' },
    { title:'Algebra — Quadratic Equations',description:'Solving quadratic equations.',         subjectId:math10._id, teacherId:teachers[0]._id, chapter:'Chapter 4', topic:'Quadratic',   duration:1920, fileSize:178000000, status:'PUBLISHED', isFeatured:false, viewCount:650,  tags:['algebra','quadratic'], videoUrl:'https://example.com/v4.mp4' },
    { title:'Real Numbers Fundamentals',    description:'Introduction to real number system.',  subjectId:math10._id, teacherId:teachers[0]._id, chapter:'Chapter 1', topic:'Real Numbers', duration:1680, fileSize:156000000, status:'PUBLISHED', isFeatured:false, viewCount:540,  tags:['real numbers'],        videoUrl:'https://example.com/v5.mp4' },
  ]);
  console.log(`✅ ${videos.length} videos created`);

  // ─── PDFs ─────────────────────────────────────────────────────────────────
  await Pdf.insertMany([
    { title:'Mathematics Chapter 1 Notes',  subjectId:math10._id, teacherId:teachers[0]._id, type:'NOTES',          status:'PUBLISHED', fileUrl:'https://example.com/p1.pdf', fileSize:2100000, pageCount:18, chapter:'Chapter 1', tags:['notes'] },
    { title:'Physics Formula Sheet',        subjectId:phy10._id,  teacherId:teachers[1]._id, type:'REFERENCE',      status:'PUBLISHED', fileUrl:'https://example.com/p2.pdf', fileSize:850000,  pageCount:4,  chapter:'All',       tags:['formula','reference'] },
    { title:'Mathematics Unit Test 2024',   subjectId:math10._id, teacherId:teachers[0]._id, type:'QUESTION_PAPER', status:'PUBLISHED', fileUrl:'https://example.com/p3.pdf', fileSize:920000,  pageCount:4,  chapter:'Unit 1',    tags:['exam'] },
    { title:'Chemistry Organic Assignment', subjectId:chem10._id, teacherId:teachers[2]._id, type:'ASSIGNMENT',     status:'PUBLISHED', fileUrl:'https://example.com/p4.pdf', fileSize:1200000, pageCount:8,  chapter:'Chapter 7', tags:['assignment'] },
  ]);
  console.log('✅ PDFs created');

  // ─── Students ─────────────────────────────────────────────────────────────
  const studentDefs = [
    { name:'Priya Sharma',  email:'priya.sharma@student.in',  phone:'9876543210', roll:'C10-001', classId:c10._id, parentName:'Ramesh Sharma',  parentPhone:'9876543211' },
    { name:'Rahul Gupta',   email:'rahul.gupta@student.in',   phone:'9876543220', roll:'C10-002', classId:c10._id, parentName:'Suresh Gupta',   parentPhone:'9876543221' },
    { name:'Anjali Patel',  email:'anjali.patel@student.in',  phone:'9876543230', roll:'C12-001', classId:c12._id, parentName:'Vijay Patel',    parentPhone:'9876543231' },
    { name:'Arjun Singh',   email:'arjun.singh@student.in',   phone:'9876543240', roll:'C10-003', classId:c10._id, parentName:'Harpreet Singh', parentPhone:'9876543241' },
    { name:'Sneha Verma',   email:'sneha.verma@student.in',   phone:'9876543250', roll:'C11-001', classId:c11._id, parentName:'Mohan Verma',    parentPhone:'9876543251' },
  ];
  const students: any[] = [];
  for (const s of studentDefs) {
    const user = await User.create({ name:s.name, email:s.email, phone:s.phone, passwordHash: await bcrypt.hash('Student@123',10), role:'STUDENT', isActive:true });
    const student = await Student.create({ userId:user._id, rollNumber:s.roll, classId:s.classId, parentName:s.parentName, parentPhone:s.parentPhone });
    students.push(student);
  }
  console.log(`✅ ${students.length} students created`);

  // ─── Video Watches ────────────────────────────────────────────────────────
  await VideoWatch.insertMany([
    { studentId:students[0]._id, videoId:videos[0]._id, watchedDuration:2520, isCompleted:true },
    { studentId:students[0]._id, videoId:videos[3]._id, watchedDuration:900,  isCompleted:false },
    { studentId:students[1]._id, videoId:videos[0]._id, watchedDuration:1800, isCompleted:false },
    { studentId:students[2]._id, videoId:videos[2]._id, watchedDuration:3000, isCompleted:true },
  ]);
  console.log('✅ Video watches created');

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  const quiz = await Quiz.create({
    title:        'Mathematics — Real Numbers Quiz',
    description:  'Test your understanding of Chapter 1.',
    subjectId:    math10._id,
    totalMarks:   15,
    passingMarks: 9,
    duration:     20,
    status:       'PUBLISHED',
    questions: [
      { question:'What is the HCF of 26 and 91?',           type:'mcq',        options:['13','26','7','91'],                                                                               correctAnswer:0, marks:3, difficulty:'easy',   explanation:"Using Euclid's algorithm: HCF = 13.", order:1 },
      { question:'Every rational number is also irrational.',type:'true_false', options:['True','False'],                                                                                   correctAnswer:1, marks:3, difficulty:'easy',   explanation:'Rational and irrational numbers are distinct sets.', order:2 },
      { question:'The decimal expansion of √2 is:',         type:'mcq',        options:['Terminating','Non-terminating repeating','Non-terminating non-repeating','None'],                correctAnswer:2, marks:3, difficulty:'medium', explanation:'√2 is irrational — non-terminating, non-repeating.', order:3 },
      { question:'Which is NOT a prime number?',            type:'mcq',        options:['2','3','9','11'],                                                                                 correctAnswer:2, marks:3, difficulty:'easy',   explanation:'9 = 3×3 is composite.', order:4 },
      { question:'LCM × HCF = Product of two numbers.',    type:'true_false', options:['True','False'],                                                                                   correctAnswer:0, marks:3, difficulty:'medium', explanation:'Fundamental theorem: LCM(a,b)×HCF(a,b)=a×b.', order:5 },
    ],
  });
  console.log('✅ Quiz with 5 questions created');

  // Sample attempt
  await QuizAttempt.create({ studentId:students[0]._id, quizId:quiz._id, score:12, totalMarks:15, answers:{0:0,1:1,2:2,3:2,4:0}, timeTaken:840, isPassed:true });
  console.log('✅ Sample quiz attempt created');

  // ─── Announcements ────────────────────────────────────────────────────────
  await Announcement.insertMany([
    { title:'Half-Yearly Exam Schedule',        content:'Exams from Nov 15, 2024. Check the timetable.',              type:'EXAM',    audience:'STUDENTS', isPinned:true,  isPublished:true, publishedAt:new Date(), createdById:admin._id },
    { title:'Diwali Holiday Notice',            content:'Institute closed Oct 31 – Nov 5, 2024.',                    type:'HOLIDAY', audience:'ALL',      isPinned:false, isPublished:true, publishedAt:new Date(), createdById:admin._id },
    { title:'New Videos: Class 10 Mathematics', content:'20 new lectures added for Chapters 4 and 5.',               type:'GENERAL', audience:'STUDENTS', isPinned:false, isPublished:true, publishedAt:new Date(), createdById:admin._id },
  ]);
  console.log('✅ Announcements created');

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 MongoDB seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  👤 Admin:   admin@drseducation.in          → Admin@123');
  console.log('  👨‍🏫 Teacher: rajesh.patel@drseducation.in  → Teacher@123');
  console.log('  👨‍🎓 Student: priya.sharma@student.in       → Student@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
