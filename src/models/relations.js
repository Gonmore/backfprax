import { Skill } from './skill.js';
import { StudentSkill } from './studentSkill.js';
import { OfferSkill } from './offerSkill.js';
import { ScenterProfamily } from './scenterProfamily.js';
import { User } from "./users.js";
import { Scenter } from "./scenter.js";
import { Tutor } from "./tutor.js";
import { Student } from "./student.js";
import { Company } from "./company.js";
import { Profamily } from "./profamily.js";
import { Offer } from "./offer.js";
import { Application } from "./application.js";
import { Cv } from "./cv.js";
import { CvSkill } from './cvSkill.js';
import { Token } from "./token.js";
import { TokenTransaction } from "./tokenTransaction.js";
import { StudentToken } from "./studentToken.js";
import UserCompany from './userCompany.js';
import { OfferProfamily } from './offerProfamily.js';
import { RevealedCV } from './revealedCV.js';
import { AcademicVerification } from './academicVerification.js';
import { UserScenter } from './userScenter.js';

// Relaciones entre tablas

// Relación uno a muchos 
Scenter.hasMany(Tutor, { foreignKey: 'tutorId' });
Tutor.belongsTo(Scenter, { foreignKey: 'tutorId' });

// Relación uno a muchos: Tutor-Profamily
Tutor.belongsTo(Profamily, { foreignKey: 'profamilyId' });
Profamily.hasMany(Tutor, { foreignKey: 'profamilyId' });

// Relación muchos a muchos: Offer-Profamily a través de OfferProfamily
Offer.belongsToMany(Profamily, { 
    through: OfferProfamily,
    foreignKey: 'offerId',
    otherKey: 'profamilyId',
    as: 'profamilys'
});
Profamily.belongsToMany(Offer, { 
    through: OfferProfamily,
    foreignKey: 'profamilyId',
    otherKey: 'offerId',
    as: 'offers'
});

// Relación muchos a muchos: Scenter-Profamily a través de ScenterProfamily
Scenter.belongsToMany(Profamily, {
    through: ScenterProfamily,
    foreignKey: 'scenterId',
    otherKey: 'profamilyId',
    as: 'profamilys'
});
Profamily.belongsToMany(Scenter, {
    through: ScenterProfamily,
    foreignKey: 'profamilyId',
    otherKey: 'scenterId',
    as: 'scenters'
});

// Relaciones directas con ScenterProfamily
Scenter.hasMany(ScenterProfamily, {
    foreignKey: 'scenterId',
    as: 'scenterProfamilys'
});
ScenterProfamily.belongsTo(Scenter, {
    foreignKey: 'scenterId',
    as: 'scenter'
});

Profamily.hasMany(ScenterProfamily, {
    foreignKey: 'profamilyId',
    as: 'scenterProfamilys'
});
ScenterProfamily.belongsTo(Profamily, {
    foreignKey: 'profamilyId',
    as: 'profamily'
});

Profamily.hasMany(Student, {
    foreignKey: 'profamilyId',
    as: 'students'
});

// Relación uno a muchos: Company-Offer (simplificado)
Company.hasMany(Offer, { foreignKey: 'companyId' });
Offer.belongsTo(Company, { foreignKey: 'companyId' });

// Relación muchos a muchos: User-Scenter a través de UserScenter
User.belongsToMany(Scenter, {
    through: UserScenter,
    foreignKey: 'userId',
    otherKey: 'scenterId',
    as: 'scenters'
});
Scenter.belongsToMany(User, {
    through: UserScenter,
    foreignKey: 'scenterId',
    otherKey: 'userId',
    as: 'users'
});

// Relaciones directas con UserScenter
User.hasMany(UserScenter, {
    foreignKey: 'userId',
    as: 'userScenters'
});
UserScenter.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Scenter.hasMany(UserScenter, {
    foreignKey: 'scenterId',
    as: 'userScenters'
});
UserScenter.belongsTo(Scenter, {
    foreignKey: 'scenterId',
    as: 'scenter'
});
Student.belongsToMany(Offer, { through: 'StudentOffer' });
Offer.belongsToMany(Student, { through: 'StudentOffer' });
Company.belongsToMany(Cv, { through: 'CompanyCv' });
Cv.belongsToMany(Company, { through: 'CompanyCv' });

// Relaciones para Applications
Application.belongsTo(Offer, { 
    foreignKey: 'offerId',
    as: 'offer'
});
Offer.hasMany(Application, { 
    foreignKey: 'offerId',
    as: 'applications'
});

Application.belongsTo(Student, { 
    foreignKey: 'studentId',
    as: 'student'
});

Student.hasMany(Application, { 
    foreignKey: 'studentId',
    as: 'applications'
});

// Relaciones para tokens de empresa
Company.hasOne(Token, {
    foreignKey: 'companyId',
    as: 'tokens'
});

Token.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

Company.hasMany(TokenTransaction, {
    foreignKey: 'companyId',
    as: 'tokenTransactions'
});

TokenTransaction.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

TokenTransaction.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
    required: false
});

Student.hasMany(TokenTransaction, {
    foreignKey: 'studentId',
    as: 'tokenTransactions'
});

// Relaciones para tokens de estudiantes
Student.hasOne(StudentToken, {
    foreignKey: 'studentId',
    as: 'studentTokens'
});

StudentToken.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// Relación uno a uno
User.hasOne(Student, {
    foreignKey: 'userId',
    as: 'student'
});

Student.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Student.belongsTo(Profamily, {
    foreignKey: 'profamilyId',
    as: 'profamily'
});

// Relación uno a muchos: Student-Tutor
Student.belongsTo(Tutor, {
    foreignKey: 'tutorId',
    as: 'tutor'
});

Tutor.hasMany(Student, {
    foreignKey: 'tutorId',
    as: 'students'
});

// Relación uno a uno: Student-CV
Student.hasOne(Cv, {
    foreignKey: 'studentId',
    as: 'cv'
});

Cv.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// ✅ Relación Many-to-Many con UserCompany
User.belongsToMany(Company, { 
    through: UserCompany, 
    foreignKey: 'userId',
    otherKey: 'companyId',
    as: 'companies'
});

Company.belongsToMany(User, { 
    through: UserCompany, 
    foreignKey: 'companyId',
    otherKey: 'userId',
    as: 'users'
});

// Relaciones directas con la tabla intermedia
User.hasMany(UserCompany, { foreignKey: 'userId' });
UserCompany.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
});

Company.hasMany(UserCompany, { foreignKey: 'companyId' });
UserCompany.belongsTo(Company, { 
    foreignKey: 'companyId',
    as: 'company'
});

// Relaciones para CVs revelados
Company.hasMany(RevealedCV, {
    foreignKey: 'companyId',
    as: 'revealedCVs'
});

RevealedCV.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

Student.hasMany(RevealedCV, {
    foreignKey: 'studentId',
    as: 'revealedCVs'
});

RevealedCV.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// ✅ Relaciones para Skills y StudentSkill
Student.hasMany(StudentSkill, {
    foreignKey: 'studentId',
    as: 'studentSkills'
});
StudentSkill.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

Skill.hasMany(StudentSkill, {
    foreignKey: 'skillId',
    as: 'studentSkills'
});
StudentSkill.belongsTo(Skill, {
    foreignKey: 'skillId',
    as: 'skill'
});

// ✅ Relación muchos a muchos entre Student y Skill
Student.belongsToMany(Skill, {
    through: StudentSkill,
    foreignKey: 'studentId',
    otherKey: 'skillId',
    as: 'skills'
});

Skill.belongsToMany(Student, {
    through: StudentSkill,
    foreignKey: 'skillId',
    otherKey: 'studentId',
    as: 'students'
});

// ✅ Relaciones para OfferSkill (relación muchos a muchos entre Offer y Skill)
Offer.belongsToMany(Skill, {
    through: OfferSkill,
    foreignKey: 'offerId',
    otherKey: 'skillId',
    as: 'skills'
});

Skill.belongsToMany(Offer, {
    through: OfferSkill,
    foreignKey: 'skillId',
    otherKey: 'offerId',
    as: 'offers'
});

// ✅ Relaciones para CvSkill (relación muchos a muchos entre Cv y Skill)
Cv.belongsToMany(Skill, {
    through: CvSkill,
    foreignKey: 'cvId',
    otherKey: 'skillId',
    as: 'skills'
});

Skill.belongsToMany(Cv, {
    through: CvSkill,
    foreignKey: 'skillId',
    otherKey: 'cvId',
    as: 'cvs'
});

// Relaciones directas con CvSkill
Cv.hasMany(CvSkill, {
    foreignKey: 'cvId',
    as: 'cvSkills'
});

CvSkill.belongsTo(Cv, {
    foreignKey: 'cvId',
    as: 'cv'
});

Skill.hasMany(CvSkill, {
    foreignKey: 'skillId',
    as: 'cvSkills'
});

CvSkill.belongsTo(Skill, {
    foreignKey: 'skillId',
    as: 'skill'
});

// ✅ Relaciones para AcademicVerification
Student.hasMany(AcademicVerification, {
    foreignKey: 'studentId',
    as: 'academicVerifications'
});

AcademicVerification.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

Scenter.hasMany(AcademicVerification, {
    foreignKey: 'scenterId',
    as: 'academicVerifications'
});

AcademicVerification.belongsTo(Scenter, {
    foreignKey: 'scenterId',
    as: 'scenter'
});

User.hasMany(AcademicVerification, {
    foreignKey: 'verifiedBy',
    as: 'academicVerifications'
});

AcademicVerification.belongsTo(User, {
    foreignKey: 'verifiedBy',
    as: 'verifiedByUser'
});

export {
    User,
    Scenter,
    Tutor,
    Student,
    Company,
    Profamily,
    OfferProfamily,
    ScenterProfamily,
    Cv,
    Offer,
    Application,
    Token,
    TokenTransaction,
    UserCompany,
    StudentToken,
    RevealedCV,
    Skill,
    StudentSkill,
    OfferSkill,
    CvSkill,
    AcademicVerification,
    UserScenter
};