# Tweeter - Playlist Social Media Web Application
Group 7 final project for CS 546 (Web Programming) at Stevens Institute of Technology

## Getting Started

Starting the application is very simple. Just run the following commands in the project root:

```sh
npm install    # install needed dependencies
npm start      # start the server  
```

### Seeding the Database

We provide some sample data with a couple of users and posts to help you get started. Refer to the file `docs/seedDataOutline.md` for a detailed look at the given users, their passwords, and their default friendships. To populate the database with sample data, run the following:

```sh
npm run seed   # adds sample data to the app
```

If at any point you want to clear the database and start fresh, run this:

```sh
npm run drop   # clears all database entries
```

**NOTE**: For TAs grading this project, please see the `TA_README.md` for additional sensitive info (i.e. test Spotify Account passwords, .env details, etc.). Sample user passwords are in the `docs/seedDataOutline.md` file.

## Overview

Our website will allow users to sign up, link their music streaming services, add playlists to their profiles, and interact/friend other users. Users can select public playlists from their library to feature on their page, along with listing the genres and/or mood/vibe the playlist has. Playlists will act as the main form of “posting”. Playlists will be able to be rated by other users out of 5 stars. Uploading a playlist will populate a feed that friended users can see, like, and comment on. All users will be able to view pages that list top-rated playlists from users with public profiles. Users can also select a song or album and create a post around that.

While the main page when logged in will be the “feed”, users can also interact directly with other friends, through direct messages and through various library comparison features. For example, users can compare their libraries, get a similarity percentage, get recommendations, and see mutually favorited artists. Users can also search by genre and mood to find specific playlists from public users.

## Core Features

- Main page describing features, and presenting login/signup modals to the user
- Home/”feed” page, where users will see a reverse chronological list of their friends’ posts, likes, and other activities
- Profile page, which contains details, posts, and featured playlists for a specific user
    - If being viewed by the current user, certain private data and settings will be available
    - If viewing another user, only public-facing data will be shown
    - Users can choose to make their profiles public or private
- Ability to link various music streaming accounts (Spotify~~, Apple Music, etc.~~) and draw content from their accounts
    - Playlists, songs, and albums can be used as the base content of a post
    - When a playlist is added to an account, the user can add tags (i.e. for genre or mood) to aid with searching
- Posting will usually involve selecting a playlist from a user’s library, or a song/album
- Ability to search for users by username, and request to add users as friends
    - Adding a user as a friend will make one’s profile “un-private” if it is already set to private (i.e. you will not be able to view the full details of a profile until that user has accepted your friend request)
- Friends can rate each other’s playlist with a 5-star rating system. On a separate “ratings” page, a user can view the top-rated playlists within their network or from users with public profiles. Anyone could rate playlists on public profiles.
- Friends can be added, removed, or blocked
- Inter-user communication through direct message chats and various music library comparison features
    - ~~Songs from different services will attempt to be matched through ISRC (International Standard Recording Codes), otherwise will be treated as different songs~~
    - ~~Matching statistics will be based on how many songs two users have in common, how frequently some artists appear in each users’ library, etc.~~
- ~~Ability to share matching statistics to your profile for all users to see, and optionally, the ability to share on other social media platforms~~
- ~~Music recommendation based friends, matching results, etc.~~
- Uploading a playlist will populate a feed that friended users can see, like, and comment on. All users will be able to view pages that list top-rated playlists from users with public profiles. Users can also select a song or album and create a post around that.

## Extra Features

- ~~Enhanced profile customization, including being able to feature/highlight a playlist, album, or post (“pinned content”), banner images, profile background themes, etc.~~
- ~~Friend recommendation on the feed page (similar to Instagram’s “you might know…”)~~



### Group Members

- John Graham (@jharrisong830)
- Emma Hodor (@ehodor)
- Ramses Peralta (@RamsesPeralta7)
- Justin Duran (@ItsJadur)
- Rebecca An (@rebeccaan8)
