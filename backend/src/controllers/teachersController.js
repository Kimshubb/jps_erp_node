const prisma = require('../utils/prismaClient');

// Fetch all subjects grouped by grade for the teacher's school
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                grade: {
                    schoolId: req.user.schoolId, // Filter by school ID
                },
            },
            include: {
                grade: true, // Include grade info
            },
        });

        // Group subjects by grade name
        const groupedSubjects = subjects.reduce((acc, subject) => {
            const gradeName = subject.grade.name;
            if (!acc[gradeName]) {
                acc[gradeName] = [];
            }
            acc[gradeName].push({
                id: subject.id,
                name: subject.name,
                lessonsPerWeek: subject.lessonsPerWeek,
            });
            return acc;
        }, {});

        res.json(groupedSubjects);
    } catch (err) {
        console.error('Error fetching subjects:', err);
        res.status(500).json({ error: 'Failed to fetch subjects.' });
    }
};

// Assign teacher to specific stream-subject combinations
const assignTeacherSubjects = async (req, res) => {
    const { teacherId, streamSubjectAssignments } = req.body;

    if (!teacherId || !Array.isArray(streamSubjectAssignments) || streamSubjectAssignments.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Please provide teacherId and streamSubjectAssignments.' });
    }

    try {
        // Ensure teacher exists, has role 'teacher', and belongs to the same school
        const teacher = await prisma.user.findUnique({
            where: { 
                id: parseInt(teacherId),
                role: 'teacher',
                schoolId: req.user.schoolId,
            },
            include: {
                teacherProfile: true,
            },
        });

        if (!teacher || !teacher.teacherProfile) {
            return res.status(403).json({ error: 'Teacher not found, unauthorized, or not a teacher.' });
        }
        const teacherProfileId = teacher.teacherProfile.id;

        // Validate and assign stream-subject-teacher mappings
        const validationResults = await Promise.all(
            streamSubjectAssignments.map(async (assignment) => {
                const stream = await prisma.stream.findUnique({
                    where: { id: parseInt(assignment.streamId) },
                    include: { grade: true },
                });

                if (!stream || stream.grade.schoolId !== req.user.schoolId) {
                    return { valid: false, error: `Stream ${assignment.streamId} not found or unauthorized.` };
                }

                const subject = await prisma.subject.findFirst({
                    where: {
                        id: parseInt(assignment.subjectId),
                        gradeId: stream.grade.id,
                    },
                });

                if (!subject) {
                    return { valid: false, error: `Subject ${assignment.subjectId} not valid for stream ${assignment.streamId}.` };
                }

                // Check if the subject is already assigned to another teacher in this stream
                const existingAssignment = await prisma.streamSubjectTeacher.findUnique({
                    where: {
                        unique_stream_subject_teacher: {
                            streamId: stream.id,
                            subjectId: subject.id,
                        },
                    },
                    include: {
                        teacher: { include: { user: true } }
                    }
                });

                if (existingAssignment && existingAssignment.teacherId !== teacherProfileId) {
                    return { 
                        valid: false, 
                        error: `Subject ${subject.name} in stream ${stream.name} is already assigned to ${existingAssignment.teacher.user.username}.` 
                    };
                }

                return { 
                    valid: true, 
                    streamId: stream.id, 
                    subjectId: subject.id,
                    lessonsPerWeek: subject.lessonsPerWeek 
                };
            })
        );

        // Check for invalid assignments
        const invalidResult = validationResults.find((result) => !result.valid);
        if (invalidResult) {
            return res.status(400).json({ error: invalidResult.error });
        }

        // Check total lessons per week
        const totalLessonsRequested = validationResults.reduce((total, result) => 
            total + (result.lessonsPerWeek || 0), 0
        );

        // Get current teacher's existing lesson load
        const currentTeacherAssignments = await prisma.streamSubjectTeacher.findMany({
            where: { teacherId: teacherProfileId },
            include: { subject: true }
        });

        const currentLessonsPerWeek = currentTeacherAssignments.reduce((total, assignment) => 
            total + (assignment.subject.lessonsPerWeek || 0), 0
        );

        const totalLessons = currentLessonsPerWeek + totalLessonsRequested;

        if (totalLessons > 30) {
            return res.status(400).json({ 
                error: `Cannot assign these subjects. Total lessons (${totalLessons}) would exceed the maximum of 30 lessons per week.`,
                currentLessons: currentLessonsPerWeek,
                requestedLessons: totalLessonsRequested,
                maxLessons: 30
            });
        }

        // Perform assignments
        const assignmentResults = await Promise.all(
            validationResults.map((result) =>
                prisma.streamSubjectTeacher.upsert({
                    where: {
                        unique_stream_subject_teacher: {
                            streamId: result.streamId,
                            subjectId: result.subjectId,
                        },
                    },
                    update: {
                        teacherId: teacherProfileId,
                    },
                    create: {
                        streamId: result.streamId,
                        subjectId: result.subjectId,
                        teacherId: teacherProfileId,
                    },
                    include: {
                        stream: { include: { grade: true } },
                        subject: true,
                    },
                })
            )
        );

        // Format response with detailed assignment information
        const formattedResponse = {
            teacher: {
                id: teacher.id,
                username: teacher.username,
                email: teacher.email,
                teacherProfileId: teacherProfileId,
                totalLessonsPerWeek: totalLessons
            },
            assignments: assignmentResults.map((assignment) => ({
                stream: {
                    id: assignment.streamId,
                    name: assignment.stream.name,
                    grade: assignment.stream.grade.name,
                },
                subject: {
                    id: assignment.subject.id,
                    name: assignment.subject.name,
                    lessonsPerWeek: assignment.subject.lessonsPerWeek,
                },
                isNewAssignment: assignment.createdAt === assignment.updatedAt
            })),
        };

        res.json(formattedResponse);
    } catch (err) {
        console.error('Error assigning subjects to teacher:', err);
        res.status(500).json({ error: 'Failed to assign subjects to teacher.' });
    }
};

// New method to remove a teacher's subject assignment
const removeTeacherSubjectAssignment = async (req, res) => {
    const { streamId, subjectId } = req.body;
    
    if (!streamId || !subjectId) {
        return res.status(400).json({ 
            error: 'Stream ID and Subject ID are required.' 
        });
    }
    
    try {
        // Updated include statement to properly fetch teacher and user information
        const existingAssignment = await prisma.streamSubjectTeacher.findUnique({
            where: {
                unique_stream_subject_teacher: {
                    streamId: parseInt(streamId),
                    subjectId: parseInt(subjectId),
                },
            },
            include: {
                stream: { 
                    include: { 
                        grade: true 
                    } 
                },
                subject: true,
                teacher: { 
                    include: { 
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true
                            }
                        } 
                    } 
                }
            }
        });
        
        // Check if assignment exists and belongs to the school
        if (!existingAssignment || 
            existingAssignment.stream.grade.schoolId !== req.user.schoolId) {
            return res.status(404).json({ 
                error: 'Subject assignment not found or unauthorized.' 
            });
        }
        
        // Remove the assignment
        await prisma.streamSubjectTeacher.delete({
            where: {
                unique_stream_subject_teacher: {
                    streamId: parseInt(streamId),
                    subjectId: parseInt(subjectId),
                },
            }
        });
        
        // Updated response structure to match the expected format
        res.json({
            message: 'Subject assignment removed successfully',
            removedAssignment: {
                stream: {
                    id: existingAssignment.streamId,
                    name: existingAssignment.stream.name,
                    grade: existingAssignment.stream.grade.name,
                },
                subject: {
                    id: existingAssignment.subject.id,
                    name: existingAssignment.subject.name,
                },
                teacher: {
                    username: existingAssignment.teacher.user.username,
                    email: existingAssignment.teacher.user.email,
                    id: existingAssignment.teacher.user.id
                }
            }
        });
    } catch (err) {
        console.error('Error removing subject assignment:', err);
        res.status(500).json({ 
            error: 'Failed to remove subject assignment.' 
        });
    }
};

// Get subject allocation data for the school
const getSubjectAllocationData = async (req, res) => {
    try {
        const grades = await prisma.grade.findMany({
            where: {
                schoolId: req.user.schoolId,
            },
            select: {
                id: true,
                name: true,
                streams: {
                    select: {
                        id: true,
                        name: true,
                        streamSubjectTeachers: {
                            select: {
                                subject: { select: { id: true, name: true, lessonsPerWeek: true } },
                                teacher: {
                                    select: {
                                        id: true,
                                        user: { select: { username: true, email: true, role: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                subjects: {
                    select: {
                        id: true,
                        name: true,
                        lessonsPerWeek: true,
                    },
                },
            },
        });
        

        const teachers = await prisma.user.findMany({
            where: {
                schoolId: req.user.schoolId,
                role: 'teacher', // Filter directly on the User model
            },
            select: {
                id: true,
                username: true,
                email: true,
                teacherProfile: {
                    select: {
                        id: true, // Fetch the related TeacherProfile ID
                    },
                },
            },
        });        

        const formattedResponse = {
            grades: grades.map((grade) => ({
                id: grade.id,
                name: grade.name,
                streams: grade.streams.map((stream) => ({
                    id: stream.id,
                    name: stream.name,
                    subjectAssignments: stream.streamSubjectTeachers.map((assignment) => ({
                        subject: assignment.subject,
                        teacher: assignment.teacher && assignment.teacher.user.role === 'teacher' ? {
                            id: assignment.teacher.id,
                            username: assignment.teacher.user.username,
                            email: assignment.teacher.user.email,
                        } : null,
                    })),
                })),
                subjects: grade.subjects.map((subject) => ({
                    id: subject.id,
                    name: subject.name,
                    lessonsPerWeek: subject.lessonsPerWeek,
                })),
            })),
            teachers: teachers.map((teacher) => ({
                id: teacher.id,
                username: teacher.username,
                email: teacher.email,
                teacherProfileId: teacher.teacherProfile?.id,
            })),
        };
        console.log('formattedResponse', formattedResponse);

        res.json(formattedResponse);
    } catch (err) {
        console.error('Error fetching subject allocation data:', err);
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch subject allocation data.' });
    }
};

module.exports = {
    getAllSubjects,
    assignTeacherSubjects,
    getSubjectAllocationData,
    removeTeacherSubjectAssignment,
};
