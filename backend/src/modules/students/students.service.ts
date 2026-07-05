import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Student, StudentDocument } from "../../schemas/student.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import {
  QuizAttempt,
  QuizAttemptDocument,
} from "../../schemas/quiz-attempt.schema";
import {
  VideoWatch,
  VideoWatchDocument,
} from "../../schemas/video-watch.schema";
import { Subject, SubjectDocument } from "../../schemas/subject.schema";
import { ApiResult } from "../classes/classes.service";

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(QuizAttempt.name)
    private quizModel: Model<QuizAttemptDocument>,
    @InjectModel(VideoWatch.name) private watchModel: Model<VideoWatchDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  private transformDocument(doc: any, visited = new WeakSet()): any {
    if (!doc) return doc;

    // Prevent infinite recursion on circular references
    if (typeof doc === "object") {
      if (visited.has(doc)) return doc;
      visited.add(doc);
    }

    if (Array.isArray(doc)) {
      return doc.map((d) => this.transformDocument(d, visited));
    }

    if (typeof doc === "object") {
      const { _id, ...rest } = doc;
      const transformed = { id: _id?.toString(), ...rest };

      // Transform nested objects with depth limit
      Object.keys(transformed).forEach((key) => {
        const value = transformed[key];
        if (value && typeof value === "object" && !visited.has(value)) {
          // Only recursively transform if it looks like a transformed document (has _id or is known structure)
          if (value._id || Array.isArray(value)) {
            transformed[key] = this.transformDocument(value, visited);
          }
        }
      });

      return transformed;
    }

    return doc;
  }

  async findAll(query: any): Promise<ApiResult> {
    const { page = 1, limit = 20, search, classId } = query;
    const filter: Record<string, any> = {};
    if (classId) filter["classId"] = classId;
    console.log("_id");

    if (search) {
      const users = await this.userModel
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id")
        .lean();
      console.log("filter::", users);

      filter["$or"] = [
        { userId: { $in: users.map((u) => u["_id"]) } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    console.log("filter::", filter);
    const [data, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .populate("userId", "name email phone avatar isActive lastLoginAt")
        .populate("classId", "name section ")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);
    console.log('data::',data);
    
  const studentsWithSubjects = await Promise.all(
  data.map(async (student) => {
    const subjects = await this.subjectModel
      .find({
        enrolledStudents: student._id,
      })
      .select("name code")
      .lean();

    return {
      ...student,
      enrolledSubjects: subjects,
    };
  }),
);
console.log('studentsWithSubjects::',studentsWithSubjects);

    console.log("data::", this.transformDocument(data));

    return {
      success: true,
      // data: this.transformDocument(data),
      data: data,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / +limit),
      },
    };
  }

  async findOne(id: string): Promise<ApiResult> {
    const s = await this.studentModel
      .findById(id)
      .populate("userId", "name email phone avatar isActive lastLoginAt")
      .populate("classId", "name section academicYear")
      .lean();
    if (!s) throw new NotFoundException(`Student ${id} not found`);
    return { success: true, data: this.transformDocument(s) };
  }

  async getProgress(id: string): Promise<ApiResult> {
    const [watches, attempts] = await Promise.all([
      this.watchModel.find({ studentId: id }).lean(),
      this.quizModel.find({ studentId: id }).lean(),
    ]);

    const totalWatchSeconds = watches.reduce(
      (sum, w) => sum + (w.watchedDuration || 0),
      0,
    );

    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (sum, a) => sum + (a.score / a.totalMarks) * 100,
              0,
            ) / attempts.length,
          )
        : 0;

    return {
      success: true,
      data: {
        totalVideosWatched: watches.filter((w) => w.isCompleted).length,
        totalWatchTimeMinutes: Math.round(totalWatchSeconds / 60),
        totalQuizzesTaken: attempts.length,
        quizzesPassed: attempts.filter((a) => a.isPassed).length,
        averageScore: avgScore,
      },
    };
  }

  async create(dto: any): Promise<ApiResult> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password || "Student@123", 10);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      passwordHash,
      role: "STUDENT",
    });

    const student = await this.studentModel.create({
      userId: user._id,
      rollNumber: dto.rollNumber,
      classId: new mongoose.Types.ObjectId(dto.classId),
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
    });

    return {
      success: true,
      data: this.transformDocument({
        ...student.toObject(),
        user: this.transformDocument(user.toObject()),
      }),
    };
  }

  async update(id: string, dto: any): Promise<ApiResult> {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException(`Student ${id} not found`);

    const { name, phone, parentName, parentPhone, classId } = dto;

    const userUpdate: Record<string, any> = {};
    if (name) userUpdate["name"] = name;
    if (phone) userUpdate["phone"] = phone;

    const studentUpdate: Record<string, any> = {};
    if (parentName) studentUpdate["parentName"] = parentName;
    if (parentPhone) studentUpdate["parentPhone"] = parentPhone;
    if (classId) studentUpdate["classId"] = classId;

    await Promise.all([
      Object.keys(userUpdate).length
        ? this.userModel.findByIdAndUpdate(student.userId, userUpdate)
        : Promise.resolve(null),
      Object.keys(studentUpdate).length
        ? this.studentModel.findByIdAndUpdate(id, studentUpdate)
        : Promise.resolve(null),
    ]);

    return this.findOne(id);
  }

  async remove(id: string): Promise<ApiResult> {
    if (!(await this.studentModel.findByIdAndDelete(id))) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return { success: true, message: "Student removed" };
  }

  async enrollSubject(
    studentId: string,
    subjectId: string,
  ): Promise<ApiResult> {
    console.log("adada",studentId, subjectId);
    
    const student = await this.studentModel.find({userId: studentId});
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }

    const normalizedStudentId = new mongoose.Types.ObjectId(studentId);
    console.log('normalizedStudentId::',normalizedStudentId);
    
    const enrolledStudents = (subject.enrolledStudents || []).map(
      (entry: any) =>
        entry instanceof mongoose.Types.ObjectId
          ? entry
          : new mongoose.Types.ObjectId(entry?.toString?.() || entry),
    );
    console.log('enrolledStudents::',enrolledStudents);
console.log('condition::',  !enrolledStudents.some(
        (entry: mongoose.Types.ObjectId) => entry.toString() === studentId,
      ));

    if (
      !enrolledStudents.some(
        (entry: mongoose.Types.ObjectId) => entry.toString() === studentId,
      )
    ) {
console.log('subject::',subject);

      subject.enrolledStudents = [...enrolledStudents, normalizedStudentId];
      await subject.save();
    }

    return {
      success: true,
      message: "Subject enrolled successfully",
      data: { subjectId, studentId },
    };
  }

  async unenrollSubject(
    studentId: string,
    subjectId: string,
  ): Promise<ApiResult> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }

    const enrolledStudents = (subject.enrolledStudents || []).map(
      (entry: any) =>
        entry instanceof mongoose.Types.ObjectId
          ? entry
          : new mongoose.Types.ObjectId(entry?.toString?.() || entry),
    );

    subject.enrolledStudents = enrolledStudents.filter(
      (entry: mongoose.Types.ObjectId) => entry.toString() !== studentId,
    );
    await subject.save();

    return {
      success: true,
      message: "Subject unenrolled successfully",
      data: { subjectId, studentId },
    };
  }

  async getEnrolledSubjects(studentId: string): Promise<ApiResult> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    const subjects = await this.subjectModel
      .find({
        enrolledStudents: new mongoose.Types.ObjectId(studentId),
      })
      .populate("classId", "name section")
      .populate({ path: "teacherId", populate: { path: "userId", select: "name" } })
      .lean();

    return {
      success: true,
      message: "Enrolled subjects retrieved successfully",
      data: subjects,
    };
  }
}
