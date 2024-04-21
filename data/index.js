// mongodb data functions
import userDataFuncs from "./users.js";
import postDataFuncs from "./posts.js";

// external api functions (put in the api subdirectory)
import AMFuncs from "./api/appleMusic.js";
import SPFuncs from "./api/spotify.js";

export const userData = userDataFuncs;
export const postData = postDataFuncs;

export const AMData = AMFuncs;
export const SPData = SPFuncs;
