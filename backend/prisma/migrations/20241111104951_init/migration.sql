/*
  Warnings:

  - You are about to drop the column `schoolId` on the `grade` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `grade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `name` on the `school` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `contacts` on the `school` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to drop the column `gradeId` on the `stream` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `stream` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cfBalance` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber1` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber2` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `currentTermId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianName` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `leftDate` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `streamId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `student` table. All the data in the column will be lost.
  - You are about to alter the column `gender` on the `student` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to drop the column `endDate` on the `term` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `term` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `term` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `term` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the column `passwordHash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - Added the required column `school_id` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade_id` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_number1` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_number2` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardian_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stream_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `grade` DROP FOREIGN KEY `Grade_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `stream` DROP FOREIGN KEY `Stream_gradeId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_currentTermId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_gradeId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_streamId_fkey`;

-- DropForeignKey
ALTER TABLE `term` DROP FOREIGN KEY `Term_schoolId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_schoolId_fkey`;

-- DropIndex
DROP INDEX `School_name_key` ON `school`;

-- AlterTable
ALTER TABLE `grade` DROP COLUMN `schoolId`,
    ADD COLUMN `school_id` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `school` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `contacts` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `stream` DROP COLUMN `gradeId`,
    ADD COLUMN `grade_id` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `student` DROP PRIMARY KEY,
    DROP COLUMN `cfBalance`,
    DROP COLUMN `contactNumber1`,
    DROP COLUMN `contactNumber2`,
    DROP COLUMN `currentTermId`,
    DROP COLUMN `fullName`,
    DROP COLUMN `gradeId`,
    DROP COLUMN `guardianName`,
    DROP COLUMN `isActive`,
    DROP COLUMN `leftDate`,
    DROP COLUMN `schoolId`,
    DROP COLUMN `streamId`,
    DROP COLUMN `studentId`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `cf_balance` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `contact_number1` VARCHAR(20) NOT NULL,
    ADD COLUMN `contact_number2` VARCHAR(20) NOT NULL,
    ADD COLUMN `current_term_id` INTEGER NULL,
    ADD COLUMN `full_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `grade_id` INTEGER NOT NULL,
    ADD COLUMN `guardian_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `id` VARCHAR(10) NOT NULL,
    ADD COLUMN `left_date` DATE NULL,
    ADD COLUMN `school_id` INTEGER NOT NULL,
    ADD COLUMN `stream_id` INTEGER NOT NULL,
    MODIFY `dob` DATE NOT NULL,
    MODIFY `gender` VARCHAR(10) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `term` DROP COLUMN `endDate`,
    DROP COLUMN `schoolId`,
    DROP COLUMN `startDate`,
    ADD COLUMN `end_date` DATE NOT NULL,
    ADD COLUMN `school_id` INTEGER NOT NULL,
    ADD COLUMN `start_date` DATE NOT NULL,
    MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `passwordHash`,
    DROP COLUMN `schoolId`,
    ADD COLUMN `password_hash` VARCHAR(256) NOT NULL,
    ADD COLUMN `school_id` INTEGER NOT NULL,
    MODIFY `username` VARCHAR(20) NOT NULL,
    MODIFY `email` VARCHAR(120) NOT NULL,
    MODIFY `role` VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE `FeeStructure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tuition_fee` DOUBLE NOT NULL,
    `ass_books` DOUBLE NOT NULL,
    `diary_fee` DOUBLE NOT NULL,
    `activity_fee` DOUBLE NOT NULL,
    `others` DOUBLE NOT NULL,
    `school_id` INTEGER NOT NULL,
    `term_id` INTEGER NOT NULL,
    `grade_id` INTEGER NOT NULL,

    UNIQUE INDEX `FeeStructure_grade_id_key`(`grade_id`),
    UNIQUE INDEX `FeeStructure_school_id_grade_id_key`(`school_id`, `grade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdditionalFee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee_name` VARCHAR(100) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(50) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `pay_date` DATE NOT NULL,
    `code` VARCHAR(20) NULL,
    `balance` DOUBLE NOT NULL,
    `school_id` INTEGER NOT NULL,
    `student_id` VARCHAR(10) NOT NULL,
    `term_id` INTEGER NOT NULL,

    UNIQUE INDEX `FeePayment_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MpesaTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `MpesaTransaction_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankStatement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(120) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(50) NOT NULL,
    `details` VARCHAR(100) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `school_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,

    UNIQUE INDEX `TeacherProfile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `grade_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimeTable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_of_week` VARCHAR(10) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `stream_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `stream_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `student_id` VARCHAR(10) NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `lesson_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Performance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `student_id` VARCHAR(10) NOT NULL,
    `subject_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AdditionalFeeToStudent` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `_AdditionalFeeToStudent_AB_unique`(`A`, `B`),
    INDEX `_AdditionalFeeToStudent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SubjectToTeacherProfile` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SubjectToTeacherProfile_AB_unique`(`A`, `B`),
    INDEX `_SubjectToTeacherProfile_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_username_idx` ON `User`(`username`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stream` ADD CONSTRAINT `Stream_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `Grade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeStructure` ADD CONSTRAINT `FeeStructure_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeStructure` ADD CONSTRAINT `FeeStructure_term_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `Term`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeeStructure` ADD CONSTRAINT `FeeStructure_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `Grade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdditionalFee` ADD CONSTRAINT `AdditionalFee_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `Grade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_stream_id_fkey` FOREIGN KEY (`stream_id`) REFERENCES `Stream`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_current_term_id_fkey` FOREIGN KEY (`current_term_id`) REFERENCES `Term`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_term_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `Term`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_code_fkey` FOREIGN KEY (`code`) REFERENCES `MpesaTransaction`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Term` ADD CONSTRAINT `Term_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `Grade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeTable` ADD CONSTRAINT `TimeTable_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `TeacherProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeTable` ADD CONSTRAINT `TimeTable_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeTable` ADD CONSTRAINT `TimeTable_stream_id_fkey` FOREIGN KEY (`stream_id`) REFERENCES `Stream`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeTable` ADD CONSTRAINT `TimeTable_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `TeacherProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_stream_id_fkey` FOREIGN KEY (`stream_id`) REFERENCES `Stream`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `TeacherProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Performance` ADD CONSTRAINT `Performance_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Performance` ADD CONSTRAINT `Performance_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdditionalFeeToStudent` ADD CONSTRAINT `_AdditionalFeeToStudent_A_fkey` FOREIGN KEY (`A`) REFERENCES `AdditionalFee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdditionalFeeToStudent` ADD CONSTRAINT `_AdditionalFeeToStudent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SubjectToTeacherProfile` ADD CONSTRAINT `_SubjectToTeacherProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SubjectToTeacherProfile` ADD CONSTRAINT `_SubjectToTeacherProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
