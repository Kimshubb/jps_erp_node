const prisma = require('../utils/prismaClient');

const assignTeacherSubjects = async (schoolId) => {
    console.log('\n=== Assigning Teacher Subjects Start ===');
    console.log(`School ID: ${schoolId}`);

    try {
        // Fetch all teachers for the school
        const teachers = await prisma.user.findMany({
            where: { 
                schoolId, 
                role: 'teacher' || 'TEACHER',
                isActive: true
            },
            include: { 
                teacherProfile: true 
            }
        });

        console.log(`Found ${teachers.length} teachers`);

        if (!teachers.length) {
            throw new Error('No teachers found for this school');
        }

        // Initialize teacher workload tracking
        const teacherWorkload = new Map(
            teachers.map(t => [t.id, { 
                streams: new Set(), 
                subjects: new Set(),
                totalAssignments: 0
            }])
        );

        // Fetch all grades with their existing assignments
        const grades = await prisma.grade.findMany({
            where: { schoolId },
            include: { 
                streams: {
                    select: {
                        id: true,
                        name: true,
                        streamSubjectTeachers: {
                            include: {
                                teacher: {
                                    include: {
                                        user: true
                                    }
                                },
                                subject: true
                            }
                        }
                    }
                },
                subjects: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        console.log(`Found ${grades.length} grades`);

        // Load existing assignments into workload tracking
        for (const grade of grades) {
            for (const stream of grade.streams) {
                for (const assignment of stream.streamSubjectTeachers) {
                    if (assignment.teacher?.user) {
                        const workload = teacherWorkload.get(assignment.teacher.user.id);
                        if (workload) {
                            workload.streams.add(stream.id);
                            workload.subjects.add(assignment.subject.id);
                            workload.totalAssignments++;
                        }
                    }
                }
            }
        }

        // Print existing workload
        console.log('\n=== Existing Teacher Workload ===');
        for (const teacher of teachers) {
            const workload = teacherWorkload.get(teacher.id);
            console.log(`${teacher.username}:
  Current Streams: ${workload.streams.size}
  Current Subjects: ${workload.subjects.size}
  Current Assignments: ${workload.totalAssignments}`);
        }

        // Helper function to check if assignment exists
        const isAssignmentExists = (stream, subjectId) => {
            return stream.streamSubjectTeachers.some(sst => sst.subject.id === subjectId);
        };

        // Helper function to find available teacher
        const findAvailableTeacher = (stream, subjectId, maxAssignments = 30) => {
            return teachers.find(t => {
                const workload = teacherWorkload.get(t.id);
        
                // Check workload limits
                if (!workload || workload.totalAssignments >= maxAssignments) return false;
        
                // Ensure the teacher isn't already assigned to this stream or subject
                if (workload.streams.has(stream.id)) return false;
                if (workload.subjects.has(subjectId)) return false;
        
                return true; // Eligible teacher
            });
        };

        const categorizeGrades = grades => ({
            prePrimaryGrades: grades.filter(g => g.name && ['PP1', 'PP2'].includes(g.name)),
            lowerPrimaryGrades: grades.filter(g => g.name && ['Grade 1', 'Grade 2', 'Grade 3'].includes(g.name)),
            upperPrimaryGrades: grades.filter(g => g.name && ['Grade 4', 'Grade 5', 'Grade 6'].includes(g.name)),
            juniorSecondaryGrades: grades.filter(g => g.name && ['Grade 7', 'Grade 8', 'Grade 9'].includes(g.name))
        });

        const gradeLevels = categorizeGrades(grades);

        // Process early education (Pre-Primary and Lower Primary)
        for (const gradeGroup of [gradeLevels.prePrimaryGrades, gradeLevels.lowerPrimaryGrades]) {
            for (const grade of gradeGroup) {
                console.log(`\nProcessing ${grade.name}:`);
                
                for (const stream of grade.streams) {
                    console.log(`  Checking stream ${stream.name}`);
                    
                    for (const subject of grade.subjects) {
                        if (isAssignmentExists(stream, subject.id)) {
                            console.log(`    Subject ${subject.name} already assigned`);
                            continue;
                        }

                        const teacher = findAvailableTeacher(stream);
                        if (!teacher || !teacher.teacherProfile) {
                            console.log(`    No available teacher for ${subject.name}`);
                            continue;
                        }

                        await assignSubjectToTeacher(teacher.teacherProfile.id, stream.id, subject.id);
                        const workload = teacherWorkload.get(teacher.id);
                        workload.streams.add(stream.id);
                        workload.subjects.add(subject.id);
                        workload.totalAssignments++;
                        
                        console.log(`    Assigned ${teacher.username} to ${subject.name}`);
                    }
                }
            }
        }

        // Process upper grades with subject specialization
        const subjectGroups = {
            'Languages': ['English', 'Kiswahili', 'Indigenous Language'],
            'Core Subjects': ['Mathematics', 'Science', 'Integrated Science'],
            'Humanities': ['Social Studies', 'Religious Education'],
            'Vocational': ['Agriculture', 'Pre-Technical Studies', 'Technical Studies']
        };

        const upperGrades = [...gradeLevels.upperPrimaryGrades, ...gradeLevels.juniorSecondaryGrades];
        
        for (const [groupName, subjectNames] of Object.entries(subjectGroups)) {
            console.log(`\nProcessing ${groupName}:`);
            
            const matchingSubjects = upperGrades
                .flatMap(grade => grade.subjects || [])
                .filter(subject => subject && subject.name && 
                    subjectNames.some(name => subject.name.includes(name)));

            for (const subject of matchingSubjects) {
                console.log(`  Subject: ${subject.name}`);
                
                for (const grade of upperGrades) {
                    for (const stream of grade.streams) {
                        if (isAssignmentExists(stream, subject.id)) {
                            console.log(`    Already assigned in ${grade.name} ${stream.name}`);
                            continue;
                        }

                        const teacher = findAvailableTeacher(stream, 20);
                        if (!teacher?.teacherProfile) {
                            console.log(`   No available teacher for ${grade.name} ${stream.name}`);
                            continue;
                        }

                        await assignSubjectToTeacher(teacher.teacherProfile.id, stream.id, subject.id);
                        const workload = teacherWorkload.get(teacher.id);
                        workload.streams.add(stream.id);
                        workload.subjects.add(subject.id);
                        workload.totalAssignments++;
                        
                        console.log(`    Assigned ${teacher.username} to ${grade.name} ${stream.name}`);
                    }
                }
            }
        }

        // Print final workload
        console.log('\n=== Final Teacher Workload ===');
        for (const teacher of teachers) {
            const workload = teacherWorkload.get(teacher.id);
            console.log(`${teacher.username}:
  Streams: ${workload.streams.size}
  Subjects: ${workload.subjects.size}
  Total Assignments: ${workload.totalAssignments}`);
        }

        return true;
    } catch (error) {
        console.error('Error in teacher subject assignment:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
};

const assignSubjectToTeacher = async (teacherProfileId, streamId, subjectId) => {
    try {
        return await prisma.streamSubjectTeacher.upsert({
            where: {
                unique_stream_subject_teacher: {
                    streamId,
                    subjectId
                }
            },
            update: {
                teacherId: teacherProfileId
            },
            create: {
                streamId,
                subjectId,
                teacherId: teacherProfileId
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error assigning subject ${subjectId} to stream ${streamId}:`, error);
        throw error;
    }
};

if (require.main === module) {
    const schoolId = parseInt(process.argv[2]);

    if (isNaN(schoolId)) {
        console.error('Please provide a valid school ID as an argument.');
        console.error('Example: node src/seedutils/assignTeacherSubjects.js 1');
        process.exit(1);
    }

    assignTeacherSubjects(schoolId)
        .then((success) => {
            if (success) {
                console.log('Teacher subject assignment completed successfully.');
                process.exit(0);
            } else {
                console.error('Teacher subject assignment failed.');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { assignTeacherSubjects };