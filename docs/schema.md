# Tweeter - Database Schema Outline

#### Group Members

- John Graham
- Emma Hodor
- Ramses Peralta
- Justin Duran
- Rebecca An

---

Below is an outline of the database structure of Tweeter. **Currently, this is only a proposal, and this document will be updated to reflect changes to the database as the project progresses**.

There will be two main collections for our database. **Users** will store identifying info for individual users, external API authentication data, and their relationships to other objects. **Posts** contain a large amount of subdocuments, as they will feature the majority of the content for our app. Each post can be associated with a "music item" subdocument, which can be a playlist, song, or album. Users can leave comments on posts, and additionally leave ratings on playlists.


---


## User

| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for each user |
| `username` | `string` | login and username handle |
| `name` | `string` (optional) | display name |
| `email` | `string` | login and contact email |
| `password` | `string` | hash of the login password |
| `dateOfBirth` | `Date`(as `string`) | string (formatted as 'YYYY-MM-DD') representing the user's date of birth (for registration purposes) |
| `SPAuth` | `Object` (subdocument, optional) | subdocument with fields for spotify authentication |
| `AMAuth` | `Object` (subdocument, optional) | subdocument with fields for apple music authentication |
| `publicProfile` | `boolean` | denotes whether this profile is public (`true`) or private (`false`) |
| `friends` | `[ObjectId]` | list of `_id`s of the current users friends |
| `blocked` | `[ObjectId]` | list of `_id`s of users that are blocked by the current user |
| `incomingRequests` | `[ObjectId]` | list of `_id`s of users that are requesting to be friends with this user |
| `posts` | `[ObjectId]` | list of post `_id`s authored by this user |
| `comments` | `[ObjectId]` | list of comment `_id`s authored by this user |
| `postLikes` | `[ObjectId]` | list of post `_id`s liked by this user |
| `commentLikes` | `[ObjectId]` | list of comment `_id`s liked by this user |
| `ratings` | `[ObjectId]` | list of rating `_id`s authored by this user |


### SPAuth (Subdocument of User)
| Field | Type | Description |
| ---  | ---  | ---         |
| `accessToken` | `string` | token needed for access to spotify api data functions |
| `expiryTime` | `number` | time since Unix epoch of when the above access token expires |
| `refreshToken` | `string` | token used to get new access token after expiry |


### AMAuth (Subdocument of User)
| Field | Type | Description |
| ---  | ---  | ---         |
| `AMDevToken` | `string` | json web token used to access apple music api endpoints |
| `musicUserToken` | `string` | token with which we can access a specific user's data using the Apple Music web API |



### Sample User Object

```javascript
const user = {
    _id: ObjectId("123"),
    username: "deviousTweeter",
    name: "Michael Devious",
    password: "123",
    dateOfBirth: "1969-04-20T05:00:00.000Z",
    SPAuth: {
        accessToken: "abcdefg",
        expiryTime: 1713585600000,
        refreshToken: "hijklmnop"
    },
    AMAuth: null,
    publicProfile: true,
    friends: [
        ObjectId("456"),
        ObjectId("789")
    ],
    blocked: [...], // all arrays of ObjectIds...
    posts: [...],
    comments: [...],
    postLikes: [...],
    commentLikes: [...],
    ratings: [...]
};
```



---



## Post 
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for the post |
| `authorId` | `ObjectId` | `_id` of the user who authored the post |
| `authorUsername` | `string` | username of the user who authored the post |
| `musicContent` | `Object` (subdocument, music item) | the music item object, which is the main content of a post |
| `textContent` | `string` | the text content of the post | 
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this post
| `comments` | `[Object]` (subdocument) | an array of comment objects, representing comments made on this post
| `createTime` | `number` | time since Unix epoch of when the post was created |
| `lastUpdated` | `number` | time since Unix epoch of when the post was last changed |
| `tags` | `[string], Array.length === 3` | a triple of strings indicating genres/moods for a playlist post |


### Comment (Subdocument of Post)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for the comment |
| `authorId` | `ObjectId` | `_id` of the user who authored the comment |
| `authorUsername` | `string` | username of the user who authored this comment |
| `parentId` | `ObjectId` | `_id` of the post that this comment is on |
| `textContent` | `string` | the text content of the comment | 
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this comment |
| `createTime` | `number` | time since Unix epoch of when the comment was created |





### Song (Subdocument of Post, Music Item)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `string` | platform id for the song (either from Spotify or AM api) |
| `platform` | `string: 'SP' \| 'AM'` | the platform from which the song originates (depends on the api used to retrieve the song) | 
| `type` | `string: 'track'` | type of music resource |
| `isrc` | `string` | International Standard Recording Code, used to match songs across platforms |
| `name` | `string` | name of the song |
| `artists` | `[string]` | name(s) of the artist(s) of the song |
| `platformURL` | `string` | url link to the song on its original platform |
| `albumId` | `string` | the `_id` of the LP/EP/single object associated with this song |


### Album (Subdocument of Post, Music Item)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `string` | platform id for the album (either from Spotify or AM api) |
| `platform` | `string: 'SP' \| 'AM'` | the platform from which the album originates (depends on the api used to retrieve the album) | 
| `type` | `string: 'album'` | type of music resource |
| `name` | `string` | name of the album |
| `artists` | `[string]` | name(s) of the artist(s) of the album |
| `platformURL` | `string` | url link to the album on its original platform |
| `tracks` | `[Object]` | a list of song objects contained in this album |


### Playlist (Subdocument of Post, Music Item)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `string` | platform id for the playlist (either from Spotify or AM api) |
| `platform` | `string: 'SP' \| 'AM'` | the platform from which the playlist originates (depends on the api used to retrieve the playlist) | 
| `type` | `string: 'playlist'` | type of music resource |
| `name` | `string` | name of the playlist |
| `platformURL` | `string` | url link to the playlist on its original platform |
| `tracks` | `[Object]` | a list of song objects contained in this playlist |
| `ratings` | `[Object]` (subdocument) | an array of ratings given to this playlist |



### Rating (Subdocument of Playlist)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for this rating |
| `authorId` | `ObjectId` | `_id` of the user who authored this rating |
| `authorUsername` | `string` | username of the user who authored this rating |
| `parentId` | `string` | `_id` of the playlist that this review is on |
| `starRating` | `number` in [1, 5] inclusive, whole numbers only | the star rating, on a scale of 1 - 5 (whole numbers only) |
| `textContent` | `string` | the text content of the rating |
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this rating | 





### Sample Post Object w/ Subdocuments

```javascript
const post = {
    _id: ObjectId("012"),
    authorId: ObjectId("123"),
    authorUsername: "deviousTweeter",
    musicContent: { // example playlist object, with data from Spotify API
        _id: "3gBrgOKZRKfOSgKrTNWE2y",
        platform: "SP",
        type: "playlist",
        name: "soup",
        platformURL: "https://open.spotify.com/playlist/3gBrgOKZRKfOSgKrTNWE2y",
        tracks: [
            { // example song oject
                _id: "4PTG3Z6ehGkBFwjybzWkR8",
                platform: "SP",
                type: "track",
                isrc: "GBARL9300135",
                name: "Never Gonna Give You Up",
                artists: ["Rick Astley"],
                platformURL: "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8",
                albumId: "6eUW0wxWtzkFdaEFsTJto6"
            }, ...
        ],
        ratings: [
            { // example rating object
                _id: ObjectId("678"),
                authorId: ObjectId("789"),
                parentId: "3gBrgOKZRKfOSgKrTNWE2y",
                starRating: 1,
                textContent: "Despite what the comments might say, this playlist is NOT goated.",
                likes: [...]
            }, ...
        ]

    },
    textContent: "goated playlist",
    likes: [...],
    comments: [
        { // example comment object
            _id: ObjectId("345"),
            authorId: ObjectId("456"),
            parentId: ObjectId("012"),
            textContent: "wait, this is goated",
            likes: [...], 
            createTime: 1710460800
        }, ...
    ],
    createTime: 1710374400
};
```





---



## Message Session

| Field | Type | Description |
| ---  | ---  | ---         |
| `user1`| `ObjectId` | unique identifier for the post |
| `user2`| `ObjectId` | unique identifier for the post |
| `messages` | `[Object]` | array of message subdocuments |


### Message


| Field | Type | Description |
| ---  | ---  | ---         |
| `text` | `string` | message content (max 2000 characters) |
| `timestamp` | `number` | time of when message was sent in Unix epoch seconds |
