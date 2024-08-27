api for managing users interactions .


## Base URL
```
https://mobtwin.com/api
```

## Usage
Available endpoints:
- [login](#login): standard login with email and password.
- [register](#register): register a new user with email and password.
- [email-verification](#email-verification): verify the email ownership.
- [refresh-token](#refresh-token): refresh the accessToken.
- [reset-password](#reset-password): reset user password.
- [logout](#logout): logout a specific device.

### login

#### - with email and password

standard login:

* `email`: user email.
* `password`: user password.

Example:

```javascript
const url = "http://localhost:3001/auth/login"
const body = {
    email: "example@email.co",
    password: "password"
}
```
Results:

* `accessToken`: for interaction with the server expire in 30 minutes.
* `refreshToken`: used for refreshing the accessToken after been expired, one time use, expire in 30 days.

```javascript
{
    accessToken: "eyJhbGciO.......eyJyb2.....91Zucygva-hE....",
    refreshToken: "eyJhbGci.........eyJ1cYjhh.....xwMEEHg_bt0ZJ1......"
}
```

### register

#### register with email and password

* `email`: user email.
* `userName`: user name
* `password`: user password.

Example:

```javascript
const url = "http://localhost:3001/auth/register"
const body = {
    email: "example@email.co",
    userName: "user name"
    password: "password"
}
```
Results:

```javascript
 {
    message: "User created successfully"
}
```

### email verification 
after the user successfully registered a verification code send to the email.


* `email`: user email.
* `code` received code.


Example:

```javascript
const url = "http://localhost:3001/auth/email-verification"
const body = {
    email: "example@email.co",
    code: "010101"
}
```
Results:

```javascript
{
    message: "email verified successfully"
}
```

### refresh token
refresh the access token using refresh Token:

* `accessToken`: the expired access Token .
* `refreshToken` refresh token.

Example:

```javascript
const url = "http://localhost:3001/auth/refresh"
const headers = {
    Authorization: "Bearer eyJhbGci...."
}
const body = {
    refreshToken: "eyJhbGciOiJIUzI1N.............."
}
```

Results:
the new tokens
```javascript
{
    accessToken: "eyJhbGciO...............",
    refreshToken: "eyJhbGc................."
}
```

### reset password
Given a email send a reset password link that contains a code wish will used later:

#### to receive the reset password code 

* `email`: user email.

Example:
```javascript
const url = "http://localhost:3001/auth/reset-password"

const body = {
    email: "example@example.co"
}
```

Results:
```javascript
{
    "message": "reset password code sent successfully"
}
```
#### to change the password

the user will receive an email like `M-953150 is your mobtwin password reset code`

to change the password:

* `email`: user email.
* `code`: from the email received.
* `newPassword` new user password.

Example:

```javascript
const url = "http://localhost:3001/auth/reset-password"

const body = {
    code: "953150",
    email: "email@email.com"
    newPassword: "UIx!11...."
}
```

Results:

```javascript
{
    message: "password reset successfully"
}

```

### logout
revoke the access of the current user:

* `accessToken`: user access token.
* `refreshToken`: user refresh token.

Example:

```javascript
const url = "http://localhost:3001/auth/logout"

const headers = {
    Authorization: "Bearer eysac........",
}
```

Results:
```javascript
{
    message: "logout successfully"
}
```
# sufi-way-api
