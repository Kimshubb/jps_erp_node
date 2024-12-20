const prisma = require('../utils/prismaClient');

const seedSubjects = async (prisma, schoolId) => {
    // Subject definitions mapped to exact grade names with lessons per week
    const subjectsByGrade = {
        'PP1': [
            { name: 'Language Activities', lessons: 5 },
            { name: 'Mathematics Activities', lessons: 5 },
            { name: 'Creative Activities', lessons: 6 },
            { name: 'Environmental Activities', lessons: 5 },
            { name: 'Religious Activities', lessons: 3 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'PP2': [
            { name: 'Language Activities', lessons: 5 },
            { name: 'Mathematics Activities', lessons: 5 },
            { name: 'Creative Activities', lessons: 6 },
            { name: 'Environmental Activities', lessons: 5 },
            { name: 'Religious Activities', lessons: 3 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 1': [
            { name: 'Indigenous Language', lessons: 2 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'English', lessons: 5 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Environmental Activities', lessons: 4 },
            { name: 'Creative Activities', lessons: 7 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 2': [
            { name: 'Indigenous Language', lessons: 2 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'English', lessons: 5 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Environmental Activities', lessons: 4 },
            { name: 'Creative Activities', lessons: 7 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 3': [
            { name: 'Indigenous Language', lessons: 2 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'English', lessons: 5 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Environmental Activities', lessons: 4 },
            { name: 'Creative Activities', lessons: 7 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 4': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Science & Technology', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Social Studies', lessons: 3 },
            { name: 'Creative Arts', lessons: 6 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 5': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Science & Technology', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Social Studies', lessons: 3 },
            { name: 'Creative Arts', lessons: 6 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 6': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 3 },
            { name: 'Science & Technology', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Social Studies', lessons: 3 },
            { name: 'Creative Arts', lessons: 6 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 7': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 4 },
            { name: 'Social Studies', lessons: 4 },
            { name: 'Integrated Science', lessons: 5 },
            { name: 'Pre-Technical Studies', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Creative Arts & Sports', lessons: 5 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'Grade 8': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 4 },
            { name: 'Social Studies', lessons: 4 },
            { name: 'Integrated Science', lessons: 5 },
            { name: 'Pre-Technical Studies', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Creative Arts & Sports', lessons: 5 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ],
        'GRADE 9': [
            { name: 'English', lessons: 5 },
            { name: 'Kiswahili', lessons: 4 },
            { name: 'Mathematics', lessons: 5 },
            { name: 'Religious Education', lessons: 4 },
            { name: 'Social Studies', lessons: 4 },
            { name: 'Integrated Science', lessons: 5 },
            { name: 'Pre-Technical Studies', lessons: 4 },
            { name: 'Agriculture & Nutrition', lessons: 4 },
            { name: 'Creative Arts & Sports', lessons: 5 },
            { name: 'Pastoral Programme of Instruction', lessons: 1 }
        ]
    };

    try {
        // Get all grades for the school
        const grades = await prisma.grade.findMany({
            where: { schoolId }
        });

        console.log(`Found ${grades.length} grades for school ${schoolId}`);

        // Process each grade in parallel
        await Promise.all(
            grades.map(async grade => {
                // Find matching subjects for the grade, accounting for case variations
                const subjectsForGrade = subjectsByGrade[grade.name] || 
                    subjectsByGrade[grade.name.toUpperCase()] || 
                    subjectsByGrade[grade.name.replace(/\s/g, '')] || 
                    null;

                if (!subjectsForGrade) {
                    console.log(`No subjects defined for grade: ${grade.name}`);
                    return;
                }

                console.log(`Processing subjects for grade: ${grade.name}`);

                // Fetch existing subjects for the grade
                const existingSubjects = await prisma.subject.findMany({
                    where: { gradeId: grade.id }
                });

                // Map existing subjects by name for quick lookup
                const existingSubjectMap = new Map(
                    existingSubjects.map(subject => [subject.name, subject])
                );

                // Process subjects for this grade in parallel
                await Promise.all(
                    subjectsForGrade.map(async subjectData => {
                        const existingSubject = existingSubjectMap.get(subjectData.name);

                        if (!existingSubject) {
                            // Create new subject
                            await prisma.subject.create({
                                data: {
                                    name: subjectData.name,
                                    lessonsPerWeek: subjectData.lessons,
                                    gradeId: grade.id
                                }
                            });
                            console.log(`Created subject: ${subjectData.name} for grade ${grade.name}`);
                        } else if (existingSubject.lessonsPerWeek !== subjectData.lessons) {
                            // Update existing subject if lessons per week has changed
                            await prisma.subject.update({
                                where: { id: existingSubject.id },
                                data: { lessonsPerWeek: subjectData.lessons }
                            });
                            console.log(`Updated lessons for subject: ${subjectData.name} in grade ${grade.name}`);
                        }
                    })
                );
            })
        );

        console.log('Subject seeding completed successfully');
        return true;
    } catch (error) {
        console.error('Error seeding subjects:', error);
        return false;
    }
};

module.exports = { seedSubjects };