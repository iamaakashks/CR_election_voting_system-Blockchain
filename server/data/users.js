const bcrypt = require('bcryptjs');

// Expanded lists for more variety
const firstNames = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Siddharth", "Rohan", "Arnav", "Aryan", "Dhruv", "Kabir", "Parth", "Veer", "Advik", "Aadi",
    "Saanvi", "Aanya", "Aadhya", "Ananya", "Pari", "Diya", "Myra", "Anika", "Sara", "Kiara",
    "Navya", "Riya", "Siya", "Ishita", "Avni", "Prisha", "Shanaya", "Pihu", "Ira", "Anvi"
];
const lastNames = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Rao", "Reddy", "Yadav", "Jain",
    "Mehta", "Shah", "Mishra", "Pandey", "Trivedi", "Chopra", "Malhotra", "Kapoor", "Joshi", "Nair"
];

const generateUsers = (branch, branchCode, section, count, startIndex) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const emailName = `${firstName.toUpperCase()}${lastName.toUpperCase()}`;
        const collegeIdNum = `${startIndex + i}`.padStart(3, '0');
        
        // --- THE GUARANTEED UNIQUE FIX ---
        // The unique collegeIdNum is now part of the email, ensuring no duplicates can ever occur.
        users.push({
            collegeId: `4NI22${branchCode}${collegeIdNum}`,
            name: fullName,
            email: `2022${branchCode}_${emailName}_${collegeIdNum}_${section}@NIE.AC.IN`,
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

const branches = [
    { name: 'CSE', code: 'CS' },
    { name: 'CSE(AI&ML)', code: 'CI' },
    { name: 'ISE', code: 'IS' },
];
const sections = ['A', 'B', 'C', 'D'];
const studentsPerSection = 12;

branches.forEach(branch => {
    let studentCounterForBranch = 1;
    sections.forEach(section => {
        allUsers = allUsers.concat(generateUsers(branch.name, branch.code, section, studentsPerSection, studentCounterForBranch));
        studentCounterForBranch += studentsPerSection;
    });
});

const salt = bcrypt.genSaltSync(10);
const hashedUsers = allUsers.map(user => {
    return { ...user, password: bcrypt.hashSync(user.password, salt) };
});

module.exports = hashedUsers;