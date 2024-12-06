# 1. Create admin user
node src/cli.js

# 2. Create grades and streams
node src/seedutils/seedGrades.js <schoolid>

# 3. Create Students  
node src/seedutils/seedStudents.js <schoolid> <Number of students per grade>

# 4. Create Student Payments
node src/seedutils/seedPayments.js <schoolid>

Replace <schoolid> with your school's ID number(As created on #1) and <Number of students per grade> with the desired number of students to generate per grade.
Note: These commands must be run in this specific order since later seeding operations depend on data created by earlier ones.