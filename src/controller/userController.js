const { User } = require('../models/userSchema');
const { ValidationUserSchema, ValidationUserSchemaLogin, ValidationUserSchemaUpdate } = require('../models/JoiValidate');
const bcrypt = require('bcrypt');
const { apiResponse } = require('../utils/apiResponse')

const registerUser = async (req, res) => {
    try {
        const { username, email, password, name, mobile, DOB } = req.body;

        const { error } = ValidationUserSchema.validate(req.body);
        if (error) {
            return res.status(200).json(apiResponse(false, 500, `${error}`, {}));
        }

        if (!username) {
            console.log('Please enter UserName');
        }
        if (!email || !password) {
            res.status(400).json(apiResponse(false, 400, 'All required feild required', {}));
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(500).json(apiResponse(false, 500, "User Already Exits!.", {}))
        }
        else {
            const user = await User.create({
                name: name,
                username: username,
                email: email,
                mobile_number: mobile,
                DOB: DOB,
                password: hashPassword,

            })
            return res.status(201).json(apiResponse(true, 201, "User register successfully.", { user }));
        }
    }
    catch (error) {
        res.json(apiResponse(false, 500, `Error in registering user: ${error}`, {}))
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = ValidationUserSchemaLogin.validate(req.body);
        if (error) {
            return res.status(200).json(apiResponse(false, 500, `${error}`, {}));
        }

        if (!email || !password) {
            return res.status(400).json(apiResponse(false, 500, `Please enter a valid email & Password`, {}));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json(apiResponse(false, 500, `User not found!`, {}));
        }
        // if (password !== user.password) {
        //     return res.status(401).json({ message: 'Invalid password' });
        // }

        const PasswordIsMatched = await bcrypt.compare(password, user.password);
        if (!PasswordIsMatched) {
            return res.status(401).json(apiResponse(false, 401, `Invalid Password!`, {}));
        }

        console.log(user)

        res.status(200).json(
            apiResponse(true, 200, 'Login successful', {
                userName: user?.username,
                email: user?.email,
                user_name: user?.name,
            }));
    } catch (error) {
        res.status(500).json(apiResponse(false, 500, `Error in Login user: ${error}`, {}));
    }
};

const users = async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json(apiResponse(true, 200, 'Users Data Fetched successfully', { user }));

    } catch (error) {
        res.status(500).json(apiResponse(false, 500, `Error in Fething users`, {}));
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, email, DOB, mobile } = req.body;

        const { error } = ValidationUserSchemaUpdate.validate(req.body);
        if (error) {
            return res.status(200).json(apiResponse(false, 500, `${error}`, {}));
        }

        const user = await User.findOne({ email: email })
        if (user) {
            user.name = name;
            user.email = email;
            user.mobile_number = mobile;
            user.DOB = DOB;

            const updatedUser = await user.save();
            console.log('User updated successfully:');
        } else {
            console.log('User not found');
        }

        res.status(200).json(apiResponse(true, 200, 'User Profile updated successfully.', { user }));
    } catch (error) {
        console.log(error)
        res.status(500).json(apiResponse(false, 500, "error in updating an user", {}));
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id, email } = req.body;
        const user = await User.findOneAndDelete({ email: email });
        return res.status(200).json(apiResponse(true, 200, 'User deleted successfully.', { user }))

    } catch (error) {
        res.status(500).json(apiResponse(false, 500, "error in deleting user", {}));
    }
}

module.exports = { registerUser, loginUser, users, updateUser, deleteUser };