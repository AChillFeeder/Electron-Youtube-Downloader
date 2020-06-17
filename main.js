// MAIN PROCESS

const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ipc = require('electron').ipcMain;

let window, settingsWindow;
let videos = [];
let format = 'mp3';

// Basic management of windows and all that BS
app.on('ready', function(){ // listen for the app to be ready
	// create a new window
	window = new BrowserWindow({
		minHeight: 600,
		maxHeight: 600,
		frame: false,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// load html file
	window.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true,
	}));

	// duh...
	window.removeMenu();

	// pretty self explanatory
	window.webContents.openDevTools();

	// quit the application when this window is closed
	// might not actually be necessary
	window.on('close', ()=>{
		app.quit();
	});

});




ipc.on('format', (event, args) => {
	format = args;
	event.sender.send('message', `format set to ${format}`);
})



let downloadPath = `${require('os').homedir()}\\Desktop\\`;
ipc.on('path', (event, args)=>{
	downloadPath = args;
	event.sender.send('message', `path has been set to: ${args}`);
})


ipc.on('download-all', (event, args) =>{
	
	// since there are no event for a finished .forEach loop
	// we have to make a custom counter
	// when the counter and videos' array length are equal then we downloaded all videos
	let downloaded_videos = 0;
	videos.forEach( (videoObject) => {
		// title sanitization, and correction goes here [function]
		videoObject.title = (videoObject.title.replace(/[ |&\/\\#,+()$~%.'":*?<>{}]/g, ""));
		event.sender.send('message', `Downloading: ${videoObject.title}`);

		console.log(`download path ${downloadPath}`);
		ytdl(videoObject.url).pipe(fs.createWriteStream(downloadPath + '\\' + videoObject.title + '.' + format)).on('finish', ()=>{
			downloaded_videos++;
			
			if (downloaded_videos == videos.length){
				// send success message
				event.sender.send('message', 'All videos have been downloaded successfully'); // index.js too		
			}

		});
	});

})



// changes: format (mp3 - mp4)
// greyed text input when downloading
