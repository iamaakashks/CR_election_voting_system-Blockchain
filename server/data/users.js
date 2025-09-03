const bcrypt = require('bcryptjs');

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Saanvi", "Aanya", "Aadhya", "Ananya", "Pari", "Diya", "Myra", "Anika", "Sara", "Kiara"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Rao", "Reddy", "Yadav", "Jain"];

// The function now accepts a 'startIndex' to ensure unique IDs
const generateUsers = (branch, branchCode, section, count, startIndex) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const emailName = `${firstName.toUpperCase()}${lastName.toUpperCase()}`;
        const collegeIdNum = `${startIndex + i}`.padStart(3, '0'); // Use startIndex
        
        users.push({
            collegeId: `4NI22${branchCode}${collegeIdNum}`,
            name: fullName,
            email: `2022${branchCode}_${emailName}_${section}@NIE.AC.IN`,
            password: 'password123',
            role: 'Student',
            department: branch,
            section: section,
        });
    }
    return users;
};

let allUsers = [
    // --- Super Admin ---
    {
        collegeId: 'SUPERADMIN01',
        name: 'Super Admin',
        email: 'admin@nie.ac.in',
        password: 'adminpassword',
        role: 'SuperAdmin',
    },
];

// --- Generate Students with corrected logic ---
const branches = [
    { name: 'CSE', code: 'CS' },
    { name: 'CSE(AI&ML)', code: 'CI' },
    { name: 'ISE', code: 'IS' },
];
const sections = ['A', 'B', 'C', 'D'];
const studentsPerSection = 12;

branches.forEach(branch => {
    let studentCounterForBranch = 1; // This counter ensures IDs are unique within a branch
    sections.forEach(section => {
        allUsers = allUsers.concat(generateUsers(branch.name, branch.code, section, studentsPerSection, studentCounterForBranch));
        studentCounterForBranch += studentsPerSection; // Increment the starting index for the next section
    });
});

// Hash all passwords before exporting
const salt = bcrypt.genSaltSync(10);
const hashedUsers = allUsers.map(user => {
    return { ...user, password: bcrypt.hashSync(user.password, salt) };
});

module.exports = hashedUsers;