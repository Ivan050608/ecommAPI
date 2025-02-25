//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../auth');
const { errorHandler } = require ('../auth')



//[SECTION] User registration
module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({error: 'Email invalid'});
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({error: 'Mobile number invalid'});
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({error: 'Password must be atleast 8 characters'});
    // If all needed requirements are achieved
    } else {

        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({message: 'Registered Successfully'}))
        .catch(error => errorHandler(error, req, res));
    }
};

//[SECTION] User Login/ Authentication
/*
    Steps:
        1. Check the database if the user email exists
        2. Compare the password provided in the login form/postman request with the passowrd stored in the database
        3. Generate/return a JSON web token if the user is successfully logged in
        4. If ever that password doesn't match in the compareSync method of bcrypt, what happens is, it would just return the boolean value false
*/  

//[SECTION] User Login
module.exports.loginUser = (req, res) => {

    // Check if the email in the request body contains an "@" symbol.
    if (req.body.email.includes("@")) {

        // If it does, search the database for a user with that email.
        return User.findOne({ email: req.body.email })
        .then(result => {
            // If no user is found (result is null), send a 404 (Not Found) status with "false".
            if (result == null) {
                return res.status(404).send({error: 'No Email Found'});
            } else {
                // Compare the password provided by the user with the stored hashed password.
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if (isPasswordCorrect) {
                    // If the password is correct, send a 200 (OK) status with an access token.
                    return res.status(200).send({ access: auth.createAccessToken(result) });
                } else {
                    // If the password is incorrect, send a 401 (Unauthorized) status with "false".
                    return res.status(401).send({error: 'Email and password do not match'});
                }
            }
        })
        .catch(error => errorHandler(error, req, res));

    } else {
        // If the email does not contain an "@", send a 400 (Bad Request) status with "false".
        return res.status(400).send({error: 'Invalid Email'});
    }
};





//[Section] Activity: Retrieve user details
/*
    Steps:
    1. Retrieve the user document using it's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
// module.exports.getProfile = (req, res) => {

//     return User.findById(req.user.id)
//     .then(user => {
//         user.password = "";
//         return res.status(200).send(user)
//     })
//     .catch(error => errorHandler(error, req, res))
// };

module.exports.getProfile = (req, res) => {
    User.findById(req.user.id)
        .select('-password') 
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json(user);
        })
        .catch(error => errorHandler(error, req, res)); 
};

//CheckEmail Exists
module.exports.checkEmailExists = (req, res) => {

    // Check if the email from the request body contains an "@" symbol.
    if (req.body.email.includes("@")) {

        // If it does, search the database for a user with that email.
        return User.find({ email: req.body.email })
        .then(result => { // If the database search is successful, process the result.

            // Check if the result (found users) contains any entries.
            if (result.length > 0) {
                // If an entry is found, send a 409 (Conflict) status with "true" to indicate the email exists.
                return res.status(409).send({ message: "Duplicate email found" });
            } else {
                // If no entry is found, send a 404 (Not Found) status with "false" to indicate the email does not exist.
                return res.status(404).send({ message: "No duplicate email found" });
            }
        })
         // If there's an error during the database search, pass the error to the errorHandler for further processing.
        .catch(error => errorHandler(error, req, res));

    } else {
        // If the email does not contain an "@", send a 400 (Bad Request) status with "false" to indicate invalid input.
        res.status(400).send({ message: "Invalid email format" });
    }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(201).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true }
    );

    res.send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// module.exports.promoteToAdmin = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required.' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Update user's role to admin
//     user.isAdmin = true;
//     await user.save();

//     return res.status(200).send({ message: `User updated as admin successfully.` });
//   } catch (error) {
//     console.error('Error promoting user to admin:', error);
//     return res.status(500).json({ message: 'Internal server error.' });
//   }
// };


module.exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    // if (!userId) {
    //   return res.status(400).json({ message: 'User ID is required.' });
    // }

    // Find and update the user to admin in one step
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true } // Returns the updated document
    );

    // if (!updatedUser) {
    //   return res.status(404).json({ message: 'User not found.' });
    // }

    // Return the updated user details
    return res.status(200).json({
      message: 'User promoted to admin successfully.',
      updatedUser,
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
