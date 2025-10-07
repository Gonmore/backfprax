const { Student, User, StudentSkill, Skill, Profamily } = require('./src/models/relations.js');const { Student, User, StudentSkill, Skill, Profamily } = require('./src/models/relations.js');const { Student, User, StudentSkill, Skill, Profamily } = require('./src/models/relations.js');



async function checkStudentsSkills() {

    try {

        console.log('🔍 Verificando estudiantes y sus skills...\n');async function checkStudentsSkills() {async function checkStudentsSkills() {



        const students = await Student.findAll({    try {    try {

            include: [

                {        console.log('🔍 Verificando estudiantes y sus skills...\n');        console.log('🔍 Verificando estudiantes y sus skills...\n');

                    model: User,

                    as: 'user',

                    attributes: ['id', 'username', 'email']

                },        const students = await Student.findAll({        const students = await Student.findAll({

                {

                    model: Profamily,            include: [            include: [

                    as: 'profamily',

                    attributes: ['id', 'name']                {                {

                },

                {                    model: User,                    model: User,

                    model: Skill,

                    as: 'skills',                    as: 'user',                    attributes: ['id', 'username', 'email']

                    through: {

                        attributes: ['proficiencyLevel']                    attributes: ['id', 'username', 'email']                },

                    }

                }                },                {

            ]

        });                {                    model: Profamily,



        console.log(`📊 Total estudiantes: ${students.length}\n`);                    model: Profamily,                    attributes: ['id', 'name']



        for (const student of students) {                    as: 'profamily',                },

            const skillCount = student.skills ? student.skills.length : 0;

            const profamilyName = student.profamily ? student.profamily.name : 'SIN PROFAMILY';                    attributes: ['id', 'name']                {



            console.log(`👤 ${student.user?.email || 'SIN EMAIL'} (ID: ${student.id})`);                },                    model: Skill,

            console.log(`   📚 Skills: ${skillCount}`);

            console.log(`   🎓 Profamily: ${profamilyName}`);                {                    as: 'skills',



            if (student.skills && student.skills.length > 0) {                    model: Skill,                    through: {

                student.skills.forEach(skill => {

                    console.log(`      - ${skill.name} (${skill.student_skills.proficiencyLevel})`);                    as: 'skills',                        attributes: ['proficiencyLevel']

                });

            }                    through: {                    }

            console.log('');

        }                        attributes: ['proficiencyLevel']                }



        process.exit(0);                    }            ]

    } catch (error) {

        console.error('❌ Error:', error.message);                }        });

        process.exit(1);

    }            ]

}

        });        console.log(`📊 Total estudiantes: ${students.length}\n`);

checkStudentsSkills();


        console.log(`📊 Total estudiantes: ${students.length}\n`);        for (const student of students) {

            const skillCount = student.skills ? student.skills.length : 0;

        for (const student of students) {            const profamilyName = student.profamily ? student.profamily.name : 'SIN PROFAMILY';

            const skillCount = student.skills ? student.skills.length : 0;

            const profamilyName = student.profamily ? student.profamily.name : 'SIN PROFAMILY';            console.log(`👤 ${student.User?.email || 'SIN EMAIL'} (ID: ${student.id})`);

            console.log(`   📚 Skills: ${skillCount}`);

            console.log(`👤 ${student.user?.email || 'SIN EMAIL'} (ID: ${student.id})`);            console.log(`   🎓 Profamily: ${profamilyName}`);

            console.log(`   📚 Skills: ${skillCount}`);

            console.log(`   🎓 Profamily: ${profamilyName}`);            if (student.skills && student.skills.length > 0) {

                student.skills.forEach(skill => {

            if (student.skills && student.skills.length > 0) {                    console.log(`      - ${skill.name} (${skill.student_skills.proficiencyLevel})`);

                student.skills.forEach(skill => {                });

                    console.log(`      - ${skill.name} (${skill.student_skills.proficiencyLevel})`);            }

                });            console.log('');

            }        }

            console.log('');

        }        process.exit(0);

    } catch (error) {

        process.exit(0);        console.error('❌ Error:', error.message);

    } catch (error) {        process.exit(1);

        console.error('❌ Error:', error.message);    }

        process.exit(1);}

    }

}checkStudentsSkills();

checkStudentsSkills();