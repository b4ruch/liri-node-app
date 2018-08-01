/* 
***********************************************
*Author: Baruch Flores                        *
*Homework 10: LIRI                            *
*UCB Extension - Full-Stack Bootcamp          *
*July 2018                                    *
*********************************************** 
*/

const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const request = require('request');
const dotenv = require("dotenv").config();
const keys = require("./keys.js");
const fs = require("fs");
let log;
// const util = require("util");

let spotify = new Spotify(keys.spotify);
let twitter = new Twitter(keys.twitter);

let keyword = process.argv[2];
let divider = "\n-------------------------\n";
let params;

var liriLog = console.log;
console.log = function(msg) {
    fs.appendFileSync("log.txt", msg, function(err) {
        if(err) {
            return liriLog(err);
        }
    });
    liriLog(msg); //for stdout logs
};


function myTweets() {
    params = {
        screen_name: "IrilSteve",
        count: "20",
    };

    twitter.get("statuses/user_timeline", params, function (err, tweets, response) {

        if (!err) {

            console.log(`Your last 20 tweets are:`);
            tweets.forEach(tweet => {
                console.log(`${divider}Date Created: ${tweet.created_at} \nContent: ${tweet.text}`);
            });

        }
        else {
            console.log(`Oops.. tweets couldn't be retrieved.`);
            console.log(err);
        }
    });
}

function spotifyThis(track) {

    //command line
    if (track == undefined) {
        track = process.argv.slice(3).join(" ");
        if (!track) {
            track = "The Sign";
            console.log(`${divider}You did not specify the track name.  Defaulted to: ${track}`);
        }
    }

    params = {
        type: "track",
        limit: "1",
        query: track
    }

    spotify.search(params, function (err, resp) {
        if (!err) {
            let artists = resp.tracks.items[0].album.artists;

            console.log(`${divider}\t\tArtists:`);
            artists.forEach(function (artist) {
                console.log(`\t\t\t${artist.name}`);
            });
            console.log(`\t\tName: ${resp.tracks.items[0].name}`);
            let preview = resp.tracks.items[0].preview_url;
            if (preview) {
                console.log(`\t\tPreview link: ${preview}`);
            }
            else {

                console.log(`\t\tPreview link: N/A  -> Full song:  ${resp.tracks.items[0].external_urls.spotify}`);
            }
            console.log(`\t\tAlbum: ${resp.tracks.items[0].album.name}
                        ${divider}`);

            // console.log(util.inspect(resp,true,null,null));
        }
        else {
            console.log(`Oops.. track could not be retrieved.\nError: ${err}`);
        }
    });
}

function movieThis(film) {

    //command line
    if (film == undefined) {
        film = process.argv.slice(3).join(" ");
        if (!film) {
            film = "Mr. Nobody";
            console.log(`${divider}You did not specify the movie name.  Defaulted to: ${film}`);
        }
    }
    let URL = "https://www.omdbapi.com/?";
    components = {
        't': film,
        'apikey': "trilogy",
        "plot": "short",
    };

    params = Object.keys(components).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(components[k])
    }).join('&');

    request(URL + params, function (err, response, body) {

        if (!err) {

            movie = JSON.parse(body);
            console.log(`
            ${divider}
            Title: ${movie.Title}
            Year: ${movie.Year}
            IMDB Rating: ${movie.Ratings[0].Value}
            Rotten Tomatoes Rating: ${movie.Ratings[1].Value}
            Country: ${movie.Country}
            Language: ${movie.Language}
            Plot: ${movie.Plot}
            Actors: ${movie.Actors}
            ${divider}
            `);
        }
        else {
            console.log(`Oops.. we couldn't retrieve your movie. Response Code: ${response.statusCode}  Error: ${err}`);
        }
    });
}


log = fs.appendFileSync("log.txt", divider + "Command: " + process.argv.slice(2).join(" "), err => {
    if (err) {
        console.log(`Unable to write into log file.  Error: ${err}`);
    }
});


switch (keyword) {
    case "my-tweets":
        myTweets();
        break;

    case "spotify-this-song":
        spotifyThis();
        break;

    case "movie-this":
        movieThis();
        break;

    case "do-what-it-says":
        fs.readFile("random.txt", "UTF-8", function (err, data) {

            if (!err) {
                let command = data.split(",")[0];
                let arg = data.split(",")[1];
                if (arg)
                    arg = arg.replace(new RegExp("\"", "g"), "");

                switch (command) {
                    case "my-tweets":
                        myTweets();
                        break;
                    case "spotify-this-song":
                        spotifyThis(arg);
                        break;
                    case "movie-this":
                        movieThis(arg);
                        break;

                    default:
                        console.log(`Command not valid`);
                        break;
                }
            }
            else {
                console.log(`Oops.. we couldn't read the file. Erro: ${err}`);
            }
        });
        break;

    default:
        console.log("Sorry, keyword not recognized \n");
        break;

}
