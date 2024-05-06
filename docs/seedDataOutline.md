# Tweeter - Sample Database Outline

The following sample database can be populated using `npm run seed`. This document will present the sample database in a more readable format, so that anyone testing this app can understand the initial relationships between sample users.


## Registered Users

To test this app, we recommend signing in as `deviousTweeter` (the first user listed below).


```javascript
let michaelDevious = {
    username: "deviousTweeter",
    name: "Michael Devious",
    password: "deVious420*",
    publicProfile: true,
    friends: [
        "jharrisong830",
        "ehodor",
        "jduran"
    ],
    blocked: [ /* none */ ]
}
```


```javascript
let johnGraham = {
    username: "jharrisong830",
    name: "John Graham",
    password: "passworD123*",
    publicProfile: true,
    friends: [
        "deviousTweeter",
        "ehodor",
        "jduran",
        "rebeccaan3",
        "rperalt1"
    ],
    blocked: [ /* none */ ]
}
```



```javascript
let emmaHodor = {
    username: "ehodor",
    name: null,
    password: "1234emmaH&",
    publicProfile: true,
    friends: [
        "deviousTweeter",
        "jharrisong830",
        "jduran"
    ],
    blocked: [ 
        "rebeccaan3",
        "rperalt1"
    ]
}
```


```javascript
let justinDuran = {
    username: "jduran",
    name: "Justin",
    password: "Wustin*456",
    publicProfile: false,
    friends: [
        "deviousTweeter",
        "jharrisong830",
        "ehodor"
    ],
    blocked: [ /* none */ ]
}
```


```javascript
let ramsesPeralta = {
    username: "rperalt1",
    name: "TheRam",
    password: "iobotomY-69",
    publicProfile: true,
    friends: [
        "jharrisong830",
        "rebeccaan3"
    ],
    blocked: [ /* none */ ]
}
```



```javascript
let rebeccaAn = {
    username: "rebeccaan3",
    name: "Rebecca An",
    password: "Password*96",
    publicProfile: false,
    friends: [
        "jharrisong830",
        "rperalt1"
    ],
    blocked: [
        "deviousTweeter"
    ]
}
```


## Signing into Spotify

No users in the database will have authentication data stored in their profile. You will either need to sign in with your own account, or (if you're a TA grading this) use the provided test login.
