# Tweeter - Database Schema Outline

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
| `password` | `string` | login password |
| `SPAuth` | `Object` (subdocument, optional) | subdocument with fields for spotify authentication |
| `AMAuth` | `Object` (subdocument, optional) | subdocument with fields for apple music authentication |
| `public` | `boolean` | denotes whether this profile is public (`true`) or private (`false`) |
| `friends` | `[ObjectId]` | list of `_id`s of the current users friends |
| `posts` | `[ObjectId]` | list of post `_id`s authored by this user |
| `comments` | `[ObjectId]` | list of comment `_id`s authored by this user |
| `postLikes` | `[ObjectId]` | list of post `_id`s liked by this user |
| `commentLikes` | `[ObjectId]` | list of comment `_id`s liked by this user |
| `ratings` | `[ObjectId]` | list of rating `_id`s authored by this user |
| `addedPlaylists` | `[ObjectId]` | list of playlists added by this user to Spotify/AM |


### SPAuth (Subdocument of User)
| Field | Type | Description |
| ---  | ---  | ---         |
| `accessToken` | `string` | token needed for access to spotify api data functions |
| `expiryTime` | `number` | time since Unix epoch of when the above access token expires |
| `refreshToken` | `string` | token used to get new access token after expiry |


### AMAuth\* (Subdocument of User)
| Field | Type | Description |
| ---  | ---  | ---         |
| `data` | `Object` | data relevant for authenticating access to the Apple Music API |


---



## Post 
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for the post |
| `authorId` | `ObjectId` | `_id` of the user who authored the post |
| `musicContent` | `Object` (subdocument, music item) | the music item object, which is the main content of a post |
| `textContent` | `string` | the text content of the post | 
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this post
| `comments` | `[Object]` (subdocument) | an array of comment objects, representing comments made on this post
| `createTime` | `number` | time since Unix epoch of when the post was created |


### Comment (Subdocument of Post)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for the comment |
| `authorId` | `ObjectId` | `_id` of the user who authored the comment |
| `parentId` | `ObjectId` | `_id` of the post that this comment is on |
| `textContent` | `string` | the text content of the comment | 
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this comment |
| `createTime` | `number` | time since Unix epoch of when the comment was created |





### Song (Subdocument of Post, Music Item)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `string` | platform id for the song (either from Spotify or AM api) |
| `platform` | `string: 'SP' \| 'AM'` | the platform from which the song originates (depends on the api used to retrieve the song) | 
| `type` | `string: 'song'` | type of music resource |
| `isrc` | `string` | International Standard Recording Code, used to match songs across platforms |
| `name` | `string` | name of the song |
| `artists` | `[string]` | name(s) of the artist(s) of the song |
| `platformURL` | `string` | url link to the song on its original platform |
| `albumURL` | `string` | the `platformURL` of the LP/EP/single object associated with this song |


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
| `artists` | `[string]` | name(s) of the artist(s) of the playlist |
| `platformURL` | `string` | url link to the playlist on its original platform |
| `tracks` | `[Object]` | a list of song objects contained in this playlist |
| `ratings` | `[Object]` (subdocument) | an array of ratings given to this playlist |



### Rating (Subdocument of Playlist)
| Field | Type | Description |
| ---  | ---  | ---         |
| `_id`| `ObjectId` | unique identifier for this rating |
| `authorId` | `ObjectId` | `_id` of the user who authored this rating |
| `parentId` | `string` | `_id` of the playlist that this review is on |
| `starRating` | `number` in [1, 5] inclusive, whole numbers only | the star rating, on a scale of 1 - 5 (whole numbers only) |
| `textContent` | `string` | the text content of the rating |
| `likes` | `[ObjectId]` | an array of `_id`s of the users who liked this rating | 


---




\* **Note**: the documentation for [MusicKit on the Web](https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/user-authorization--page) is very vague on what data is needed/returned as part of the authorization flow. Additionally, we haven't been able to test AM authentication yet, as it involves using DOM listeners. This section will be updated as the project progresses.

