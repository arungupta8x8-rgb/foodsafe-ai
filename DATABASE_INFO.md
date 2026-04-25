# Database Information - AllerGuard App

## Current Setup (LocalStorage)

Right now, your app stores user data in the **browser's LocalStorage**. This is perfect for learning and testing!

## Where Your Data is Stored

### Users Database
All registered users are stored in LocalStorage under the key: `users`

**To view your users:**
1. Open your app in the browser
2. Press `F12` to open Developer Tools
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click on **Local Storage** → Select your website URL
5. Look for the key named `users`

### User Data Structure
```json
[
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "createdAt": "2026-04-15T10:30:00.000Z"
  }
]
```

### Allergy Profiles
Each user's allergy profile is stored separately with the key: `allergyProfile_{email}`

For example:
- `allergyProfile_john@example.com`
- `allergyProfile_sarah@gmail.com`

**Profile Structure:**
```json
{
  "allergies": ["Peanuts", "Milk", "Eggs"],
  "severity": {
    "Peanuts": "high",
    "Milk": "medium",
    "Eggs": "low"
  },
  "dietType": "Vegetarian"
}
```

## How to View All Users (Browser Console)

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Type this command:
```javascript
JSON.parse(localStorage.getItem('users'))
```
4. Press Enter to see all registered users

## How Authentication Works

### Sign Up Flow:
1. User enters: Email, Password, Name
2. App checks if email already exists
3. If new → Create user account in `users` array
4. Auto-login the user
5. Create empty allergy profile for them

### Login Flow:
1. User enters: Email, Password
2. App checks `users` array for matching credentials
3. If found → Log them in
4. Load their personal allergy profile
5. They can now use the app!

### Logout:
- Clears current session
- User data stays in LocalStorage
- They can login again anytime

## Important Notes

⚠️ **LocalStorage Limitations:**
- Data only stays on THIS browser
- If you clear browser data, users are deleted
- Can't sync across different devices
- Not suitable for real production apps

✅ **Perfect for:**
- Learning and testing
- Demonstrating your project
- Building prototypes
- School projects

## Upgrading to Real Database (Future)

When you're ready to make this a real app, you would:
1. Connect to **Supabase** (cloud database)
2. Users stored in PostgreSQL database
3. Secure authentication with encrypted passwords
4. Cross-device sync
5. Better security and data backup

---

## Quick Test Guide

**To test your login system:**

1. **Create a Test Account:**
   - Click "Sign Up"
   - Email: `test@example.com`
   - Password: `test123`
   - Name: `Test User`
   - Click "Sign Up"

2. **View in LocalStorage:**
   - F12 → Application → Local Storage
   - See your new user in the `users` key

3. **Test Logout:**
   - Click the red "Logout" button
   - You'll go back to login screen

4. **Test Login:**
   - Click "Login" tab
   - Enter: `test@example.com` / `test123`
   - Click "Login"
   - You're back in!

5. **Add Allergies:**
   - Go to Profile tab
   - Add some allergies
   - Click Save
   - Check LocalStorage for `allergyProfile_test@example.com`

---

**For Teacher Presentation:**

Show them:
1. The login/signup screen
2. How to create a new account
3. Open Developer Tools to show the data in LocalStorage
4. Explain this is a working prototype that could connect to a real database

**Simple Explanation:**
"Right now the app stores user accounts in the browser's memory (LocalStorage). You can see all the users by opening Developer Tools and checking the Application tab. For a real app, this would connect to a secure cloud database like Supabase, but LocalStorage is perfect for prototyping and learning how authentication works!"
