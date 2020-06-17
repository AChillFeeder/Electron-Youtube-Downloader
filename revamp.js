
// required
const { ipcRenderer } = require('electron');

// const { realpath, realpathSync } = require('fs');

// for native folder prompt
const { dialog } = require('electron').remote;

// for communication with MAIN
const ipc = require('electron').ipcRenderer;

// for searching
const ytsr = require('ytsr'); // search
const ytdl = require('ytdl-core'); // metadata
const search = require('yt-search');

// Video objects are stored here
let downloadList = new Array();
let searchedList = new Array();

// avoids refreshing the page when submitting a form
document.getElementById('the-actual-form').addEventListener('submit', (event)=>{
	event.preventDefault(); 
})


// send this to main when downloading everything
properties = {
	'links': [],
	'path': '',
	'format': 'mp3',
}

// current queue [download/search]
let queue;

// this needs renaming
const link = document.getElementById('link'); // input

// this needs renaming
function addVideo(){

	// commands:
		// path
		// add [link]
		// format [format]
		// search [query with spaces]
		// select [number]
		// queue [search/download]
		
	let input = link.value;
	let action = input.split(' ')[0]
	let args = input.replace(action, '');

	switch(action){
		case('add'):
			// code for adding a link
			queue = 'download';
			output('Fetching metadata...');

			ytdl.getInfo(args).then( videoObject => {
				downloadList.push(videoObject);

				output(`new addition to the download queue: ${videoObject.title}`, 'green');
				queue = 'download';
				display(downloadList);
			});

			break; // !!!!!!!!!!!!!!!!!!!! 

		case('format'):
			// code for choosing format here
			properties.format = args;
			break;

		case('search'):
			searchedList = [];
			queue = 'search';
			output(`searching for ${args}...`);
			// code for searching for a video
			ytsr(args, {limit: 5}).then( searchResults => { // limit in settings?
				
				searchResults.items.forEach( element => {
				
					ytdl.getInfo(element.link).then( videoObject => {
						searchedList.push(videoObject);
						display(searchedList);
						if (searchedList.length == searchResults.items.length){
							output();
						}
					})
				})
			} );
			break;

		case('select'):
			// code for selecting a video (only in search queue!)
			output(`selected: ${searchedList[parseInt(args)-1].title}`);
			break;

		case('queue'):
			// code for changing queues
			break;
			
		case('download'):
			// code for downloading a specific video ([number]) or all videos ([all/*/button click])
			break;
			
		default:
			if (action == 'path'){
				// code for choosing path here
				dialog.showOpenDialog({ 
					properties: ['openDirectory']
				}).then( ( data => properties.path = data.filePaths ) )
			}else{
				link.value = 'add ' + link.value;
				addVideo()
			}

	}

}



function output(message='Enter command', color='white'){
	link.placeholder = message;
	link.value = '';
	link.style.borderColor = color;
}

const videoContainer = document.getElementById('videos-container');

function display(list){
	function makeDiv(obj){
	
		let container = document.createElement('div');
		let hover_command = 'onmouseover = "this.getElementsByClassName"'	
		container.className = 'container';
		container.id = obj.video_id; // might change to url instead of ID
		container.innerHTML = `
		<div class='background' style="background-image: url('https://img.youtube.com/vi/${obj.video_id}/maxresdefault.jpg')">        
		</div>
		<div class='meta'>
			<span class='videoTitle'>${obj.title}</span>
		</div>`
	
		videoContainer.appendChild(container); // put this div inside the video-container
	}


	resetView(); // delete all visible divs
	list.forEach(element => { // for each video make a div
		makeDiv(element);
	});
}


function resetView(){
	videoContainer.innerHTML = '';
}



videoContainer.addEventListener("wheel", event => {

	function checkVisible(list) {
		list.forEach(videoObject => { // for each div (since divs IDs are the video links, that's convenient xD)
			let div = document.getElementById(videoObject.video_id); // 'Select' the element
			let y = div.getBoundingClientRect().y; // and get the y coordinate
			div.getElementsByClassName('meta')[0].style.display = (y==160) ? 'block' : 'none';
			// elements that have (y == 160) are visible, so we show the 'meta' div
		});
	}

	// this function manages the 'perfect scrolling'
	event.preventDefault(); // disable the normal scrolling
    const delta = Math.sign(event.deltaY); // get -1 or 1 instead of the other values chrome returns
	// delta => 1 down | -1 up
	videoContainer.scrollBy(0, 300*delta); // 300px is the height of the container
	let currentList = queue == 'download' ? downloadList : searchedList;
	checkVisible(currentList);
});




/*
// need to change names and stuff like that

// path //
Open window and select folder
get path
send path to MAIN
change MAIN's path variable

// format //
send arg (format) to MAIN
change MAIN's format property

// add (require ytld-core in index.js) //
fetch for meta of the video
resetView()
display the data (make function)
add the video object to the downloadList

// search
get results from the query
fetch for meta of each video
add the video objects to the searchedList
resetView()
display data in searchList


> MAIN
properties = {
	'links': [],
	'path': '',
	'format': 'mp3',
}

set a function property(property, value)
> ipc.send('properties', property, value)

*/

/* 
	commands:
		add [link] or [link]
		format [mp3/mp4]
		path
		search [search query]
		
*/


// BUGS:
	// search returns error on channels
